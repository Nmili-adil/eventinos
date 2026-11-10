# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`eventify_front_end`: the admin/organizer dashboard for Eventinos. It is a React 19 + TypeScript SPA built with Vite (aliased to `rolldown-vite`, using the SWC React plugin), Tailwind CSS v4, shadcn/ui (Radix), React Router v7, react-hook-form + Zod, and i18next. `AGENTS.md` holds the contributor conventions; this file covers what you need to work across files.

## Commands

- `npm run dev`: Vite dev server (`host: true`, port 5173).
- `npm run build`: `tsc -b && vite build`. This is the main correctness check, because the project has **no test framework**.
- `npm run lint`: ESLint (flat config, `eslint.config.js`).
- `npm run preview`: serves `dist/`.
- Docker: `npm ci`/`npm install` run with `--legacy-peer-deps` (see `Dockerfile`), so use the same flag if peer-dep resolution fails locally.

Env vars (`.env.local`, from `.env.example`): `VITE_BACKEND_URL` (defaults to `http://localhost:3000`), `VITE_APP_ENV`, `GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_MAP_ID`. The `development` vs production behaviour switches on `VITE_APP_ENV` and falls back to Vite's `MODE`. That check is repeated inline in `apiClient.ts`, `app/index.tsx` and `useGlobalErrorHandler.ts`.

## Architecture

**Boot flow:** `main.tsx` imports `i18n/config` and renders `app/index.tsx`. That file wraps everything in the Redux `Provider`, the sonner `Toaster`, an `ErrorBoundary`, `LoadingProvider` and `RouterProvider`. On mount it dispatches `authInitialize()`, which rehydrates auth from localStorage.

**State management:** this is classic Redux, **not** Redux Toolkit, even though `AGENTS.md` says otherwise. `store/app/store.ts` uses `legacy_createStore` with `redux-thunk`, and `rootReducer.ts` combines the feature reducers. Each `store/features/<feature>/` has:
- `*.type(s).ts`: string action-type constants (`FETCH_EVENTS_REQUEST/SUCCESS/FAILURE`), action interfaces, and the state shape.
- `*.actions.ts`: thunks that call an `src/api/*Api.ts` function, then dispatch REQUEST → SUCCESS/FAILURE. Many of them also call `toast` from sonner.
- `*.reducer.ts`: a switch reducer.

Adding a feature means creating all three files and registering the reducer in `rootReducer.ts`. `zustand` and `next` appear in `package.json` but nothing in the code uses them.

**API layer:** all requests go through the shared Axios instance `api` in `src/lib/apiClient.ts`. It has `withCredentials` set, and a request interceptor adds the Bearer token from `getAuthToken()`. Many API functions also set `Authorization` by hand. Responses are inconsistent: some API functions return the full Axios response and others return `response.data`. Check before you use one in a thunk (e.g. `fetchEvents` vs `fetchEventByIdApi`).

**Event create/update uses multipart:** `eventsApi.ts` (`buildEventFormData`) and `eventUpdateApi.ts` serialize nested data (speakers, sponsors, social networks) with **dot-notation FormData keys** such as `speakers.0.fullName`, because the backend's `convertDotNotationToNested` parser expects that format. File fields are appended as `File` objects, and existing ones are sent as URL strings. The edit page saves one tab at a time through `components/partials/eventsComponents/hooks/useEventTabSave.ts` → `eventUpdateApi.ts`, which calls per-section endpoints like `PUT /events/:id/infos`.

**Auth and routing:** `services/localStorage.ts` owns the token, a client-side 24h expiry, the user, the role, and layout preferences. Use its helpers rather than raw localStorage keys. `router/router.tsx` defines public routes (landing, login, forgot-password, privacy, account-deletion) and a `/dashboard/*` tree wrapped in `ProtectedRoute` + `_layout.tsx`. `ProtectedRoute` only lets in the `admin` and `organizer` roles. `RoleProtectedRoute allowedRoles={[...]}` narrows access per page. Paths live in `constants/routerConstants.ts`, and some are builder functions (e.g. `EVENT_EDIT_PAGE(id)`).

**Global errors** travel as window `CustomEvent`s and are handled in `app/index.tsx`:
- `server-error`: the Axios interceptor fires it on HTTP 5xx, and it replaces the whole app with `ServerErrorPage` (dev) or `ProductionErrorPage`.
- `global-error-dialog`: dispatched by `useGlobalErrorHandler` and some components. It shows `ErrorDialog`, but only in production.
- Routes use `RouteErrorElement` from `components/shared/ErrorBoundary.tsx`.

**Global loading:** call `useLoading().setLoading(true, message)` from `contexts/LoadingContext.tsx`. `contexts/GLOBAL_LOADING_USAGE.md` documents it, and `hooks/useLoadingAction.ts` wraps it.

**i18n:** the locales are `en`, `fr`, `ar`, `eg` in `src/i18n/locales/*.json`. The default and fallback language is `fr`, and the selection is stored in the `selectedLanguage` localStorage key. When you add a key, add it to all four files.

**Forms:** react-hook-form with `zodResolver`, using schemas from `src/schema/`. The shadcn form primitives live in `components/ui/form.tsx`.

## CI / deploy

- Every push to `main` triggers `.github/workflows/version-bump.yml`, which bumps `package.json` and regenerates `src/config/version.ts` (never edit that file by hand). The bump size follows the commit prefix: `breaking:`/`major:` → major, `feat:`/`feature:`/`minor:` → minor, anything else → patch.
- `deploy.yml` SSHes into the VPS and runs `deploy_frontend.sh`, so every push to `main` deploys to production.
