import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { mapNegotiationLog } from '@/lib/mappers';
import type { NegotiationLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** GET /api/negotiations (admin only) */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await query<NegotiationLog>('SELECT * FROM negotiation_logs ORDER BY created_at DESC LIMIT 100');
    return NextResponse.json(rows.map(mapNegotiationLog));
  } catch (e) {
    console.error('[/api/negotiations]', e);
    return NextResponse.json([]);
  }
}
