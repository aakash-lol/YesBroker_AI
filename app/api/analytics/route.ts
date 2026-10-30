import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const EMPTY = {
  totalLeads: 0, totalCalls: 0, totalVisits: 0, totalProperties: 0, hotLeads: 0, conversions: 0, revenue: 0,
  sentiment: { positive: 0, neutral: 0, negative: 0 },
  funnel: { calls: 0, leads: 0, visits: 0, offers: 0, deals: 0 },
  monthlyTrend: [], propertyPerformance: [],
};

function bucket(s?: string | null): 'positive' | 'neutral' | 'negative' {
  const v = (s ?? '').toLowerCase();
  if (v.includes('pos') || v.includes('good') || v.includes('high')) return 'positive';
  if (v.includes('neg') || v.includes('bad') || v.includes('low')) return 'negative';
  return 'neutral';
}

const count = async (sql: string) => Number((await queryOne<{ n: number }>(sql))?.n ?? 0);

/** GET /api/analytics (admin only). Aggregates in SQL; no longer ships raw leads/calls/floor prices to the browser. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const [
      totalLeads, hotLeads, conversions, totalCalls, totalVisits, totalProperties, offers, deals, rev,
      sentimentRows, leadMonths, callMonths, props, visitsByProp, dealsByProp,
    ] = await Promise.all([
      count('SELECT COUNT(*) n FROM leads'),
      count('SELECT COUNT(*) n FROM leads WHERE interest_score >= 80'),
      count("SELECT COUNT(*) n FROM leads WHERE lead_status IN ('converted','closed')"),
      count('SELECT COUNT(*) n FROM call_logs'),
      count("SELECT COUNT(*) n FROM site_visits WHERE status <> 'cancelled'"),
      count('SELECT COUNT(*) n FROM properties WHERE is_published = 1'),
      count('SELECT COUNT(*) n FROM negotiation_logs'),
      count('SELECT COUNT(*) n FROM negotiation_logs WHERE accepted = 1'),
      queryOne<{ s: string | null }>('SELECT SUM(counter_offer) s FROM negotiation_logs WHERE accepted = 1 AND counter_offer IS NOT NULL'),
      query<{ sentiment: string }>('SELECT sentiment FROM call_logs WHERE sentiment IS NOT NULL'),
      query<{ ym: string; n: number }>("SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) n FROM leads WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY ym"),
      query<{ ym: string; n: number }>("SELECT DATE_FORMAT(created_at, '%Y-%m') ym, COUNT(*) n FROM call_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY ym"),
      query<{ id: string; project_name: string; view_count: number }>('SELECT id, project_name, view_count FROM properties WHERE is_published = 1 ORDER BY view_count DESC LIMIT 6'),
      query<{ property_id: string; n: number }>('SELECT property_id, COUNT(*) n FROM site_visits WHERE property_id IS NOT NULL GROUP BY property_id'),
      query<{ property_id: string; n: number }>('SELECT property_id, COUNT(*) n FROM negotiation_logs WHERE accepted = 1 AND property_id IS NOT NULL GROUP BY property_id'),
    ]);

    const sc = { positive: 0, neutral: 0, negative: 0 };
    for (const r of sentimentRows) sc[bucket(r.sentiment)] += 1;
    const st = sc.positive + sc.neutral + sc.negative || 1;

    const months = new Map<string, { leads: number; calls: number }>();
    for (const r of leadMonths) months.set(r.ym, { leads: Number(r.n), calls: 0 });
    for (const r of callMonths) months.set(r.ym, { leads: months.get(r.ym)?.leads ?? 0, calls: Number(r.n) });
    const monthlyTrend = [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, v]) => ({ month: new Date(`${ym}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }), ...v }));

    const vMap = new Map(visitsByProp.map((r) => [r.property_id, Number(r.n)]));
    const dMap = new Map(dealsByProp.map((r) => [r.property_id, Number(r.n)]));
    const propertyPerformance = props.map((p) => ({
      name: p.project_name.slice(0, 18),
      inquiries: p.view_count ?? 0,
      visits: vMap.get(p.id) ?? 0,
      deals: dMap.get(p.id) ?? 0,
    }));

    return NextResponse.json({
      totalLeads, totalCalls, totalVisits, totalProperties, hotLeads, conversions,
      revenue: Number(rev?.s ?? 0),
      sentiment: {
        positive: Math.round((sc.positive / st) * 100),
        neutral: Math.round((sc.neutral / st) * 100),
        negative: Math.round((sc.negative / st) * 100),
      },
      funnel: { calls: totalCalls, leads: totalLeads, visits: totalVisits, offers, deals },
      monthlyTrend,
      propertyPerformance,
    });
  } catch (e) {
    console.error('[/api/analytics]', e);
    return NextResponse.json(EMPTY);
  }
}
