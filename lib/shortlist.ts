const KEY = "yesbroker_shortlist_v1";
const EVENT = "yesbroker:shortlist-change";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* storage unavailable — no-op */
  }
}

export function getShortlist(): string[] {
  return readIds();
}

export function isShortlisted(id: string): boolean {
  return readIds().includes(id);
}

export function toggleShortlist(id: string): string[] {
  const ids = readIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  writeIds(next);
  return next;
}

export function removeFromShortlist(id: string): string[] {
  const next = readIds().filter((x) => x !== id);
  writeIds(next);
  return next;
}

export const SHORTLIST_EVENT = EVENT;