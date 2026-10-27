import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { mapProperty } from '@/lib/mappers';
import { demoProperties } from '@/lib/utils';

function scoreProperty(
  p: ReturnType<typeof mapProperty>,
  q: string
): number {
  const query = q.toLowerCase();
  let score = 0;
  const haystack = [
    p.title,
    p.location,
    p.area,
    p.city,
    p.property_type,
    p.description,
    ...(p.amenities ?? []),
  ]
    .join(' ')
    .toLowerCase();

  for (const token of query.split(/\s+/).filter(Boolean)) {
    if (haystack.includes(token)) score += 2;
  }
  if (query.includes('bhk') && haystack.includes('bhk')) score += 3;
  if (query.includes('villa') && p.property_type.toLowerCase().includes('villa')) score += 4;
  if (query.includes('apartment') && p.property_type.toLowerCase().includes('apartment')) score += 4;
  if (query.includes('whitefield') && haystack.includes('whitefield')) score += 5;
  if (query.includes('under') || query.includes('budget')) {
    const budgetMatch = query.match(/(\d+)\s*(l|lakh|lakhs|cr|crore)?/i);
    if (budgetMatch) {
      let budget = parseInt(budgetMatch[1], 10);
      if (/cr|crore/i.test(budgetMatch[2] ?? '')) budget *= 100;
      const priceLakhs = p.price / 100_000;
      if (priceLakhs <= budget) score += 5;
    }
  }
  return score;
}

/** POST /api/ai/search — searches Supabase properties (same data n8n/Qdrant uses) */
export async function POST(req: Request) {
  const { query } = await req.json();
  const q = String(query ?? '').trim();
  if (!q) {
    return NextResponse.json({ query: '', answer: 'Please enter a search query.', properties: [] });
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(50);

    let properties = (data ?? []).map(mapProperty);

    if (error || properties.length === 0) {
      properties = demoProperties.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        location: `${p.area}, ${p.city}`,
        area: p.area ?? p.city,
        city: p.city,
        property_type: p.property_type,
        price: p.price,
        currency: p.currency,
        amenities: [],
        featured: p.featured ?? false,
        status: p.status ?? 'available',
        investment_score: p.investment_score ?? 80,
      }));
    }

    const ranked = properties
      .map(p => ({ p, score: scoreProperty(p, q) }))
      .sort((a, b) => b.score - a.score);

    const results =
      ranked[0]?.score > 0
        ? ranked.filter(r => r.score > 0).slice(0, 6).map(r => r.p)
        : properties.slice(0, 6);

    const names = results.map(p => p.title).join(', ');
    const answer =
      results.length > 0
        ? `Based on "${q}", I found ${results.length} matching propert${results.length === 1 ? 'y' : 'ies'} in our database${names ? `: ${names}` : ''}. These are synced with the same inventory your AI voice agent uses via n8n and Qdrant.`
        : `I couldn't find exact matches for "${q}" in Supabase yet. Try asking the voice agent or broadening your search.`;

    return NextResponse.json({
      query: q,
      answer,
      properties: results.map(p => ({
        id: p.id,
        title: p.title,
        area: p.area,
        city: p.city,
        property_type: p.property_type,
        price: p.price,
        currency: p.currency,
        investment_score: p.investment_score,
        rental_yield: undefined,
        description: p.description,
      })),
      suggestions: [
        '2BHK in Whitefield under 80 Lakhs',
        '3BHK apartment near IT parks',
        'Villa with amenities in Bangalore',
      ],
    });
  } catch (e) {
    console.error('[/api/ai/search]', e);
    return NextResponse.json({
      query: q,
      answer: 'Search temporarily unavailable. Please try again.',
      properties: [],
    });
  }
}
