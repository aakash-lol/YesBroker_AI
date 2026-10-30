import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { mapLead } from '@/lib/mappers';
import { ADMIN_LEAD_FIELDS, PUBLIC_LEAD_FIELDS, normalizePhone, upsertLead } from '@/lib/crm';
import type { Lead } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** GET /api/leads (admin only) */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await query<Lead>('SELECT * FROM leads ORDER BY updated_at DESC LIMIT 100');
    return NextResponse.json(rows.map(mapLead));
  } catch (e) {
    console.error('[/api/leads]', e);
    return NextResponse.json([]);
  }
}

/** POST /api/leads: public lead capture from the website. Returns no lead data. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone_number);
    if (!phone) return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });
    const source = typeof body.source === 'string' && body.source ? body.source.slice(0, 50) : 'frontend';
    await upsertLead(phone, { ...body, source }, PUBLIC_LEAD_FIELDS, PUBLIC_LEAD_FIELDS);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[/api/leads POST]', e);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}

/** PATCH /api/leads (admin only): update status/notes */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const cols = ADMIN_LEAD_FIELDS.filter((c) => updates[c] !== undefined);
    if (!cols.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    await execute(`UPDATE leads SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [
      ...cols.map((c) => updates[c]),
      id,
    ]);
    const row = await queryOne<Lead>('SELECT * FROM leads WHERE id = ?', [id]);
    return row ? NextResponse.json(mapLead(row)) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (e) {
    console.error('[/api/leads PATCH]', e);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
