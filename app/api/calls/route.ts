import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { mapCallLog } from '@/lib/mappers';
import type { CallLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** GET /api/calls (admin only). Transcript and raw payload are intentionally not selected. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await query<CallLog>(
      `SELECT id, call_id, customer_name, customer_phone, summary, sentiment, interest_score, next_action,
              recording_url, call_status, duration_seconds, property_queried, created_at, updated_at
       FROM call_logs ORDER BY created_at DESC LIMIT 50`
    );
    return NextResponse.json(rows.map(mapCallLog));
  } catch (e) {
    console.error('[/api/calls]', e);
    return NextResponse.json([]);
  }
}
