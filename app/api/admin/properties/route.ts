import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { mapProperty } from '@/lib/mappers';
import { createProperty, normalizeRow, parsePropertyInput, syncPropertyToQdrant } from '@/lib/properties';

export const dynamic = 'force-dynamic';

/** GET /api/admin/properties           -> raw rows incl. minimum_price + unpublished
 *  GET /api/admin/properties?format=ui -> same shape as the public API, but WITH minimum_price (negotiation tool) */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await query('SELECT * FROM properties ORDER BY created_at DESC');
    const props = rows.map(normalizeRow);
    if (req.nextUrl.searchParams.get('format') === 'ui') return NextResponse.json(props.map(mapProperty));
    return NextResponse.json(props);
  } catch (e) {
    console.error('[admin/properties GET]', e);
    return NextResponse.json({ error: 'Failed to load properties' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const parsed = parsePropertyInput(body, 'create');
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const id = await createProperty(parsed.data);
    const sync = await syncPropertyToQdrant(id);
    const row = await queryOne('SELECT * FROM properties WHERE id = ?', [id]);
    return NextResponse.json({ property: normalizeRow(row), sync }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'That property code is already used' }, { status: 409 });
    console.error('[admin/properties POST]', e);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
