# Anchor Pay Training App

Anchor Pay is a standalone nautical-themed fintech training simulator.
It helps employees practice role-based workflows in a safe harbor: no real
money, no real users, no real API calls, and no backend connection.

This repository is separate from `nova-platform`. Do not connect it to the
production platform or reuse production credentials.

## What Is Inside

- Vite + React + TypeScript.
- Russian UI copy by default.
- Dark graphite/navy Anchor Pay visual style with blue navigation accents and bronze/gold training highlights.
- Local role-based training login.
- Admin route switching across all roles.
- Restricted role paths for support, merchant, trader, and provider.
- 15 training modules, role playbooks, simulations, reference center, process maps, decision trees, cheat sheet, and final checks.
- Progress, quiz scores, and final training results stored in `localStorage` by `email + role`.
- Direct `index.html` fallback for opening the app without a dev server.

## Training Accounts

These accounts are local training accounts only. They are not production auth.

| Role | Email | Password |
| --- | --- | --- |
| Администратор | `admin@training.local` | `Training123!` |
| Саппорт | `support@training.local` | `Training123!` |
| Мерчант | `merchant@training.local` | `Training123!` |
| Трейдер | `trader@training.local` | `Training123!` |
| Провайдер | `provider@training.local` | `Training123!` |

## Role Access

- Администратор can switch between every training route.
- Саппорт sees only support materials.
- Мерчант sees only merchant materials.
- Трейдер sees only trader materials.
- Провайдер sees only provider materials.
- If a user tries to spoof another role, the app shows a training access-denied screen.

## Install

```bash
bun install
```

## Run Locally

```bash
bun run dev
```

Vite usually prints `http://127.0.0.1:5173/`.

## Direct Index Fallback

You can open `index.html` directly. The fallback still shows Anchor Pay branding,
local login, role-restricted modules, module details, simulations summary,
reference material, and a short final training check.

The fallback uses `public/anchor-pay-logo.png` if present and falls back to text
branding if the image is missing.

## Build

```bash
bun run build
```

Static output is written to `dist/`.

## Test

```bash
bun run test
```

Tests cover local login, role filtering, quiz scoring, and progress persistence.

## Updating Content

- Main modules: `src/training-content.ts`.
- Role playbooks, reference center, simulations, cases, and final exams: `src/reference-content.ts`.
- Direct-open fallback: `src/static-fallback.js`.
- Styling: `src/styles.css`.

Keep content practical and safe. Use mock objects, placeholders, and training
language. Do not add real URLs, secrets, personal data, production credentials,
or anything that implies actions move real money.

## Local Progress

- Session and progress are stored in `localStorage`.
- Progress is scoped by training account email and selected role.
- `Сбросить прогресс` clears the current route.
- `Сбросить все` clears all local Anchor Pay training data in the browser.

## Static Deploy

After `bun run build`, deploy `dist/` to any static server such as Nginx, Apache,
GitHub Pages, S3-compatible storage, CDN, or an internal file server.

No backend is required.

## Intentionally Not Connected

- No production backend.
- No `nova-platform` backend calls.
- No real API endpoints.
- No `fetch` or XHR to production services.
- No database, Prisma, migrations, auth server, or deployment config.
- No secrets, real credentials, personal data, real payments, real wallets, or real notification integrations.
