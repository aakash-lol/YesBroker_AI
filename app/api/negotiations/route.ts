import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { mapNegotiationLog } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

/** GET /api/negotiations — negotiation_logs from n8n voice agent */
export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('negotiation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json((data ?? []).map(mapNegotiationLog));
  } catch (e) {
    console.error('[/api/negotiations]', e);
    return NextResponse.json([]);
  }
}
