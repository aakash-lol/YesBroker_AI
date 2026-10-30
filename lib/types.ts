// Row types (replaces the type exports that lived in lib/supabase.ts)

export type Lead = {
  id: string;
  phone_number: string;
  customer_name?: string;
  email?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  property_type?: string;
  loan_requirement?: string;
  site_visit_interest?: string;
  lead_status: string;
  lead_score: number;
  interest_score: number;
  sentiment?: string;
  next_action?: string;
  assigned_to?: string;
  source: string;
  last_call_id?: string;
  last_event_type?: string;
  call_count?: number;
  negotiation_count?: number;
  last_negotiated_price?: number;
  negotiation_accepted?: boolean;
  whatsapp_sent?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type CallLog = {
  id: string;
  call_id: string;
  assistant_id?: string;
  customer_name?: string;
  customer_phone?: string;
  event_type?: string;
  route?: string;
  transcript?: string;
  summary?: string;
  sentiment?: string;
  interest_score?: number;
  next_action?: string;
  recording_url?: string;
  call_status: string;
  received_at?: string;
  duration_seconds?: number;
  ended_reason?: string;
  property_queried?: string;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  property_code?: string;
  project_name: string;
  location: string;
  property_type: string;
  seller_price: number;
  minimum_price?: number;
  amenities: string[] | unknown;
  payment_plan?: string;
  builder_details?: string;
  locality_advantages?: string;
  brochure_url?: string;
  price_sheet_url?: string;
  floor_plan_url?: string;
  image_url?: string;
  kb_chunk_id?: string;
  availability_status?: string;
  total_units?: number;
  available_units?: number;
  possession_date?: string;
  rera_number?: string;
  featured?: boolean;
  is_published?: boolean;
  view_count?: number;
  created_at: string;
  updated_at: string;
};

export type CallAnalytics = {
  id: string;
  call_id: string;
  customer_name?: string;
  budget?: string;
  preferred_location?: string;
  interest_score?: number;
  sentiment?: string;
  next_action?: string;
  summary?: string;
  call_duration_seconds?: number;
  property_queried?: string;
  negotiation_rounds?: number;
  final_offer?: number;
  visit_booked?: boolean;
  recording_url?: string;
  created_at: string;
};

export type NegotiationLog = {
  id: string;
  call_id: string;
  lead_phone: string;
  property_id?: string;
  round_number?: number;
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

export type SiteVisit = {
  id: string;
  lead_phone: string;
  lead_name?: string;
  property_id?: string;
  slot_start: string;
  slot_end: string;
  status: string;
  notes?: string;
  source: string;
  created_at: string;
  updated_at?: string;
};
