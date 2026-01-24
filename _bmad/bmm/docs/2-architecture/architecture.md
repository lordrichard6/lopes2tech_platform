---
stepsCompleted: [step-01-init, step-02-context, step-03-decisions]
inputDocuments: [1-product/product-requirements.md]
workflowType: 'architecture'
project_name: 'lopes2tech_platform_v2'
user_name: 'Paulo Lopes'
date: '2026-01-12'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## 1. System Context & Goals

**System Goal:**
A centralized client portal for Lopes2Tech to manage clients, projects, tasks, and invoices. It provides transparency for clients and specific workflows for task requests and approvals.

**Core Capabilities:**
- **Client Portal:** Read-only project/invoice view, active task request system.
- **Admin Dashboard:** Full management of entities (Clients, Projects, Tasks, Invoices).
- **Billing Engine:** Stripe integration for invoice synchronization and payments.

---

## 2. Technology Stack Decisions

### 2.1 Core Framework
- **Decision:** **Next.js 15 (App Router)**
- **Rationale:** Approved stack. Provides robust SSR/SSG capabilities, API routes for backend logic, and excellent Vercel integration.

### 2.2 Database & ORM
- **Decision:** **Supabase (PostgreSQL)** with **Drizzle ORM**
- **Rationale:**
    - **Supabase:** Managed Postgres, built-in Auth, Realtime capabilities.
    - **Drizzle:** Lightweight, type-safe TypeScript ORM for best developer experience and performance.

### 2.3 Authentication & Authorization
- **Decision:** **Supabase Auth**
- **Rationale:** Seamless integration with the database. Supports email/password, magic links, and social providers.
- **RBAC:**
    - Roles: `admin`, `client`.
    - Implementation: Custom `profiles` table linked to `auth.users`, checked via RLS policies and middleware.

### 2.4 Styling & UI
- **Decision:** **Tailwind CSS + Shadcn/ui**
- **Rationale:** Standard modern stack for rapid, accessible, and beautiful UI development. Matches "premium" aesthetic requirement.

### 2.5 Payments
- **Decision:** **Stripe**
- **Rationale:** Industry standard for billing.
    - **Invoices:** Syncing Stripe Invoices to local DB for display.
    - **Checkout:** Redirecting to Stripe hosted checkout for payments.

---

## 3. Data Architecture (Schema Design)

### 3.1 Core Entities (ERD Draft)

**`profiles`**
- `id` (UUID, PK, references auth.users)
- `role` (enum: 'admin', 'client')
- `full_name` (text)
- `email` (text)
- `stripe_customer_id` (text, optional)

**`clients`**
- `id` (UUID, PK)
- `name` (text)
- `profile_id` (UUID, FK -> profiles, optional linkage for access)
- `contact_email` (text)

**`projects`**
- `id` (UUID, PK)
- `client_id` (UUID, FK -> clients)
- `name` (text)
- `status` (enum: 'active', 'completed', 'on-hold')
- `progress` (integer, 0-100)

**`milestones`**
- `id` (UUID, PK)
- `project_id` (UUID, FK -> projects)
- `title` (text)
- `status` (enum: 'pending', 'in-progress', 'completed')
- `due_date` (date)

**`tasks`** (Service Requests)
- `id` (UUID, PK)
- `requester_id` (UUID, FK -> profiles)
- `project_id` (UUID, FK -> projects, nullable)
- `title` (text)
- `description` (text)
- `status` (enum: 'requested', 'quoted', 'approved', 'active', 'completed', 'rejected')
- `quote_amount` (decimal, null until quoted)
- `quote_currency` (text, default 'CHF')

**`invoices`**
- `id` (UUID, PK)
- `client_id` (UUID, FK -> clients)
- `stripe_invoice_id` (text, unique)
- `amount_due` (decimal)
- `currency` (text)
- `status` (enum: 'draft', 'open', 'paid', 'void', 'uncollectible')
- `invoice_pdf` (url)
- `created_at` (timestamp)

---

## 4. API & Interface Design

### 4.1 Client Dashboard (`/dashboard`)
- **Data Fetching:** Server Components fetching via Drizzle.
- **Actions:** Server Actions for "Request Task".

### 4.2 Admin Dashboard (`/admin`)
- **Protected Routes:** Middleware check for `role === 'admin'`.
- **Functionality:** CRUD interfaces for all tables.

---

## 5. Security & Compliance

### 5.1 Row Level Security (RLS)
- **Projects/Invoices:** Clients can only `SELECT` rows where `client_id` matches their profile's linked client.
- **Tasks:** Clients can `INSERT` (request) and `SELECT` their own tasks.
- **Admin:** Full access to all tables.

### 5.2 Payment Security
- No credit card data stored locally.
- Use Stripe Webhooks to update invoice status securely.

---

## 6. Implementation Strategy
- **Phase 1: Foundation:** Auth, Database implementation, Admin Dashboard scaffold.
- **Phase 2: Core Entities:** Clients, Projects, Milestones CRUD.
- **Phase 3: Task Workflow:** Request form, Admin quote UI, Client approval UI.
- **Phase 4: Billing:** Stripe Sync & Invoices view.
