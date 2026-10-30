# YesBroker: Supabase to Hostinger MySQL + in-app admin panel

Folder layout mirrors your project root. If your project keeps code under `src/`, put `app/`, `lib/` and
`middleware.ts` inside `src/` (the `@/` imports then keep working).

## 1. Dependencies

```bash
npm uninstall @supabase/supabase-js
npm install mysql2 jose bcryptjs
```

## 2. Database (hPanel)

1. hPanel > Databases > MySQL Databases: create a database + user, note the three names.
2. phpMyAdmin > SQL tab: paste `db/schema.sql` and run it.
3. Add the variables in `env.example.additions` to `.env.local` and to the Hostinger environment settings.
   Remove the three `SUPABASE_*` variables. `DB_HOST=localhost` on Hostinger.
   For local development you must allow your IP under hPanel > Remote MySQL and use the host name shown there.
4. Create your first admin:
   `node --env-file=.env.local scripts/create-admin.mjs you@example.com 'long-password-here' "Your Name"`

## 3. Copy files in

New: `db/`, `scripts/`, `middleware.ts`, `lib/{db,types,session,auth,crm,negotiation,properties,qdrant}.ts`,
`app/admin/login`, `app/admin/properties`, `app/api/admin/*`, `app/api/n8n/*`.

Replace: `app/admin/page.tsx` (old one was a mock dashboard with fake numbers), and every file under
`app/api/{properties,leads,calls,negotiations,analytics,site-visit,vapi/webhook,ai/negotiate,ai/search}`.

Delete: `lib/supabase.ts`, `03_qdrant_sync.py` (replaced by the "Re-sync search" button), and the Supabase lines in README.

## 4. Edits to existing files

**lib/mappers.ts**
```diff
-import type { ... } from './supabase';
+import type { ... } from './types';
```
In `UIProperty` add `image_url?: string;`. In `mapProperty`'s return value:
```diff
-    featured: (row.view_count ?? 0) > 10 || row.availability_status === 'available',
+    featured: Boolean(row.featured),
+    image_url: row.image_url ?? undefined,
```

**components/property/PropertyCard.tsx**
```diff
-  const imgSrc = !imgError ? getPropertyImage(property.title) : null;
+  const imgSrc = !imgError ? (property.image_url || getPropertyImage(property.title)) : null;
```
and delete the floor price from the card:
```diff
-              {property.minimum_price && !compact && (
-                <span> · Floor {formatPrice(property.minimum_price)}</span>
-              )}
```

**app/property/[id]/page.tsx**
- Same `imgSrc` change as above.
- Delete the `{property.minimum_price && ( <p ...>Floor: ...</p> )}` block in the hero card (the public API no longer sends it).
- "Property not found in Supabase." -> "Property not found."
- "Saved to Supabase — n8n will send WhatsApp if configured" -> "We'll confirm your visit shortly."
- `bookVisit` currently shows "Visit Booked!" even when the request fails. The API now returns 400 for a bad
  phone/date, so check it:
```diff
-      await fetch("/api/site-visit", { ... });
+      const res = await fetch("/api/site-visit", { ... });
+      if (!res.ok) { alert("Please check your phone number and date."); return; }
```

**app/negotiation/page.tsx** (now admin-only, it needs the floor price)
```diff
-    fetch("/api/properties", { cache: "no-store" })
+    fetch("/api/admin/properties?format=ui", { cache: "no-store" })
```

**app/voice-agent/page.tsx**: `/api/calls` is now admin-only, so visitors would see the hard-coded `DEMO_CALLS`
(fake names). Initialise `callLogs` to `[]` and drop `DEMO_CALLS`, or hide the "Recent Calls" strip for non-admins.

**Images from other sites**: if you paste `https://...` image URLs in the admin form, add them to `next.config.ts`:
```ts
images: { remotePatterns: [{ protocol: 'https', hostname: 'your-image-host.com' }] }
```
`/images/foo.png` paths (files in `public/images`) work with no config.

Cosmetic: replace the remaining "Supabase" wording in the CRM, analytics, site-visits and negotiation page headers.

## 5. n8n: repoint (I could not see your workflows, so this is the mapping to apply)

All calls: `POST https://<your-domain>/api/n8n/...` with header `x-api-secret: <N8N_API_SECRET>`.

| Workflow step that used Supabase | Replace with |
|---|---|
| upsert lead / mark `whatsapp_sent` | `/api/n8n/lead` `{ phone_number, customer_name, budget_max, whatsapp_sent, ... }` |
| negotiatePrice tool | `/api/n8n/negotiate` `{ property_id or property_code, buyer_offer, call_id, lead_phone }` returns `counterOffer, accepted, escalate` |
| bookSiteVisit tool | `/api/n8n/site-visit` `{ lead_phone, lead_name, property_code, visit_date: "YYYY-MM-DD", visit_time: "HH:MM" }` (convert "June 25th, 11 AM" in n8n first) |
| writes to `call_logs` / `call_analytics` | delete them: `/api/vapi/webhook` already stores both |
| Qdrant search + Gemini embed | unchanged |

## 6. Security problems found while migrating (all fixed in this bundle)

1. **The negotiation floor was in the voice agent's knowledge base.** `03_qdrant_sync.py` embedded
   "minimum: ₹X Lakhs" in the text and stored `minimum_price` in the payload, so the agent could repeat it to a buyer.
   The new sync never writes it. After deploying, press **Re-sync search** once to rebuild the collection
   without it. If your n8n negotiation step read `minimum_price` from the Qdrant payload, use `/api/n8n/negotiate`.
2. `POST /api/properties` was public: anyone could insert listings. Removed (admin API only).
3. `/api/leads`, `/api/calls`, `/api/analytics`, `/api/negotiations`, `/api/site-visit` and the `/crm`, `/analytics`,
   `/site-visits`, `/whatsapp` pages were open to the internet (names, phone numbers, transcripts, floor prices).
   They now require the admin login. Only lead capture and visit booking stay public, and they return no data.
4. `/api/leads` POST spread the request body straight into the table. Now a field whitelist.
5. Rotate the old Supabase service-role key and the Gemini/Qdrant keys if they were ever committed or shared.

## 7. Behaviour changes to be aware of

- Site visits come only from the `site_visits` table. The old code also derived visits from `leads` and
  `call_analytics`, which showed the same booking twice.
- `/api/analytics` returns aggregates only (it used to ship every raw lead/call row), and per-property "inquiries"
  is the real `view_count` instead of a random number.
- "Featured" is now a flag you set in the admin panel (before, every available property counted as featured).
- Properties can be hidden (`is_published`) without deleting; hidden ones also leave the voice-agent index.

## 8. Deploy checklist (Hostinger)

1. hPanel > Websites > Node.js app: build `npm run build`, start `npm start`, add the env vars, redeploy.
2. Open `/admin/login`, add one property, confirm it shows on `/marketplace` and that the toast says the voice-agent
   search is up to date.
3. Run the six voice test calls from the README.
4. Turn on database backups in hPanel before real data goes in.

Not compiled or run: I had no network or your repo here, so run `npm run build` and fix any import-path
differences (for example `src/`) first.
