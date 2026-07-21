-- Hanzo Base schema for this app (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped by the access rule `@request.auth.org_id = org` — a member of your
-- org reads/writes it; other orgs cannot see it.
--
-- The app sorts the list by Base's managed `created` field (newest first) and
-- renders it as the join date. Keep this file in lockstep with what the app
-- reads/writes (src/views/landing.tsx, src/views/admin.tsx).

CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL
);
