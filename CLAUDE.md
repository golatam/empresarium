# Empresarium — CLAUDE.md

## Overview
SaaS platform for company registration in Latin American countries (BR, CL, CO, PE, AR).
Clients create orders, legal partners process them. Includes messaging, documents, status tracking.

## Tech Stack
- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)
- **shadcn/ui** + Tailwind CSS
- **next-intl** — 4 locales: EN, ES, PT, RU
- **react-hook-form** + **Zod** validation
- **Node 24** (pinned via `.node-version`)

## Project Structure
```
src/app/[locale]/          # Locale-based routing
  (auth)/                  # Login, register (OTP-based, no passwords)
  (dashboard)/             # Protected: dashboard, orders, messages, profile, admin
  auth/callback/           # Supabase auth callback
src/components/            # UI (shadcn), layout, auth, orders, messages, documents, admin, shared
src/lib/actions/           # Server Actions (mutations)
src/lib/queries/           # Data fetching (server-side)
src/lib/supabase/          # 3 clients: server.ts, client.ts, admin.ts
src/lib/hooks/             # Realtime hooks (messages, order status)
src/lib/validations/       # Zod schemas (auth, order, profile)
src/types/                 # database.ts, order.ts, country.ts
messages/{en,es,pt,ru}.json
src/lib/email.ts           # Resend email client (OTP codes)
supabase/migrations/       # 16 SQL migrations
supabase/seed.sql          # 5 countries, 17 entity types, form fields
```

## Key Architecture Decisions
- **No `<Database>` generic on Supabase clients** — hand-written types don't include `PostgrestVersion` metadata, causing `never` types. All clients are untyped; `database.ts` exists for reference only.
- **Data-driven country config** — countries, entity types, form fields stored in DB (not code). Adding a country = INSERT only.
- **JSONB for country-specific data** — `orders.form_data`, `founders.extra_data`
- **Server Components for reads, Server Actions for mutations** — minimal client JS
- **`as any` casts avoided** — removed by using untyped clients instead
- **Custom OTP auth (no passwords)** — users sign in/register via 6-digit email codes. Two-step Route Handler flow: `sendOtp()` (Server Action) → stores hash in `otp_codes` → sends code via Resend → `POST /api/auth/session` (verifies OTP hash, generates magic link, returns `tokenHash`) → `GET /api/auth/session?token_hash=...` (full-page navigation, calls `verifyOtp`, sets cookies via redirect response) → dashboard. Register path also creates user + profile via `upsert`. No password storage, no password reset flow.
- **RLS admin checks via `is_admin(auth.uid())`** — all admin RLS policies use a `SECURITY DEFINER` function instead of direct `SELECT FROM profiles` to avoid infinite recursion (see migration 00015)

## Database
15 tables: profiles, countries, entity_types, country_form_fields, orders, founders, order_status_history, conversations, messages, documents, required_documents, addons, partner_countries, otp_codes

3 roles: client, partner, admin (with RLS policies)

## Status
| Component | Status |
|-----------|--------|
| Auth (OTP login/register, no passwords) | Done |
| Email via Resend (OTP codes) | Done |
| Order wizard (7 steps) | Done |
| Order management + status pipeline | Done |
| Messaging (realtime) | Done |
| Document upload/download | Done |
| Admin panel | Done |
| i18n (EN/ES/PT/RU) | Done |
| Database migrations + seed | Done |
| Railway deployment | Done |

## Deployment
- **GitHub**: https://github.com/golatam/empresarium
- **Railway**: https://empresarium-production.up.railway.app
- **Auto-deploy**: pushes to `main` → Railway builds and deploys automatically (via Railway GitHub App on `golatam` org)
- **Supabase env vars** need to be set in Railway Dashboard

## Commands
```bash
npm run dev     # Local dev server
npm run build   # Production build
npm run start   # Production server
git push        # Deploy to Railway (auto-deploy from main)
railway up      # Manual deploy (fallback)
```
