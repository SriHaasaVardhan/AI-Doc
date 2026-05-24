/**
 * Demo Mode — Pre-generated sample data for hackathon demos.
 * Ensures the app always looks impressive, even without API connectivity.
 */

import type { RepositorySummary } from "@/lib/parsers/types";

// ─── Demo Repository Summary ────────────────────────────────────────────────

export const DEMO_REPO_SUMMARY: RepositorySummary = {
  name: "acme-saas-platform",
  totalFiles: 87,
  totalLines: 12450,
  languages: {
    TypeScript: 42,
    TSX: 28,
    JavaScript: 5,
    JSON: 8,
    Markdown: 3,
    CSS: 1,
  },
  dependencies: {
    next: "^15.1.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.0.0",
    "next-auth": "^5.0.0",
    stripe: "^17.0.0",
    zod: "^3.23.0",
    "framer-motion": "^12.0.0",
    "tailwindcss": "^4.0.0",
    resend: "^4.0.0",
    "lucide-react": "^0.400.0",
    "@tanstack/react-query": "^5.60.0",
  },
  devDependencies: {
    typescript: "^5.7.0",
    vitest: "^2.1.0",
    "@testing-library/react": "^16.0.0",
    eslint: "^9.0.0",
    prettier: "^3.4.0",
    prisma: "^6.0.0",
  },
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "eslint .",
    test: "vitest run",
    "test:watch": "vitest",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
  },
  folderStructure: `acme-saas-platform/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── settings/page.tsx
│   │   ├── billing/page.tsx
│   │   └── projects/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── projects/route.ts
│       ├── billing/
│       │   ├── checkout/route.ts
│       │   └── webhook/route.ts
│       └── users/route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── ProjectList.tsx
│   │   └── ActivityFeed.tsx
│   └── billing/
│       ├── PricingTable.tsx
│       └── InvoiceList.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── stripe.ts
│   ├── email.ts
│   └── utils.ts
├── services/
│   ├── project-service.ts
│   ├── user-service.ts
│   └── billing-service.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
├── public/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json`,
  files: [
    {
      filePath: "app/api/projects/route.ts",
      language: "TypeScript",
      functions: [
        { name: "GET", params: ["request: Request"], returnType: "Promise<Response>", isAsync: true, isExported: true },
        { name: "POST", params: ["request: Request"], returnType: "Promise<Response>", isAsync: true, isExported: true },
      ],
      classes: [],
      routes: [
        { method: "GET", path: "/api/projects", handler: "GET" },
        { method: "POST", path: "/api/projects", handler: "POST" },
      ],
      imports: [
        { source: "next/server", specifiers: ["NextResponse"], isDefault: false },
        { source: "@/lib/db", specifiers: ["prisma"], isDefault: false },
        { source: "@/lib/auth", specifiers: ["getServerSession"], isDefault: false },
      ],
      exports: ["GET", "POST"],
      lineCount: 48,
    },
    {
      filePath: "app/api/billing/checkout/route.ts",
      language: "TypeScript",
      functions: [
        { name: "POST", params: ["request: Request"], returnType: "Promise<Response>", isAsync: true, isExported: true },
      ],
      classes: [],
      routes: [
        { method: "POST", path: "/api/billing/checkout", handler: "POST" },
      ],
      imports: [
        { source: "@/lib/stripe", specifiers: ["stripe"], isDefault: false },
        { source: "@/lib/auth", specifiers: ["getServerSession"], isDefault: false },
      ],
      exports: ["POST"],
      lineCount: 35,
    },
    {
      filePath: "app/api/billing/webhook/route.ts",
      language: "TypeScript",
      functions: [
        { name: "POST", params: ["request: Request"], returnType: "Promise<Response>", isAsync: true, isExported: true },
      ],
      classes: [],
      routes: [
        { method: "POST", path: "/api/billing/webhook", handler: "POST" },
      ],
      imports: [
        { source: "@/lib/stripe", specifiers: ["stripe"], isDefault: false },
        { source: "@/lib/db", specifiers: ["prisma"], isDefault: false },
      ],
      exports: ["POST"],
      lineCount: 62,
    },
    {
      filePath: "app/api/users/route.ts",
      language: "TypeScript",
      functions: [
        { name: "GET", params: ["request: Request"], returnType: "Promise<Response>", isAsync: true, isExported: true },
        { name: "PATCH", params: ["request: Request"], returnType: "Promise<Response>", isAsync: true, isExported: true },
      ],
      classes: [],
      routes: [
        { method: "GET", path: "/api/users", handler: "GET" },
        { method: "PATCH", path: "/api/users", handler: "PATCH" },
      ],
      imports: [
        { source: "@/lib/db", specifiers: ["prisma"], isDefault: false },
        { source: "zod", specifiers: ["z"], isDefault: false },
      ],
      exports: ["GET", "PATCH"],
      lineCount: 41,
    },
    {
      filePath: "services/project-service.ts",
      language: "TypeScript",
      functions: [
        { name: "getProjects", params: ["userId: string"], returnType: "Promise<Project[]>", isAsync: true, isExported: true },
        { name: "createProject", params: ["data: CreateProjectInput"], returnType: "Promise<Project>", isAsync: true, isExported: true },
        { name: "updateProject", params: ["id: string", "data: UpdateProjectInput"], returnType: "Promise<Project>", isAsync: true, isExported: true },
        { name: "deleteProject", params: ["id: string"], returnType: "Promise<void>", isAsync: true, isExported: true },
      ],
      classes: [],
      routes: [],
      imports: [
        { source: "@/lib/db", specifiers: ["prisma"], isDefault: false },
        { source: "@/types", specifiers: ["Project", "CreateProjectInput", "UpdateProjectInput"], isDefault: false },
      ],
      exports: ["getProjects", "createProject", "updateProject", "deleteProject"],
      lineCount: 78,
    },
    {
      filePath: "services/billing-service.ts",
      language: "TypeScript",
      functions: [
        { name: "createCheckoutSession", params: ["userId: string", "priceId: string"], returnType: "Promise<string>", isAsync: true, isExported: true },
        { name: "handleWebhook", params: ["event: Stripe.Event"], returnType: "Promise<void>", isAsync: true, isExported: true },
        { name: "getSubscription", params: ["userId: string"], returnType: "Promise<Subscription | null>", isAsync: true, isExported: true },
      ],
      classes: [],
      routes: [],
      imports: [
        { source: "@/lib/stripe", specifiers: ["stripe"], isDefault: false },
        { source: "@/lib/db", specifiers: ["prisma"], isDefault: false },
      ],
      exports: ["createCheckoutSession", "handleWebhook", "getSubscription"],
      lineCount: 92,
    },
    {
      filePath: "lib/auth.ts",
      language: "TypeScript",
      functions: [
        { name: "getServerSession", params: [], returnType: "Promise<Session | null>", isAsync: true, isExported: true },
      ],
      classes: [],
      routes: [],
      imports: [
        { source: "next-auth", specifiers: ["NextAuth"], isDefault: true },
      ],
      exports: ["getServerSession", "authOptions"],
      lineCount: 45,
    },
    {
      filePath: "components/dashboard/StatsCard.tsx",
      language: "TSX",
      functions: [
        { name: "StatsCard", params: ["props: StatsCardProps"], returnType: "JSX.Element", isAsync: false, isExported: true },
      ],
      classes: [],
      routes: [],
      imports: [
        { source: "framer-motion", specifiers: ["motion"], isDefault: false },
        { source: "lucide-react", specifiers: ["TrendingUp", "TrendingDown"], isDefault: false },
      ],
      exports: ["StatsCard"],
      lineCount: 38,
    },
  ],
  frameworks: ["Next.js", "React", "Prisma", "Tailwind CSS"],
  packageManager: "npm",
  hasTests: true,
  hasLinting: true,
  hasTypeScript: true,
  envVars: [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
  ],
};

// ─── Demo Generated Documentation ──────────────────────────────────────────

export const DEMO_README = `# Acme SaaS Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat-square&logo=prisma)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)

A modern, full-stack SaaS platform built with Next.js 15 App Router, featuring authentication, billing, project management, and a polished dashboard.

## ✨ Features

- **Authentication** — Secure login/register with NextAuth v5
- **Project Management** — Create, update, and delete projects with a clean dashboard
- **Billing & Subscriptions** — Stripe integration with checkout and webhook handling
- **Dashboard Analytics** — Real-time stats cards and activity feeds
- **Email Notifications** — Transactional emails via Resend
- **Type Safety** — Full TypeScript coverage with Zod validation
- **Modern UI** — Tailwind CSS + Framer Motion animations
- **Database** — Prisma ORM with type-safe queries

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Database | Prisma 6.0 |
| Auth | NextAuth v5 |
| Payments | Stripe |
| Styling | Tailwind CSS 4.0 |
| Animation | Framer Motion 12 |
| Email | Resend |
| Validation | Zod |
| Testing | Vitest + Testing Library |

## 📁 Project Structure

\`\`\`
app/              → Next.js App Router pages and API routes
├── (auth)/       → Authentication pages (login, register)
├── (dashboard)/  → Protected dashboard pages
└── api/          → REST API endpoints
components/       → Reusable React components
├── ui/           → Design system primitives
├── layout/       → Layout components (Navbar, Sidebar)
├── dashboard/    → Dashboard-specific components
└── billing/      → Billing components
lib/              → Core utilities (auth, db, stripe, email)
services/         → Business logic layer
prisma/           → Database schema
types/            → TypeScript type definitions
\`\`\`

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables (see \`.env.example\`)
4. Initialize database: \`npx prisma db push\`
5. Start development: \`npm run dev\`

## 📄 License

MIT
`;

export const DEMO_API_DOCS = `# API Documentation

## Base URL

\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

All protected endpoints require a valid session. Authentication is handled via NextAuth v5.

---

## Endpoints

### Projects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| \`GET\` | \`/api/projects\` | List all projects for authenticated user | ✅ |
| \`POST\` | \`/api/projects\` | Create a new project | ✅ |

#### GET /api/projects

Returns all projects belonging to the authenticated user.

**Response:**
\`\`\`json
{
  "projects": [
    {
      "id": "clx...",
      "name": "My Project",
      "description": "Project description",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
\`\`\`

#### POST /api/projects

Create a new project.

**Request Body:**
\`\`\`json
{
  "name": "string (required)",
  "description": "string (optional)"
}
\`\`\`

---

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| \`GET\` | \`/api/users\` | Get current user profile | ✅ |
| \`PATCH\` | \`/api/users\` | Update user profile | ✅ |

---

### Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| \`POST\` | \`/api/billing/checkout\` | Create Stripe checkout session | ✅ |
| \`POST\` | \`/api/billing/webhook\` | Stripe webhook handler | 🔒 Stripe Signature |

#### POST /api/billing/checkout

Creates a Stripe Checkout session and returns the URL.

**Request Body:**
\`\`\`json
{
  "priceId": "price_..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "url": "https://checkout.stripe.com/..."
}
\`\`\`

---

## Error Responses

All errors follow this format:

\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
\`\`\`

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — No valid session |
| 404 | Not Found — Resource doesn't exist |
| 500 | Internal Server Error |
`;

export const DEMO_SETUP_GUIDE = `# Setup Guide

## Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **PostgreSQL** database (or use a cloud provider like Supabase/Neon)
- **Stripe** account (for billing features)

## Step 1: Clone & Install

\`\`\`bash
git clone https://github.com/acme/saas-platform.git
cd saas-platform
npm install
\`\`\`

## Step 2: Environment Variables

Copy the example environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in the required values:

| Variable | Description | Where to Get |
|----------|-------------|-------------|
| \`DATABASE_URL\` | PostgreSQL connection string | Your database provider |
| \`NEXTAUTH_SECRET\` | Random secret for auth | Run \`openssl rand -base64 32\` |
| \`NEXTAUTH_URL\` | App URL | \`http://localhost:3000\` for dev |
| \`STRIPE_SECRET_KEY\` | Stripe API key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| \`STRIPE_WEBHOOK_SECRET\` | Webhook signing secret | Stripe CLI or Dashboard |
| \`RESEND_API_KEY\` | Email service key | [Resend Dashboard](https://resend.com) |

## Step 3: Database Setup

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
\`\`\`

## Step 4: Start Development

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Stripe Setup (Optional)

For local webhook testing:

\`\`\`bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/billing/webhook
\`\`\`

## Available Scripts

| Script | Description |
|--------|-------------|
| \`npm run dev\` | Start development server |
| \`npm run build\` | Build for production |
| \`npm run start\` | Start production server |
| \`npm run lint\` | Run ESLint |
| \`npm run test\` | Run tests with Vitest |
| \`npm run test:watch\` | Run tests in watch mode |
| \`npm run db:push\` | Push Prisma schema |
| \`npm run db:studio\` | Open Prisma Studio |

## Common Issues

### Database Connection
If you see \`P1001: Can't reach database server\`, ensure your \`DATABASE_URL\` is correct and the database is running.

### Stripe Webhooks
For local development, you must use the Stripe CLI to forward webhooks. Production webhooks are configured in the Stripe Dashboard.
`;

export const DEMO_ARCHITECTURE = `# Architecture Summary

## High-Level Overview

Acme SaaS Platform follows a **layered architecture** pattern built on Next.js 15 App Router:

\`\`\`
┌─────────────────────────────────────────────┐
│                  Client (Browser)            │
├─────────────────────────────────────────────┤
│           Next.js App Router                 │
│    ┌─────────┐  ┌───────────────────┐       │
│    │  Pages   │  │   API Routes      │       │
│    │  (RSC)   │  │   /api/*          │       │
│    └────┬─────┘  └────────┬──────────┘       │
│         │                 │                  │
│    ┌────┴─────────────────┴──────────┐       │
│    │        Services Layer            │       │
│    │  (Business Logic)                │       │
│    └────────────┬─────────────────────┘       │
│                 │                             │
│    ┌────────────┴─────────────────────┐       │
│    │        Data Layer (Prisma)        │       │
│    └────────────┬─────────────────────┘       │
│                 │                             │
├─────────────────┼─────────────────────────────┤
│            PostgreSQL Database                │
└───────────────────────────────────────────────┘
\`\`\`

## Component Architecture

### Pages (app/)
- **Route Groups**: \`(auth)\` for public pages, \`(dashboard)\` for protected pages
- **API Routes**: RESTful endpoints under \`app/api/\`
- **Layouts**: Shared layouts per route group

### Components (components/)
- **ui/**: Atomic design system components (Button, Card, Input, Modal, Table)
- **layout/**: Structural components (Navbar, Sidebar, Footer)
- **Feature-specific**: Grouped by feature (dashboard/, billing/)

### Services (services/)
- **project-service.ts**: CRUD operations for projects
- **user-service.ts**: User management logic
- **billing-service.ts**: Stripe integration and subscription management

### Core Libraries (lib/)
- **auth.ts**: NextAuth configuration and session helpers
- **db.ts**: Prisma client singleton
- **stripe.ts**: Stripe client initialization
- **email.ts**: Resend email client and templates

## Design Patterns

1. **Service Layer Pattern**: Business logic separated from API routes
2. **Repository Pattern**: Data access via Prisma client abstraction
3. **Route Groups**: Logical grouping of related pages
4. **Middleware**: Auth checks via NextAuth middleware

## Data Flow

1. Client makes request → Next.js middleware checks auth
2. API route validates input with Zod
3. Route calls service layer function
4. Service interacts with database via Prisma
5. Response formatted and returned

## Security

- Session-based auth via NextAuth
- Stripe webhook signature verification
- Zod validation on all inputs
- Environment variable isolation
`;

export const DEMO_FOLDER_STRUCTURE = `# Folder Structure Explanation

## Root Directory

| Path | Purpose |
|------|---------|
| \`app/\` | Next.js 15 App Router — all pages and API routes |
| \`components/\` | Reusable React components organized by feature |
| \`lib/\` | Core utilities and third-party integrations |
| \`services/\` | Business logic layer (data operations) |
| \`prisma/\` | Database schema and migrations |
| \`types/\` | Shared TypeScript type definitions |
| \`public/\` | Static assets served directly |

---

## app/ — Application Routes

### app/(auth)/
Authentication-related pages. Wrapped in a minimal layout without the dashboard sidebar.
- **login/page.tsx** — Login form with NextAuth providers
- **register/page.tsx** — User registration page

### app/(dashboard)/
Protected dashboard pages. Wrapped in a layout with Sidebar and Navbar.
- **page.tsx** — Main dashboard with stats and activity feed
- **settings/page.tsx** — User settings and preferences
- **billing/page.tsx** — Subscription management and invoices
- **projects/** — Project listing and individual project views

### app/api/
RESTful API endpoints following Next.js App Router conventions.
- **auth/[...nextauth]/** — NextAuth API handler
- **projects/** — Project CRUD operations
- **billing/** — Stripe checkout and webhook handling
- **users/** — User profile management

---

## components/ — UI Components

### components/ui/
Design system primitives — the building blocks:
- **Button.tsx** — Primary, secondary, ghost variants with loading states
- **Card.tsx** — Container with optional header and footer
- **Input.tsx** — Form input with label and error states
- **Modal.tsx** — Dialog overlay with animations
- **Table.tsx** — Data table with sorting support

### components/layout/
Page-level structural components:
- **Navbar.tsx** — Top navigation with user menu
- **Sidebar.tsx** — Dashboard navigation sidebar
- **Footer.tsx** — Site footer

### components/dashboard/
Dashboard-specific components:
- **StatsCard.tsx** — Metric card with trend indicator
- **ProjectList.tsx** — Project cards grid
- **ActivityFeed.tsx** — Recent activity timeline

---

## lib/ — Core Utilities

| File | Purpose |
|------|---------|
| \`auth.ts\` | NextAuth configuration, session helpers |
| \`db.ts\` | Prisma client singleton instance |
| \`stripe.ts\` | Stripe client initialization |
| \`email.ts\` | Resend email client and templates |
| \`utils.ts\` | General utility functions |

---

## services/ — Business Logic

| File | Purpose |
|------|---------|
| \`project-service.ts\` | Project CRUD with authorization checks |
| \`user-service.ts\` | User profile management |
| \`billing-service.ts\` | Stripe subscription and checkout logic |
`;

export const DEMO_MERMAID_DIAGRAMS = `## Architecture Overview

\`\`\`mermaid
graph TD
    Client["Browser Client"] --> AppRouter["Next.js App Router"]
    AppRouter --> Pages["Pages (RSC)"]
    AppRouter --> API["API Routes"]
    Pages --> Components["React Components"]
    API --> Services["Services Layer"]
    Services --> Prisma["Prisma ORM"]
    Prisma --> DB["PostgreSQL"]
    API --> Stripe["Stripe API"]
    API --> Resend["Resend Email"]
    AppRouter --> Auth["NextAuth v5"]
    Auth --> DB
    
    style Client fill:#3b82f6,color:#fff
    style AppRouter fill:#8b5cf6,color:#fff
    style DB fill:#06b6d4,color:#fff
    style Stripe fill:#635bff,color:#fff
\`\`\`

## API Request Flow

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant R as API Route
    participant S as Service
    participant D as Database
    
    C->>M: HTTP Request
    M->>M: Check Auth Session
    alt Unauthorized
        M-->>C: 401 Redirect to Login
    end
    M->>R: Forward Request
    R->>R: Validate Input (Zod)
    R->>S: Call Service Method
    S->>D: Query via Prisma
    D-->>S: Result
    S-->>R: Processed Data
    R-->>C: JSON Response
\`\`\`

## Dependency Graph

\`\`\`mermaid
graph LR
    subgraph Core
        Next["Next.js 15"]
        React["React 19"]
        TS["TypeScript 5.7"]
    end
    
    subgraph Data
        Prisma["Prisma 6"]
        Zod["Zod"]
    end
    
    subgraph Auth
        NextAuth["NextAuth v5"]
    end
    
    subgraph Payments
        Stripe["Stripe"]
    end
    
    subgraph UI
        Tailwind["Tailwind CSS 4"]
        Framer["Framer Motion"]
        Lucide["Lucide Icons"]
    end
    
    subgraph Email
        ResendPkg["Resend"]
    end
    
    Next --> React
    Next --> TS
    Next --> Prisma
    Next --> NextAuth
    Next --> Stripe
    Next --> Tailwind
    
    style Core fill:#3b82f6,color:#fff
    style Data fill:#8b5cf6,color:#fff
    style UI fill:#06b6d4,color:#fff
    style Payments fill:#635bff,color:#fff
\`\`\`
`;

// ─── Demo Health Analysis ───────────────────────────────────────────────────

export interface HealthAnalysis {
  overallScore: number;
  architecture: number;
  documentation: number;
  dependencyRisk: "low" | "medium" | "high";
  complexity: number;
  maintainability: number;
  hasTests: boolean;
  hasLinting: boolean;
  hasTypeScript: boolean;
  suggestions: string[];
}

export const DEMO_HEALTH: HealthAnalysis = {
  overallScore: 82,
  architecture: 88,
  documentation: 75,
  dependencyRisk: "low",
  complexity: 72,
  maintainability: 85,
  hasTests: true,
  hasLinting: true,
  hasTypeScript: true,
  suggestions: [
    "Add CONTRIBUTING.md for open-source collaboration guidelines",
    "Consider adding a CHANGELOG.md to track version history",
    "Add API rate limiting middleware for production security",
    "Consider adding E2E tests with Playwright for critical flows",
    "Add error boundary components for better error handling UX",
  ],
};

// ─── Demo Insights ──────────────────────────────────────────────────────────

export interface InsightItem {
  id: string;
  category:
    | "architecture"
    | "scalability"
    | "maintainability"
    | "security"
    | "performance"
    | "documentation"
    | "dependencies"
    | "deployment";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical" | "success";
  confidence: number;
}

export const DEMO_INSIGHTS: InsightItem[] = [
  {
    id: "1",
    category: "architecture",
    title: "Clean Layered Architecture Detected",
    description:
      "Project follows a well-structured layered pattern with separate service, route, and component layers. This promotes maintainability and testability.",
    severity: "success",
    confidence: 95,
  },
  {
    id: "2",
    category: "architecture",
    title: "Next.js 15 App Router Pattern",
    description:
      "Using the latest App Router with route groups for auth and dashboard separation. Server Components used appropriately for data fetching.",
    severity: "success",
    confidence: 98,
  },
  {
    id: "3",
    category: "scalability",
    title: "Service Layer Enables Horizontal Scaling",
    description:
      "Business logic is properly decoupled from API routes via a service layer, making it easier to extract into microservices if needed.",
    severity: "success",
    confidence: 85,
  },
  {
    id: "4",
    category: "security",
    title: "Auth Middleware Present",
    description:
      "NextAuth v5 is configured with middleware-level auth checks. Consider adding rate limiting and CSRF protection for API routes.",
    severity: "info",
    confidence: 90,
  },
  {
    id: "5",
    category: "documentation",
    title: "Missing CONTRIBUTING.md",
    description:
      "No contribution guidelines found. Adding a CONTRIBUTING.md would help onboard new contributors and establish coding standards.",
    severity: "warning",
    confidence: 100,
  },
  {
    id: "6",
    category: "dependencies",
    title: "Healthy Dependency Count",
    description:
      "12 production dependencies is well within healthy range. Each dependency serves a clear purpose with no obvious redundancy.",
    severity: "success",
    confidence: 92,
  },
  {
    id: "7",
    category: "maintainability",
    title: "Strong Type Safety",
    description:
      "TypeScript is used throughout with Zod for runtime validation. This significantly reduces runtime errors and improves developer experience.",
    severity: "success",
    confidence: 96,
  },
  {
    id: "8",
    category: "performance",
    title: "Consider Edge Runtime for API Routes",
    description:
      "Some stateless API routes could benefit from Edge Runtime for lower latency. Evaluate checkout and webhook routes for compatibility.",
    severity: "info",
    confidence: 70,
  },
  {
    id: "9",
    category: "deployment",
    title: "No Docker Configuration",
    description:
      "No Dockerfile or docker-compose.yml detected. Consider adding containerization for consistent deployment across environments.",
    severity: "info",
    confidence: 100,
  },
  {
    id: "10",
    category: "maintainability",
    title: "Test Coverage Present",
    description:
      "Vitest and Testing Library are configured. Ensure critical paths (auth, billing) have comprehensive test coverage.",
    severity: "success",
    confidence: 88,
  },
];

// ─── Getter for all demo data ───────────────────────────────────────────────

export interface DemoData {
  summary: RepositorySummary;
  readme: string;
  apiDocs: string;
  setupGuide: string;
  architecture: string;
  folderStructure: string;
  mermaidDiagrams: string;
  health: HealthAnalysis;
  insights: InsightItem[];
}

export function getDemoData(): DemoData {
  return {
    summary: DEMO_REPO_SUMMARY,
    readme: DEMO_README,
    apiDocs: DEMO_API_DOCS,
    setupGuide: DEMO_SETUP_GUIDE,
    architecture: DEMO_ARCHITECTURE,
    folderStructure: DEMO_FOLDER_STRUCTURE,
    mermaidDiagrams: DEMO_MERMAID_DIAGRAMS,
    health: DEMO_HEALTH,
    insights: DEMO_INSIGHTS,
  };
}
