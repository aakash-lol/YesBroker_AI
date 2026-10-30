import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { deletePropertyRow, normalizeRow, parsePropertyInput, syncPropertyToQdrant, updateProperty } from '@/lib/properties';
import { removePoint } from '@/lib/qdrant';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const existing = await queryOne('SELECT seller_price, minimum_price FROM properties WHERE id = ?', [id]);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const parsed = parsePropertyInput(body, 'update');
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // The two prices can be edited separately, so check the merged result.
  const seller = (parsed.data.seller_price ?? existing.seller_price) as number;
  const min = (parsed.data.minimum_price !== undefined ? parsed.data.minimum_price : existing.minimum_price) as number | null;
  if (min != null && min > seller) {
    return NextResponse.json({ error: 'Minimum price cannot be higher than the listed price' }, { status: 400 });
  }

  try {
    await updateProperty(id, parsed.data);
    const sync = await syncPropertyToQdrant(id);
    const row = await queryOne('SELECT * FROM properties WHERE id = ?', [id]);
    return NextResponse.json({ property: normalizeRow(row), sync });
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'That property code is already used' }, { status: 409 });
    console.error('[admin/properties PATCH]', e);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await deletePropertyRow(id);
    let sync: { ok: boolean; error?: string } = { ok: true };
    try {
      await removePoint(id);
    } catch (e) {
      sync = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
    return NextResponse.json({ ok: true, sync });
  } catch (e) {
    console.error('[admin/properties DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
