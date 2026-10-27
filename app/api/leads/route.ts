import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { mapLead } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

/** GET /api/leads */
export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json((data ?? []).map(mapLead));
  } catch (e) {
    console.error('[/api/leads]', e);
    return NextResponse.json([]);
  }
}

/** POST /api/leads — manual lead capture from frontend */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('leads')
      .upsert(
        {
          ...body,
          source: body.source ?? 'frontend',
          lead_status: body.lead_status ?? 'captured',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone_number' }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapLead(data));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create lead';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** PATCH /api/leads — update lead status/notes */
export async function PATCH(req: Request) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapLead(data));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update lead';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
