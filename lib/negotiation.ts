import { rupeesToLakhs } from './mappers';

export type NegotiationInput = {
  propertyPrice: number;
  minimumPrice: number;
  buyerOffer: number;
  propertyTitle?: string;
};

const toRupees = (n: number) => (n > 0 && n < 1000 ? n * 100_000 : n); // callers may send lakhs

/** Same rules as the original /api/ai/negotiate. Pure function, no DB. */
export function computeNegotiation(input: NegotiationInput) {
  const propertyPrice = toRupees(input.propertyPrice);
  const minimumPrice = toRupees(input.minimumPrice) || Math.round(propertyPrice * 0.94);
  const buyerOffer = toRupees(input.buyerOffer);
  const title = input.propertyTitle ?? 'this property';

  const sellerLakhs = rupeesToLakhs(propertyPrice);
  const minLakhs = rupeesToLakhs(minimumPrice);
  const buyerLakhs = rupeesToLakhs(buyerOffer);

  let counterLakhs: number;
  let interestScore: number;
  let recommendation: string;
  let escalate = false;
  let accepted = false;

  if (buyerLakhs >= minLakhs) {
    counterLakhs = buyerLakhs;
    interestScore = 95;
    accepted = true;
    recommendation = 'Strong offer at or above floor price. Recommend accepting and scheduling site visit.';
  } else if (buyerLakhs >= minLakhs - 5) {
    counterLakhs = minLakhs + 2;
    interestScore = 75;
    recommendation = 'Buyer is close to floor. Counter slightly above minimum to preserve margin.';
  } else if (buyerLakhs >= sellerLakhs * 0.8) {
    counterLakhs = sellerLakhs - 3;
    interestScore = 60;
    recommendation = 'Offer below target but negotiable. Counter firmly and highlight property value.';
    escalate = true;
  } else {
    counterLakhs = sellerLakhs - 3;
    interestScore = 35;
    recommendation = 'Offer significantly below market. Strong counter recommended; consider human escalation.';
    escalate = true;
  }

  const counterOffer = Math.round(counterLakhs * 100_000);
  const ratio = propertyPrice ? buyerOffer / propertyPrice : 0;
  const aiReason = `Analysis for ${title}: buyer offered ₹${buyerLakhs.toFixed(1)} Lakhs (${(ratio * 100).toFixed(0)}% of ask ₹${sellerLakhs.toFixed(1)} Lakhs). Floor is ₹${minLakhs.toFixed(1)} Lakhs. AI counter: ₹${counterLakhs.toFixed(1)} Lakhs.`;

  return { propertyPrice, minimumPrice, buyerOffer, counterOffer, interestScore, recommendation, escalate, accepted, aiReason };
}
