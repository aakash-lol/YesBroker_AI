import { NextResponse } from 'next/server';
import { verifyN8nSecret } from '@/lib/auth';
import { getPropertyFull } from '@/lib/properties';
import { createSiteVisit, normalizePhone, upsertLead } from '@/lib/crm';

/**
 * POST /api/n8n/site-visit  (header x-api-secret)
 * Body: { lead_phone, lead_name, property_id | property_code, visit_date: "YYYY-MM-DD", visit_time: "HH:MM", notes? }
 * Convert spoken dates ("June 25th", "11 AM") to these formats in n8n before calling.
 */
export async function POST(req: Request) {
  const denied = verifyN8nSecret(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(body.lead_phone ?? body.phone);
  if (!phone) return NextResponse.json({ error: 'lead_phone required' }, { status: 400 });

  const ref = String(body.property_id ?? body.property_code ?? '');
  const property = ref ? await getPropertyFull(ref) : null;

  try {
    const visit = await createSiteVisit({
      phone, name: body.lead_name, propertyId: property?.id ?? null,
      date: String(body.visit_date ?? ''), time: body.visit_time,
      notes: body.notes ?? (property ? `Visit for ${property.project_name}` : undefined), source: 'vapi',
    });
    await upsertLead(phone, {
      customer_name: body.lead_name, site_visit_interest: `booked ${visit.date} ${visit.time}`, source: 'vapi',
    }, ['customer_name', 'site_visit_interest', 'source']);
    return NextResponse.json({ success: true, visit_date: visit.date, visit_time: visit.time, property: property?.project_name ?? null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not book visit' }, { status: 400 });
  }
}
