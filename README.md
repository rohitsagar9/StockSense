# StockSense — Inventory Management System

StockSense is a full-stack Inventory Management System that replaces manual registers and spreadsheets with a centralized, real-time view of stock across multiple warehouses.

Built with **Next.js 14 (App Router) · TypeScript · PostgreSQL · Prisma · NextAuth**.

**Repository:** https://github.com/rohitsagar9/StockSense

---

## Features

- **Authentication** — Signup/login with NextAuth sessions, OTP-based password reset (email via Nodemailer, or console output in dev).
- **Role-based access** — `MANAGER` and `STAFF` roles; mutations are guarded server-side via `requireAuth()` / `requireManager()` (`src/lib/auth-guard.ts`). Staff cannot create or delete products, warehouses, or categories.
- **Dashboard** — KPIs for stock levels, low/out-of-stock alerts, pending receipts/deliveries/transfers; filters by operation type, status, warehouse, and category; stock vs. reorder-threshold chart (Recharts).
- **Product catalog** — SKU, category, unit of measure, reorder rules, and per-location stock breakdown.
- **Core operations** (all transactional via Server Actions):
  - **Receipts** — incoming stock increments the destination location.
  - **Deliveries** — outgoing stock is validated against on-hand quantity, then deducted.
  - **Internal transfers** — move stock between locations/warehouses; company net total stays unchanged.
  - **Adjustments** — reconcile physical counts with system quantities; deltas recorded automatically.
- **Stock ledger** — immutable move history: every receipt, delivery, transfer, and adjustment logged with user, timestamp, and locations.
- **Warehouses & locations** — multi-warehouse support with nested locations (racks, shelves, zones).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router + Server Actions |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (credentials), bcrypt, OTP reset |
| Validation | Zod |
| Styling | Tailwind CSS |
| Charts | Recharts |

## Getting started

Prerequisites: Node.js 18+, PostgreSQL running locally.

```bash
# 1. Install dependencies (Prisma client is generated automatically via postinstall)
npm install

# 2. Configure .env — copy .env.example and set your credentials
#    DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/stocksense_db?schema=public"
#    NEXTAUTH_SECRET="<random string>"

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Seed demo users, warehouses, products, and operations
npm run prisma:seed

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000.

## Default credentials

| Role | Email | Password |
|---|---|---|
| Manager | `manager@stocksense.com` | `admin123` |
| Staff | `staff@stocksense.com` | `staff123` |

## Inventory flow walkthrough

1. **Receipt** — Operations → Receipts → New: receive 100 kg steel rods → stock increases by 100.
2. **Transfer** — Operations → Internal Transfers → New: Main Warehouse → Production Rack, 20 kg → location changes, net total unchanged.
3. **Delivery** — Operations → Deliveries → New: dispatch 6 units → stock decreases after availability check.
4. **Adjustment** — Operations → Adjustments → New: count 77 kg vs. recorded 80 kg → system updates and logs the -3 delta.
5. **Audit** — Move History shows every step with timestamp, user, source, destination, and reference number.

## Project structure

```
prisma/
  schema.prisma        # 9 models + enums (User, Warehouse, Location, Category,
                       #   Product, StockLevel, Operation, OperationLine, StockMove)
  seed.js              # Demo dataset
src/
  app/                 # App Router pages
    (auth)/            # Login, signup, forgot-password
    (dashboard)/       # Dashboard, products, operations, move-history, settings, profile
    api/auth/          # NextAuth route handler
  actions/             # Server Actions (transactional mutations + queries)
  components/          # ui/ · layout/ · dashboard/ · operations/ · products/
  lib/                 # db (Prisma singleton) · auth · auth-guard · otp · email
  validators/          # Zod schemas
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Create/apply migrations |
| `npm run prisma:seed` | Seed demo data |
| `npm run prisma:studio` | Prisma Studio (browse data) |
