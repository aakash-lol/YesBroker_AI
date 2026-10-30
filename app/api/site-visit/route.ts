import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { createSiteVisit, normalizePhone, upsertLead } from '@/lib/crm';
import type { UISiteVisit } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'confirmed', 'booked', 'completed', 'cancelled'];

/** GET /api/site-visit (admin only). site_visits is now the single source of truth. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await query(
      `SELECT sv.*, p.project_name
       FROM site_visits sv LEFT JOIN properties p ON p.id = sv.property_id
       ORDER BY sv.created_at DESC LIMIT 100`
    );
    const visits: UISiteVisit[] = rows.map((v: any) => {
      const start = new Date(v.slot_start);
      return {
        id: v.id,
        lead_name: v.lead_name || v.lead_phone || 'Client',
        phone_number: v.lead_phone,
        property_address: v.project_name || v.notes || 'Site visit scheduled',
        visit_date: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }),
        visit_time: start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
        status: v.status || 'booked',
        source: v.source || 'frontend',
        created_at: v.created_at,
      };
    });
    return NextResponse.json(visits);
  } catch (e) {
    console.error('[/api/site-visit GET]', e);
    return NextResponse.json([]);
  }
}

/** POST /api/site-visit: public booking from a property page */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.lead_phone ?? body.phone_number ?? body.phone);
    if (!phone) return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });

    const name = String(body.lead_name ?? body.name ?? '').trim().slice(0, 255);
    const date = String(body.visit_date ?? body.date ?? '');
    const time = String(body.visit_time ?? '10:00');
    const notes = String(body.notes ?? body.property_address ?? 'Booked via website').slice(0, 1000);

    await upsertLead(phone, {
      customer_name: name,
      site_visit_interest: `booked ${date} ${time}`,
      source: 'frontend',
      notes,
    }, ['customer_name', 'site_visit_interest', 'source', 'notes'], ['customer_name', 'source', 'notes']);

    const visit = await createSiteVisit({ phone, name, propertyId: body.property_id ?? null, date, time, notes, source: 'frontend' });
    return NextResponse.json({ success: true, visit_date: visit.date, visit_time: visit.time, status: 'booked' });
  } catch (e) {
    console.error('[/api/site-visit POST]', e);
    const msg = e instanceof Error && /visit_date|Invalid visit/.test(e.message) ? e.message : 'Could not book the visit';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/** PATCH /api/site-visit (admin only) */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id, status } = await req.json();
    if (!id || !STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    await execute('UPDATE site_visits SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[/api/site-visit PATCH]', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
