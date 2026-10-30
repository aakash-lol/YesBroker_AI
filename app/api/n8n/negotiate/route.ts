import { NextResponse } from 'next/server';
import { verifyN8nSecret } from '@/lib/auth';
import { getPropertyFull } from '@/lib/properties';
import { computeNegotiation } from '@/lib/negotiation';
import { logNegotiation, normalizePhone, upsertLead } from '@/lib/crm';

/**
 * POST /api/n8n/negotiate  (header x-api-secret)
 * Body: { property_id | property_code, buyer_offer, call_id?, lead_phone? }   (buyer_offer may be in rupees or lakhs)
 * The floor price stays on the server: only the counter offer and flags are returned to n8n / the voice agent.
 */
export async function POST(req: Request) {
  const denied = verifyN8nSecret(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const ref = String(body.property_id ?? body.property_code ?? '');
  const property = ref ? await getPropertyFull(ref) : null;
  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  const r = computeNegotiation({
    propertyPrice: property.seller_price,
    minimumPrice: property.minimum_price ?? Math.round(property.seller_price * 0.94),
    buyerOffer: Number(body.buyer_offer ?? 0),
    propertyTitle: property.project_name,
  });

  const phone = normalizePhone(body.lead_phone);
  await logNegotiation({
    callId: body.call_id, leadPhone: phone ?? '', propertyId: property.id, buyerOffer: r.buyerOffer,
    sellerPrice: r.propertyPrice, minimumPrice: r.minimumPrice, counterOffer: r.counterOffer,
    responseText: r.recommendation, accepted: r.accepted, interestScore: r.interestScore, escalated: r.escalate,
  }).catch((e) => console.error('[n8n negotiate log]', e));

  if (phone) {
    await upsertLead(phone, {
      last_negotiated_price: r.counterOffer, negotiation_accepted: r.accepted, last_call_id: body.call_id,
    }, ['last_negotiated_price', 'negotiation_accepted', 'last_call_id']).catch(() => {});
  }

  return NextResponse.json({
    property: property.project_name,
    listedPrice: property.seller_price,
    counterOffer: r.counterOffer,
    accepted: r.accepted,
    escalate: r.escalate,
    interestScore: r.interestScore,
  });
}
