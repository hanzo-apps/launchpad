/**
 * The app's environment contract, in ONE place. Every value has a sensible
 * default so the starter runs against live Hanzo (hanzo.id + api.hanzo.ai) with
 * zero config; the deploy pipeline overrides them per environment.
 */

const origin = typeof window !== 'undefined' ? window.location.origin : ''

/** OIDC issuer (Hanzo IAM). */
export const IAM_URL = import.meta.env.VITE_HANZO_IAM_URL || 'https://hanzo.id'

/** IAM application (client) id, `<org>-<app>`. */
export const CLIENT_ID = import.meta.env.VITE_HANZO_CLIENT_ID || 'hanzo-app'

/** PKCE redirect URI — this origin's callback route unless overridden. */
export const REDIRECT_URI =
  import.meta.env.VITE_HANZO_REDIRECT_URI || `${origin}/auth/callback`

/** Browser-reachable Hanzo Base data plane (IAM-native). */
export const BASE_URL = import.meta.env.VITE_HANZO_BASE_URL || 'https://api.hanzo.ai'

/**
 * The instant the countdown counts down to. Set `VITE_LAUNCH_AT` to an ISO 8601
 * date (e.g. `2026-12-01T17:00:00Z`); with none set we default to a rolling
 * 30-day window so a fresh fork always shows a live, ticking countdown.
 */
export const LAUNCH_AT: Date = (() => {
  const raw = import.meta.env.VITE_LAUNCH_AT
  const parsed = raw ? new Date(raw) : null
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
})()
