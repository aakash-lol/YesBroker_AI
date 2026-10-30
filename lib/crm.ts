import { query, queryOne, execute, uuid, toSqlDate } from './db';
import type { Lead } from './types';

const NUMERIC = new Set([
  'budget_min', 'budget_max', 'lead_score', 'interest_score', 'call_count',
  'negotiation_count', 'last_negotiated_price',
]);
const BOOLEAN = new Set(['whatsapp_sent', 'negotiation_accepted']);

/** What the public website forms (lead modal, visit booking) may set. */
export const PUBLIC_LEAD_FIELDS = [
  'customer_name', 'email', 'budget_min', 'budget_max', 'preferred_location',
  'property_type', 'loan_requirement', 'site_visit_interest', 'notes', 'source',
] as const;

/** What n8n (trusted, behind a shared secret) may set. */
export const N8N_LEAD_FIELDS = [
  ...PUBLIC_LEAD_FIELDS, 'lead_status', 'lead_score', 'interest_score', 'sentiment', 'next_action',
  'assigned_to', 'last_call_id', 'last_event_type', 'call_count', 'negotiation_count',
  'last_negotiated_price', 'negotiation_accepted', 'whatsapp_sent',
] as const;

/** What a logged-in admin may PATCH from the CRM. */
export const ADMIN_LEAD_FIELDS = ['lead_status', 'notes', 'assigned_to', 'next_action', 'interest_score'] as const;

/**
 * One canonical form per person, so the website form ("98765 43210") and Vapi/n8n ("+919876543210")
 * hit the same lead row (phone_number is UNIQUE). Defaults to India (+91) for bare 10-digit numbers.
 */
export function normalizePhone(v: unknown): string | null {
  const raw = String(v ?? '').trim().slice(0, 40);
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

function coerce(col: string, v: unknown): unknown {
  if (NUMERIC.has(col)) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  if (BOOLEAN.has(col)) return v ? 1 : 0;
  return typeof v === 'string' ? v.trim().slice(0, 5000) : v;
}

/** Insert a lead, or update only the fields that were supplied. Column names come from `allowed` (constants). */
export async function upsertLead(
  phone: string,
  fields: Record<string, unknown>,
  allowed: readonly string[],
  fillOnly: readonly string[] = []
) {
  const cols = allowed.filter((c) => fields[c] !== undefined && fields[c] !== null && fields[c] !== '');
  const values = cols.map((c) => coerce(c, fields[c]));
  const insertCols = ['id', 'phone_number', ...cols];
  // fillOnly columns never overwrite an existing value. Used for public forms, so a stranger who knows
  // someone's phone number cannot rewrite that lead's name, budget or notes.
  const updates = [
    ...cols.map((c) => (fillOnly.includes(c) ? `${c} = COALESCE(${c}, VALUES(${c}))` : `${c} = VALUES(${c})`)),
    'updated_at = CURRENT_TIMESTAMP',
  ];
  await execute(
    `INSERT INTO leads (${insertCols.join(', ')}) VALUES (${insertCols.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE ${updates.join(', ')}`,
    [uuid(), phone, ...values]
  );
  return queryOne<Lead>('SELECT * FROM leads WHERE phone_number = ?', [phone]);
}

// ───────────────────────── site visits ─────────────────────────

export type NewVisit = {
  phone: string;
  name?: string;
  propertyId?: string | null;
  date: string; // YYYY-MM-DD, India local date
  time?: string; // HH:MM, India local time
  notes?: string;
  source: string;
};

export async function createSiteVisit(v: NewVisit) {
  const time = v.time && /^\d{2}:\d{2}$/.test(v.time) ? v.time : '10:00';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) throw new Error('visit_date must be YYYY-MM-DD');
  const start = new Date(`${v.date}T${time}:00+05:30`);
  if (Number.isNaN(start.getTime())) throw new Error('Invalid visit date/time');
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const id = uuid();
  await execute(
    `INSERT INTO site_visits (id, lead_phone, lead_name, property_id, slot_start, slot_end, status, notes, source)
     VALUES (?, ?, ?, ?, ?, ?, 'booked', ?, ?)`,
    [id, v.phone, v.name ?? null, v.propertyId ?? null, toSqlDate(start), toSqlDate(end), v.notes ?? null, v.source]
  );
  return { id, date: v.date, time };
}

// ───────────────────────── negotiation log ─────────────────────────

export async function logNegotiation(e: {
  callId?: string;
  leadPhone?: string;
  propertyId?: string | null;
  buyerOffer: number;
  sellerPrice: number;
  minimumPrice: number;
  counterOffer: number;
  responseText: string;
  accepted: boolean;
  interestScore: number;
  escalated: boolean;
}) {
  const callId = e.callId || 'frontend';
  const phone = e.leadPhone || '';
  const prev = await queryOne<{ n: number }>(
    'SELECT COUNT(*) AS n FROM negotiation_logs WHERE call_id = ? AND lead_phone = ?',
    [callId, phone]
  );
  await execute(
    `INSERT INTO negotiation_logs
     (id, call_id, lead_phone, property_id, round_number, buyer_offer, seller_price, minimum_price,
      counter_offer, response_text, accepted, buyer_interest_score, escalated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuid(), callId, phone, e.propertyId ?? null, Number(prev?.n ?? 0) + 1,
      Math.round(e.buyerOffer), Math.round(e.sellerPrice), Math.round(e.minimumPrice),
      e.counterOffer, e.responseText, e.accepted ? 1 : 0, e.interestScore, e.escalated ? 1 : 0,
    ]
  );
}

/** Generic upsert for call_logs / call_analytics. Table and column names are literals in our code. */
export async function upsertRow(table: 'call_logs' | 'call_analytics', data: Record<string, unknown>) {
  const row: Record<string, unknown> = { id: uuid(), ...data };
  const cols = Object.keys(row);
  const updates = cols.filter((c) => c !== 'id' && c !== 'created_at').map((c) => `${c} = VALUES(${c})`);
  await execute(
    `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
     ON DUPLICATE KEY UPDATE ${updates.join(', ')}`,
    Object.values(row).map((v) => (v !== null && typeof v === 'object' ? JSON.stringify(v) : v))
  );
}

export { query };
