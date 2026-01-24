---
stepsCompleted: [step-01-init, step-02-epics, step-03-stories]
inputDocuments: [1-product/product-requirements.md, 2-architecture/architecture.md]
workflowType: 'epics-and-stories'
project_name: 'lopes2tech_platform_v2'
---

# Epics and Stories - Lopes2Tech Platform v2

## Epic 1: Foundation & Authentication
**Goal:** Set up the core project structure, database schemas, and secure authentication system.

### Story 1.1: Project Setup & Shadcn/ui
- **As a:** Developer
- **I want to:** Initialize the project with necessary UI libraries and base styles.
- **So that:** I have a consistent design system to build upon.
- **Acceptance Criteria:**
    - Next.js 15 + Tailwind CSS installed.
    - Shadcn/ui configured (Button, Input, Card, Table, Sheet, Dialog, Dropdown components added).
    - Fonts and themes (Lopes2Tech branding) set up in `layout.tsx`.

### Story 1.2: Database & Auth Integration
- **As a:** User
- **I want to:** Sign up and log in securely.
- **So that:** I can access my personalized dashboard.
- **Acceptance Criteria:**
    - Supabase Auth configured (Email/Password).
    - Login / Signup / Forgot Password pages created.
    - `profiles` table created and linked to `auth.users` via trigger.
    - RLS policies set (Users read own profile; Admin reads all).

---

## Epic 2: Client & Project Management (Core)
**Goal:** Enable Admin to manage clients/projects and Clients to view them.

### Story 2.1: Admin - Client Management
- **As an:** Admin
- **I want to:** specific Create and list Clients.
- **So that:** I can associate projects and users to them.
- **Acceptance Criteria:**
    - `clients` table created (name, contact_email).
    - Admin page to list all clients.
    - Admin form to add/edit a client.

### Story 2.2: Admin - Project & Milestone Setup
- **As an:** Admin
- **I want to:** Create projects and define milestones for a client.
- **So that:** Clients can track progress.
- **Acceptance Criteria:**
    - `projects` and `milestones` tables created.
    - Admin page to view Client details and add Projects.
    - UI to add Milestones to a Project (Name, Status, Date).

### Story 2.3: Client Dashboard - Read Only
- **As a:** Client
- **I want to:** View my active projects and their status.
- **So that:** I know what is being worked on.
- **Acceptance Criteria:**
    - Dashboard page displaying list of assigned Projects.
    - Project details page showing Milestone progress bar and status.
    - RLS ensures Client only sees their own data.

---

## Epic 3: Task Request System
**Goal:** Implement the "Request -> Quote -> Approve" workflow.

### Story 3.1: Client - Request Logic
- **As a:** Client
- **I want to:** Submit a new task request.
- **So that:** I can ask for changes or new features.
- **Acceptance Criteria:**
    - `tasks` table created with status enum.
    - "New Request" Form (Title, Description, Priority) on Dashboard.
    - Submission creates a task with status `requested`.

### Story 3.2: Admin - Review & Quote
- **As an:** Admin
- **I want to:** Review requests and add a price quote.
- **So that:** The client knows the cost before proceeding.
- **Acceptance Criteria:**
    - Admin "Inbox" showing `requested` tasks.
    - UI to "Approve & Quote" task (Input amount) -> updates status to `quoted`.
    - UI to "Reject" task.

### Story 3.3: Client - Approval
- **As a:** Client
- **I want to:** Approve or Decline a quoted task.
- **So that:** Work can begin (or not).
- **Acceptance Criteria:**
    - Client sees `quoted` tasks with price.
    - "Approve" button -> Task becomes `active`.
    - "Decline" button -> Task becomes `rejected`.

---

## Epic 4: Invoicing & Payments
**Goal:** Monetize the platform via Stripe.

### Story 4.1: Stripe Sync
- **As an:** Admin
- **I want to:** Sync Stripe invoices to the platform.
- **So that:** Clients can see them here.
- **Acceptance Criteria:**
    - `invoices` table created.
    - Webhook endpoint receiving `invoice.created` / `invoice.paid` / `invoice.payment_failed`.
    - Logic to map Stripe Customer ID to Client.

### Story 4.2: Client - Invoice View & Pay
- **As a:** Client
- **I want to:** View my invoices and pay pending ones.
- **So that:** I can settle my balances.
- **Acceptance Criteria:**
    - Invoices list on Dashboard.
    - Status badges (Paid, Open).
    - "Pay Now" link redirecting to Stripe hosted invoice page.
