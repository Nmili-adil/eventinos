# Eventinas — Backend Fixes from the Production Test Report

Source: production test report of 2026-11-09 (https://eventinas.com, dashboard walkthrough as role `organizer`, read-only API checks with and without a token).

Scope: issues that **only the backend can fix**. The front-end side of the same report is already done in this repository (see "Front-end status" at the end). Items marked **(verify)** are inferred from front-end code or from the report and must be confirmed in the backend code.

Companion documents: [`backend-changes.md`](./backend-changes.md), [`frontend-changes.md`](./frontend-changes.md).

---

## Priority order

| # | Severity | Issue | Section |
|---|---|---|---|
| 1 | **Critical** | `GET /api/events` answers without authentication, including PRIVATE events and creator data | [1.1](#11-critical--unauthenticated-read-of-events) |
| 2 | High | Anonymous and organizer event scopes disagree | [1.2](#12-high--inconsistent-event-scopes) |
| 3 | High | `GET /api/members` returns `fcmToken`, `birthday`, `phoneNumber` to the list | [1.3](#13-high--members-list-over-exposes-personal-data) |
| 4 | High | `GET /api/analytics/events-per-dates` fails on every call (no response, CORS error) | [2.1](#21-high--analyticsevents-per-dates-fails) |
| 5 | Medium | Permission denials return 401 instead of 403 | [1.4](#14-medium--permission-denials-return-401) |
| 6 | Medium | Analytics numbers disagree with the member data | [2.2](#22-medium--analytics-do-not-match-the-source-data) |
| 7 | Medium | No real notification list endpoint (the bell reads the stats endpoint) | [2.3](#23-medium--notification-list-endpoint) |
| 8 | Low | Test and seed data in production | [3](#3-production-data-cleanup) |
| 9 | Follow-up | Role escalation, rate limiting, other roles, scale | [4](#4-follow-up-checks) |

---

## 1. Access control and data exposure

### 1.1 CRITICAL — Unauthenticated read of events

**Observed:**
- `curl https://eventinas.com/api/events` (no `Authorization`, no cookie) returns **HTTP 200**, 7 events, about 10.8 KB.
- 2 of the 7 events are `visibility: PRIVATE`.
- Each event embeds `createdBy { _id, firstName, lastName, gender, picture }`.
- Every other protected route correctly answers `401 "Auth token is not supplied"` without a token.

**Impact:** anyone on the internet can list private events and the names, gender and photos of their creators.

**Changes:**
1. Put `GET /events` (and `GET /events/:id`) behind the same auth middleware as the other dashboard routes. If the mobile app or landing page needs a public listing, expose a **separate** public route (e.g. `GET /public/events`) instead of leaving the dashboard route open.
2. On any public or non-owner route:
   - return only `visibility: PUBLIC` and `status: ACCEPTED` events;
   - never return `DRAFT`, `PENDING` or `REFUSED` events;
   - replace `createdBy` with the public `organizer { name, logo }` block (see `backend-changes.md` 1.6). Do not return `gender` or the creator's personal photo.
3. Apply the same visibility filter to `GET /events/:id`: a PRIVATE event is readable only by its owner, its members or an admin.

**Acceptance:**
- `curl -i https://eventinas.com/api/events` returns `401` (or, on the public route, PUBLIC + ACCEPTED events only, with no `createdBy`).
- `curl -i https://eventinas.com/api/events/<private-event-id>` without a token returns `401`/`404`.

### 1.2 HIGH — Inconsistent event scopes

**Observed:**

| Caller | Events returned | Visibility / status |
|---|---|---|
| Anonymous | 7 | 5 PUBLIC, 2 PRIVATE, all ACCEPTED |
| Organizer (token) | 3 | 2 PUBLIC/PENDING, 1 PUBLIC/ACCEPTED |

Only 1 event appears in both responses. Both filters need review. The anonymous path is missing its filter (1.1). The authenticated path may also be too strict, or simply correct (owner-only). **(verify)**

**Changes:** write the rule down in one place (a query builder or service method) and use it for every caller:

| Caller | Sees |
|---|---|
| Admin | all events, all statuses |
| Organizer | own events (all statuses, including DRAFT), plus PUBLIC + ACCEPTED events of others **only if** the dashboard is meant to show them (decide and document) |
| Member / app user | PUBLIC + ACCEPTED, plus PRIVATE events they are a member of |
| Anonymous | PUBLIC + ACCEPTED on the public route only |

Drafts (`backend-changes.md` 2.3) are visible to their owner and to admins only.

**Acceptance:** the same event never appears for a caller who should not see it. Add a test per row of the table.

### 1.3 HIGH — Members list over-exposes personal data

**Observed:** `GET /api/members` (organizer token) returns on every item:
`phoneNumber, birthday, email, firstName, lastName, gender, country, city, picture, role, isActive, registrationCompleted, favorites, badges, fcmToken, user, createdAt, updatedAt`.

**Changes, in two steps (because of a front-end dependency):**

**Step 1 — now, no front-end impact:**
- Remove `fcmToken` from **every** API response (list, detail, auth `me`, guests). It is a push-notification device token and must never leave the server. The front end does not read it anywhere.
- Remove `password`, `verificationCode` and any reset token from every response if they are ever selected **(verify)**. Use a schema-level `select: false` or a `toJSON` transform so a new route cannot leak them by accident.
- Remove `favorites` from the list response unless needed.

**Step 2 — after adding a detail endpoint:**
- Add `GET /members/:id`, which returns the full record for an admin or for an organizer who shares an event with that member.
- Then reduce `GET /members` to what the list renders: `_id, firstName, lastName, email, picture, gender, city, country, isActive, registrationCompleted, verified, createdAt`.
- `birthday` and `phoneNumber` move to the detail endpoint only.

> Front-end dependency: today `MemberDetailsDialog.tsx` and `MemberEditDialog.tsx` read `phoneNumber`/`birthday` from the **list** object, and the client-side member search matches on `phoneNumber`. Do step 2 only together with the front-end change (call `GET /members/:id` when the dialog opens; move phone search to a server-side `?search=` parameter).

**Scope:** also check that an organizer only receives members related to their own events, not the whole user base. **(verify)**

**Acceptance:** `GET /members` never contains `fcmToken`, `password` or `verificationCode`. After step 2, it contains no `birthday` or `phoneNumber` either.

### 1.4 MEDIUM — Permission denials return 401

**Observed:** with a valid organizer token, `GET /users/all` and `GET /contacts` answer `401 {"message":"permission_error"}`.

**Why it matters:** 401 means "not authenticated" and 403 means "authenticated but not allowed". With 401 for both, a client cannot tell an expired session from a missing permission. The dashboard used to show "Session expirée" to an organizer who was simply not allowed to open Contacts.

**Changes:**
- Keep **401** for a missing, invalid or expired token.
- Return **403** for a valid token whose role lacks the permission.
- Add a machine-readable code to every error body so clients don't rely on messages:

```json
{ "message": "permission_error", "code": "PERMISSION_DENIED" }
{ "message": "Auth token is not supplied", "code": "TOKEN_MISSING" }
{ "message": "jwt expired", "code": "TOKEN_EXPIRED" }
```

The front end already treats both `403` and `message === "permission_error"` as a permission error, so this change is backward compatible.

**Acceptance:** an organizer token on `GET /contacts` returns `403`. An expired token on any route returns `401` with `TOKEN_EXPIRED`.

---

## 2. Broken or inconsistent endpoints

### 2.1 HIGH — `/analytics/events-per-dates` fails

**Observed:**
- The fetch fails at network level ("Failed to fetch", about 5 ms, no HTTP status), with and without a token. The browser reports it as a CORS error.
- The sibling routes `breakdown-by-city`, `breakdown-by-gender` and `counts` work with exactly the same request shape.

**What the front end sends** (`src/api/analyticsApi.ts`): `GET /analytics/events-per-dates`, optional query `startDate` / `endDate` as `YYYY-MM-DD` (both **omitted** for the "Tout" period), headers `Authorization: Bearer …` and `Content-Type: application/json`, with credentials. Nothing differs from the working analytics routes.

**Likely cause:** the handler throws, or crashes the process, before a response is written, most likely when `startDate`/`endDate` are absent or on date parsing. The error response then goes out without CORS headers, so the browser hides the real status. Nginx is a plain `proxy_pass` and adds no CORS headers itself, so they depend entirely on the app. **(verify)**

**Changes:**
1. Fix the handler. Treat missing dates as "no bound", validate the format, and return `400` with a JSON error on bad input.
2. Register the CORS middleware **before** all routes and make sure the global error handler also sends the CORS headers. Then any future 4xx/5xx reaches the client as a real status.
3. Return a stable shape, e.g. `{ data: [{ date: "2026-11-01", count: 3 }] }`, with an empty array when there are no events.

**Acceptance:** `curl -i -H "Origin: https://eventinas.com" -H "Authorization: Bearer <token>" https://eventinas.com/api/analytics/events-per-dates` returns `200` with `Access-Control-Allow-Origin`. The same call with an invalid date returns `400` and still carries the CORS header.

### 2.2 MEDIUM — Analytics do not match the source data

**Observed:**

| Metric | Analytics returns | Source data |
|---|---|---|
| `/analytics/counts` → `members` | 0 (dashboard "Aucun membre") | `GET /members` returns 6 |
| `/analytics/breakdown-by-gender` | `Homme 0, Femme 0` | members: 3 FEMALE, 3 MALE |
| `/analytics/breakdown-by-city` | `Marrakech 1, null 2` (3 in total) | 6 members, one each in Amsterdam, Tokyo, Paris, Berlin, Sydney, London |
| `/firebase-notifications/stats` → `totalUsers` | 24 | none of the above |

The queries probably read a different collection (users rather than members, or event creators), a different field name, or compare a translated label (`"Homme"`) with the stored enum (`"MALE"`). **(verify)**

**Changes:**
- Decide and document what each number means ("members" = app users with the member role? participants of the caller's events?) and scope it like `GET /members` for the same caller.
- Gender breakdown: group on the stored value and return the **enum**, not a translated label. The front end translates it.
  ```json
  { "data": [ { "gender": "MALE", "count": 3 }, { "gender": "FEMALE", "count": 3 } ] }
  ```
  The front end accepts `MALE`/`FEMALE`/`OTHER`, `null` and the French labels, but the enum is the contract.
- City breakdown: group on the same city field the member records use. Return `null` (not the string `"null"`) for members without a city. The front end shows it as "Non renseigné".
- `counts`: add `members` and `pending_users` computed with the same rule as the list endpoints. Respect `startDate`/`endDate` the same way on every analytics route.
- Document how `/firebase-notifications/stats.totalUsers` differs from members (e.g. "devices registered for push").

**Acceptance:** on the same dataset and filters, `counts.members` equals the `GET /members` total, and the gender and city breakdowns sum to that total.

> The front end currently falls back to the `GET /members` total when `counts.members` is 0 on the unfiltered view. That is a workaround, not a fix.

### 2.3 MEDIUM — Notification list endpoint

**Observed:** the header bell (`src/api/notificationsApi.ts`) loads its list from `GET /firebase-notifications/stats`. That endpoint returns statistics, not notifications, so the bell is empty or wrong. It is also called on every page load. The mark-as-read calls already use `PUT /notifications/:id/view` and `PUT /notifications/view`.

**Changes:**
- Provide (or confirm) `GET /notifications?page=&limit=` for the current user: `{ data: [{ _id, title, message, type, read, createdAt, meta }], unreadCount }`.
- Keep `/firebase-notifications/stats` for the admin statistics only.

Once the endpoint exists, the front end switches the bell to it and loads it lazily.

---

## 3. Production data cleanup

The report found test and seed data in production:
- sponsor category **"test categorie"**;
- members with `@example.com` e-mail addresses;
- event creators with `randomuser.me` avatars, and event images on `picsum.photos`;
- the organizer account **"Alex Thompson" (`alex.thompson@eventco.com`)**. This name comes from the backend user record, not from the front end.

**Changes:**
- Confirm whether `eventinas.com` is production. If it is, remove or archive the seed records with a reviewed, backed-up script. Don't delete them by hand.
- Make sure seed scripts cannot run against the production database (environment guard).
- Keep the 5 default partner types (`backend-changes.md` 3.2). They are intended seed data.

---

## 4. Follow-up checks

Not covered by the report. Run them after the fixes above:
- **Role escalation:** the role is stored client-side (`localStorage auth-role`). Edit it to `admin` in the browser and confirm every admin route still returns `403` for an organizer token. Authorization must come from the token and the database, never from the client.
- **Other roles:** with admin, member and sponsor accounts, confirm that each denied route returns `403` and each allowed one returns only that role's scope.
- **Ownership checks on writes:** `PUT/DELETE /events/:id/*`, participant export, attendance and submit routes must check that the caller is the event's owner or an admin (`backend-changes.md` 2.1–2.3).
- **Rate limiting:** add rate limiting and lockout or backoff on `POST /auth/sign-in` and on password reset.
- **Scale:** re-measure latency with 1,000+ events and members. Today's 65–80 ms reflects a dataset of fewer than 10 records per list. Add indexes for the event visibility/status/owner filters and the analytics group-bys.

---

## Front-end status (already done in this repo)

These were handled on the front end and need no backend work, though some become simpler once the backend items above land:
- Contacts and Comptes are hidden from organizers and route-guarded. The Contacts page shows "Accès refusé" or a load error instead of an empty inbox.
- `401 permission_error` and `403` are shown as "Accès refusé", not "Session expirée".
- The dashboard and global search no longer call admin-only `GET /users/all` for organizers.
- The duplicate `GET /events` on the Events page is removed.
- The charts tolerate enum, label and null gender or city values, and missing counts. The misleading "CORS issue" console message is removed.

## Summary checklist

- [ ] 1.1 Auth on `GET /events` and `GET /events/:id`; PRIVATE and non-ACCEPTED events never public; no `createdBy` personal data
- [ ] 1.2 One documented visibility rule per role, with tests
- [ ] 1.3 Step 1: strip `fcmToken`, `password`, `verificationCode` from all responses
- [ ] 1.3 Step 2: `GET /members/:id`, then a slim list (together with the front end)
- [ ] 1.4 403 + `code` for permission errors; 401 only for auth failures
- [ ] 2.1 Fix the `events-per-dates` handler; CORS headers on error responses
- [ ] 2.2 Analytics scoped and keyed like the list endpoints; gender returned as an enum
- [ ] 2.3 `GET /notifications` list endpoint
- [ ] 3 Remove test/seed data from production; guard the seed scripts
- [ ] 4 Role-escalation, other-role, ownership, rate-limit and scale checks
