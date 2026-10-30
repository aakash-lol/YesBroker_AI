// Server-only helpers for route handlers (defence in depth on top of middleware.ts).
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { COOKIE_NAME, verifySession } from './session';

export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies();
  const session = await verifySession(store.get(COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}

function safeEqual(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

/** For n8n -> app calls. n8n sends header  x-api-secret: <N8N_API_SECRET> */
export function verifyN8nSecret(req: Request): NextResponse | null {
  const expected = process.env.N8N_API_SECRET;
  const got = req.headers.get('x-api-secret') ?? '';
  if (!expected || !safeEqual(got, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
