# Applying this bundle (verified copy of your project)

This folder is your original YesBroker_AI with the MySQL migration, admin panel and all required edits
already applied. Nothing was compiled here (no network), so step 3 is the real test.

1. Dependencies (run in the project root; this also updates package-lock.json)
   npm uninstall @supabase/supabase-js
   npm install mysql2 jose bcryptjs
   (bcryptjs must be v3+, which ships its own TypeScript types; the latest version is fine)

2. Environment: copy .env.example to .env.local and fill in DB_*, AUTH_SECRET (openssl rand -base64 48),
   N8N_API_SECRET, VAPI_WEBHOOK_SECRET (optional), QDRANT_*, GEMINI_API_KEY.

3. Local check BEFORE deploying
   npm run build        # must finish with no errors
   (for local dev against Hostinger MySQL: hPanel > Databases > Remote MySQL, allow your IP,
    and use the host name shown there instead of localhost)

4. Database: phpMyAdmin > SQL tab > paste db/schema.sql > Go.
   Then: node --env-file=.env.local scripts/create-admin.mjs you@example.com 'long-password' "Your Name"

5. Deploy to Hostinger Node.js app (build: npm run build, start: npm start), add the same env vars there.
   Open https://YOURDOMAIN/admin/login (needs HTTPS for the login cookie), add a property,
   then press "Re-sync search" once.

6. n8n: see section 5 of docs/MIGRATION-original.md. Not done for you (workflows were not in the upload).
