import { NextResponse } from 'next/server';
import { listPublicProperties } from '@/lib/properties';
import { demoProperties } from '@/lib/utils';
import type { UIProperty } from '@/lib/mappers';

function scoreProperty(p: UIProperty, q: string): number {
  const query = q.toLowerCase();
  let score = 0;
  const haystack = [p.title, p.location, p.area, p.city, p.property_type, p.description, ...(p.amenities ?? [])]
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
    const m = query.match(/(\d+)\s*(l|lakh|lakhs|cr|crore)?/i);
    if (m) {
      let budget = parseInt(m[1], 10);
      if (/cr|crore/i.test(m[2] ?? '')) budget *= 100;
      if (p.price / 100_000 <= budget) score += 5;
    }
  }
  return score;
}

/** POST /api/ai/search: public; searches published listings (same inventory the voice agent uses) */
export async function POST(req: Request) {
  const { query } = await req.json();
  const q = String(query ?? '').trim();
  if (!q) return NextResponse.json({ query: '', answer: 'Please enter a search query.', properties: [] });

  try {
    let properties = await listPublicProperties();

    if (properties.length === 0 && process.env.NODE_ENV !== 'production') {
      properties = demoProperties.map((p) => ({
        id: p.id, title: p.title, description: p.description, location: `${p.area}, ${p.city}`,
        area: p.area ?? p.city, city: p.city, property_type: p.property_type, price: p.price,
        currency: p.currency, amenities: [], featured: p.featured ?? false,
        status: p.status ?? 'available', investment_score: p.investment_score ?? 80,
      }));
    }

    const ranked = properties.map((p) => ({ p, score: scoreProperty(p, q) })).sort((a, b) => b.score - a.score);
    const results = ranked[0]?.score > 0 ? ranked.filter((r) => r.score > 0).slice(0, 6).map((r) => r.p) : properties.slice(0, 6);

    const names = results.map((p) => p.title).join(', ');
    const answer = results.length
      ? `Based on "${q}", I found ${results.length} matching propert${results.length === 1 ? 'y' : 'ies'} in our database${names ? `: ${names}` : ''}. These are synced with the same inventory your AI voice agent uses.`
      : `I couldn't find exact matches for "${q}" yet. Try asking the voice agent or broadening your search.`;

    return NextResponse.json({
      query: q,
      answer,
      properties: results.map((p) => ({
        id: p.id, title: p.title, area: p.area, city: p.city, property_type: p.property_type,
        price: p.price, currency: p.currency, investment_score: p.investment_score, description: p.description,
      })),
      suggestions: ['2BHK in Whitefield under 80 Lakhs', '3BHK apartment near IT parks', 'Villa with amenities in Bangalore'],
    });
  } catch (e) {
    console.error('[/api/ai/search]', e);
    return NextResponse.json({ query: q, answer: 'Search temporarily unavailable. Please try again.', properties: [] });
  }
}
