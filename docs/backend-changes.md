# Eventinas — Backend Changes

Scope: bug fixes, new features and new requirements reported for the event module. Endpoint paths below follow the existing conventions used by the front end (`/events/:id/<section>`, `/guests/...`). Items marked **(verify)** are inferred from front-end behaviour and must be confirmed in the backend code.

Companion document: [`frontend-changes.md`](./frontend-changes.md).

---

## 1. Bug fixes

### 1.1 Location not saved at creation (city, country, coordinates lost)

**Symptom:** city, country and coordinates entered in the "Informations de localisation" step disappear once the event is created.

**Current contract:** `POST /events` and `PUT /events/:id/location` receive only:

```json
{ "location": { "coordinates": { "latitude": 0, "longitude": 0 }, "name": "" } }
```

The backend is expected to derive `city`, `country`, `countryCode` through reverse geocoding. **(verify)** The geocoding step fails or is skipped on create (multipart body: `location` arrives as a JSON **string** and is probably not parsed before geocoding), so only the empty defaults are persisted.

**Required:**
- Accept the full location object on both create and update:
  ```json
  {
    "name": "Palais des Congrès",
    "address": "…",
    "place_id": "ChIJ…",
    "city": "Marrakech",
    "country": "Morocco",
    "countryCode": "MA",
    "coordinates": { "latitude": 31.63, "longitude": -8.01 }
  }
  ```
- On multipart requests, `JSON.parse` the `location` field before validation.
- Persist client-provided `city`/`country`/`countryCode`/`place_id`/`address` as-is; use reverse geocoding only as a **fallback** when they are missing.
- Never overwrite stored values with empty strings / `0,0` coordinates.
- Return the full location in `GET /events/:id`.

### 1.2 Time does not change on update

**Symptom:** after editing, the new time is displayed in the form but the old time remains stored.

**Required for `PUT /events/:id/date` and `PUT /events/:id`:**
- Accept `{ startDate: { date, time }, endDate: { date, time } }` where `date` is a full ISO datetime (`2026-11-26T14:30:00.000Z`) and `time` is local `HH:mm`.
- Update **both** `date` and `time`; today **(verify)** only the date part is updated, or `time` is ignored / recomputed from the stored date.
- Keep backward compatibility with the old `DD-MM-YYYY` format during the transition, or reject it with a 400 explicitly.
- Validate `endDate >= startDate` (date + time).
- Store a single source of truth; recommended: store UTC datetime plus the event timezone (e.g. `Africa/Casablanca`) and derive `time` on read.

### 1.3 Status change from the edit form has no effect

**Symptom:** choosing "Accepté" in the edit form does nothing; only ⋯ → "Changer le statut" (`PUT /events/:id/status`) works.

**Cause:** the edit form sends `status` inside `PUT /events/:id/infos`, which ignores it.

**Required (pick one, document it):**
- **Option A (recommended):** keep status changes exclusive to `PUT /events/:id/status` (permissions, notifications, audit), and make `/infos` return **400** if `status` is present, instead of silently ignoring it. The front end will call `/status` separately.
- **Option B:** handle `status` in `/infos` by delegating to the same service as `/status` (same permission checks and side effects).

Also align status enums across endpoints: the front end currently uses `PENDING | ACCEPTED | REFUSED | CLOSED`, and some filters send `REJECTED`/`CANCELLED`. Publish the authoritative list (see 2.3 for `DRAFT`).

### 1.4 Category appears empty in edit (risk of being erased)

Mainly a front-end bug, but the backend must protect the data:
- `PUT /events/:id/category` with an empty/null `category` must return **400**, not unset the category.
- `PUT /events/:id/infos` must ignore absent fields (PATCH semantics) and never clear `category`.
- `GET /events/:id` must always populate `category` (`{ _id, name, … }`).

### 1.5 Fields empty right after creation

- `POST /events` must return the **full, populated event** (same shape as `GET /events/:id`: category, location, speakers, sponsors, organizer…), so the client can use it directly.

### 1.6 Wrong organizer displayed ("Organisé par Super Admin")

**Cause:** the organizer shown is `createdBy` (the account that created the event, often the admin).

**Required:**
- Add an `organizer` field to the Event model, distinct from `createdBy`:
  ```ts
  organizer: {
    name: string        // required — e.g. "StartupGrow Foundation"
    logo?: string       // URL
    website?: string
    email?: string
    phone?: string
    user?: ObjectId     // optional link to an organizer account
  }
  ```
  If organizers are already accounts (`/organizer` API exists), `organizer` can instead be an `ObjectId` reference populated on read — decide and document.
- Accept it in `POST /events`, `PUT /events/:id` and `PUT /events/:id/infos` (or a dedicated `PUT /events/:id/organizer`).
- When an **organizer** account creates an event, default `organizer` to that account; when an **admin** creates it, `organizer` is required.
- Migration: for existing events, set `organizer` from `createdBy` when `createdBy` has role `organizer`; leave the rest for manual completion.
- Mobile app API must expose `organizer` (not `createdBy`) for "Organisé par".

---

## 2. New features

### 2.1 Export participants (Excel / CSV) per event — configurable

The export is **parameterised**: the user chooses which columns to export, in which order, which participants (filters), the file format and the language. Default selection = `Nom`, `E-mail`, `Téléphone`, `Statut`.

#### 2.1.1 Available fields endpoint

`GET /events/:id/participants/export/fields` returns the whitelist of exportable fields, so the front end builds the selector dynamically and new fields can be added without front-end changes:

```json
{
  "fields": [
    { "key": "fullName",         "label": "Nom complet",        "group": "identity",   "default": true  },
    { "key": "firstName",        "label": "Prénom",             "group": "identity",   "default": false },
    { "key": "lastName",         "label": "Nom",                "group": "identity",   "default": false },
    { "key": "email",            "label": "E-mail",             "group": "contact",    "default": true  },
    { "key": "phoneNumber",      "label": "Téléphone",          "group": "contact",    "default": true  },
    { "key": "status",           "label": "Statut",             "group": "registration","default": true  },
    { "key": "registeredAt",     "label": "Date d'inscription", "group": "registration","default": false },
    { "key": "gender",           "label": "Genre",              "group": "profile",    "default": false },
    { "key": "nationality",      "label": "Nationalité",        "group": "profile",    "default": false },
    { "key": "city",             "label": "Ville",              "group": "profile",    "default": false },
    { "key": "jobTitle",         "label": "Fonction",           "group": "profile",    "default": false },
    { "key": "organization",     "label": "Organisation",       "group": "profile",    "default": false },
    { "key": "badge",            "label": "Badge",              "group": "registration","default": false },
    { "key": "isPresent",        "label": "Présent",            "group": "attendance", "default": false },
    { "key": "firstCheckInAt",   "label": "Première entrée",    "group": "attendance", "default": false },
    { "key": "lastCheckInAt",    "label": "Dernière entrée",    "group": "attendance", "default": false },
    { "key": "scanCount",        "label": "Nombre de scans",    "group": "attendance", "default": false }
  ],
  "formats": ["csv", "xlsx"],
  "statuses": ["PENDING", "ACCEPTED", "REFUSED", "EXPIRED"]
}
```

- Labels are returned in the requested language (`?lang=fr|en|ar`), FR by default.
- Profile fields (`gender`, `nationality`, `city`, `jobTitle`, `organization`) — **(verify)** which ones exist on the user/guest model; return only existing ones.
- Attendance fields depend on 2.2.

#### 2.1.2 Export endpoint

`POST /events/:id/participants/export` (POST because the parameter set can be long):

```json
{
  "format": "xlsx",
  "fields": ["fullName", "email", "phoneNumber", "status", "jobTitle"],
  "filters": {
    "status": ["ACCEPTED", "PENDING"],
    "present": true,
    "registeredFrom": "2026-11-01",
    "registeredTo": "2026-11-30",
    "search": "gmail.com"
  },
  "sort": { "field": "lastName", "direction": "asc" },
  "lang": "fr",
  "options": {
    "includeHeader": true,
    "csvSeparator": ";",
    "dateFormat": "DD/MM/YYYY HH:mm"
  }
}
```

**Rules:**
- Auth: admin, or the organizer owning the event.
- `fields`: required, non-empty, **validated against the whitelist** (unknown key → 400). Columns are written **in the order received**. Never allow arbitrary model paths (prevents leaking password hashes, tokens, etc.).
- `filters`: all optional; combined with AND. No filter = all participants (no pagination).
- `format`: `csv` | `xlsx`.
  - CSV: `Content-Type: text/csv; charset=utf-8`, UTF-8 **BOM** (Excel accents), separator from `options.csvSeparator` (default `;`), values escaped (quotes, separators, newlines). Prefix cells starting with `=`, `+`, `-`, `@` with `'` to prevent CSV/formula injection.
  - XLSX: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (e.g. `exceljs`), bold header row, auto column width, frozen header, real date cells.
- `Content-Disposition: attachment; filename="participants-<event-slug>-<YYYYMMDD>.<ext>"`.
- Values: translated status labels, `Oui/Non` for booleans, dates in `options.dateFormat` and the event timezone.
- Large events: stream the file; if > N rows (e.g. 50 000), switch to an async job (`202 { jobId }` + `GET /exports/:jobId`) — optional.
- Log each export (who, when, event, fields) for GDPR traceability, since personal data is exported.

#### 2.1.3 Saved export presets (optional)

Let users save a field selection to reuse it:
- `GET /export-presets?type=participants`, `POST /export-presets` `{ name, fields, filters, format }`, `DELETE /export-presets/:id`.
- Scoped per user (or per organizer). Alternatively the front end stores the last selection locally — see front-end doc.

### 2.2 Attendance tracking (real presence via QR scans)

**Data model — new collection `CheckIn` (or `attendance` on Guest):**

```ts
CheckIn {
  _id
  event: ObjectId
  guest: ObjectId          // participant / guest record
  scannedBy: ObjectId      // staff/organizer account performing the scan
  scannedAt: Date
  result: 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'NOT_ACCEPTED' | 'WRONG_EVENT'
  device?: string
}
```

Denormalised on the guest record for fast listing: `firstCheckInAt`, `lastCheckInAt`, `scanCount`, `isPresent`.

**Endpoints:**
- `POST /events/:id/check-in` — body `{ qrCode }`. Validates the QR (signed token: event + guest), records a `CheckIn` row on **every** scan (including duplicates), returns `{ result, guest: { fullName, picture, status }, scanCount, firstCheckInAt }`.
- `GET /events/:id/attendance?page&limit&present=true|false&search` — list with `fullName, email, phone, status, isPresent, firstCheckInAt, lastCheckInAt, scanCount`.
- `GET /events/:id/attendance/stats` — `{ registered, accepted, present, absent, totalScans, attendanceRate, checkInsByHour: [{ hour, count }] }`.
- `GET /events/:id/attendance/:guestId/scans` — scan history of one participant.

**Rules:**
- QR must be unique per guest/event and non-guessable (signed JWT/HMAC, not the raw guest id).
- Only `ACCEPTED` guests can be checked in; others are logged with `NOT_ACCEPTED`.
- Event must be ongoing (configurable tolerance before start).
- Optional realtime: emit `attendance:updated` on the existing realtime service (`VITE_REALTIME_URL`) for live dashboards.

### 2.3 "Brouillon" (Draft) status

- Add `DRAFT` to the event status enum: `DRAFT | PENDING | ACCEPTED | REFUSED | CLOSED`.
- `POST /events` accepts `status: 'DRAFT'` (or `?draft=true`); a draft:
  - is **not** visible in the mobile app / public listings,
  - is **not** in the admin validation queue (`PENDING`),
  - may be incomplete: relax required-field validation for drafts; enforce full validation on submit.
- New transition endpoint: `PUT /events/:id/submit` → `DRAFT → PENDING` (full validation; returns 400 with the list of missing fields). Admin may also publish directly `DRAFT → ACCEPTED` via `/status`.
- Allowed transitions must be enforced server-side (e.g. no `CLOSED → DRAFT`).
- Drafts are visible only to their organizer and admins; exclude from public counters/analytics.

---

## 3. New requirements

### 3.1 Speakers: photo, full name, function required

Speaker sub-document:

```ts
Speaker {
  firstName: string     // required
  lastName: string      // required
  fullName: string      // derived (firstName + ' ' + lastName), kept for backward compatibility
  picture: string       // required (uploaded file URL)
  jobTitle: string      // required — "poste"
  organization: string  // required — "organisation"
  fonction?: string     // legacy; derive as `${jobTitle} — ${organization}` for old clients
  nationality?: string
  socialNetworks?: {...}
}
```

- Validate on `POST /events`, `PUT /events/:id` and `PUT /events/:id/speakers` (multipart dot-notation keys: `speakers.0.firstName`, `speakers.0.jobTitle`, `speakers.0.picture` …). Return 400 with field-level errors.
- On update, a speaker with `_id` and no new file keeps its existing `picture`.
- Drafts (2.3) may skip this validation until submission.
- Expose all fields in the event detail API for the back office **and** the mobile app.
- Migration: split existing `fullName` into first/last name (best effort) and existing `fonction` into `jobTitle`; flag speakers without picture for completion.

### 3.2 Partners: mandatory partner type + default types

Partner (sponsor) sub-document: `name` (required), `logo` (required), `category` → **partner type** (required, ObjectId to `SponsorCategory`).

- Validate in `POST /events`, `PUT /events/:id`, `PUT /events/:id/sponsors` (multipart key `sponsors.<i>.category`). **(verify)** that `category` is currently persisted from the sponsors endpoint and populated on read (`{ _id, name }`).
- **Default types:** seed global (not organizer-scoped) sponsor categories, idempotently (migration/seed script):
  - Partenaire officiel
  - Partenaire Hackathon
  - Partenaire institutionnel
  - Partenaire média
  - Sponsor
- Add `isDefault: boolean` (or `organizer: null`) to `SponsorCategory`; `GET /sponsor-categories` (and the "all" endpoint used by the event form) returns **default + organizer-specific** categories.
- Default categories cannot be deleted/renamed by organizers (403); admins can manage them.
- Provide translations for default names (store a `key`, e.g. `official_partner`, or `{ fr, en, ar }` names).
- Deleting a category in use must be refused (409) or require reassignment.
- Mobile app API: return partners grouped/sortable by type.

---

## 4. Summary checklist

| # | Item | Endpoint(s) | Type |
|---|------|-------------|------|
| 1.1 | Persist full location | `POST /events`, `PUT /events/:id/location` | Bug |
| 1.2 | Persist time on update | `PUT /events/:id/date`, `PUT /events/:id` | Bug |
| 1.3 | Status from edit form | `PUT /events/:id/status`, `PUT /events/:id/infos` | Bug |
| 1.4 | Protect category | `PUT /events/:id/category`, `/infos` | Bug |
| 1.5 | Full event in create response | `POST /events` | Bug |
| 1.6 | `organizer` field | Event model, create/update, mobile API | Bug + model |
| 2.1 | Configurable participants export (fields, filters, format) | `GET /events/:id/participants/export/fields`, `POST /events/:id/participants/export`, optional `/export-presets` | Feature |
| 2.2 | Attendance / check-in | `POST /events/:id/check-in`, `GET …/attendance*` | Feature |
| 2.3 | Draft status | Status enum, `PUT /events/:id/submit` | Feature |
| 3.1 | Speaker required fields | Speaker schema + migration | Requirement |
| 3.2 | Partner type required + defaults | Sponsor schema, SponsorCategory seed | Requirement |
