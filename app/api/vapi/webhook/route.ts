import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { mapProperty } from '@/lib/mappers';


/**
 * POST /api/vapi/webhook
 *
 * Handles two Vapi event types:
 *  1. tool-calls — assistant invokes a server-side tool during a live call.
 *     Handles: getProperties / searchProperties / getPropertyDetails
 *     Response: { results: [{ toolCallId, result }] }
 *
 *  2. All other events (call-started, call-ended, end-of-call-report …)
 *     Forwarded to n8n + mirrored to Supabase for the dashboard.
 *
 * To enable live property search from Riley:
 *   Vapi Dashboard → Assistant → Server URL → <your_deployed_url>/api/vapi/webhook
 *   Add a tool: name="getProperties", parameter query (string, required)
 *
 * n8n workflow path: vapi-real-estate (Real Estate Voice Agent Pro)
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const supabase = getServiceClient();

  const msg = body.message ?? body;
  const eventType = String(
    msg.type || body.event || body.type || ''
  ).toLowerCase();

  const call = msg.call ?? body.call ?? {};
  const callId = call.id ?? body.callId ?? msg.callId ?? '';
  const assistantId = call.assistantId ?? body.assistantId ?? '';
  const customer = call.customer ?? body.customer ?? {};
  const customerPhone = customer.number ?? customer.phone ?? body.customerPhone ?? '';
  const customerName = customer.name ?? body.customerName ?? '';
  const transcript =
    msg.artifact?.transcript ??
    body.artifact?.transcript ??
    body.transcript ??
    '';
  const summary =
    msg.analysis?.summary ??
    body.analysis?.summary ??
    body.artifact?.summary ??
    msg.artifact?.summary ??
    body.summary ??
    '';
  const structured = msg.analysis?.structuredData ?? body.analysis?.structuredData ?? {};
  const recordingUrl =
    msg.artifact?.recording ??
    msg.artifact?.recordingUrl ??
    body.artifact?.recording ??
    '';

  // ── TOOL CALL HANDLER ──────────────────────────────────────────────────────
  // Vapi fires { message: { type: "tool-calls", toolCallList: [...] } } when
  // the assistant invokes a server-side tool during a live call.
  // Return { results: [{ toolCallId, result }] } so the assistant can speak it.
  if (eventType === 'tool-calls' || eventType === 'tool-call') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCallList: any[] = msg.toolCallList ?? (msg.toolCall ? [msg.toolCall] : []);
    const results: { toolCallId: string; result: string }[] = [];

    for (const tc of toolCallList) {
      const fnName: string = (tc.function?.name ?? tc.name ?? '').toLowerCase();
      let args: Record<string, unknown> = {};
      try {
        args = typeof tc.function?.arguments === 'string'
          ? JSON.parse(tc.function.arguments)
          : (tc.function?.arguments ?? tc.arguments ?? {});
      } catch { /* empty args */ }

      const query = String(args.query ?? args.search ?? args.requirement ?? args.location ?? '').trim();
      const propertyId = String(args.property_id ?? args.propertyId ?? args.id ?? '').trim();

      // getPropertyDetails — single property by Supabase UUID
      if ((fnName.includes('detail') || (fnName.includes('getproperty') && propertyId))) {
        try {
          const { data } = await supabase.from('properties').select('*').eq('id', propertyId).maybeSingle();
          results.push({ toolCallId: tc.id, result: data ? JSON.stringify(mapProperty(data)) : `No property found with id "${propertyId}".` });
        } catch (e) {
          results.push({ toolCallId: tc.id, result: `Error fetching property: ${e instanceof Error ? e.message : String(e)}` });
        }
        continue;
      }

      // getProperties / searchProperties / listInventory — keyword search on Supabase
      if (fnName.includes('propert') || fnName.includes('search') || fnName.includes('listing') || fnName.includes('inventor')) {
        try {
          const { data, error } = await supabase.from('properties').select('*').order('view_count', { ascending: false }).limit(50);
          if (error) throw error;
          let properties = (data ?? []).map(mapProperty);

          if (query && properties.length > 0) {
            const q = query.toLowerCase();
            const scored = properties.map(p => {
              let score = 0;
              const hay = [p.title, p.location, p.area, p.city, p.property_type, p.description, ...p.amenities].join(' ').toLowerCase();
              for (const token of q.split(/\s+/).filter(Boolean)) { if (hay.includes(token)) score += 2; }
              if (q.includes('bhk') && hay.includes('bhk')) score += 3;
              if (q.includes('villa') && p.property_type.toLowerCase().includes('villa')) score += 4;
              if (q.includes('apartment') && p.property_type.toLowerCase().includes('apartment')) score += 4;
              const bm = q.match(/(\d+)\s*(l|lakh|lakhs|cr|crore)/i);
              if (bm) { let b = parseInt(bm[1], 10); if (/cr|crore/i.test(bm[2] ?? '')) b *= 100; if (p.price / 100_000 <= b) score += 5; }
              return { p, score };
            });
            const matched = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
            properties = matched.length ? matched.slice(0, 5).map(s => s.p) : properties.slice(0, 5);
          } else {
            properties = properties.slice(0, 5);
          }

          if (properties.length === 0) {
            results.push({ toolCallId: tc.id, result: 'No matching properties found in our database right now.' });
          } else {
            const lines = properties.map((p, i) => {
              const pl = (p.price / 100_000).toFixed(1);
              return `${i + 1}. ${p.title} — ${p.property_type} in ${p.location}, \u20b9${pl} Lakhs.${p.description ? ' ' + p.description.slice(0, 100) : ''}`;
            });
            results.push({ toolCallId: tc.id, result: `Found ${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}:\n${lines.join('\n')}` });
          }
        } catch (e) {
          console.error('[vapi webhook tool-call searchProperties]', e);
          results.push({ toolCallId: tc.id, result: 'Database error while fetching properties. Please try again.' });
        }
        continue;
      }

      results.push({ toolCallId: tc.id, result: `Tool "${tc.function?.name ?? fnName}" is not handled by this server.` });
    }

    return NextResponse.json({ results });
  }

  // ── 1. Forward to production n8n ────────────────────────────────────────
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nUrl) {
    fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(err => console.error('[vapi\u2192n8n]', err));
  }

  // ── 2. Mirror to Supabase (same fields n8n writes) ──────────────────────
  try {
    if (eventType === 'call-started' && callId) {
      await supabase.from('call_logs').upsert(
        {
          call_id: callId,
          assistant_id: assistantId,
          customer_name: customerName,
          customer_phone: customerPhone,
          event_type: eventType,
          route: 'call_started',
          call_status: 'active',
          received_at: new Date().toISOString(),
          raw_payload: body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'call_id' }
      );
    }

    if (
      (eventType === 'call-ended' ||
        eventType === 'end-of-call-report' ||
        eventType === 'analysis-ready') &&
      callId
    ) {
      const duration =
        msg.duration ??
        body.duration ??
        msg.artifact?.duration ??
        null;

      await supabase.from('call_logs').upsert(
        {
          call_id: callId,
          assistant_id: assistantId,
          customer_name: customerName,
          customer_phone: customerPhone,
          event_type: eventType,
          route: 'call_end',
          transcript,
          summary,
          sentiment: structured.sentiment ?? msg.analysis?.successEvaluation ?? null,
          interest_score: structured.interestScore ?? null,
          next_action: structured.nextAction ?? null,
          recording_url: recordingUrl,
          duration_seconds: duration,
          call_status: 'ended',
          ended_reason: msg.endedReason ?? body.endedReason ?? '',
          raw_payload: body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'call_id' }
      );

      await supabase.from('call_analytics').insert({
        call_id: callId,
        customer_name: customerName,
        budget: structured.budget ?? '',
        preferred_location: structured.preferredLocation ?? '',
        interest_score: structured.interestScore ?? null,
        sentiment: structured.sentiment ?? '',
        next_action: structured.nextAction ?? '',
        summary,
        call_duration_seconds: duration,
        property_queried: structured.propertyQueried ?? '',
        visit_booked: Boolean(structured.visitBooked),
        recording_url: recordingUrl,
      });
    }
  } catch (err) {
    console.error('[vapi webhook supabase]', err);
  }

  return NextResponse.json({ received: true, eventType, forwarded: Boolean(n8nUrl) });
}

export async function GET() {
  return NextResponse.json({
    status: 'Vapi webhook ready',
    n8nConfigured: Boolean(process.env.N8N_WEBHOOK_URL),
  });
}
