# Ledgered Frontend

A modern Next.js 15 frontend for the Ledgered banking and ledger API.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Radix UI primitives with shadcn-style components
- TanStack Query for server state
- React Hook Form + Zod for forms

## Setup

1. Install dependencies

```bash
cd frontend
npm install
```

2. Configure environment variables

```bash
copy .env.example .env.local
```

Set the backend URL if needed:

```env
BACKEND_URL=http://localhost:3000
```

3. Run the app

```bash
npm run dev
```

The frontend runs on `http://localhost:3001` so it can proxy requests to the backend on `http://localhost:3000`.

## Features

- Register, login, email verification, resend verification, and logout
- Dashboard with total balance, account cards, recent transfers, and analytics
- Multiple accounts with live balances
- Idempotent money transfers between own accounts
- Immutable ledger and transaction history views
- Transaction CSV export
- Admin-only initial-funds seeding

## Integration Notes

- The frontend uses a same-origin proxy under `/api/backend/*` so the HttpOnly JWT cookie remains usable in the browser.
- Protected routes are guarded by `middleware.ts`.
- Ledger and transaction detail pages depend on the read endpoints added to the backend for this frontend.
