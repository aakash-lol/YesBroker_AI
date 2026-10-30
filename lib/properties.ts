import { query, queryOne, execute, uuid } from './db';
import { mapProperty, type UIProperty } from './mappers';
import { parseAmenities, upsertPoint, removePoint } from './qdrant';
import type { Property } from './types';

/** Everything except minimum_price and kb_chunk_id. Public queries MUST use this list, never SELECT *. */
export const PUBLIC_COLUMNS = [
  'id', 'property_code', 'project_name', 'location', 'property_type', 'seller_price',
  'amenities', 'payment_plan', 'builder_details', 'locality_advantages',
  'brochure_url', 'price_sheet_url', 'floor_plan_url', 'image_url',
  'availability_status', 'total_units', 'available_units', 'possession_date',
  'rera_number', 'featured', 'view_count', 'created_at', 'updated_at',
].join(', ');

export function normalizeRow(row: any): Property {
  return { ...row, amenities: parseAmenities(row.amenities) };
}

export function toPublicProperty(row: any): UIProperty {
  const p = mapProperty(normalizeRow(row));
  delete p.minimum_price;
  return p;
}

export async function listPublicProperties(): Promise<UIProperty[]> {
  const rows = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM properties WHERE is_published = 1 ORDER BY featured DESC, created_at DESC`
  );
  return rows.map(toPublicProperty);
}

export async function getPublicProperty(id: string): Promise<UIProperty | null> {
  const row = await queryOne(`SELECT ${PUBLIC_COLUMNS} FROM properties WHERE id = ? AND is_published = 1`, [id]);
  return row ? toPublicProperty(row) : null;
}

/** Full row including the private floor price. Server-side / admin / negotiation use only. */
export async function getPropertyFull(idOrCode: string): Promise<Property | null> {
  const row = await queryOne('SELECT * FROM properties WHERE id = ? OR property_code = ? LIMIT 1', [idOrCode, idOrCode]);
  return row ? normalizeRow(row) : null;
}

// ───────────────────────── input validation ─────────────────────────

const STATUSES = ['available', 'sold', 'upcoming', 'on_hold'];

type Parsed = { ok: true; data: Record<string, unknown> } | { ok: false; error: string };

function text(v: unknown, max: number): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function int(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

export function parsePropertyInput(body: Record<string, any>, mode: 'create' | 'update'): Parsed {
  const d: Record<string, unknown> = {};
  const has = (k: string) => body[k] !== undefined;
  const fail = (error: string): Parsed => ({ ok: false, error });

  for (const [k, label, max] of [
    ['project_name', 'Project name', 255],
    ['location', 'Location', 255],
    ['property_type', 'Property type', 100],
  ] as const) {
    if (mode === 'create' || has(k)) {
      const v = text(body[k], max);
      if (!v) return fail(`${label} is required`);
      d[k] = v;
    }
  }

  if (mode === 'create' || has('seller_price')) {
    const n = int(body.seller_price);
    if (n === null || Number.isNaN(n) || n <= 0) return fail('Listed price must be a positive number');
    d.seller_price = n;
  }
  if (has('minimum_price')) {
    const n = int(body.minimum_price);
    if (Number.isNaN(n) || (n !== null && n < 0)) return fail('Minimum price is invalid');
    d.minimum_price = n;
  }

  for (const [k, max] of [
    ['property_code', 50], ['payment_plan', 5000], ['builder_details', 5000],
    ['locality_advantages', 5000], ['possession_date', 50], ['rera_number', 100],
  ] as const) {
    if (has(k)) d[k] = text(body[k], max);
  }

  for (const k of ['brochure_url', 'price_sheet_url', 'floor_plan_url', 'image_url']) {
    if (has(k)) {
      const v = text(body[k], 500);
      if (v && !/^(https?:\/\/|\/)/i.test(v)) return fail(`${k} must start with http(s):// or /`);
      d[k] = v;
    }
  }

  if (has('availability_status')) {
    const v = String(body.availability_status);
    if (!STATUSES.includes(v)) return fail(`Status must be one of: ${STATUSES.join(', ')}`);
    d.availability_status = v;
  }
  for (const k of ['total_units', 'available_units']) {
    if (has(k)) {
      const n = int(body[k]);
      if (Number.isNaN(n) || (n !== null && n < 0)) return fail(`${k} is invalid`);
      d[k] = n;
    }
  }
  if (has('amenities')) d.amenities = JSON.stringify(parseAmenities(body.amenities));
  for (const k of ['featured', 'is_published']) if (has(k)) d[k] = body[k] ? 1 : 0;

  const seller = d.seller_price as number | undefined;
  const min = d.minimum_price as number | null | undefined;
  if (seller !== undefined && min != null && min > seller) return fail('Minimum price cannot be higher than the listed price');

  return { ok: true, data: d };
}

// ───────────────────────── writes ─────────────────────────
// Column names come from the whitelist in parsePropertyInput, never from the request.

export async function createProperty(data: Record<string, unknown>) {
  const id = uuid();
  const cols = ['id', ...Object.keys(data)];
  await execute(
    `INSERT INTO properties (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
    [id, ...Object.values(data)]
  );
  return id;
}

export async function updateProperty(id: string, data: Record<string, unknown>) {
  const keys = Object.keys(data);
  if (!keys.length) return;
  await execute(`UPDATE properties SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, [
    ...Object.values(data),
    id,
  ]);
}

export async function deletePropertyRow(id: string) {
  await execute('DELETE FROM properties WHERE id = ?', [id]);
}

/** Keep the voice-agent knowledge base (Qdrant) in step with MySQL. Never throws. */
export async function syncPropertyToQdrant(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const row = await queryOne('SELECT * FROM properties WHERE id = ?', [id]);
    if (!row || !row.is_published) await removePoint(id);
    else await upsertPoint(normalizeRow(row));
    return { ok: true };
  } catch (e) {
    console.error('[qdrant sync]', e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
