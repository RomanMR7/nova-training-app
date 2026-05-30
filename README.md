# Anchor Pay Training App

Anchor Pay is a standalone nautical-themed fintech training simulator for employee onboarding.
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

## Supabase Free Setup

1. Create a Supabase Free project.
2. Open the Supabase SQL editor.
3. Run `supabase/schema.sql`.
4. Create the first admin user in Supabase Authentication.
5. Insert a matching row into `public.training_users` using the bootstrap example at the bottom
   of `supabase/schema.sql`.
6. Add the env vars above in Vercel.
7. Deploy the app.
8. Log in as the bootstrap admin and create employee training accounts from the Anchor Pay admin
   panel.

The app uses Supabase Auth for passwords. The `training_users.password_hash` column is reserved
for possible future migrations and should not store plaintext passwords.

## Employee Flow

- Everyone receives the same Vercel URL.
- Login fields are empty by default.
- The employee enters email and password created by the admin.
- The employee sees only the route for their assigned role.
- Progress, simulations, quiz scores, and final results sync to Supabase.
- Non-admin users cannot open the admin statistics screen.

## Admin Flow

Admin can:

- create employee training accounts;
- assign roles: Администратор, Саппорт, Мерчант, Трейдер, Провайдер;
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
| Администратор | `admin@training.local` | `Training123!` |
| Саппорт | `support@training.local` | `Training123!` |
| Мерчант | `merchant@training.local` | `Training123!` |
| Трейдер | `trader@training.local` | `Training123!` |
| Провайдер | `provider@training.local` | `Training123!` |

These are not production credentials and do not create centralized statistics.

## Role Access

- Администратор can switch between every training route and open the admin panel.
- Саппорт sees only support materials.
- Мерчант sees only merchant materials.
- Трейдер sees only trader materials.
- Провайдер sees only provider materials.
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
modules, module details, simulations summary, reference material, and a short final check.

The fallback cannot use Supabase or centralized statistics. It clearly states that employee login
and admin statistics require deployed Supabase configuration.

## Updating Content

- Main modules: `src/training-content.ts`.
- Role playbooks, reference center, simulations, cases, and final exams: `src/reference-content.ts`.
- Direct-open fallback: `src/static-fallback.js`.
- Styling: `src/styles.css`.
- Supabase schema: `supabase/schema.sql`.
- Admin serverless API: `api/admin-training-users.js`.

Keep content practical and safe. Use mock objects, placeholders, and training language. Do not add
real URLs, secrets, personal data, production credentials, or wording that implies real money
movement.

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
