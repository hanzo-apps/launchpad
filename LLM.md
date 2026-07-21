# waitlist-launchpad — agent notes

A launch landing page on the canonical Hanzo app stack (forked from
`hanzo-apps/hanzo-starter`). Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam`
(auth) + `@hanzo/base` (data). Keep it minimal and REAL — every surface builds
and runs, no fabricated UI, no fabricated metrics.

## What this app is

- **Landing (signed out, `views/landing.tsx`)** — dark, motion-rich hero: a
  drifting aurora, a live countdown to `LAUNCH_AT`, an easing signup counter, and
  ONE call to action (email + button). Submitting stashes the email
  (`stashPending`) and starts Hanzo PKCE.
- **Admin (signed in, `views/admin.tsx`)** — running total (easing counter) +
  countdown, folds in the claimed email via `takePending` (read-and-clear, so it
  creates exactly one row under StrictMode), then lists / filters / removes the
  org-scoped `signups`.
- **Motion is real, not a driver.** The v5 config ships no animation driver, so
  motion is: a 1s `setInterval` (countdown), `requestAnimationFrame` (counter
  count-up), and CSS keyframes in `index.html` applied via the `className` prop
  (aurora drift, entrance, CTA glow). `prefers-reduced-motion` disables them.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`
  (adds `LAUNCH_AT`).
- **Domain logic is one place** (`src/lib/waitlist.ts`) — pure, no React/gui:
  copy, `emailValid`, countdown math (`splitDuration`/`pad2`), the pending-email
  handoff, `formatJoined`, and the `Signup` record type.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Landing + admin are the two views.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. Do NOT add
  `@hanzogui/vite-plugin` — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
  `Button` uses `onPress`; `Input` uses `value`/`onChangeText`.
- **`className` is the one web escape hatch** for effects Tamagui props don't
  cover (blur, keyframe motion). It typechecks on gui primitives and is how the
  motion classes attach. Keep the keyframes in `index.html`.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`), org-scoped by
  `@request.auth.org_id = org`. Keep it in lockstep with the views.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. Production needs a `https://*.hanzo.app/auth/callback`
  wildcard on the shared client (or a per-app `hanzo-<app>` client).

## Proven

`npm run typecheck` clean · `npm run build` (tsc + vite) → `dist/`. Renders under
Vite; the landing countdown ticks and the CTA runs a real PKCE S256 redirect to
hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
