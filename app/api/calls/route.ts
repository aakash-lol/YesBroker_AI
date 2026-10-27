import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { mapCallLog } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

/** GET /api/calls — live call_logs from Supabase (written by n8n) */
export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json((data ?? []).map(mapCallLog));
  } catch (e) {
    console.error('[/api/calls]', e);
    return NextResponse.json([]);
  }
}
