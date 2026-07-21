/**
 * Waitlist domain helpers — pure, no React, no @hanzo/gui. One place for the
 * things the landing and admin views share: the product copy, email validation,
 * the countdown math, and the "claim a spot then sign in" handoff.
 */
import type { BaseRecord } from '@hanzo/base/react'

/** One row of the `signups` collection provisioned from schema.sql. */
export interface Signup extends BaseRecord {
  email: string
}

/** Editable product identity for a fork. Used by both views + index.html title. */
export const BRAND = 'Nova'
export const EYEBROW = 'Early access — invite only'
export const SUBHEAD =
  "We're opening the doors soon. Join the waitlist to get early access the moment we launch."

/** Loose-but-honest email shape check (no network verification). */
export function emailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * A visitor claims a spot while signed out, so we stash the email, send them
 * through Hanzo PKCE, and create the org-scoped `signups` row once they land
 * back authenticated (see views/admin.tsx). `take` reads-and-clears so the row
 * is created exactly once even under React StrictMode's double-invoked effects.
 */
const PENDING_KEY = 'waitlist:pending'

export function stashPending(email: string): void {
  try {
    window.localStorage.setItem(PENDING_KEY, email)
  } catch {
    /* storage unavailable — the visitor can retry after signing in */
  }
}

export function takePending(): string | null {
  try {
    const v = window.localStorage.getItem(PENDING_KEY)
    if (v) window.localStorage.removeItem(PENDING_KEY)
    return v
  } catch {
    return null
  }
}

export interface Duration {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

/** Break a millisecond remainder into whole d/h/m/s, clamped at zero. */
export function splitDuration(ms: number): Duration {
  const clamped = Math.max(0, ms)
  const total = Math.floor(clamped / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: clamped === 0,
  }
}

/** Two-digit, non-jittering countdown cell. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Friendly join date for the admin list. */
export function formatJoined(iso?: string): string {
  if (!iso) return 'Just now'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Just now'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
