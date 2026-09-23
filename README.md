# MBG - Money Bank Gua

Your personal money management web

# Overview

MBG adalah aplikasi web expense tracker sederhana untuk mahasiswa. Aplikasi ini memungkinkan pengguna mencatat pemasukan dan pengeluaran pribadi, melihat riwayat transaksi, serta memantau total pemasukan, total pengeluaran, dan saldo terkini.

Setiap transaksi dimiliki oleh satu akun Supabase Auth. Aplikasi tidak mempercayai `user_id` dari browser; identitas pengguna diambil dari session yang sedang aktif. Supabase PostgreSQL Row Level Security (RLS) menjadi lapisan otorisasi utama agar pengguna hanya dapat membaca dan mengubah transaksi miliknya sendiri.

Ruang lingkup versi awal:

- Autentikasi email dan password.
- Satu akun dapat memiliki banyak transaksi.
- Jenis transaksi hanya `income` dan `expense`.
- Setiap transaksi memiliki nominal, deskripsi, dan tanggal transaksi.
- Preferensi tema hanya terdiri dari `light` dan `dark` serta disimpan dalam cookie.
- Belum mencakup kategori, anggaran, transfer antar-akun, laporan periodik, atau ekspor data.

# Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Web framework | Next.js with App Router | Routing, server rendering, Route Handlers, and page composition |
| Language | TypeScript | Type safety across UI, API, and database models |
| UI | React + Tailwind CSS | Responsive and reusable interface components |
| Backend integration | Supabase JavaScript client + `@supabase/ssr` | Authenticated browser/server clients and session cookies |
| Database | Supabase PostgreSQL | Persistent transaction storage and aggregation source |
| Authentication | Supabase Auth | Email/password registration, login, session, and logout |
| Authorization | PostgreSQL Row Level Security | Per-user data isolation at the database layer |
| Validation | Zod | Runtime validation for request bodies and form data |
| Quality tools | ESLint, TypeScript compiler, and automated tests | Static checks and regression prevention |

# Features

1. Registrasi akun menggunakan email dan password.
2. Login dan logout.
3. Session login tetap tersedia selama session masih berlaku, termasuk setelah reload halaman.
4. Dashboard yang menampilkan total pemasukan, total pengeluaran, dan saldo terkini.
5. Menambahkan transaksi pemasukan atau pengeluaran.
6. Melihat riwayat transaksi milik sendiri.
7. Mengubah transaksi milik sendiri.
8. Menghapus transaksi milik sendiri.
9. Pemisahan data antar-pengguna menggunakan Supabase RLS.
10. Preferensi tema `light` atau `dark` yang disimpan dalam cookie.
11. Tampilan responsif untuk ponsel dan desktop.

# Getting Started

## Clone

```bash
git clone <repository-url>
cd duitku
```

## Install

Gunakan Node.js versi LTS yang kompatibel dengan versi Next.js pada `package.json`.

```bash
npm install
```

Buat project Supabase baru, lalu jalankan migration pada `supabase/migrations/0001_create_transactions.sql` melalui Supabase SQL Editor atau Supabase CLI.

## Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
```

Aturan environment variable:

- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` boleh digunakan oleh client karena memang diperlukan oleh Supabase client.
- Jangan menyimpan `service_role` key di `.env.local` yang masuk ke bundle browser.
- Jangan commit `.env.local`; commit hanya `.env.example` tanpa nilai rahasia.
- Jika project Supabase menggunakan nama legacy `anon key`, gunakan satu nama variabel secara konsisten di seluruh source code.

## Run

Jalankan development server:

```bash
npm run dev
```

Buka `http://localhost:3000`.

Sebelum melakukan merge, jalankan pemeriksaan lokal:

```bash
npm run lint
npm run typecheck
npm run build
```

Jika script `typecheck` belum tersedia, tambahkan script berikut ke `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

# Project Structure (File Tree)

```text
duitku/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── dashboard/
│   │   │   └── summary/
│   │   │       └── route.ts
│   │   └── transactions/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── dashboard/
│   │   ├── balance-card.tsx
│   │   ├── summary-cards.tsx
│   │   └── transaction-list.tsx
│   ├── theme/
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── transactions/
│   │   ├── transaction-form.tsx
│   │   ├── transaction-row.tsx
│   │   └── transaction-dialog.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── toast.tsx
├── lib/
│   ├── api-response.ts
│   ├── auth/
│   │   └── guards.ts
│   ├── supabase/
│   │   ├── browser.ts
│   │   ├── proxy.ts
│   │   └── server.ts
│   └── transactions/
│       ├── schemas.ts
│       ├── service.ts
│       └── types.ts
├── supabase/
│   └── migrations/
│       └── 0001_create_transactions.sql
├── types/
│   └── database.ts
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── proxy.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

# API / Data Flow

## Authentication and session flow

1. The user submits the registration or login form.
2. The authentication layer calls Supabase Auth with email and password.
3. Supabase returns the authentication result and session information.
4. The SSR Supabase client stores and refreshes the session through cookies.
5. Next.js Proxy refreshes the session when needed and protects `/dashboard` and authenticated API routes.
6. An unauthenticated request to a protected page is redirected to `/login`; an unauthenticated API request receives `401 Unauthorized`.
7. Logout calls Supabase Auth sign-out, clears the session, and redirects to `/login`.

## Transaction request flow

```text
Browser UI
  -> Next.js Route Handler
  -> Supabase server client using the current session
  -> PostgreSQL transactions table
  -> RLS policy checks auth.uid() = user_id
  -> JSON response
  -> Browser updates the relevant UI
```

The browser never supplies a trusted owner identity. For an insert, the server derives `user_id` from the authenticated user. For reads, updates, and deletes, the database RLS policy remains the final authorization boundary even if a client submits a guessed transaction ID.

## API contract

| Method | Route | Authentication | Request | Success response |
|---|---|---|---|---|
| `GET` | `/api/transactions` | Required | Optional query parameters defined by the implementation | Current user's transactions, newest first |
| `POST` | `/api/transactions` | Required | `{ type, amount, description, transactionDate }` | Created transaction with HTTP `201` |
| `PATCH` | `/api/transactions/:id` | Required | One or more editable transaction fields | Updated transaction |
| `DELETE` | `/api/transactions/:id` | Required | No body | HTTP `204` or `{ data: null, error: null }` |
| `GET` | `/api/dashboard/summary` | Required | No body | `{ totalIncome, totalExpense, balance }` |

Recommended response shapes:

```ts
type ApiSuccess<T> = {
  data: T;
  error: null;
};

type ApiError = {
  data: null;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
```

Standard error mapping:

| Status | Code | Meaning |
|---:|---|---|
| `400` | `BAD_REQUEST` | Request shape or identifier is invalid |
| `401` | `UNAUTHENTICATED` | No valid session is available |
| `404` | `NOT_FOUND` | Transaction does not exist or is not visible to the user |
| `422` | `VALIDATION_ERROR` | Field values violate the input rules |
| `500` | `INTERNAL_ERROR` | Unexpected server or database failure |

The API must not return stack traces, database credentials, or information that reveals another user's transaction.

# SRS

## Functional Requirements (table with Owner: P1/P2/P3)

| ID | Requirement | Acceptance Criteria | Owner |
|---|---|---|---|
| SRS-001 | User can register with an email and password. | - A valid email and password create a Supabase Auth account.<br>- A duplicate email is rejected with a user-readable error.<br>- Invalid input is rejected before a transaction request is sent.<br>- No password is stored in the application database. | P1 |
| SRS-002 | User can log in and log out. | - Valid credentials create an authenticated session.<br>- Invalid credentials do not open the dashboard and show a safe error message.<br>- Logout invalidates the active session and redirects to `/login`.<br>- The UI does not expose authentication tokens in application state or logs. | P1 |
| SRS-003 | The application preserves a valid session and protects private resources. | - Reloading the page while the session is valid keeps the user authenticated.<br>- `/dashboard` redirects unauthenticated users to `/login`.<br>- Protected API routes return `401` without a valid session.<br>- Expired sessions are refreshed or the user is sent to login. | P1 |
| SRS-004 | Transactions are stored with per-user ownership and protected by RLS. | - Every transaction has a non-null `user_id` referencing `auth.users(id)`.<br>- `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies enforce `auth.uid() = user_id`.<br>- A user cannot read, modify, or delete another user's transaction even when an ID is guessed.<br>- The client cannot choose another user's `user_id` during creation. | P1 |
| SRS-005 | User can add an income or expense transaction. | - The request accepts only `income` or `expense`.<br>- `amount` must be a positive number with at most two decimal places.<br>- `description` and `transactionDate` satisfy the declared validation rules.<br>- A valid request creates one transaction and returns HTTP `201`.<br>- Invalid requests return a validation error and create no row. | P2 |
| SRS-006 | User can view their own transaction history. | - The authenticated user sees only transactions belonging to the current account.<br>- Transactions are displayed newest first by transaction date and creation time.<br>- An account with no transactions displays an empty state.<br>- Loading and request-error states are visible and recoverable. | P2 |
| SRS-007 | User can edit their own transaction. | - The edit form loads the selected transaction values.<br>- A valid update changes only the selected user's row.<br>- `updated_at` changes after a successful update.<br>- An invalid update is rejected without partially changing the row.<br>- A non-owned or nonexistent row is treated as not found. | P2 |
| SRS-008 | User can delete their own transaction. | - The user can request deletion from the transaction history or edit view.<br>- A successful deletion removes the row from the database and current UI.<br>- A non-owned or nonexistent row cannot be deleted.<br>- A failed deletion leaves the existing transaction visible and shows an error. | P2 |
| SRS-009 | User can view a financial summary. | - Dashboard displays total income, total expense, and balance.<br>- `balance = totalIncome - totalExpense`.<br>- Only the current user's rows contribute to the totals.<br>- The summary is refreshed after a successful create, edit, or delete operation.<br>- Amounts use one consistent currency and number format. | P2 |
| SRS-010 | User can choose and persist a light or dark theme and also filtering also hide amount cookie | - The UI provides a light/dark toggle.<br>- The selected value is stored in a cookie named `duitku-theme`.<br>- Reloading the page preserves the selected theme, and hide/showed amount.<br>- Invalid or missing cookie values fall back to the default light theme, opened transaction.<br>- Theme selection does not require a database query. | P3 |
| SRS-011 | The application is usable on mobile and desktop screens. | - Login, registration, dashboard, transaction form, and history are usable at a minimum width of `320px`.<br>- Layout adapts without horizontal scrolling on supported mobile and desktop sizes.<br>- Form controls have labels, focus states, and readable validation messages.<br>- Destructive actions have a clear confirmation or an immediately visible recovery/error state. | P3 |

## Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | All protected data access requires an authenticated Supabase session and is additionally enforced by PostgreSQL RLS. The publishable/anon key may be public, but a service-role key must never reach the browser. |
| Authorization | Authorization is based on the authenticated user's Supabase identity, not a `user_id` supplied by the client. RLS policies are tested independently from the UI. |
| Data integrity | `type` is limited to `income` and `expense`; `amount` is positive and uses `numeric(12,2)`; ownership is non-null; updates maintain `updated_at`. |
| Privacy | API errors do not disclose whether a guessed transaction ID belongs to another user. Logs must not contain passwords, access tokens, or sensitive session values. |
| Reliability | A failed validation or database mutation must not produce a partially applied transaction operation. Client state is updated only after a successful server response. |
| Performance | Dashboard summary and transaction history should use indexed ownership/date columns and avoid fetching unrelated users' rows. The initial UI should remain responsive during requests through loading states. |
| Responsiveness | The core flows must work on current mobile and desktop browsers from `320px` width upward without horizontal overflow. |
| Accessibility | Interactive controls must be keyboard reachable, visibly focused, labelled, and paired with readable error messages. Color must not be the only way to communicate transaction type or status. |
| Maintainability | TypeScript strict mode, reusable validation schemas, centralized Supabase client creation, and clear service boundaries are required. |
| Observability | Unexpected server errors are logged without secrets; user-facing responses expose a stable error code and a safe message. |
| Compatibility | The application must run with the Node.js version declared in `package.json` and the package-lock file must be committed. |

## Database Design (Entities)

### Entity: `auth.users`

`auth.users` is managed by Supabase Auth and is not recreated by the application migration.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `uuid` | Primary key | Unique identity used by RLS and transaction ownership |
| `email` | `text` | Managed by Supabase Auth | Login email |
| `created_at` | `timestamptz` | Managed by Supabase Auth | Account creation timestamp |

### Entity: `public.transactions`

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` | Transaction identifier |
| `user_id` | `uuid` | Not null, foreign key to `auth.users(id)` with `ON DELETE CASCADE` | Owner of the transaction |
| `type` | `transaction_type` | Not null | `income` or `expense` |
| `amount` | `numeric(12,2)` | Not null, greater than `0` | Transaction amount |
| `description` | `text` | Not null, trimmed length `1..200` | Human-readable transaction description |
| `transaction_date` | `date` | Not null, default current date | Date used in history ordering and reporting |
| `created_at` | `timestamptz` | Not null, UTC default | Row creation timestamp |
| `updated_at` | `timestamptz` | Not null, UTC default | Last successful row update timestamp |

Required indexes:

```sql
create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc, created_at desc);
```

Recommended initial migration:

```sql
create extension if not exists pgcrypto;

create type public.transaction_type as enum ('income', 'expense');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.transaction_type not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text not null
    check (char_length(btrim(description)) between 1 and 200),
  transaction_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.transactions enable row level security;

create policy "transactions_select_own"
on public.transactions
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "transactions_insert_own"
on public.transactions
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "transactions_update_own"
on public.transactions
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "transactions_delete_own"
on public.transactions
for delete to authenticated
using ((select auth.uid()) = user_id);
```

Database rules:

- The API derives `user_id` from the session and never accepts it as an authoritative input field.
- RLS must remain enabled in every environment, including local development.
- The application does not need a duplicate public users table for the initial scope.
- Theme preference is intentionally stored in the `duitku-theme` cookie, not in PostgreSQL.

