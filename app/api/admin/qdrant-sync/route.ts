import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { normalizeRow } from '@/lib/properties';
import { rebuildAll } from '@/lib/qdrant';

export const maxDuration = 300;

/** POST /api/admin/qdrant-sync: drop and rebuild the whole knowledge base (replaces 03_qdrant_sync.py). */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const rows = await query('SELECT * FROM properties WHERE is_published = 1 ORDER BY created_at ASC');
    const result = await rebuildAll(rows.map(normalizeRow));
    return NextResponse.json({ total: rows.length, ...result });
  } catch (e) {
    console.error('[admin/qdrant-sync]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sync failed' }, { status: 500 });
  }
}
