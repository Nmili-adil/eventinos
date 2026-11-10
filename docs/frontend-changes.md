# Eventinas — Front-end Changes (back office)

Scope: same list as [`backend-changes.md`](./backend-changes.md), translated into concrete changes in this repository. File references point to the current code; root causes marked **(confirmed)** were verified by reading the code.

> Note: `src/api/eventsApi.ts` and `src/api/eventUpdateApi.ts` already contain **uncommitted** work on location and date formatting. Finish/merge it with the items below instead of starting over.

---

## 1. Bug fixes

### 1.1 Location not saved at creation

**Root cause (confirmed):** `buildEventFormData` (`src/api/eventsApi.ts`) and `updateEventLocation` (`src/api/eventUpdateApi.ts`) send only `{ coordinates, name }` and drop `city`, `country`, `countryCode`, `place_id`, `address`, relying on backend geocoding.

**Changes:**
- `src/api/eventsApi.ts` → `buildEventFormData`, `location` branch: send the full object
  `{ name, address, place_id, city, country, countryCode, coordinates: { latitude, longitude } }`.
- `src/api/eventUpdateApi.ts` → `updateEventLocation`: same payload.
- `src/components/partials/eventsComponents/EventAddForm.tsx`: the "Informations de localisation" step validates `location.city/country/...` — also require non-zero coordinates (or a selected place) before going to the next step.
- After creation, check that `GET /events/:id` returns city/country (manual test).

### 1.2 Time does not change on update

**Root cause:** date/time tab sends `{ date, time }`; backend keeps the old time. The uncommitted `updateEventDates` change now sends ISO `date` + `HH:mm` `time`.

**Changes:**
- `src/api/eventUpdateApi.ts` → `updateEventDates`: keep the new ISO format (agree with backend 1.2). Remove the leftover `DD-MM-YYYY` comments/paths.
- `EventAddForm.tsx` → `handleSubmit`: uses `extractTime(new Date(...).toTimeString())` — align with the same helper (move `formatTime`/`formatDate` to `src/lib/events-utils.ts` and reuse in add + edit).
- `EventEditForm.tsx`: after a successful `saveDateTime`, refetch the event (`fetchEventByIdRequest`) and `form.reset(...)` so the displayed value is what is actually stored.
- Check the display side (`event-details.tsx`, `table-row.tsx`, calendar view) reads `startDate.time` / ISO consistently (timezone).

### 1.3 Status change from the edit form has no effect

**Root cause (confirmed):** `useEventTabSave.saveBasicInfo` (`src/components/partials/eventsComponents/hooks/useEventTabSave.ts`) sends `status` to `PUT /events/:id/infos`, which ignores it. Only `updateEventStatusApi` (`PUT /events/:id/status`) works.

**Changes:**
- In `saveBasicInfo`: remove `status` from `basicData`; if `data.status !== initialStatus`, call `updateEventStatus(eventId, data.status)` (already exported from `eventUpdateApi.ts`), then dispatch `UPDATE_EVENT_STATUS_SUCCESS` (or refetch) so the list updates.
- Only show the status select to admins (organizers should not self-accept) — use `getRole()` / `state.auth.role`.
- Align status values: `filters.tsx` uses `REJECTED` and `CANCELLED`, while `src/types/eventsTypes.ts`, `eventSchema.ts` and the forms use `REFUSED`. Use one enum constant (e.g. `EVENT_STATUSES` in `src/constants/`) everywhere, including `DRAFT` (see 2.3).

### 1.4 Fields empty when opening "Modifier" right after creation

**Root cause (confirmed):**
- `FETCH_EVENT_BY_ID_REQUEST` (`src/store/features/events/events.reducer.ts`) keeps the previous `event` in the store, so `eventEdit-page.tsx` (`isFetching = isLoading && !event`) renders the form with a **stale** event.
- `EventEditForm.tsx` builds `useForm({ defaultValues })` once from `event` and never calls `form.reset()` when the fetched event arrives.
- Several `<Select>`s use `defaultValue={field.value}` (uncontrolled) instead of `value`, so they don't update when values change later.

**Changes:**
- Reducer: on `FETCH_EVENT_BY_ID_REQUEST` set `event: null` (or store `eventId` and compare).
- `eventEdit-page.tsx`: render the form only when `event?._id === eventId`; show the loader otherwise.
- `EventEditForm.tsx`: extract the default-values mapping into a function `mapEventToForm(event)` and add
  `useEffect(() => form.reset(mapEventToForm(event)), [event?._id])` (or give the form `key={event._id}`).
- Replace `defaultValue={field.value}` by `value={field.value}` on all controlled selects (visibility, category, type, status, badges).
- `createEventRequest` success: if backend returns the full event (backend 1.5), store it, so navigating to edit uses fresh data.

### 1.5 Category appears empty during edit (risk of erasing it)

**Root cause (confirmed):** in `EventEditForm.tsx` the category `<FormField>` is bound to `name="categories"`, while `defaultValues` and `saveBasicInfo` use `category`. The select is therefore always empty, and a new selection is written to `categories` and never saved.

**Changes:**
- `EventEditForm.tsx`: `name="categories"` → `name="category"`, `value={field.value}`; remove `event.categories` fallback in defaults; normalise `event.category?._id ?? event.category`.
- Do the same check in `EventEditForm_refactored.tsx` — or delete this unused file (only `EventEditForm.tsx` is imported).
- `useEventTabSave.saveBasicInfo`: call `updateEventCategory` only when the value changed and is non-empty.
- Make the category required in the schema (`eventSchema.ts`) so it cannot be saved empty.
- Ensure categories are loaded before rendering the select (`fetchCategoriesRequest` already dispatched) — show a skeleton while `categories` is empty.

### 1.6 Wrong organizer ("Organisé par Super Admin")

**Root cause (confirmed):** `event-details.tsx` → `getOrganizerName()` / `getOrganizerAvatar()` use `event.createdBy`.

**Changes:**
- Types: add `organizer` to `Event` in `src/types/eventsTypes.ts` (shape from backend 1.6).
- Schema: add `organizer: { name (required), logo?, website?, email?, phone? }` to `eventFormSchema`.
- `EventAddForm.tsx` (step "Informations générales") and `EventEditForm.tsx` (tab `basic`): add an **"Organisateur"** field:
  - organizer account → prefilled with the account's organization, editable;
  - admin → required; optionally a select of existing organizers (`src/api/organizerApi.ts`) + free text.
  - logo upload via `EventLogoInput.tsx`/`FileUpload.tsx`.
- `buildEventFormData` + `updateEventInfos`: send `organizer.*` (dot notation for the logo file).
- `event-details.tsx`, `EventPreview.tsx`, `table-row.tsx`: display `event.organizer.name` / `logo`, fallback to `createdBy` only for legacy events.
- i18n: `eventForm.fields.organizer`, `eventForm.placeholders.organizer`, `events.details.organizedBy` in `en/fr/ar/eg.json`.

---

## 2. New features

### 2.1 Export participants (Excel / CSV) — configurable

The user decides **what** is exported: columns, column order, participant filters, format. Default selection: Nom, E-mail, Téléphone, Statut.

**API — `src/api/guestsApi.ts` (or new `src/api/exportApi.ts`):**
- `fetchParticipantExportFieldsApi(eventId, lang)` → `GET /events/:id/participants/export/fields` (list of fields with `key`, `label`, `group`, `default`).
- `exportEventParticipantsApi(eventId, params: ParticipantExportParams)` → `POST /events/:id/participants/export` with `responseType: 'blob'`.
- Optional presets: `fetchExportPresetsApi`, `createExportPresetApi`, `deleteExportPresetApi`.

**Types — `src/types/exportTypes.ts`:**
```ts
export type ExportFormat = 'csv' | 'xlsx'

export interface ExportField {
  key: string
  label: string
  group: 'identity' | 'contact' | 'registration' | 'profile' | 'attendance'
  default: boolean
}

export interface ParticipantExportParams {
  format: ExportFormat
  fields: string[]                 // ordered
  filters?: {
    status?: string[]
    present?: boolean
    registeredFrom?: string
    registeredTo?: string
    search?: string
  }
  sort?: { field: string; direction: 'asc' | 'desc' }
  lang?: 'fr' | 'en' | 'ar'
  options?: { includeHeader?: boolean; csvSeparator?: ';' | ','; dateFormat?: string }
}
```

**Schema — `src/schema/exportSchema.ts`:** Zod schema for the dialog form (`fields.min(1)`, `format` enum, date range `to >= from`).

**UI — new `src/components/partials/eventsComponents/dialogs/ParticipantsExportDialog.tsx`:**
- Opened from an **"Exporter"** button in `EventParticipantsSection.tsx` and the event details page.
- Sections:
  1. **Colonnes à exporter** — checkboxes (`checkbox.tsx`) grouped by `group` (Identité, Contact, Inscription, Profil, Présence), with "Tout sélectionner / Désélectionner" per group and "Réinitialiser (par défaut)". Fields come from the `/fields` endpoint (not hardcoded).
  2. **Ordre des colonnes** — list of the selected fields, reorderable (up/down buttons, or drag & drop).
  3. **Filtres** — statut (multi-select), présent / absent / tous, période d'inscription (`date-time-picker.tsx`), recherche.
  4. **Format** — radio (`radio-group`) Excel (.xlsx) / CSV; for CSV, separator `;` or `,`.
  5. **Preview** — first 5 rows rendered in a `table.tsx` with the chosen columns, using participants already loaded on the page (no extra call).
- Footer: participant count matching the filters, **"Exporter"** button with loading state, toast on success/error.
- Persist the last selection per user in localStorage via `src/services/localStorage.ts` (`setExportPreferences` / `getExportPreferences`, key `participants-export-preferences`); optional backend presets: "Enregistrer ce modèle" + preset select.
- Visible to admin and the event's organizer only.

**Download helper — `src/lib/helperFunctions.ts`:** `downloadBlob(blob, fallbackName)` — read the file name from `Content-Disposition`, create an object URL, click a temporary link, revoke the URL. Handle a JSON error body returned as blob (parse it to show the backend message).

**Redux (optional):** keep it local state in the dialog; no need for a store feature unless presets are shared across pages.

**i18n (`en/fr/ar/eg.json`):** `events.participants.export.title`, `.columns`, `.order`, `.filters`, `.format`, `.preview`, `.selectAll`, `.deselectAll`, `.resetDefault`, `.savePreset`, `.exportButton`, `.noColumnSelected`, `.success`, `.failed`, group names (`identity`, `contact`, `registration`, `profile`, `attendance`).

### 2.2 Attendance tracking (presence)

- API: new `src/api/attendanceApi.ts`:
  - `fetchEventAttendanceApi(eventId, { page, limit, present, search })`
  - `fetchEventAttendanceStatsApi(eventId)`
  - `fetchGuestScansApi(eventId, guestId)`
  - (optional, for a web scanner) `checkInApi(eventId, qrCode)`
- Redux: new feature `src/store/features/attendance/` (`attendance.types.ts`, `attendance.actions.ts`, `attendance.reducer.ts`), registered in `rootReducer.ts`.
- UI:
  - New tab/section **"Présence"** in the event details page: stat cards (inscrits, acceptés, présents, absents, taux de présence, total scans) + chart "entrées par heure" (`src/components/charts/`, recharts).
  - Table: nom, e-mail, téléphone, statut, présent (badge), première entrée (heure), dernière entrée, nombre de scans; filter présents/absents; search; pagination.
  - Click on a row → dialog with scan history (time, result, scanned by).
  - Highlight multiple scans (`scanCount > 1`) as a possible duplicate QR use.
  - Optional: live refresh through the realtime service (`VITE_REALTIME_URL`) or polling every 30 s during the event.
- Include presence columns in the export (2.1).

### 2.3 "Brouillon" (Draft) status

- Add `DRAFT` to `EventStatus` (`src/types/eventsTypes.ts`), `eventSchema.ts` status enum, the shared status constant (see 1.3), `filters.tsx`, `StatusChangeDialog.tsx`, status badges in `table-row.tsx` / `event-details.tsx` (already has a `DRAFT` case), calendar/map views.
- `EventAddForm.tsx`: add **"Enregistrer comme brouillon"** next to "Créer" — available on every step, skips full validation (only `name` required), sends `status: 'DRAFT'`.
- Drafts in the list: badge "Brouillon", action **"Soumettre pour validation"** → `PUT /events/:id/submit` (new `submitEventApi` in `eventsApi.ts` + action/reducer case); show missing-field errors returned by the backend.
- Edit form: for a draft, show "Soumettre" instead of status select (organizer); admin keeps the status select.
- Default filter: drafts visible only to their owner/admin; add "Brouillon" to the status filter.
- i18n: `events.statusDraft`, `eventForm.actions.saveDraft`, `eventForm.actions.submitForReview`, `eventForm.success.draftSaved`.

---

## 3. New requirements

### 3.1 Speakers: photo, full name, function required

- Schema `src/schema/eventSchema.ts` → `speakerSchema`:
  - `firstName: z.string().min(1)`, `lastName: z.string().min(1)` (keep `fullName` computed for backend compatibility),
  - `picture`: **required**, accept `File` **or** URL (currently `z.string().url().optional()` — rejects a `File` and allows empty),
  - `jobTitle: z.string().min(1)` (poste), `organization: z.string().min(1)` (organisation).
- `dialogs/PersonDialog.tsx` (type `speaker`): split "Nom complet" into Prénom / Nom, add Poste + Organisation, mark photo required; block save with field errors (today only `fullName` / sponsor `name` are checked).
- APIs: send `speakers.<i>.firstName`, `lastName`, `jobTitle`, `organization` in `buildEventFormData` and `updateEventSpeakers`.
- Display: speaker cards in `event-details.tsx` and `EventPreview.tsx` show photo, "Prénom Nom", "Poste — Organisation". Legacy speakers without these fields: fallback to `fullName`/`fonction` and show a "à compléter" warning.
- Exhibitors keep the current optional rules (not in scope) — split `exhibitorSchema` from `speakerSchema` accordingly.
- i18n: `eventForm.addSpeakerDialog.firstName`, `lastName`, `jobTitle`, `organization`, `validation.pictureRequired`, etc.

### 3.2 Partners: mandatory partner type + default types

- **Bug to fix first (confirmed):** `appendSponsors` in `buildEventFormData` (`src/api/eventsApi.ts`) does **not** send `sponsors.<i>.category`, so the partner type is lost at creation (`updateEventSponsors` does send it). Add it.
- Schema: `sponsorSchema.category: z.string().min(1, …)` and `logo` required (File or URL).
- `PersonDialog.tsx` (type `sponsor`): rename label to **"Type de partenaire"**, make it required; validate name + logo + type.
- Default types come from the backend (seeded, see backend 3.2). In `sponsorCategoriesPage.tsx` / `SponsorCategoriesTable.tsx`: show default types with a "Par défaut" badge and disable edit/delete for organizers.
- `src/types/sponsorCategoriesTypes.ts`: add `isDefault?: boolean` (and `key?` for translation).
- Display partners grouped by type in `event-details.tsx` / `EventPreview.tsx`.
- Rename UI wording "Sponsors" → "Partenaires" where it designates partners in general (keep "Sponsor" as one of the types) — update all four locale files.

---

## 4. Cleanup recommended along the way

- Delete `EventEditForm_refactored.tsx` (not imported) to avoid fixing bugs twice.
- Centralise create/update payload building (`buildEventFormData`, `updateEvent*`) — sponsors/speakers serialisation is duplicated in two files and already diverged (1.1, 3.2).
- Replace hardcoded French/English strings in `eventAdd-page.tsx` / `eventEdit-page.tsx` toasts with i18n keys.

## 5. Manual test plan

1. Create an event with a place picked on the map → open details: city/country/coordinates shown; reload → still there.
2. Edit start time only → save → reload → new time persisted.
3. Edit form: set status "Accepté" → save → list shows "Accepté".
4. Create an event → immediately click "Modifier" (no reload) → all fields and category filled.
5. Edit any tab without touching category → category still set.
6. Event created by admin for "StartupGrow Foundation" → details show "Organisé par StartupGrow Foundation".
7. Export dialog: default columns = nom/e-mail/téléphone/statut; uncheck téléphone, add fonction, reorder, filter "Accepté" → exported CSV and XLSX contain exactly those columns in that order and only accepted participants; accents OK in Excel; reopening the dialog restores the last selection; exporting with no column selected is blocked.
8. Scan a QR twice → attendance shows présent, first entry time, 2 scans.
9. Save as draft → not in pending queue / not in app; submit → becomes "En attente".
10. Try to save a speaker without photo/function, or a partner without type → blocked with messages.
11. New organizer account → partner type list shows the 5 default types.
12. `npm run build` and `npm run lint` pass.
