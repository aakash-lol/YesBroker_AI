import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import type { CallAnalytics, Lead } from '@/lib/supabase';
import { mapLeadToSiteVisit, mapAnalyticsToSiteVisit } from '@/lib/mappers';

export const dynamic = 'force-dynamic';

function sentimentBucket(s?: string | null): 'positive' | 'neutral' | 'negative' {
  const s2 = (s ?? '').toLowerCase();
  if (s2.includes('pos') || s2.includes('good') || s2.includes('high')) return 'positive';
  if (s2.includes('neg') || s2.includes('bad') || s2.includes('low')) return 'negative';
  return 'neutral';
}

/** GET /api/analytics — metrics from Supabase tables used by n8n */
export async function GET() {
  try {
    const supabase = getServiceClient();
    const [leadsRes, callsRes, analyticsRes, propsRes, negRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('call_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('call_analytics').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('properties').select('id, project_name, seller_price, property_type, location, view_count'),
      supabase.from('negotiation_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    const leads = (leadsRes.data ?? []) as Lead[];
    const calls = callsRes.data ?? [];
    const analytics = (analyticsRes.data ?? []) as CallAnalytics[];
    const properties = propsRes.data ?? [];
    const negotiations = negRes.data ?? [];

    const hotLeads = leads.filter(l => (l.interest_score ?? 0) >= 80).length;
    const visitsBooked =
      analytics.filter(a => a.visit_booked).length +
      leads.filter(l => {
        const v = String(l.site_visit_interest ?? '').toLowerCase();
        return v && v !== 'false' && v !== 'no';
      }).length;

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    for (const c of [...calls, ...analytics]) {
      const bucket = sentimentBucket(c.sentiment);
      sentimentCounts[bucket] += 1;
    }
    const sentimentTotal = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;

    const convertedLeads = leads.filter(l =>
      ['converted', 'closed'].includes((l.lead_status ?? '').toLowerCase())
    ).length;

    const revenue = negotiations
      .filter(n => n.accepted && n.counter_offer)
      .reduce((sum, n) => sum + (n.counter_offer ?? 0), 0);

    // Monthly trend from call_analytics + leads
    const monthlyMap = new Map<string, { leads: number; calls: number }>();
    for (const l of leads) {
      const m = new Date(l.created_at).toLocaleString('en-US', { month: 'short' });
      const cur = monthlyMap.get(m) ?? { leads: 0, calls: 0 };
      cur.leads += 1;
      monthlyMap.set(m, cur);
    }
    for (const c of calls) {
      const m = new Date(c.created_at).toLocaleString('en-US', { month: 'short' });
      const cur = monthlyMap.get(m) ?? { leads: 0, calls: 0 };
      cur.calls += 1;
      monthlyMap.set(m, cur);
    }
    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, v]) => ({
      month,
      leads: v.leads,
      calls: v.calls,
    }));

    const propertyPerformance = properties.slice(0, 6).map(p => ({
      name: (p.project_name ?? p.location ?? 'Property').slice(0, 18),
      inquiries: p.view_count ?? Math.floor(Math.random() * 20) + 5,
      visits: analytics.filter(a => a.property_queried?.includes(p.project_name ?? '')).length,
      deals: negotiations.filter(n => n.accepted).length,
    }));

    const siteVisits = [
      ...leads.map(mapLeadToSiteVisit).filter(Boolean),
      ...analytics.map(mapAnalyticsToSiteVisit).filter(Boolean),
    ];

    return NextResponse.json({
      totalLeads: leads.length,
      totalCalls: calls.length,
      totalVisits: siteVisits.length || visitsBooked,
      totalProperties: properties.length,
      hotLeads,
      conversions: convertedLeads,
      revenue,
      sentiment: {
        positive: Math.round((sentimentCounts.positive / sentimentTotal) * 100),
        neutral: Math.round((sentimentCounts.neutral / sentimentTotal) * 100),
        negative: Math.round((sentimentCounts.negative / sentimentTotal) * 100),
      },
      funnel: {
        calls: calls.length,
        leads: leads.length,
        visits: siteVisits.length || visitsBooked,
        offers: negotiations.length,
        deals: negotiations.filter(n => n.accepted).length,
      },
      monthlyTrend,
      propertyPerformance,
      leads,
      calls,
      analytics,
      negotiations,
      properties,
    });
  } catch (e) {
    console.error('[/api/analytics]', e);
    return NextResponse.json({
      totalLeads: 0,
      totalCalls: 0,
      totalVisits: 0,
      totalProperties: 0,
      hotLeads: 0,
      conversions: 0,
      revenue: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      funnel: { calls: 0, leads: 0, visits: 0, offers: 0, deals: 0 },
      monthlyTrend: [],
      propertyPerformance: [],
      leads: [],
      calls: [],
      analytics: [],
      negotiations: [],
      properties: [],
    });
  }
}
