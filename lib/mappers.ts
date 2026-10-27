import type { CallAnalytics, CallLog, Lead, NegotiationLog, Property } from './supabase';

/** DB prices are stored in absolute INR (e.g. 8500000 = ₹85 Lakhs) */
export function rupeesToLakhs(amount?: number | null): number {
  if (!amount) return 0;
  return amount / 100_000;
}

export function formatBudget(amount?: number | null): string {
  if (!amount) return 'Flexible';
  const lakhs = rupeesToLakhs(amount);
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Cr`;
  return `₹${lakhs.toFixed(lakhs % 1 === 0 ? 0 : 1)} Lakhs`;
}

export function mapLeadStatus(lead: Lead): string {
  const score = lead.interest_score ?? lead.lead_score ?? 0;
  const status = (lead.lead_status || '').toLowerCase();
  if (status === 'converted' || status === 'closed') return 'converted';
  if (score >= 80 || status === 'hot') return 'hot';
  if (score >= 50 || status === 'warm' || status === 'captured') return 'warm';
  return 'cold';
}

export type UIProperty = {
  id: string;
  title: string;
  description: string;
  location: string;
  area: string;
  city: string;
  property_type: string;
  price: number;
  minimum_price?: number;
  currency: string;
  amenities: string[];
  payment_plan?: string;
  builder_details?: string;
  locality_advantages?: string;
  availability_status?: string;
  possession_date?: string;
  rera_number?: string;
  featured: boolean;
  status: string;
  investment_score: number;
};

export function mapProperty(row: Property): UIProperty {
  const amenities = Array.isArray(row.amenities)
    ? row.amenities
    : typeof row.amenities === 'string'
      ? [row.amenities]
      : [];

  const location = row.location || 'India';
  const parts = location.split(',').map(s => s.trim());
  const city = parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'India';
  const area = parts[0] || location;

  return {
    id: row.id,
    title: row.project_name,
    description:
      row.locality_advantages ||
      row.builder_details ||
      row.payment_plan ||
      `${row.property_type} in ${location}`,
    location,
    area,
    city,
    property_type: row.property_type,
    price: row.seller_price,
    minimum_price: row.minimum_price,
    currency: 'INR',
    amenities,
    payment_plan: row.payment_plan,
    builder_details: row.builder_details,
    locality_advantages: row.locality_advantages,
    availability_status: row.availability_status,
    possession_date: row.possession_date,
    rera_number: row.rera_number,
    featured: (row.view_count ?? 0) > 10 || row.availability_status === 'available',
    status: row.availability_status || 'available',
    investment_score: Math.min(99, 70 + Math.min(29, Math.floor((row.view_count ?? 0) / 2))),
  };
}

export type UILead = {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  status: string;
  interest: string;
  budget: string;
  preferred_location?: string;
  property_type?: string;
  interest_score: number;
  sentiment?: string;
  next_action?: string;
  site_visit_interest?: string;
  whatsapp_sent?: boolean;
  negotiation_count?: number;
  call_count?: number;
  created_at: string;
  updated_at: string;
};

export function mapLead(row: Lead): UILead {
  return {
    id: row.id,
    name: row.customer_name || 'Unknown',
    phone_number: row.phone_number || '',
    email: row.email,
    status: mapLeadStatus(row),
    interest: [
      row.property_type,
      row.preferred_location ? `in ${row.preferred_location}` : '',
    ]
      .filter(Boolean)
      .join(' ') || 'General Inquiry',
    budget: formatBudget(row.budget_max),
    preferred_location: row.preferred_location,
    property_type: row.property_type,
    interest_score: row.interest_score ?? row.lead_score ?? 0,
    sentiment: row.sentiment,
    next_action: row.next_action,
    site_visit_interest: row.site_visit_interest,
    whatsapp_sent: row.whatsapp_sent,
    negotiation_count: row.negotiation_count,
    call_count: row.call_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type UICallLog = {
  id: string;
  call_id: string;
  customer_name?: string;
  customer_phone?: string;
  summary?: string;
  sentiment?: string;
  call_status: string;
  duration_seconds?: number;
  property_queried?: string;
  interest_score?: number;
  next_action?: string;
  recording_url?: string;
  created_at: string;
};

export function mapCallLog(row: CallLog): UICallLog {
  return {
    id: row.id,
    call_id: row.call_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    summary: row.summary,
    sentiment: row.sentiment,
    call_status: row.call_status,
    duration_seconds: row.duration_seconds,
    property_queried: row.property_queried,
    interest_score: row.interest_score,
    next_action: row.next_action,
    recording_url: row.recording_url,
    created_at: row.created_at,
  };
}

export type UISiteVisit = {
  id: string;
  lead_name: string;
  phone_number: string;
  property_address: string;
  visit_date: string;
  visit_time: string;
  status: string;
  source: string;
  created_at: string;
};

/** Derive site visits from leads + call_analytics when site_visits table is unavailable */
export function mapLeadToSiteVisit(lead: Lead): UISiteVisit | null {
  const interest = String(lead.site_visit_interest ?? '').toLowerCase();
  if (!interest || interest === 'false' || interest === 'no') return null;

  return {
    id: lead.id,
    lead_name: lead.customer_name || 'Client',
    phone_number: lead.phone_number,
    property_address: lead.preferred_location || lead.property_type || 'Property visit',
    visit_date: new Date(lead.updated_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    visit_time: new Date(lead.updated_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: interest.includes('book') ? 'confirmed' : 'pending',
    source: lead.source || 'vapi',
    created_at: lead.updated_at || lead.created_at,
  };
}

export function mapAnalyticsToSiteVisit(row: CallAnalytics): UISiteVisit | null {
  if (!row.visit_booked) return null;
  return {
    id: row.id,
    lead_name: row.customer_name || 'Client',
    phone_number: '',
    property_address: row.property_queried || row.preferred_location || 'Site visit booked',
    visit_date: new Date(row.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    visit_time: new Date(row.created_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'confirmed',
    source: 'call_analytics',
    created_at: row.created_at,
  };
}

export type UINegotiationRound = {
  id: string;
  call_id: string;
  lead_phone: string;
  round_number: number;
  buyer_offer: number;
  seller_price: number;
  minimum_price?: number;
  counter_offer?: number;
  response_text?: string;
  accepted?: boolean;
  buyer_interest_score?: number;
  escalated?: boolean;
  created_at: string;
};

export function mapNegotiationLog(row: NegotiationLog): UINegotiationRound {
  return {
    id: row.id,
    call_id: row.call_id,
    lead_phone: row.lead_phone,
    round_number: row.round_number ?? 1,
    buyer_offer: row.buyer_offer,
    seller_price: row.seller_price,
    minimum_price: row.minimum_price,
    counter_offer: row.counter_offer,
    response_text: row.response_text,
    accepted: row.accepted,
    buyer_interest_score: row.buyer_interest_score,
    escalated: row.escalated,
    created_at: row.created_at,
  };
}
