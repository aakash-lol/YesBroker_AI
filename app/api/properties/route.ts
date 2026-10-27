import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { mapProperty } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

/** GET /api/properties — ?id=uuid for single property */
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const supabase = getServiceClient();

    if (id) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json(data ? mapProperty(data) : null);
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json((data ?? []).map(mapProperty));
  } catch (e) {
    console.error('[/api/properties]', e);
    return NextResponse.json([]);
  }
}

/** POST /api/properties */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('properties')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapProperty(data));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create property';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
