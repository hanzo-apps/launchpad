# Launchpad Waitlist

A dark, motion-rich **launch landing page** you fork on
[hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud. Drop your email,
watch the countdown tick, and see the signup counter climb — then sign in to the
admin dashboard to see every signup, private to your org.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. Every surface is gui primitives — no
  Tailwind, no second kit. The motion (drifting aurora, ticking countdown,
  easing counter) is real: a 1s interval, `requestAnimationFrame`, and CSS
  keyframes applied through gui's `className` escape hatch.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction. Claiming a spot stashes the email and rides the
  sign-in, so the signup is written under a verified identity.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. `signups` is a real Base collection.

Two views, one static SPA:

- **Launch landing** (signed out) — the hero: aurora, countdown to launch, live
  signup counter, and one call to action.
- **Admin signups** (signed in) — the running total, the countdown, and the
  list of signups (email + join date) with add / filter / remove.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the landing and the sign-in flow. Copy `.env.example` to
`.env` to point at a different environment or set your launch date.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_HANZO_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback` — see **Ambient IAM**. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |
| `VITE_LAUNCH_AT` (rolling +30 days) | ISO 8601 instant the countdown targets. Unset → a rolling 30-day window so a fresh fork always ticks. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base. On the landing, submitting an email stashes it, runs the PKCE round-trip,
and the admin view writes the org-scoped `signups` row on return.

The one deploy requirement: the IAM client (`VITE_HANZO_CLIENT_ID`) must list
this origin's `/auth/callback` as an allowed redirect URI. Register a
`https://*.hanzo.app/auth/callback` wildcard on the shared client so every
forked app works, or register a dedicated `hanzo-<app>` client per template.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org via the access rule
`@request.auth.org_id = org` — a teammate in your org sees the row; other orgs
cannot. At runtime the views read/write `signups` through `@hanzo/base/react`
(`useQuery`/`useMutation`) carrying the IAM token, sorting by the managed
`created` field. Keep `schema.sql` in lockstep with what the app reads/writes.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx            entry
  providers.tsx       GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx             route (/auth/callback) + auth gate
  gui.config.ts       createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts       IAM PKCE config
  env.ts              the VITE_ env contract + LAUNCH_AT, one place
  lib/base.ts         BaseClient carrying the IAM bearer token
  lib/waitlist.ts     domain helpers: copy, email check, countdown math, pending-email handoff
  auth/callback.tsx   PKCE return leg
  components/         aurora · countdown · counter (the hero motion)
  views/              landing (signed out) · admin (signed in)
schema.sql            databaseSchema -> Base `signups` collection on publish
hanzo.yml             Hanzo Cloud build/deploy manifest
```
