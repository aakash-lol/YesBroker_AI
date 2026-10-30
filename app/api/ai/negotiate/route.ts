import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { computeNegotiation } from '@/lib/negotiation';
import { logNegotiation } from '@/lib/crm';
import { getPropertyFull } from '@/lib/properties';

/** POST /api/ai/negotiate (admin only: the response reveals the floor price) */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  let propertyPrice = Number(body.propertyPrice ?? body.seller_price ?? 0);
  let minimumPrice = Number(body.minimumPrice ?? body.minimum_price ?? 0);
  let title: string = body.propertyTitle ?? body.property_title ?? 'this property';
  let propertyId: string | null = null;

  const ref = body.propertyId ?? body.property_id;
  if (ref) {
    try {
      const p = await getPropertyFull(String(ref));
      if (p) {
        propertyId = p.id;
        propertyPrice = p.seller_price;
        minimumPrice = p.minimum_price ?? Math.round(p.seller_price * 0.94);
        title = p.project_name;
      }
    } catch {
      /* fall back to the values sent by the client */
    }
  }

  const r = computeNegotiation({ propertyPrice, minimumPrice, buyerOffer: Number(body.buyerOffer ?? body.buyer_offer ?? 0), propertyTitle: title });

  try {
    await logNegotiation({
      callId: body.call_id,
      leadPhone: body.lead_phone ?? body.phone,
      propertyId,
      buyerOffer: r.buyerOffer,
      sellerPrice: r.propertyPrice,
      minimumPrice: r.minimumPrice,
      counterOffer: r.counterOffer,
      responseText: r.recommendation,
      accepted: r.accepted,
      interestScore: r.interestScore,
      escalated: r.escalate,
    });
  } catch (e) {
    console.error('[negotiate log]', e); // non-blocking
  }

  return NextResponse.json({
    propertyPrice: r.propertyPrice,
    buyerOffer: r.buyerOffer,
    counterOffer: r.counterOffer,
    interestScore: r.interestScore,
    recommendation: r.recommendation,
    escalate: r.escalate,
    accepted: r.accepted,
    aiReason: r.aiReason,
    propertyTitle: title,
  });
}
