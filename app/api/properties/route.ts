import { NextRequest, NextResponse } from 'next/server';
import { getPublicProperty, listPublicProperties } from '@/lib/properties';

export const dynamic = 'force-dynamic';

/**
 * GET /api/properties            -> published listings
 * GET /api/properties?id=<uuid>  -> one listing
 * Public. Never includes minimum_price. (The old public POST that let anyone insert properties is gone;
 * creating/editing now lives under /api/admin/properties.)
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  try {
    if (id) return NextResponse.json(await getPublicProperty(id));
    return NextResponse.json(await listPublicProperties());
  } catch (e) {
    console.error('[/api/properties]', e);
    return NextResponse.json(id ? null : []);
  }
}
