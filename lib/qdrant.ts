import type { Property } from './types';

const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';
const EMBED_DIM = 768; // MUST match the n8n "Gemini Embed Query" node

function cfg() {
  const url = (process.env.QDRANT_URL || '').replace(/\/$/, '');
  const key = process.env.QDRANT_API_KEY || '';
  const collection = process.env.QDRANT_COLLECTION || 'real_estate_kb';
  if (!url) throw new Error('QDRANT_URL is not set');
  return { url, key, collection };
}

async function qdrant(path: string, method: string, body?: unknown, okStatuses: number[] = []) {
  const { url, key } = cfg();
  const res = await fetch(`${url}${path}`, {
    method,
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok && !okStatuses.includes(res.status)) {
    throw new Error(`Qdrant ${method} ${path} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res;
}

export function parseAmenities(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v.trim()) {
    try {
      const j = JSON.parse(v);
      if (Array.isArray(j)) return j.map(String);
    } catch {
      /* not JSON */
    }
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Text that gets embedded and returned to the voice agent as RAG context.
 * NOTE: minimum_price is deliberately NOT included. The old sync script put the
 * negotiation floor in here, which meant the agent could quote it to buyers.
 */
export function propertyToText(p: Property): string {
  const lakhs = (n?: number | null) => Math.round(((n ?? 0) / 100000) * 100) / 100;
  return [
    `Property code: ${p.property_code ?? ''}`,
    `Project name: ${p.project_name}`,
    `Location: ${p.location}`,
    `Property type: ${p.property_type}`,
    `Price: ₹${lakhs(p.seller_price)} Lakhs`,
    `Builder: ${p.builder_details ?? ''}`,
    `Amenities: ${parseAmenities(p.amenities).join(', ')}`,
    `Payment plan: ${p.payment_plan ?? ''}`,
    `Locality advantages: ${p.locality_advantages ?? ''}`,
    `Availability: ${p.availability_status ?? 'available'} (${p.available_units ?? '?'} of ${p.total_units ?? '?'} units left)`,
    `Possession: ${p.possession_date ?? 'TBD'}`,
    `RERA: ${p.rera_number ?? 'N/A'}`,
  ].join('\n');
}

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(GEMINI_EMBED_URL, {
    method: 'POST',
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      taskType: 'RETRIEVAL_DOCUMENT',
      content: { parts: [{ text }] },
      output_dimensionality: EMBED_DIM,
    }),
  });
  if (!res.ok) throw new Error(`Gemini embed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return json.embedding.values as number[];
}

let collectionReady = false;

export async function ensureCollection() {
  if (collectionReady) return;
  const { collection } = cfg();
  const res = await qdrant(`/collections/${collection}`, 'GET', undefined, [404]);
  if (res.status === 404) {
    await qdrant(`/collections/${collection}`, 'PUT', {
      vectors: { size: EMBED_DIM, distance: 'Cosine' },
    });
  }
  collectionReady = true;
}

function payloadFor(p: Property, text: string) {
  return {
    property_code: p.property_code ?? '',
    project_name: p.project_name,
    title: p.project_name,
    location: p.location,
    property_type: p.property_type,
    seller_price: p.seller_price,
    price_lakhs: Math.round((p.seller_price / 100000) * 100) / 100,
    builder: p.builder_details ?? '',
    builder_details: p.builder_details ?? '',
    amenities: parseAmenities(p.amenities),
    payment_plan: p.payment_plan ?? '',
    locality_advantages: p.locality_advantages ?? '',
    brochure_url: p.brochure_url ?? '',
    possession_date: p.possession_date ?? '',
    rera_number: p.rera_number ?? '',
    availability_status: p.availability_status ?? 'available',
    available_units: p.available_units ?? 0,
    total_units: p.total_units ?? 0,
    featured: Boolean(p.featured),
    supabase_id: p.id, // kept so existing n8n expressions that read this field keep working
    property_id: p.id,
    text,
  };
}

/** Embed one property and write it to Qdrant. The point id IS the property UUID, so edits overwrite. */
export async function upsertPoint(p: Property) {
  await ensureCollection();
  const { collection } = cfg();
  const text = propertyToText(p);
  const vector = await embed(text);
  await qdrant(`/collections/${collection}/points?wait=true`, 'PUT', {
    points: [{ id: p.id, vector, payload: payloadFor(p, text) }],
  });
}

export async function removePoint(id: string) {
  await ensureCollection();
  const { collection } = cfg();
  await qdrant(`/collections/${collection}/points/delete?wait=true`, 'POST', { points: [id] });
}

/** Drop and rebuild the whole collection (replaces 03_qdrant_sync.py). */
export async function rebuildAll(properties: Property[]) {
  const { collection } = cfg();
  await qdrant(`/collections/${collection}`, 'DELETE', undefined, [404]);
  collectionReady = false;
  await ensureCollection();
  let synced = 0;
  const failed: { id: string; error: string }[] = [];
  for (const p of properties) {
    try {
      await upsertPoint(p);
      synced++;
    } catch (e) {
      failed.push({ id: p.id, error: e instanceof Error ? e.message : String(e) });
    }
    await new Promise((r) => setTimeout(r, 300)); // stay under the Gemini rate limit
  }
  return { synced, failed };
}
