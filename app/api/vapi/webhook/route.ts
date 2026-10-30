import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { listPublicProperties, getPublicProperty } from '@/lib/properties';
import { upsertRow } from '@/lib/crm';
import { toSqlDate } from '@/lib/db';

/**
 * POST /api/vapi/webhook
 *  1. tool-calls: getProperties / searchProperties / getPropertyDetails (answers from MySQL, public fields only)
 *  2. everything else (call-started, end-of-call-report, ...): forwarded to n8n and mirrored to MySQL for the dashboards
 *
 * Optional hardening: set VAPI_WEBHOOK_SECRET and put the same value in the Vapi dashboard
 * (Server URL secret). Vapi then sends it as the x-vapi-secret header.
 */

function authorized(req: NextRequest) {
  const expected = process.env.VAPI_WEBHOOK_SECRET;
  if (!expected) return true;
  const got = Buffer.from(req.headers.get('x-vapi-secret') ?? '');
  const want = Buffer.from(expected);
  return got.length === want.length && timingSafeEqual(got, want);
}

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
};

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const msg = body.message ?? body;
  const eventType = String(msg.type || body.event || body.type || '').toLowerCase();

  const call = msg.call ?? body.call ?? {};
  const callId = call.id ?? body.callId ?? msg.callId ?? '';
  const assistantId = call.assistantId ?? body.assistantId ?? '';
  const customer = call.customer ?? body.customer ?? {};
  const customerPhone = customer.number ?? customer.phone ?? body.customerPhone ?? '';
  const customerName = customer.name ?? body.customerName ?? '';
  const transcript = msg.artifact?.transcript ?? body.artifact?.transcript ?? body.transcript ?? '';
  const summary = msg.analysis?.summary ?? body.analysis?.summary ?? body.artifact?.summary ?? msg.artifact?.summary ?? body.summary ?? '';
  const structured = msg.analysis?.structuredData ?? body.analysis?.structuredData ?? {};
  const recordingUrl = msg.artifact?.recording ?? msg.artifact?.recordingUrl ?? body.artifact?.recording ?? '';

  // ── TOOL CALLS ──────────────────────────────────────────────────────────
  if (eventType === 'tool-calls' || eventType === 'tool-call') {
    const toolCallList: any[] = msg.toolCallList ?? (msg.toolCall ? [msg.toolCall] : []);
    const results: { toolCallId: string; result: string }[] = [];

    for (const tc of toolCallList) {
      const fnName: string = (tc.function?.name ?? tc.name ?? '').toLowerCase();
      let args: Record<string, unknown> = {};
      try {
        args = typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments) : (tc.function?.arguments ?? tc.arguments ?? {});
      } catch { /* empty args */ }

      const q = String(args.query ?? args.search ?? args.requirement ?? args.location ?? '').trim();
      const propertyId = String(args.property_id ?? args.propertyId ?? args.id ?? '').trim();

      if (fnName.includes('detail') || (fnName.includes('getproperty') && propertyId)) {
        try {
          const p = await getPublicProperty(propertyId);
          results.push({ toolCallId: tc.id, result: p ? JSON.stringify(p) : `No property found with id "${propertyId}".` });
        } catch (e) {
          results.push({ toolCallId: tc.id, result: `Error fetching property: ${e instanceof Error ? e.message : String(e)}` });
        }
        continue;
      }

      if (fnName.includes('propert') || fnName.includes('search') || fnName.includes('listing') || fnName.includes('inventor')) {
        try {
          let properties = (await listPublicProperties()).slice(0, 50);
          if (q && properties.length) {
            const ql = q.toLowerCase();
            const scored = properties.map((p) => {
              let score = 0;
              const hay = [p.title, p.location, p.area, p.city, p.property_type, p.description, ...p.amenities].join(' ').toLowerCase();
              for (const t of ql.split(/\s+/).filter(Boolean)) if (hay.includes(t)) score += 2;
              if (ql.includes('bhk') && hay.includes('bhk')) score += 3;
              if (ql.includes('villa') && p.property_type.toLowerCase().includes('villa')) score += 4;
              if (ql.includes('apartment') && p.property_type.toLowerCase().includes('apartment')) score += 4;
              const bm = ql.match(/(\d+)\s*(l|lakh|lakhs|cr|crore)/i);
              if (bm) { let b = parseInt(bm[1], 10); if (/cr|crore/i.test(bm[2] ?? '')) b *= 100; if (p.price / 100_000 <= b) score += 5; }
              return { p, score };
            });
            const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
            properties = matched.length ? matched.slice(0, 5).map((s) => s.p) : properties.slice(0, 5);
          } else {
            properties = properties.slice(0, 5);
          }

          if (!properties.length) {
            results.push({ toolCallId: tc.id, result: 'No matching properties found in our database right now.' });
          } else {
            const lines = properties.map((p, i) => `${i + 1}. ${p.title} — ${p.property_type} in ${p.location}, ₹${(p.price / 100_000).toFixed(1)} Lakhs.${p.description ? ' ' + p.description.slice(0, 100) : ''}`);
            results.push({ toolCallId: tc.id, result: `Found ${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}:\n${lines.join('\n')}` });
          }
        } catch (e) {
          console.error('[vapi webhook search]', e);
          results.push({ toolCallId: tc.id, result: 'Database error while fetching properties. Please try again.' });
        }
        continue;
      }

      results.push({ toolCallId: tc.id, result: `Tool "${tc.function?.name ?? fnName}" is not handled by this server.` });
    }
    return NextResponse.json({ results });
  }

  // ── 1. forward to n8n ───────────────────────────────────────────────────
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nUrl) {
    fetch(n8nUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch((err) => console.error('[vapi→n8n]', err));
  }

  // ── 2. mirror to MySQL ──────────────────────────────────────────────────
  try {
    if (eventType === 'call-started' && callId) {
      await upsertRow('call_logs', {
        call_id: callId, assistant_id: assistantId, customer_name: customerName, customer_phone: customerPhone,
        event_type: eventType, route: 'call_started', call_status: 'active',
        received_at: toSqlDate(new Date()), raw_payload: JSON.stringify(body),
      });
    }

    if ((eventType === 'call-ended' || eventType === 'end-of-call-report' || eventType === 'analysis-ready') && callId) {
      const duration = num(msg.duration ?? body.duration ?? msg.artifact?.duration ?? null);
      const sentiment = structured.sentiment ?? msg.analysis?.successEvaluation ?? null;

      await upsertRow('call_logs', {
        call_id: callId, assistant_id: assistantId, customer_name: customerName, customer_phone: customerPhone,
        event_type: eventType, route: 'call_end', transcript, summary,
        sentiment: sentiment === null ? null : String(sentiment),
        interest_score: num(structured.interestScore), next_action: structured.nextAction ?? null,
        recording_url: recordingUrl, duration_seconds: duration, call_status: 'ended',
        ended_reason: msg.endedReason ?? body.endedReason ?? '', raw_payload: JSON.stringify(body),
      });

      await upsertRow('call_analytics', {
        call_id: callId, customer_name: customerName, budget: structured.budget ?? '',
        preferred_location: structured.preferredLocation ?? '', interest_score: num(structured.interestScore),
        sentiment: structured.sentiment ?? '', next_action: structured.nextAction ?? '', summary,
        call_duration_seconds: duration, property_queried: structured.propertyQueried ?? '',
        visit_booked: structured.visitBooked ? 1 : 0, recording_url: recordingUrl,
      });
    }
  } catch (err) {
    console.error('[vapi webhook mysql]', err);
  }

  return NextResponse.json({ received: true, eventType, forwarded: Boolean(n8nUrl) });
}

export async function GET() {
  return NextResponse.json({ status: 'Vapi webhook ready', n8nConfigured: Boolean(process.env.N8N_WEBHOOK_URL) });
}
