# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Vite + React 19 + `@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. A launch
waitlist: a motion-rich landing (countdown + live counter + one CTA) and a
signed-in admin over the org-scoped `signups` collection. Keep it minimal and
real. `@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this); motion is
real JS + CSS keyframes via `className`. `schema.sql` is the Base data contract.
Prove changes with `npm run build` (tsc + vite). Never build a container image
locally — Hanzo Cloud owns deploys.
