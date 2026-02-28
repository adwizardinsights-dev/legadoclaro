# LegadoClaro — Digital Estate Planning MVP

A production-oriented estate planning and will creation platform built with Next.js 14, TypeScript, Prisma, Stripe, and NextAuth.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS + custom design system |
| Auth | NextAuth v5 (credentials + Google OAuth) |
| Database | PostgreSQL via Prisma ORM |
| Payments | Stripe Checkout (one-time) |
| PDF | @react-pdf/renderer (server-side) |
| Email | Resend |
| Hosting | Vercel-ready |

---

## Project Structure

```
legadoclaro/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles + form helpers
│   ├── (auth)/                         # Auth pages (login, register, reset)
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx          # User dashboard
│   │   ├── dashboard/consultation/     # Consultation booking
│   │   └── will/[step]/page.tsx        # 6-step will wizard
│   ├── (admin)/
│   │   └── admin/                      # Admin panel + document detail
│   ├── (marketing)/
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts # NextAuth handler
│       ├── stripe/webhook/route.ts     # Stripe webhook
│       └── will/pdf/route.ts          # PDF generation endpoint
├── actions/
│   ├── auth.ts                         # Register, login, password reset
│   ├── will.ts                         # Will CRUD + autosave
│   ├── payment.ts                      # Stripe Checkout sessions
│   └── admin.ts                        # Admin document management
├── components/
│   └── will/
│       ├── wizard-layout.tsx           # Progress bar + step navigation
│       └── steps/
│           ├── step-1-personal.tsx     # Personal info form
│           ├── step-2-executor.tsx     # Executor selection
│           ├── step-3-beneficiaries.tsx # Beneficiary management
│           ├── step-4-guardianship.tsx  # Guardian designation
│           ├── step-5-assets.tsx       # Assets overview
│           └── step-6-review.tsx       # Final review + submit
├── lib/
│   ├── auth.ts                         # NextAuth configuration
│   ├── prisma.ts                       # Prisma singleton
│   ├── stripe.ts                       # Stripe client + price IDs
│   ├── pdf.ts                          # PDF generation logic
│   ├── email.ts                        # Resend email templates
│   └── utils.ts                        # Helpers, constants, formatters
├── types/
│   ├── will.ts                         # Will wizard TypeScript types
│   └── next-auth.d.ts                  # Session type augmentation
├── prisma/
│   └── schema.prisma                   # Database schema
└── middleware.ts                       # Route protection
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted — Supabase, Railway, Neon all work)
- Stripe account (test mode is fine)
- Resend account (free tier available)
- Google OAuth credentials (optional — for Google sign-in)

### Step 1 — Clone & Install

```bash
git clone <your-repo>
cd legadoclaro
npm install
```

### Step 2 — Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/legadoclaro"

# Auth
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create products in Stripe Dashboard)
STRIPE_PRICE_WILL_BASIC="price_..."
STRIPE_PRICE_ATTORNEY_REVIEW="price_..."
STRIPE_PRICE_CONSULTATION="price_..."
STRIPE_PRICE_NOTARIZATION="price_..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="LegadoClaro <noreply@yourdomain.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3 — Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or create a migration (for production)
npm run db:migrate
```

### Step 4 — Create Admin User

After registering via the app, promote yourself to admin directly in the database:

```bash
npm run db:studio
# OR via psql:
psql $DATABASE_URL -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

### Step 5 — Set Up Stripe Products

In your [Stripe Dashboard](https://dashboard.stripe.com):

1. Create 4 products with one-time prices:
   - **Basic Will** — $99
   - **Attorney Review** — $249
   - **Consultation** — $199
   - **Notarization** — $79
2. Copy each Price ID into `.env.local`

### Step 6 — Stripe Webhook (Local)

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

### Step 7 — Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Flows

### Will Creation Flow

1. User registers → lands on `/dashboard`
2. Clicks "Start My Will" → `/will/1` (Personal Info)
3. Completes 6 steps — each autosaves to DB
4. Step 6: Review summary + preview draft PDF
5. Clicks "Submit & Pay $99" → Stripe Checkout
6. Stripe webhook marks document as `SUBMITTED`
7. User returns to dashboard, can download PDF

### Attorney Review Flow

1. User clicks "Request Attorney Review" on dashboard
2. → Stripe Checkout ($249)
3. Webhook: document status → `UNDER_REVIEW`, creates `AttorneyReviewRequest`
4. Admin logs into `/admin` → views document
5. Admin writes notes, sets status to `APPROVED` or `NEEDS_REVISION`
6. User receives email notification
7. User sees feedback on dashboard

### Admin Access

1. Register normally via `/register`
2. Promote to admin via database (see Step 4 above)
3. Admin sees "Admin Panel" link in dashboard header
4. `/admin` — overview + document list
5. `/admin/documents/[id]` — full document review + status control

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Add your production DATABASE_URL, Stripe keys, etc.

# Production webhook — add in Stripe Dashboard:
# https://your-domain.vercel.app/api/stripe/webhook
```

**Important:** Set `NEXTAUTH_URL` / `AUTH_URL` to your production domain in Vercel env vars.

---

## Pricing Logic

| Product | Price | Stripe Type | Action |
|---------|-------|-------------|--------|
| Basic Will | $99 | One-time | Submits will, unlocks PDF download |
| Will + Attorney Review | $249 | One-time | Submits will + creates review request |
| Consultation | $199 | One-time | Creates consultation record, confirmed on payment |
| Notarization Add-On | $79 | One-time | Records notarization request |

---

## Compliance Notes

- Every page includes: *"This platform does not replace independent legal advice unless attorney review is purchased."*
- All will PDFs are watermarked: **DRAFT — NOT LEGALLY VALID WITHOUT PROPER EXECUTION**
- State field is captured for future jurisdiction-specific logic
- Privacy Policy and Terms of Service templates included at `/privacy` and `/terms`

---

## Phase 2 Roadmap (Beyond MVP)

- [ ] State-specific will clauses (per-jurisdiction compliance engine)
- [ ] E-signature integration (DocuSign or HelloSign)
- [ ] Online notarization (Notarize.com API)
- [ ] Codicil generation (amendments to existing will)
- [ ] Trust document creation
- [ ] Healthcare proxy / power of attorney
- [ ] Real calendar integration (Cal.com or Calendly)
- [ ] Multi-language support (Spanish — target market alignment with brand name)
- [ ] Mobile app (React Native)
