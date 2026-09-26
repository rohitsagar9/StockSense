# 📦 StockSense — Modular Inventory Management System

**StockSense** is a centralized, real-time Inventory Management System (IMS) designed to replace manual registers, spreadsheets, and scattered tracking methods. Built with a full-stack architecture using **Next.js 14 (App Router)**, **PostgreSQL**, **Prisma ORM**, and **NextAuth.js**.

---

## 🌟 Key Features

1. **Authentication & Profile**
   - User Registration & Login with Role-Based Access (`MANAGER`, `STAFF`).
   - OTP-based password recovery flow with email delivery or simulated dev console preview.
   - User profile settings with name and password updating.

2. **Dashboard & KPIs**
   - Snapshot of real-time inventory metrics:
     - Total Products in Stock
     - Low Stock / Out of Stock alerts with threshold indicators
     - Pending Receipts count
     - Pending Deliveries count
     - Scheduled Internal Transfers count
   - **Dynamic multi-attribute filters**: Filter operations by Document Type (*Receipt, Delivery, Transfer, Adjustment*), Status (*Draft, Waiting, Ready, Done, Cancelled*), Warehouse, and Category.
   - Interactive stock level vs. safety reorder threshold chart (Recharts).

3. **Products Catalog**
   - Catalog management (Name, SKU, Category, Unit of Measure, Description).
   - **Reordering Rules**: Configurable minimum safety stock threshold and replenishment quantities.
   - **Stock availability per location**: Breakdown table showing quantities on-hand across all warehouses, shelves, and racks.
   - Dynamic product category management.

4. **Core Operations**
   - **Receipts (Incoming Stock)**: Receive goods from suppliers $\rightarrow$ validate $\rightarrow$ automatically increments destination stock.
   - **Delivery Orders (Outgoing Stock)**: Dispatch customer shipments $\rightarrow$ validates on-hand availability $\rightarrow$ deducts stock.
   - **Internal Transfers**: Relocate goods inside the company (*Main Warehouse $\rightarrow$ Production Floor*, *Rack A $\rightarrow$ Rack B*) without changing company net total stock.
   - **Stock Adjustments**: Reconcile physical count audits with recorded system quantities, computing deltas automatically.

5. **Stock Ledger (Move History)**
   - Complete, immutable audit log of every stock relocation, receipt, delivery, and adjustment across the entire business.

6. **Warehouses & Locations**
   - Multi-warehouse support with nested sub-locations (Racks, Zones, Shelves, Bays).

---

## 🏗️ Architecture & Code Organization

```
d:/odoo hyd/
├── prisma/
│   ├── schema.prisma        # 9 PostgreSQL relational models with Prisma ORM
│   └── seed.js              # Comprehensive demo dataset (users, warehouses, items)
│
├── src/
│   ├── app/                 # Next.js 14 App Router routes & pages
│   │   ├── (auth)/          # Login, Sign Up, OTP Forgot Password
│   │   ├── (dashboard)/     # Authenticated layout, Dashboard, Products, Operations
│   │   └── api/auth/        # NextAuth session handlers
│   │
│   ├── actions/             # Server Actions (Atomic transactional backend logic)
│   │   ├── auth.actions.ts
│   │   ├── product.actions.ts
│   │   ├── category.actions.ts
│   │   ├── operation.actions.ts
│   │   ├── warehouse.actions.ts
│   │   ├── dashboard.actions.ts
│   │   └── move-history.actions.ts
│   │
│   ├── components/          # Reusable frontend UI components
│   │   ├── ui/              # Buttons, Cards, Inputs, Tables, Badges
│   │   ├── layout/          # Left Sidebar, Header, Breadcrumbs
│   │   ├── dashboard/       # KPI Grid, Stock Chart, Filter Bar, Activity Feed
│   │   ├── products/        # Product Form, Stock by Location Table
│   │   ├── operations/      # Line Items Editor, Receipt/Delivery/Transfer forms
│   │   └── move-history/    # Move Table Ledger
│   │
│   ├── lib/                 # Backend utilities & singletons
│   │   ├── db.ts            # Prisma Client singleton
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── auth-guard.ts    # Server-side auth check
│   │   ├── otp.ts           # 6-digit OTP generation and bcrypt check
│   │   └── email.ts         # Nodemailer OTP email service
│   │
│   └── validators/          # Zod input schemas for validation
```

---

## 🚀 Getting Started & Execution Guide

Follow these commands in your PowerShell terminal to launch StockSense:

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Database Connection
Ensure PostgreSQL is running on your machine. Inspect `.env` and verify your connection string:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stocksense_db?schema=public"
NEXTAUTH_SECRET="stocksense_super_secret_jwt_key_2026_change_in_production"
NEXTAUTH_URL="http://localhost:3000"
```
*(Replace `postgres:postgres` with your PostgreSQL username and password).*

### 3. Generate Prisma Client & Run Migrations
```powershell
npx prisma migrate dev --name init
```

### 4. Seed Database with Initial Data
Run the seeder to populate sample users, warehouses, products, and operations:
```powershell
npm run prisma:seed
```

### 5. Start the Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Inventory Manager** | `manager@stocksense.com` | `admin123` |
| **Warehouse Staff** | `staff@stocksense.com` | `staff123` |

*(Quick 1-click fill buttons are also available on the Login screen).*

---

## 🔄 Inventory Flow Example

1. **Step 1 — Inward Goods**: Go to **Operations $\rightarrow$ Receipts $\rightarrow$ Create New Receipt**. Add supplier "Apex Steel", select receiving location "Main Central Warehouse Stock", and set 100 kg Steel Rods. Click **Validate** $\rightarrow$ Stock increases by +100 kg.
2. **Step 2 — Internal Relocation**: Go to **Operations $\rightarrow$ Internal Transfers $\rightarrow$ Create Transfer**. Select source "Main Central Warehouse Stock" and target "Production Floor Rack". Move 20 kg. Click **Validate** $\rightarrow$ Stock is relocated; company net total remains unchanged.
3. **Step 3 — Customer Delivery**: Go to **Operations $\rightarrow$ Deliveries $\rightarrow$ Create Delivery Order**. Add customer "Acme Workspace", dispatch from "Main Central Warehouse Stock", deliver 6 Chairs. Click **Validate** $\rightarrow$ Stock decreases automatically.
4. **Step 4 — Physical Audit Adjustment**: Go to **Operations $\rightarrow$ Stock Adjustments $\rightarrow$ New Adjustment**. Select "Steel Rods 10mm" and adjust to 77 kg (e.g. 3 kg damaged). Click **Apply** $\rightarrow$ System updates on-hand stock and logs delta into the **Stock Ledger**.
5. **Step 5 — Audit Ledger**: Check **Move History** $\rightarrow$ Every step is logged with timestamp, user, source, destination, and reference number!
