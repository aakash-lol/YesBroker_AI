"""
YESBROKER / AI Estate OS – Qdrant Sync Script
==============================================
Steps:
  1. Fetch all properties from Supabase
  2. Delete & recreate Qdrant collection (real_estate_kb)
  3. Embed each property with gemini-embedding-001 (768-dim)
  4. Upsert all vectors to Qdrant

Usage:
  pip install requests
  python 03_qdrant_sync.py

CRITICAL: embedding model MUST be gemini-embedding-001 with 768 dims
to match the n8n workflow's Gemini Embed Query node.
"""

import requests
import json
import time

import os

def load_env_file(filepath):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    val = val.strip().strip("'\"")
                    os.environ[key.strip()] = val

# Load env files
load_env_file(".env.local")
load_env_file(".env")

try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv(".env.local")
except ImportError:
    pass

# ──────────────────────────────────────────────────────────────
# CREDENTIALS  (loaded from env)
# ──────────────────────────────────────────────────────────────
SUPABASE_URL     = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://lawxsmqmztpyjcqenudp.supabase.co")
SUPABASE_KEY     = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

GEMINI_API_KEY   = os.environ.get("GEMINI_API_KEY", "")
GEMINI_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent"
EMBED_DIM        = 768

QDRANT_URL       = os.environ.get("QDRANT_URL", "")
QDRANT_KEY       = os.environ.get("QDRANT_API_KEY", "")
COLLECTION       = os.environ.get("QDRANT_COLLECTION", "real_estate_kb")

# ──────────────────────────────────────────────────────────────
def supabase_get(path: str, params: str = "") -> list:
    """Fetch rows from Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{path}?{params}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json"
    }
    r = requests.get(url, headers=headers, timeout=30)
    r.raise_for_status()
    return r.json()


def embed_text(text: str) -> list:
    """Call Gemini embedding-001 API and return 768-dim vector."""
    headers = {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json"
    }
    body = {
        "taskType": "RETRIEVAL_DOCUMENT",
        "content": {
            "parts": [{"text": text}]
        },
        "output_dimensionality": EMBED_DIM
    }
    r = requests.post(GEMINI_EMBED_URL, headers=headers,
                      json=body, timeout=60)
    if r.status_code != 200:
        print(f"  Gemini error {r.status_code}: {r.text[:200]}")
        r.raise_for_status()
    return r.json()["embedding"]["values"]


def qdrant_delete_collection():
    """Delete existing collection (ignore 404)."""
    url = f"{QDRANT_URL}/collections/{COLLECTION}"
    headers = {"api-key": QDRANT_KEY, "Content-Type": "application/json"}
    r = requests.delete(url, headers=headers, timeout=30)
    if r.status_code in (200, 404):
        print(f"  Collection '{COLLECTION}' deleted (or didn't exist).")
    else:
        r.raise_for_status()


def qdrant_create_collection():
    """Create Qdrant collection with 768-dim cosine vectors."""
    url = f"{QDRANT_URL}/collections/{COLLECTION}"
    headers = {"api-key": QDRANT_KEY, "Content-Type": "application/json"}
    body = {
        "vectors": {
            "size": EMBED_DIM,
            "distance": "Cosine"
        }
    }
    r = requests.put(url, headers=headers, json=body, timeout=30)
    r.raise_for_status()
    print(f"  Collection '{COLLECTION}' created ({EMBED_DIM}-dim Cosine).")


def qdrant_upsert(points: list):
    """Upsert all points to Qdrant."""
    url = f"{QDRANT_URL}/collections/{COLLECTION}/points?wait=true"
    headers = {"api-key": QDRANT_KEY, "Content-Type": "application/json"}
    body = {"points": points}
    r = requests.put(url, headers=headers, json=body, timeout=120)
    r.raise_for_status()
    return r.json()


def property_to_text(p: dict) -> str:
    """
    Build the searchable text that will be embedded.
    MUST match what the n8n 'Compose KB Context' node extracts from payload.text
    """
    amenities_raw = p.get("amenities", "[]")
    if isinstance(amenities_raw, list):
        amenities_str = ", ".join(amenities_raw)
    else:
        try:
            amenities_str = ", ".join(json.loads(amenities_raw))
        except Exception:
            amenities_str = str(amenities_raw)

    price_lakhs = round(p.get("seller_price", 0) / 100000, 2)
    min_lakhs   = round(p.get("minimum_price", 0) / 100000, 2)

    return (
        f"Property code: {p.get('property_code', '')}\n"
        f"Project name: {p.get('project_name', '')}\n"
        f"Location: {p.get('location', '')}\n"
        f"Property type: {p.get('property_type', '')}\n"
        f"Price: ₹{price_lakhs} Lakhs (minimum: ₹{min_lakhs} Lakhs)\n"
        f"Builder: {p.get('builder_details', '')}\n"
        f"Amenities: {amenities_str}\n"
        f"Payment plan: {p.get('payment_plan', '')}\n"
        f"Locality advantages: {p.get('locality_advantages', '')}\n"
        f"Availability: {p.get('availability_status', 'available')} "
        f"({p.get('available_units', '?')} of {p.get('total_units', '?')} units left)\n"
        f"Possession: {p.get('possession_date', 'TBD')}\n"
        f"RERA: {p.get('rera_number', 'N/A')}"
    )


# ──────────────────────────────────────────────────────────────
def main():
    print("\n═══════════════════════════════════════════════")
    print(" YESBROKER – Qdrant Knowledge Base Sync")
    print("═══════════════════════════════════════════════\n")

    # ── 1. Fetch properties from Supabase ──────────────────
    print("1. Fetching properties from Supabase...")
    properties = supabase_get("properties", "select=*&order=created_at.asc")
    print(f"   Found {len(properties)} properties.\n")
    if not properties:
        print("ERROR: No properties found. Run 02_mock_data.sql first.")
        return

    # ── 2. Delete & recreate Qdrant collection ─────────────
    print("2. Rebuilding Qdrant collection...")
    qdrant_delete_collection()
    qdrant_create_collection()
    print()

    # ── 3. Embed each property ──────────────────────────────
    print("3. Embedding properties with gemini-embedding-001...")
    points = []
    for idx, prop in enumerate(properties, start=1):
        code = prop.get("property_code", f"PROP-{idx}")
        text = property_to_text(prop)

        print(f"   [{idx}/{len(properties)}] {code} – {prop.get('project_name', '')}...")
        try:
            vector = embed_text(text)
        except Exception as e:
            print(f"   ✗ FAILED: {e}")
            continue

        points.append({
            "id": idx,
            "vector": vector,
            "payload": {
                # Store all searchable fields in payload
                "property_code":     prop.get("property_code", ""),
                "project_name":      prop.get("project_name", ""),
                "title":             prop.get("project_name", ""),   # alias for compatibility
                "location":          prop.get("location", ""),
                "property_type":     prop.get("property_type", ""),
                "seller_price":      prop.get("seller_price", 0),
                "minimum_price":     prop.get("minimum_price", 0),
                "price_lakhs":       round(prop.get("seller_price", 0) / 100000, 2),
                "builder":           prop.get("builder_details", ""),
                "builder_details":   prop.get("builder_details", ""),
                "amenities":         prop.get("amenities", []),
                "payment_plan":      prop.get("payment_plan", ""),
                "locality_advantages": prop.get("locality_advantages", ""),
                "brochure_url":      prop.get("brochure_url", ""),
                "possession_date":   prop.get("possession_date", ""),
                "rera_number":       prop.get("rera_number", ""),
                "availability_status": prop.get("availability_status", "available"),
                "available_units":   prop.get("available_units", 0),
                "total_units":       prop.get("total_units", 0),
                "featured":          prop.get("featured", False),
                "supabase_id":       prop.get("id", ""),
                "text":              text              # full text for RAG context
            }
        })
        time.sleep(0.5)  # rate limit: ~2 requests/sec

    print(f"\n   Embedded {len(points)} / {len(properties)} properties.")

    # ── 4. Upsert to Qdrant ─────────────────────────────────
    if points:
        print(f"\n4. Upserting {len(points)} vectors to Qdrant...")
        result = qdrant_upsert(points)
        status = result.get("status", "unknown")
        print(f"   Qdrant response: {status}")
        print("\n✅ Sync complete!")
    else:
        print("\n✗ No points to upsert. Check Gemini API key.")

    # ── 5. Verify ───────────────────────────────────────────
    print("\n5. Verifying collection...")
    url = f"{QDRANT_URL}/collections/{COLLECTION}"
    headers = {"api-key": QDRANT_KEY}
    r = requests.get(url, headers=headers, timeout=15)
    info = r.json().get("result", {})
    count = info.get("points_count", "?")
    dims  = info.get("config", {}).get("params", {}).get("vectors", {}).get("size", "?")
    print(f"   Collection '{COLLECTION}': {count} points, {dims}-dim vectors")
    print("\n═══════════════════════════════════════════════\n")


if __name__ == "__main__":
    main()
