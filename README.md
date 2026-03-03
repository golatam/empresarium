# Empresarium

SaaS platform for company registration in Latin American countries (Brazil, Chile, Colombia, Peru, Argentina). Clients create orders by selecting a country and entity type. Backend marketplace of legal partners processes the orders. System includes messaging, document exchange, status tracking, and add-on services.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **UI**: shadcn/ui + Tailwind CSS
- **i18n**: next-intl (EN, ES, PT, RU)
- **Forms**: react-hook-form + Zod
- **Language**: TypeScript

## Features

- **Multi-country support**: Data-driven country configuration (countries, entity types, form fields stored in DB)
- **7-step order wizard**: Country selection, entity type, company details, founders, country-specific fields, add-ons, review
- **Order status pipeline**: draft -> submitted -> under_review -> documents_requested -> documents_received -> in_progress -> government_filing -> completed
- **Role-based access**: Client, Partner, Admin with middleware route protection
- **Real-time messaging**: Supabase Realtime for live chat between clients and partners
- **Document management**: Drag-and-drop upload, Supabase Storage, signed URLs
- **Admin panel**: User management, order oversight, partner assignment, country configuration
- **4 locales**: English, Spanish, Portuguese, Russian

## Database Schema

14 tables with RLS policies:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles: role, name, phone, locale |
| `countries` | BR, CL, CO, PE, AR with localized names |
| `entity_types` | Legal entity types per country (MEI, LTDA, SpA, SAS...) |
| `country_form_fields` | Data-driven form fields per country |
| `orders` | Main orders with JSONB form_data |
| `founders` | Company founders with universal + country-specific fields |
| `order_status_history` | Status change audit log |
| `conversations` | 1:1 chat linked to orders |
| `messages` | Chat messages (text/file/system) |
| `documents` | Uploaded files with metadata |
| `required_documents` | Required documents per country |
| `addons` | Add-on services per order |
| `partner_countries` | Partner-country assignments (M2M) |

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (or local Supabase via CLI)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Run database migrations (in order)
# Apply files from supabase/migrations/ via Supabase Dashboard or CLI

# Seed data
# Run supabase/seed.sql to populate countries, entity types, form fields

# Start development server
npm run dev
```

### Database Migrations

Migrations are in `supabase/migrations/` and should be applied in order:

1. `00001_create_enums.sql` - Custom enum types
2. `00002_create_profiles.sql` - User profiles table
3. `00003_create_countries.sql` - Countries table
4. `00004_create_entity_types.sql` - Entity types per country
5. `00005_create_country_form_fields.sql` - Dynamic form fields
6. `00006_create_orders.sql` - Orders table
7. `00007_create_founders.sql` - Founders table
8. `00008_create_order_status_history.sql` - Status audit log
9. `00009_create_conversations_and_messages.sql` - Messaging
10. `00010_create_documents.sql` - Document management
11. `00011_create_required_documents.sql` - Required documents config
12. `00012_create_addons_and_partner_countries.sql` - Add-ons and partner assignments
13. `00013_create_functions_and_triggers.sql` - Triggers and helper functions

Then run `supabase/seed.sql` for initial data (5 countries, 17 entity types, form fields, required documents).

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # Locale-based routing
│   │   ├── (auth)/         # Login, register, forgot-password
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   │   ├── dashboard/  # Role-aware dashboard
│   │   │   ├── orders/     # Order list, wizard, detail
│   │   │   ├── messages/   # Conversations
│   │   │   ├── profile/    # User profile
│   │   │   └── admin/      # Admin panel
│   │   └── auth/callback/  # Supabase auth callback
│   └── api/                # API routes (document download)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Sidebar, topbar, locale switcher
│   ├── auth/               # Auth forms
│   ├── orders/             # Order wizard, cards, timeline, status
│   ├── messages/           # Chat thread, bubbles, input
│   ├── documents/          # Upload, list, cards
│   ├── admin/              # Admin tables and config
│   └── shared/             # Spinner, empty state, page header
├── lib/
│   ├── supabase/           # Client configurations
│   ├── actions/            # Server Actions (mutations)
│   ├── queries/            # Data fetching functions
│   ├── validations/        # Zod schemas
│   ├── utils/              # Constants, formatters
│   └── hooks/              # Realtime hooks
└── types/                  # TypeScript types
```

## Deployment

### Railway

```bash
railway login
railway up
```

Set environment variables in Railway dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your Railway deployment URL)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_APP_URL` | Application base URL |

## License

Private - All rights reserved.
