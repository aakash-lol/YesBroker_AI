import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { rupeesToLakhs } from '@/lib/mappers';

/**
 * POST /api/ai/negotiate
 * Mirrors n8n Gemini negotiation logic using Supabase property prices (lakhs → absolute INR).
 */
export async function POST(req: Request) {
  const body = await req.json();
  let propertyPrice = Number(body.propertyPrice ?? body.seller_price ?? 0);
  let minimumPrice = Number(body.minimumPrice ?? body.minimum_price ?? 0);
  const buyerOffer = Number(body.buyerOffer ?? body.buyer_offer ?? 0);
  const propertyId = body.propertyId ?? body.property_id;
  const propertyTitle = body.propertyTitle ?? body.property_title ?? 'this property';

  // Load from Supabase if property id provided
  if (propertyId) {
    try {
      const supabase = getServiceClient();
      const { data } = await supabase
        .from('properties')
        .select('seller_price, minimum_price, project_name')
        .eq('id', propertyId)
        .maybeSingle();
      if (data) {
        propertyPrice = data.seller_price;
        minimumPrice = data.minimum_price ?? Math.round(data.seller_price * 0.94);
        if (!body.propertyTitle) body.propertyTitle = data.project_name;
      }
    } catch {
      /* use passed values */
    }
  }

  // Frontend may send lakhs; n8n stores absolute INR
  if (propertyPrice > 0 && propertyPrice < 1000) propertyPrice *= 100_000;
  if (minimumPrice > 0 && minimumPrice < 1000) minimumPrice *= 100_000;
  let normalizedBuyerOffer = buyerOffer;
  if (normalizedBuyerOffer > 0 && normalizedBuyerOffer < 1000) normalizedBuyerOffer *= 100_000;

  const sellerLakhs = rupeesToLakhs(propertyPrice);
  const minLakhs = rupeesToLakhs(minimumPrice || propertyPrice * 0.94);
  const buyerLakhs = rupeesToLakhs(normalizedBuyerOffer);

  let counterOfferLakhs: number;
  let interestScore: number;
  let recommendation: string;
  let escalate = false;
  let accepted = false;

  if (buyerLakhs >= minLakhs) {
    counterOfferLakhs = buyerLakhs;
    interestScore = 95;
    accepted = true;
    recommendation = 'Strong offer at or above floor price. Recommend accepting and scheduling site visit.';
  } else if (buyerLakhs >= minLakhs - 5) {
    counterOfferLakhs = minLakhs + 2;
    interestScore = 75;
    recommendation = 'Buyer is close to floor. Counter slightly above minimum to preserve margin.';
    escalate = false;
  } else if (buyerLakhs >= sellerLakhs * 0.8) {
    counterOfferLakhs = sellerLakhs - 3;
    interestScore = 60;
    recommendation = 'Offer below target but negotiable. Counter firmly and highlight property value.';
    escalate = true;
  } else {
    counterOfferLakhs = sellerLakhs - 3;
    interestScore = 35;
    recommendation = 'Offer significantly below market. Strong counter recommended; consider human escalation.';
    escalate = true;
  }

  const counterOffer = Math.round(counterOfferLakhs * 100_000);
  const ratio = normalizedBuyerOffer / propertyPrice;

  const aiReason = `Analysis for ${propertyTitle}: buyer offered ₹${buyerLakhs.toFixed(1)} Lakhs (${(ratio * 100).toFixed(0)}% of ask ₹${sellerLakhs.toFixed(1)} Lakhs). Floor is ₹${minLakhs.toFixed(1)} Lakhs. AI counter: ₹${counterOfferLakhs.toFixed(1)} Lakhs.`;

  // Log to negotiation_logs (same table n8n uses)
  try {
    const supabase = getServiceClient();
    await supabase.from('negotiation_logs').insert({
      call_id: body.call_id ?? 'frontend',
      lead_phone: body.lead_phone ?? body.phone ?? '',
      buyer_offer: Math.round(normalizedBuyerOffer),
      seller_price: Math.round(propertyPrice),
      minimum_price: Math.round(minimumPrice || propertyPrice * 0.94),
      counter_offer: counterOffer,
      response_text: recommendation,
      accepted,
      buyer_interest_score: interestScore,
      escalated: escalate,
    });
  } catch {
    /* non-blocking */
  }

  return NextResponse.json({
    propertyPrice,
    buyerOffer: normalizedBuyerOffer,
    counterOffer,
    interestScore,
    recommendation,
    escalate,
    accepted,
    aiReason,
    propertyTitle: body.propertyTitle ?? propertyTitle,
  });
}
