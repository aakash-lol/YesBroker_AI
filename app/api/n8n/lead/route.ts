import { NextResponse } from 'next/server';
import { verifyN8nSecret } from '@/lib/auth';
import { N8N_LEAD_FIELDS, normalizePhone, upsertLead } from '@/lib/crm';
import { mapLead } from '@/lib/mappers';

/** POST /api/n8n/lead  (header x-api-secret). Body: { phone_number, customer_name, budget_max, ... } */
export async function POST(req: Request) {
  const denied = verifyN8nSecret(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(body.phone_number ?? body.phone);
  if (!phone) return NextResponse.json({ error: 'phone_number required' }, { status: 400 });
  const lead = await upsertLead(phone, { source: 'vapi', ...body }, N8N_LEAD_FIELDS);
  return NextResponse.json({ success: true, lead: lead ? mapLead(lead) : null });
}
