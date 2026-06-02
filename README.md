# Anchor Pay Training App

Anchor Pay is a standalone PSP training simulator for employee onboarding.
It is separate from `nova-platform` and does not connect to production payment systems.

The deployed app can use Supabase Free for centralized employee accounts and training statistics.
The direct `index.html` fallback remains an offline demo for opening the app without Vite, Vercel,
or Supabase configuration.

## Safety Boundaries

- No real payment APIs.
- No production `nova-platform` backend calls.
- No real money movement, wallets, user operations, or notification integrations.
- No secrets in the repository.
- Supabase keys must be provided through environment variables.
- Progress is training-only data.
- `api_key`, real requisites, real users, and production URLs must not be placed in training text.

## Environment Variables

Frontend:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server/admin API only:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. It is used only by
`api/admin-training-users.js` for admin operations such as creating Supabase Auth users and
resetting temporary passwords.

## Current Training Model

The program now follows the PSP role model:

- `ADMIN`: full access. Creates users of any type, verifies users and shops, sees merchants, orders, wallets, and currencies.
- `TEAMLEAD_MANAGER`: manages the teamlead team/organization, creates `TRADER_MANAGER` and participants through `/psp/teamlead/members`, sees invite codes and organization orders.
- `TRADER_MANAGER`: manages the trader team inside the organization, creates the trader team, adds `TRADER`, adds devices, and sees team orders.
- `TRADER`: creates requisites through `/psp/trader/requisites`, uses the device prepared by `TRADER_MANAGER`, sees own orders, wallet, and withdrawals.
- `MERCHANT`: owns a shop, sees shop orders, withdrawals, and appeals. Cannot create the shop.
- `MERCHANT_MANAGER`: creates and edits shops.
- `HEAD_SUPPORT` and `SUPPORT`: read-only users list plus verification work.

## Core Training Flows

Create a trader ready to work:

1. `ADMIN` opens `/psp/admin/users`, clicks Create, and selects Teamlead manager.
2. `ADMIN` opens `/psp/admin/verification` and confirms the created `TEAMLEAD_MANAGER`.
3. `TEAMLEAD_MANAGER` opens `/psp/teamlead/teams` and creates a team.
4. `TEAMLEAD_MANAGER` opens `/psp/teamlead/members`, adds a participant, and selects `TRADER_MANAGER`.
5. `ADMIN` opens `/psp/admin/verification` and confirms `TRADER_MANAGER`.
6. `TRADER_MANAGER` opens `/psp/trader-manager/team` and creates a trader team.
7. `TRADER_MANAGER` opens `/psp/trader-manager/devices` and adds a device. This is required before a requisite can be created.
8. `TRADER_MANAGER` opens `/psp/trader-manager/team`, adds a trader, and selects `TRADER`.
9. `ADMIN` opens `/psp/admin/verification` and confirms `TRADER`.
10. `TRADER` opens `/psp/trader/requisites`, creates a requisite, selects the bank from dropdown, and checks that the device is auto-filled.

Create a merchant:

1. `ADMIN` opens `/psp/admin/users`, clicks Create, and selects Merchant manager.
2. `ADMIN` opens `/psp/admin/verification`, tab Users, and confirms `MERCHANT_MANAGER`.
3. `MERCHANT_MANAGER` opens `/psp/merchant/shops` and creates a shop.
4. `ADMIN` opens `/psp/admin/verification`, tab Shops, and confirms the shop after checking `percent`, `payout_percent`, and `trust_amount`.
5. `ADMIN` or `MERCHANT_MANAGER` calls `POST /authentication-service/api-key/create` with `{ owner_id: <shop_id>, owner_type: 'MERCHANT' }` and receives `api_key`.
6. The external system, cascade, or integrator sends orders to `POST /order-service/orders` with header `X-API-KEY: <api_key>`.

## Supabase Free Setup

1. Create a Supabase Free project.
2. Open the Supabase SQL editor.
3. Run `supabase/schema.sql`.
4. Create the first admin user in Supabase Authentication.
5. Insert a matching row into `public.training_users` using the bootstrap example at the bottom
   of `supabase/schema.sql`.
6. Add the env vars above in Vercel.
7. Deploy the app.
8. Log in as the bootstrap `ADMIN` and create employee training accounts from the Anchor Pay admin
   panel.

The app uses Supabase Auth for passwords. The `training_users.password_hash` column is reserved
for possible future migrations and should not store plaintext passwords.

## Employee Flow

- Everyone receives the same Vercel URL.
- Login fields are empty by default.
- The employee enters email and password created by `ADMIN`.
- The employee sees only the route for their assigned PSP role.
- Progress, simulations, quiz scores, and final results sync to Supabase when configured.
- Non-admin users cannot open the admin statistics screen.

## Admin Flow

`ADMIN` can:

- create training accounts for every PSP role;
- assign roles: `ADMIN`, `TEAMLEAD_MANAGER`, `TRADER_MANAGER`, `TRADER`, `MERCHANT`, `MERCHANT_MANAGER`, `HEAD_SUPPORT`, `SUPPORT`;
- set a temporary password;
- block or unblock employees;
- change role;
- reset password;
- see all employee progress/statistics;
- export CSV without passwords.

## Local Offline Demo Accounts

When Supabase env vars are missing, the Vite app and direct fallback use local demo accounts only:

| Role | Email | Password |
| --- | --- | --- |
| `ADMIN` | `admin@training.local` | `Training123!` |
| `TEAMLEAD_MANAGER` | `teamlead.manager@training.local` | `Training123!` |
| `TRADER_MANAGER` | `trader.manager@training.local` | `Training123!` |
| `TRADER` | `trader@training.local` | `Training123!` |
| `MERCHANT` | `merchant@training.local` | `Training123!` |
| `MERCHANT_MANAGER` | `merchant.manager@training.local` | `Training123!` |
| `HEAD_SUPPORT` | `head.support@training.local` | `Training123!` |
| `SUPPORT` | `support@training.local` | `Training123!` |

These are not production credentials and do not create centralized statistics.

## Role Access

- `ADMIN` can switch between every training route and open the admin panel.
- Non-admin users see only their assigned route.
- If a user tries to spoof another role, the app shows an access-denied training screen.

## Install

```bash
bun install
```

## Run Locally

```bash
bun run dev
```

Vite usually prints `http://127.0.0.1:5173/`.

## Build

```bash
bun run build
```

Static output is written to `dist/`.

## Test

```bash
bun run test
```

Tests cover login, role filtering, quiz scoring, and progress persistence.

## Direct Index Fallback

You can open `index.html` directly. The fallback shows Anchor Pay branding, local role-restricted
modules, the two core PSP process maps, module details, and local progress.

The fallback cannot use Supabase or centralized statistics.

## Supabase Free Limitations

- Free projects can pause after inactivity.
- Storage, database size, bandwidth, and monthly active users are limited.
- Email delivery and auth rate limits are lower than paid plans.
- Backups, retention, and support are limited.
- For production-grade compliance, audit, uptime, and access management, review Supabase paid plan
  terms and your internal security requirements.

## Static Deploy

Deploy the Vite build output from `dist/` to Vercel or any static server. For centralized employee
accounts, Vercel must also deploy the `api/admin-training-users.js` serverless route and have all
Supabase env vars configured.

No production payment backend is required.

## Updating Content

- Main modules: `src/training-content.ts`.
- Role playbooks, reference center, simulations, cases, and final exams: `src/reference-content.ts`.
- Direct-open fallback: `src/static-fallback.js`.
- Styling: `src/styles.css`.
- Supabase schema: `supabase/schema.sql`.
- Admin serverless API: `api/admin-training-users.js`.

Keep content practical and safe. Use mock objects, placeholders, and training language.
