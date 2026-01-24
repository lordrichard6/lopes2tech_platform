---
stepsCompleted: [step-01-init]
inputDocuments: [directives/lopes2tech_services.md, directives/lopes2tech_pricing.md]
workflowType: 'prd'
---

# Product Requirements Document - Lopes2Tech Platform v2

**Author:** Paulo Lopes / BMAD Agent
**Date:** 2026-01-12
**Status:** Draft

## 1. Executive Summary
**Lopes2Tech Platform v2** is a centralized client portal designed to streamline operations for Lopes2Tech, a digital agency serving Swiss SMEs. The platform serves two main purposes: providing clients with a transparent, read-only view of their projects and invoices, and enabling an interactive task request system. For the admin (Paulo), it serves as a management command center for clients, projects, and billing.

### 1.1 Goals
- **Transparency:** Give clients real-time visibility into project status and costs.
- **Efficiency:** Streamline the "task request -> quote -> approval" workflow.
- **Monetization:** Simplify payment collection via Stripe integration.
- **Professionalism:** Provide a premium, branded experience for high-value Swiss clients.

---

## 2. User Roles

### 2.1 Admin (Paulo Lopes)
- **Permissions:** Full access to all data and settings.
- **Key Actions:**
    - Create/Manage Clients.
    - Create/Manage Projects and Milestones.
    - Approve/Helper/Reject Task Requests.
    - Generate Quotes for Tasks.
    - Manage Invoices and Stripe products.

### 2.2 Client (SMEs)
- **Permissions:** Read-only access to own Projects/Invoicing; Write access to Task Requests.
- **Key Actions:**
    - View Dashboard (Project Status, Active Tasks).
    - View Project Details (Milestones, Progress).
    - Request new Tasks.
    - Approve/Decline Quotes for Tasks.
    - View and Pay Invoices.

---

## 3. Functional Requirements

### 3.1 Authentication & User Management
- **Auth Provider:** Supabase Auth.
- **Features:**
    - Secure Email/Password Login.
    - Password Reset.
    - Role-based Access Control (Admin vs. Client) via Database Tables/Policies.

### 3.2 Dashboard
- **Client View:**
    - Summary of active projects.
    - Recent activity/updates.
    - Quick link to "Request Task".
- **Admin View:**
    - Overview of all revenue, active projects, and pending task requests.

### 3.3 Project Management
- **Projects:**
    - Linked to a specific Client.
    - Visual progress tracking (%).
- **Milestones:**
    - Projects are broken down into Milestones.
    - Each Milestone has a status (Pending, In Progress, Completed).

### 3.4 Task Request System (Core Workflow)
1.  **Request:** Client submits a task request (Title, Description, Priority).
2.  **Review:** Admin receives notification and reviews request.
3.  **Quote:** Admin approves request and attaches a Quote/Price (or rejects it).
4.  **Approval:** Client views the Quote.
    - **Approve:** Task becomes "Active" and is added to the queue.
    - **Decline:** Request is closed.

### 3.5 Invoicing & Billing
- **Stripe Integration:**
    - Sync Invoices from Stripe or generate them via Platform.
    - Display Invoice status (Paid, Open, Overdue).
    - "Pay Now" button redirecting to Stripe Checkout.
- **Products/Services:** Based on Lopes2Tech Service Catalog (see Section 5).

---

## 4. Technical Stack (Approved)
- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS + Shadcn/ui
- **Payments:** Stripe
- **Hosting:** Vercel

---

## 5. Services & Pricing Reference
*Based on Services V2 Playbook*

### 5.1 AI Customer Support Agent
- **Setup:** CHF 2,000 - 6,000
- **Retainer:** CHF 300 - 800 / month

### 5.2 AI Sales / SDR Agent
- **Setup:** CHF 1,500 - 4,500
- **Retainer:** CHF 400 - 1,200 / month

### 5.3 AI Voice Agent
- **Setup:** CHF 2,500 - 7,000
- **Retainer:** CHF 300 - 1,000 / month

### 5.4 AI Knowledge Base (RAG)
- **Setup:** CHF 3,000 - 9,000
- **Retainer:** CHF 400 - 1,200 / month

### 5.5 AI Workflow Automation
- **Setup:** CHF 1,500 - 5,000 per pack
- **Retainer:** CHF 250 - 800 / month

---

## 6. Non-Functional Requirements
- **Performance:** High lighthouse score (90+), fast page loads.
- **Security:** RLS (Row Level Security) on all Supabase tables.
- **Design:** Premium, clean aesthetic matching "Lopes2Tech" branding.
- **Localization:** Primary: English (Codebase), but content may be Multi-language ready (Start with EN).
