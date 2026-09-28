# Project Name

MBG (money-bank-gua)

# Overview

money-bank-gua adalah aplikasi web **expense tracker untuk mahasiswa** yang membantu pengguna mencatat pemasukan dan pengeluaran pribadi, melihat riwayat transaksi, memantau total pemasukan, total pengeluaran, saldo terkini, serta mengatur dan memantau **budget bulanan**.

Setiap transaksi dan budget dimiliki oleh satu akun Supabase Auth. Aplikasi tidak mempercayai `user_id` dari browser; identitas pengguna selalu diambil dari session yang sedang aktif. Supabase PostgreSQL Row Level Security (RLS) menjadi lapisan otorisasi utama agar pengguna hanya dapat membaca dan mengelola data miliknya sendiri.

Ruang lingkup aplikasi:

- Autentikasi email dan password.
- Satu akun dapat memiliki banyak transaksi.
- Jenis transaksi hanya `income` dan `expense`.
- Setiap transaksi memiliki nominal, deskripsi, dan tanggal transaksi.
- Satu pengguna dapat memiliki maksimal satu budget untuk setiap bulan kalender.
- Budget bulan disimpan sebagai tanggal hari pertama bulan tersebut, misalnya `2026-09-01` untuk September 2026.
- Budget summary menampilkan total anggaran, total pengeluaran pada bulan terpilih, dan sisa anggaran.
- Budget indicator menampilkan status pemakaian anggaran berdasarkan persentase pengeluaran terhadap budget.
- Pengguna dapat memilih bulan untuk melihat budget historis tanpa mencampur data antarbulan.
- Interaksi budget menggunakan HTMX untuk AJAX/partial UI update tanpa reload halaman penuh.
- Preferensi tema hanya terdiri dari `light` dan `dark` serta disimpan dalam cookie.
- Belum mencakup kategori transaksi, transfer antar-akun, recurring budget, carry-over budget, laporan kompleks, atau ekspor data.

# Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Web framework | Next.js with App Router | Routing, server rendering, Route Handlers, and page composition |
| Language | TypeScript | Type safety across UI, API, and database models |
| UI | React + Tailwind CSS | Responsive and reusable interface components |
| Partial updates / AJAX | HTMX | Budget form submission, month filtering, summary refresh, and targeted DOM swaps without full-page reload |
| Backend integration | Supabase JavaScript client + `@supabase/ssr` | Authenticated browser/server clients and session cookies |
| Database | Supabase PostgreSQL | Persistent transaction and monthly-budget storage |
| Authentication | Supabase Auth | Email/password registration, login, session, and logout |
| Authorization | PostgreSQL Row Level Security | Per-user isolation for transactions and monthly budgets |
| Validation | Zod | Runtime validation for request bodies, form data, and month parameters |
| Quality tools | ESLint, TypeScript compiler, and automated tests | Static checks and regression prevention |

HTMX is intentionally scoped to the budget interaction region. React owns the page shell and reusable application components, while HTMX performs targeted requests and swaps only the designated budget fragments. This avoids maintaining duplicate client-side budget state.

# Features

1. Registrasi akun menggunakan email dan password.
2. Login dan logout.
3. Session login tetap tersedia selama session masih berlaku, termasuk setelah reload halaman.
4. Dashboard yang menampilkan total pemasukan, total pengeluaran, dan saldo terkini.
5. Menambahkan transaksi pemasukan atau pengeluaran.
6. Melihat riwayat transaksi milik sendiri.
7. Mengubah transaksi milik sendiri.
8. Menghapus transaksi milik sendiri.
9. Pemisahan data transaksi antar-pengguna menggunakan Supabase RLS.
10. Preferensi tema `light` atau `dark` yang disimpan dalam cookie.
11. Tampilan responsif untuk ponsel dan desktop.
12. Menetapkan atau memperbarui budget untuk satu bulan tertentu.
13. Pemisahan data budget antar-pengguna menggunakan Supabase RLS.
14. Budget summary yang menampilkan total anggaran, total pengeluaran bulan terpilih, dan sisa anggaran.
15. Budget indicator yang menampilkan status penggunaan budget dan persentase pemakaian.
16. Filter budget berdasarkan bulan kalender.
17. AJAX budget flow menggunakan HTMX sehingga pengaturan budget, filter bulan, summary, indicator, dan feedback dapat diperbarui tanpa reload halaman penuh.

# Getting Started

## Clone

```bash
git clone <repository-url>
cd money-bank-gua
```

## Install

Gunakan Node.js versi LTS yang kompatibel dengan versi Next.js pada `package.json`.

```bash
npm install
```

HTMX harus tercantum sebagai dependency project. Jika melakukan upgrade dari versi money-bank-gua lama yang belum memiliki HTMX:

```bash
npm install htmx.org
```

Buat project Supabase baru, lalu jalankan migration secara berurutan:

```text
supabase/migrations/0001_create_transactions.sql
supabase/migrations/0002_create_monthly_budgets.sql
```

Migration dapat dijalankan melalui Supabase SQL Editor atau Supabase CLI.

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
money-bank-gua/
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
│   │   ├── budgets/
│   │   │   └── monthly/
│   │   │       ├── route.ts
│   │   │       └── summary/
│   │   │           └── route.ts
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
│   ├── budget/
│   │   ├── budget-form.tsx
│   │   ├── budget-panel.tsx
│   │   ├── budget-summary-shell.tsx
│   │   └── month-filter.tsx
│   ├── dashboard/
│   │   ├── balance-card.tsx
│   │   ├── summary-cards.tsx
│   │   └── transaction-list.tsx
│   ├── htmx/
│   │   └── htmx-loader.tsx
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
│   ├── budgets/
│   │   ├── fragment.ts
│   │   ├── schemas.ts
│   │   ├── service.ts
│   │   └── types.ts
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
│       ├── 0001_create_transactions.sql
│       └── 0002_create_monthly_budgets.sql
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

Ownership rule for this tree:

- Programmer 1 owns Supabase schema changes, RLS policies, database types, and authorization verification for monthly budgets.
- Programmer 2 owns budget validation, budget service logic, monthly aggregation, HTMX Route Handlers, and server-generated response fragments.
- Programmer 3 owns the dashboard budget shell, budget form, month filter, HTMX loader, styling, accessibility, and user interaction wiring.
- Shared files such as `app/(dashboard)/dashboard/page.tsx`, `types/database.ts`, and `package.json` must be coordinated through the PM before editing.
- A programmer must not rewrite another programmer's owned module merely to simplify a local implementation.

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
  -> RLS checks auth.uid() = user_id
  -> JSON response
  -> Browser updates the relevant transaction/dashboard UI
```

The browser never supplies a trusted owner identity. For an insert, the server derives `user_id` from the authenticated user. For reads, updates, and deletes, database RLS remains the final authorization boundary even if a client submits a guessed transaction ID.

## Monthly budget flow with HTMX

```text
Dashboard React shell
  -> HTMX month filter / budget form
  -> Next.js Route Handler
  -> Supabase server client using current session
  -> monthly_budgets + transactions
  -> RLS checks auth.uid() = user_id
  -> HTML fragment / feedback response
  -> HTMX swaps only the targeted DOM fragment
```

Budget interaction is split into two HTMX operations:

1. **Read summary:** the budget summary container performs `GET /api/budgets/monthly/summary?month=YYYY-MM`. The server returns a `text/html` fragment containing total budget, total expense, remaining budget, usage percentage, and indicator status.
2. **Set budget:** the form performs `PUT /api/budgets/monthly` with `month` and `amount`. After a successful upsert, the Route Handler returns user feedback and sends the response header `HX-Trigger: budgetChanged`. The summary container listens for `budgetChanged` and requests the selected month again.

Recommended HTMX wiring:

```tsx
<select
  id="budget-month-filter"
  name="month"
  data-hx-get="/api/budgets/monthly/summary"
  data-hx-target="#budget-summary-fragment"
  data-hx-swap="innerHTML"
  data-hx-trigger="change"
/>

<form
  data-hx-put="/api/budgets/monthly"
  data-hx-target="#budget-form-feedback"
  data-hx-swap="innerHTML"
  data-hx-include="#budget-month-filter"
>
  {/* amount input */}
</form>

<section
  id="budget-summary-fragment"
  data-hx-get="/api/budgets/monthly/summary"
  data-hx-trigger="load, budgetChanged from:body"
  data-hx-include="#budget-month-filter"
  data-hx-swap="innerHTML"
/>
```

The budget flow must not use `window.location.reload()` and must not require a manual `fetch()` call for the requested budget interactions. HTMX owns the AJAX request and fragment replacement for this feature.

## Budget calculation rules

For a selected month `M`:

```text
totalBudget     = monthly_budgets.amount for current user and month M
totalExpense    = SUM(transactions.amount)
                  WHERE type = 'expense'
                  AND transaction_date >= first_day(M)
                  AND transaction_date < first_day(next_month(M))
remainingBudget = totalBudget - totalExpense
usagePercentage = (totalExpense / totalBudget) * 100
```

If no budget has been configured for the selected month:

- `totalExpense` is still calculated.
- Budget state is `UNSET`.
- `totalBudget` is displayed as `0` or "Belum diatur" according to the UI presentation.
- `remainingBudget` and `usagePercentage` are displayed as unavailable (`—`) rather than implying that every expense exceeded a zero budget.

Indicator status after a budget exists:

| Status | Rule | Meaning |
|---|---|---|
| `SAFE` | `usagePercentage < 75` | Penggunaan anggaran masih aman |
| `WARNING` | `75 <= usagePercentage < 100` | Penggunaan mendekati batas anggaran |
| `LIMIT` | `usagePercentage = 100` | Anggaran tepat habis |
| `OVER` | `usagePercentage > 100` | Pengeluaran melebihi anggaran |

The status text must be displayed explicitly. Color may support the indicator but must not be the only way the status is communicated.

## API contract

| Method | Route | Authentication | Request | Success response |
|---|---|---|---|---|
| `GET` | `/api/transactions` | Required | Optional query parameters defined by implementation | Current user's transactions, newest first |
| `POST` | `/api/transactions` | Required | `{ type, amount, description, transactionDate }` | Created transaction with HTTP `201` |
| `PATCH` | `/api/transactions/:id` | Required | One or more editable transaction fields | Updated transaction |
| `DELETE` | `/api/transactions/:id` | Required | No body | HTTP `204` or `{ data: null, error: null }` |
| `GET` | `/api/dashboard/summary` | Required | No body | `{ totalIncome, totalExpense, balance }` |
| `PUT` | `/api/budgets/monthly` | Required | HTMX form data: `month=YYYY-MM`, `amount=<positive decimal>` | `text/html` feedback; HTTP `200`; `HX-Trigger: budgetChanged` |
| `GET` | `/api/budgets/monthly/summary?month=YYYY-MM` | Required | Query parameter `month` | `text/html` summary/indicator fragment for the current user and selected month |

Recommended JSON response shapes for JSON endpoints:

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

Recommended budget domain model used internally before HTML rendering:

```ts
type BudgetStatus = "UNSET" | "SAFE" | "WARNING" | "LIMIT" | "OVER";

type MonthlyBudgetSummary = {
  month: string; // YYYY-MM
  totalBudget: number | null;
  totalExpense: number;
  remainingBudget: number | null;
  usagePercentage: number | null;
  status: BudgetStatus;
};
```

Standard error mapping:

| Status | Code | Meaning |
|---:|---|---|
| `400` | `BAD_REQUEST` | Request shape, month, or identifier is invalid |
| `401` | `UNAUTHENTICATED` | No valid session is available |
| `404` | `NOT_FOUND` | Requested owned resource does not exist or is not visible to the user |
| `422` | `VALIDATION_ERROR` | Field values violate the input rules |
| `500` | `INTERNAL_ERROR` | Unexpected server or database failure |

For HTMX requests, error responses should return a safe `text/html` feedback fragment to the declared target while preserving the appropriate HTTP status when practical. Responses must not expose stack traces, database credentials, session tokens, or information about another user's rows.

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
| SRS-010 | User can choose and persist a light or dark theme. | - The UI provides a light/dark toggle.<br>- The selected value is stored in a cookie named `money-bank-gua-theme`.<br>- Reloading the page preserves the selected theme.<br>- Invalid or missing cookie values fall back to the default light theme.<br>- Theme selection does not require a database query. | P3 |
| SRS-011 | The application is usable on mobile and desktop screens. | - Login, registration, dashboard, transaction form, history, and budget controls are usable at a minimum width of `320px`.<br>- Layout adapts without horizontal scrolling on supported mobile and desktop sizes.<br>- Form controls have labels, focus states, and readable validation messages.<br>- Destructive actions have a clear confirmation or an immediately visible recovery/error state. | P3 |
| SRS-012 | Monthly budgets are stored with per-user ownership and protected by RLS. | - Every monthly budget has a non-null `user_id` referencing `auth.users(id)`.<br>- `budget_month` represents the first date of a calendar month.<br>- A unique constraint prevents more than one budget row for the same user and month.<br>- `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies enforce `auth.uid() = user_id`.<br>- A user cannot read or modify another user's budget even when request parameters are manipulated.<br>- The browser cannot choose another user's `user_id`. | P1 |
| SRS-013 | User can set or update the budget for a selected month. | - The request requires a valid `month` in `YYYY-MM` format and an `amount > 0` with at most two decimal places.<br>- The server derives ownership from the authenticated session.<br>- Creating a budget for a month with no existing row inserts one row.<br>- Setting a budget for a month that already has a row updates that row instead of creating a duplicate.<br>- Invalid input changes no database row.<br>- A successful HTMX request returns feedback and emits `budgetChanged`. | P2 |
| SRS-014 | User can view the budget summary for the selected month. | - Summary contains total budget, total expense, and remaining budget for the selected month.<br>- `remainingBudget = totalBudget - totalExpense` when a budget exists.<br>- `totalExpense` includes only the current user's `expense` transactions whose transaction date falls inside the selected calendar month.<br>- Income transactions do not reduce the budget.<br>- If no budget exists, the UI shows an `UNSET` state and does not present a misleading remaining-budget value.<br>- Other users' budgets and expenses never contribute to the result. | P2 |
| SRS-015 | User can see a budget usage indicator. | - `usagePercentage = totalExpense / totalBudget * 100` when a budget exists.<br>- Status is `SAFE` below 75%, `WARNING` from 75% to below 100%, `LIMIT` at exactly 100%, and `OVER` above 100%.<br>- No budget produces `UNSET` rather than dividing by zero.<br>- Status is communicated with visible text, not color alone.<br>- If a progress bar is used, its visual width may be capped at 100% while the textual percentage still shows the actual value. | P3 |
| SRS-016 | User can filter monthly budget information by calendar month. | - The month control defaults to the current month.<br>- Changing the month requests the corresponding summary through HTMX without a full-page reload.<br>- The selected month is sent in `YYYY-MM` format.<br>- Budget, expense, remaining amount, percentage, and indicator are all recalculated for the selected month only.<br>- Historical months with no budget show the defined `UNSET` state. | P3 |
| SRS-017 | Budget interactions use HTMX for AJAX partial updates. | - Budget form submission uses an HTMX request rather than full-page navigation.<br>- Month filtering uses an HTMX request.<br>- A successful budget update refreshes only the relevant budget summary/indicator fragment.<br>- Loading, validation, success, and error feedback are rendered in targeted regions.<br>- The budget flow does not call `window.location.reload()` and does not require a manual `fetch()` implementation.<br>- HTMX only mutates the designated budget DOM region so React and HTMX do not compete for ownership of the same stateful subtree. | P3 |

## Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | All protected transaction and budget access requires an authenticated Supabase session and is additionally enforced by PostgreSQL RLS. The publishable/anon key may be public, but a service-role key must never reach the browser. |
| Authorization | Authorization is based on the authenticated user's Supabase identity, not a `user_id` supplied by the client. RLS policies for both `transactions` and `monthly_budgets` must be tested independently from the UI. |
| Data integrity | Transaction `type` is limited to `income` and `expense`; amounts and budget amounts are positive `numeric(12,2)` values; each budget month is normalized to its first date; `(user_id, budget_month)` is unique; updates maintain `updated_at`. |
| Privacy | API/HTMX errors do not disclose whether a guessed resource belongs to another user. Logs must not contain passwords, access tokens, refresh tokens, or sensitive session values. |
| Reliability | Failed validation or database mutation must not partially apply a transaction or budget operation. HTMX only swaps a fragment after receiving a server response intended for that target. |
| Consistency | Budget summary calculations are produced from persisted server-side data for the authenticated user. The browser must not be the source of truth for total expense, remaining budget, or indicator status. |
| Performance | Ownership/month columns are indexed. Budget summary queries filter by user and bounded month range rather than scanning unrelated rows. HTMX refreshes only the budget fragment instead of the entire dashboard. |
| Responsiveness | Core flows must work on current mobile and desktop browsers from `320px` width upward without horizontal overflow. |
| Accessibility | Interactive controls must be keyboard reachable, visibly focused, labelled, and paired with readable error messages. Budget status cannot rely on color alone. |
| Maintainability | TypeScript strict mode, reusable Zod schemas, centralized Supabase client creation, isolated budget services, and a clear React/HTMX ownership boundary are required. |
| Observability | Unexpected server errors are logged without secrets; user-facing responses expose a stable, safe message. Budget validation errors are returned to the HTMX feedback target. |
| Compatibility | The application must run with the Node.js version declared in `package.json`. The lock file must be committed, and the installed HTMX version must be reproducible from the lock file. |

## Database Design (Entities)

### Entity: `auth.users`

`auth.users` is managed by Supabase Auth and is not recreated by the application migration.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `uuid` | Primary key | Unique identity used by RLS and resource ownership |
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
| `transaction_date` | `date` | Not null, default current date | Date used in history ordering and monthly budget aggregation |
| `created_at` | `timestamptz` | Not null, UTC default | Row creation timestamp |
| `updated_at` | `timestamptz` | Not null, UTC default | Last successful row update timestamp |

Required transaction index:

```sql
create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc, created_at desc);
```

### Entity: `public.monthly_budgets`

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` | Budget identifier |
| `user_id` | `uuid` | Not null, foreign key to `auth.users(id)` with `ON DELETE CASCADE` | Owner of the budget |
| `budget_month` | `date` | Not null, day must equal `1` | Month represented by its first calendar date |
| `amount` | `numeric(12,2)` | Not null, greater than `0` | Total budget for the month |
| `created_at` | `timestamptz` | Not null, UTC default | Row creation timestamp |
| `updated_at` | `timestamptz` | Not null, UTC default | Last successful budget update timestamp |

Required budget constraints and indexes:

```sql
alter table public.monthly_budgets
  add constraint monthly_budgets_user_month_key
  unique (user_id, budget_month);

create index monthly_budgets_user_month_idx
  on public.monthly_budgets (user_id, budget_month desc);
```

Recommended budget migration:

```sql
create table public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_month date not null check (extract(day from budget_month) = 1),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint monthly_budgets_user_month_key unique (user_id, budget_month)
);

create index monthly_budgets_user_month_idx
  on public.monthly_budgets (user_id, budget_month desc);

create trigger monthly_budgets_set_updated_at
before update on public.monthly_budgets
for each row execute function public.set_updated_at();

alter table public.monthly_budgets enable row level security;

create policy "monthly_budgets_select_own"
on public.monthly_budgets
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "monthly_budgets_insert_own"
on public.monthly_budgets
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "monthly_budgets_update_own"
on public.monthly_budgets
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "monthly_budgets_delete_own"
on public.monthly_budgets
for delete to authenticated
using ((select auth.uid()) = user_id);
```

`public.set_updated_at()` is created by the initial transaction migration and reused by the budget table. If the migration history differs, move the function into an earlier shared migration before creating either trigger.

Database rules:

- The API derives `user_id` from the authenticated session and never accepts it as an authoritative form or query field.
- The server validates `month` as `YYYY-MM`, then normalizes it to `YYYY-MM-01` before database access.
- RLS must remain enabled in every environment, including local development.
- The unique `(user_id, budget_month)` constraint is the database-level guarantee that one user has at most one budget per month.
- Updating a monthly budget should use an upsert keyed by `(user_id, budget_month)` or an equivalent insert/update flow that preserves the same constraint.
- Budget indicator status is derived data and is not stored as a database column.
- `totalExpense`, `remainingBudget`, and `usagePercentage` are calculated from current persisted data rather than stored redundantly.
- Theme preference remains stored in the `money-bank-gua-theme` cookie, not in PostgreSQL.

