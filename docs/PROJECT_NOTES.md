# 7ZUZ — agent handoff

## Product
Hebrew RTL web app for short desk-worker micro-workouts at work.
First open → onboarding (health + optional PROMIS). Then Home, workouts, reminders, questionnaires.
Company brand is one accent (`--brand`); light/dark supported.

## Stack
Vite 8 · React 19 · TypeScript · Tailwind v4 (`@theme inline`) · shadcn/base-ui · react-router-dom v7 · lucide · recharts · oxlint. No backend yet (localStorage mocks). Run: `npm run dev`. Rules: `.cursor/rules/project.mdc`.

## Folders
`src/pages` screens · `src/components/{layout,shared,ui,player,preworkout,promis,reminders,workouts,music,onboarding,feedback,demo,org}` · `src/mocks` data/APIs · `src/lib` domain stores/helpers · `src/content` questionnaire copy (draft) · `src/theme` · `src/hooks` · `public/` (SW, videos, audio) · `docs/`.

## Design system
Tokens only — `src/index.css`. Never hardcode colors/fonts. Override **one** variable `--brand`; AA helpers (`brand-solid`, `brand-ink`, `brand-graphic`, `brand-soft`) derive from it. Live docs: `/design`. Demo “Preview as company” = `src/components/demo` (sets `data-brand`); remove that folder + TopBar usage to strip. Logical properties (`ms`/`me`, `ps`/`pe`, `text-start`). Skeletons / empty / error; often `?state=loading|empty|error`. Touch ≥44px, WCAG AA.

## Mock layers (swap for real APIs later)
User data is namespaced `7zuz.<userId>.<suffix>` via `src/lib/userStorage.ts` (no migration of old keys). Theme / brand-preview stay global. Theme preference is `light`, `dark`, or `system` (localStorage `theme`).
| Layer | Where |
| --- | --- |
| Auth | `src/lib/auth.ts` + `src/mocks/auth.ts` → `7zuz.session` (global); lockout → `7zuz.authLockedUntil` |
| Acceptance (health) | `src/lib/acceptanceStore.ts` → `…healthAcceptance`; rules in `preWorkout.ts` |
| PROMIS | `src/mocks/promis.ts` + `src/lib/promis.ts` → `…promis` (30-day interval) |
| Reminders | `src/lib/reminders.ts` → `…reminders` (+ `…reminderSound`, SW in `public/sw.js`) |
| Sessions | `src/mocks/sessions.ts` → `…sessions` (`listSessions`; recorded when a training user leaves the player with progress). Profile summary reads this. Feedback stays `…feedback` |
| Workouts | `src/mocks/workouts.ts` (+ `useMockWorkouts` / `useMockWorkout`, `todaysWorkout`, `home`) |
| Exercises | `src/mocks/exercises.ts` — library; workouts reference `exerciseId`s via `WorkoutItem` |
| Org HR stats | `src/mocks/orgStats.ts` (`getOrgStats`, `ORG_PRIVACY_MIN_USERS`) — aggregated only; no names/emails/codes |

## Routes
**Built:** `/login` · `/register` · `/forgot-password` · `/onboarding` · `/` Home · `/workouts` · `/workouts/:id` · `/workouts/:id/play` · `/workouts/:id/feedback` · `/reminders` · `/questionnaires` · `/profile` (employee + team) · `/org` (HR dashboard; `org_manager` + `trainer`) · `/design`  
**Placeholder:** `/admin` (trainer-only guard; pages later)

## Key product decisions
- Auth is mock (`AuthGuard` + `src/lib/auth.ts`). Guests → `/login` (return URL preserved). Training roles (`isTrainingRole`: `employee` / `team`): onboarding when needed; nav = Home, Workouts, Reminders, Profile, Questionnaires. `trainer`: nav = Dashboard (`/org`) + Workouts; landing `/org`; workouts open in **preview** (`isTrainerPreview` — badge, no health gate, no feedback/session save, exit → detail). `org_manager`: nav = Dashboard only; no workouts. `/reminders` `/profile` `/questionnaires` `/onboarding` = training only. Workouts = employee/team/trainer. Code login chip **משתתף/ת**. `/admin` trainer-only (later). Sign out / chip / theme / בס״ד stay in the shell for all roles.
- Health questionnaire: training roles only; onboarding when no acceptance; again only if wording **version** rises or acceptance older than **90 days** (`QUESTIONNAIRE_VERSION`, `ACCEPTANCE_MAX_AGE_DAYS`). One component: `HealthQuestionnaire`. Onboarding pages have a quiet יציאה מהמערכת (`signOut`). The pre-workout dialog can be closed without answering.
- Workouts compose an **exercise library** (not inline clips per workout).
- Reminder defaults: **Israeli work week** Sun–Thu (`WORKDAYS`).
- Layout: **desktop-first** shell (sidebar) with mobile bottom nav; Hebrew **RTL**.
- PROMIS: gentle Home banner when due — never a blocking popup. Skip allowed at onboarding.
- Org HR dashboard (`/org`): anonymous aggregated KPIs/charts/reports. Numeric breakdown only when registered users ≥ `ORG_PRIVACY_MIN_USERS` (5); otherwise “אין מספיק נתונים להצגה”. Demo: default org has enough users; `?org=small` has fewer. Charts use design tokens / `--brand` (recolor via Preview as company). Report “הורדה” saves a client-side CSV of that report’s anonymous aggregates (UTF-8 BOM) via `src/lib/downloadFile.ts`.
- Profile (`/profile`, training only): code login shows only משתתף/ת — no email and no name field. Email login: read-only email and an editable display name (toast on save). Summary (workouts, minutes, streak, last date) from `listSessions`; calm empty state when none. Settings: theme, reminder sound, links to `/reminders` and `/questionnaires`. “הורדת הנתונים שלי” (JSON) and “מחיקת הנתונים שלי” (clears per-user mock data, then sign-out) are client-side mocks. A code-user export is only `role`, `loginType`, and data records — no email, name, or other identifiers. `?state=loading|error`.
- Player: boxing-ring bell (`bellSounds` — synth or `BELL_SRC` mp3) at start, work→rest, rest→work, and finish (longer ring); shared `playerAudioContext` resumed on התחלת אימון / questionnaire confirm; per-user פעמון (`playerBell`, on by default); muted while paused / exit / buffering; skip skips that step’s bell. Music ducks 1s before work-end/finish (`DUCK_LEAD_MS`), stays at `REST_MUSIC_LEVEL` through rest, restores after rest-end/start strikes (`config/playerAudio`). Rest steps use `restSeconds` (default 10); calm `RestScreen` (`restLines`). Demo today’s workout (`energizing-march`): jumping ×3 + wall-pushups ×3, 10s work/rest.
