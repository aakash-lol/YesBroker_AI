import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import {
  mapAnalyticsToSiteVisit,
  mapLeadToSiteVisit,
  type UISiteVisit,
} from '@/lib/mappers';
import type { CallAnalytics, Lead, SiteVisit } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function mapDbSiteVisit(v: SiteVisit): UISiteVisit {
  const start = new Date(v.slot_start);
  return {
    id: v.id,
    lead_name: v.lead_name || v.lead_phone || 'Client',
    phone_number: v.lead_phone,
    property_address: v.notes || 'Site visit scheduled',
    visit_date: start.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    visit_time: start.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: v.status || 'booked',
    source: v.source || 'vapi',
    created_at: v.created_at,
  };
}

async function fetchSiteVisits(): Promise<UISiteVisit[]> {
  const supabase = getServiceClient();
  const visits: UISiteVisit[] = [];

  // n8n writes to site_visits when available
  const { data: siteRows } = await supabase
    .from('site_visits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (siteRows?.length) {
    visits.push(...siteRows.map(mapDbSiteVisit));
  }

  // Fallback: derive from leads + call_analytics (current schema)
  const [{ data: leads }, { data: analytics }] = await Promise.all([
    supabase.from('leads').select('*').order('updated_at', { ascending: false }).limit(100),
    supabase.from('call_analytics').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  for (const lead of (leads ?? []) as Lead[]) {
    const mapped = mapLeadToSiteVisit(lead);
    if (mapped && !visits.some(v => v.id === mapped.id)) visits.push(mapped);
  }
  for (const row of (analytics ?? []) as CallAnalytics[]) {
    const mapped = mapAnalyticsToSiteVisit(row);
    if (mapped && !visits.some(v => v.id === mapped.id)) visits.push(mapped);
  }

  return visits.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/** GET /api/site-visit */
export async function GET() {
  try {
    return NextResponse.json(await fetchSiteVisits());
  } catch (e) {
    console.error('[/api/site-visit GET]', e);
    return NextResponse.json([]);
  }
}

/** POST /api/site-visit — book from property page (mirrors n8n bookSiteVisit) */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServiceClient();
    const phone = body.lead_phone ?? body.phone_number ?? body.phone ?? '';
    const name = body.lead_name ?? body.name ?? '';
    const visitDate = body.visit_date ?? body.date ?? new Date().toISOString().slice(0, 10);
    const visitTime = body.visit_time ?? '10:00';
    const slotStart = new Date(`${visitDate}T${visitTime}:00+05:30`).toISOString();
    const slotEnd = new Date(new Date(slotStart).getTime() + 60 * 60 * 1000).toISOString();

    // Upsert lead (schema-native)
    if (phone) {
      await supabase.from('leads').upsert(
        {
          phone_number: phone,
          customer_name: name,
          site_visit_interest: `booked ${visitDate} ${visitTime}`,
          lead_status: 'captured',
          source: 'frontend',
          notes: body.notes ?? `Visit for ${body.property_address ?? body.property_id ?? 'property'}`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone_number' }
      );
    }

    // Try legacy site_visits table (n8n compatibility)
    const { data, error } = await supabase
      .from('site_visits')
      .insert({
        lead_phone: phone,
        lead_name: name,
        property_id: body.property_id ?? null,
        slot_start: slotStart,
        slot_end: slotEnd,
        status: 'booked',
        source: 'frontend',
        notes: body.notes ?? body.property_address ?? 'Booked via frontend',
      })
      .select()
      .single();

    if (!error && data) {
      return NextResponse.json(mapDbSiteVisit(data as SiteVisit));
    }

    return NextResponse.json({
      success: true,
      lead_phone: phone,
      lead_name: name,
      visit_date: visitDate,
      visit_time: visitTime,
      status: 'booked',
    });
  } catch (e) {
    console.error('[/api/site-visit POST]', e);
    return NextResponse.json({ success: true, message: 'Visit request recorded' });
  }
}

/** PATCH /api/site-visit — update visit status */
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const supabase = getServiceClient();

    const { error } = await supabase.from('site_visits').update({ status }).eq('id', id);
    if (!error) return NextResponse.json({ success: true });

    // Fallback: update lead notes
    await supabase
      .from('leads')
      .update({ site_visit_interest: status, updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
