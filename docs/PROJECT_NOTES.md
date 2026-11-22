# 7ZUZ — agent handoff

## Product
Hebrew RTL web app for short desk-worker micro-workouts at work.
First open → onboarding (health + optional PROMIS). Then Home, workouts, reminders, questionnaires.
Company brand is one accent (`--brand`); light/dark supported.

## Stack
Vite 8 · React 19 · TypeScript · Tailwind v4 (`@theme inline`) · shadcn/base-ui · react-router-dom v7 · lucide · oxlint. No backend yet (localStorage mocks). Run: `npm run dev`. Rules: `.cursor/rules/project.mdc`.

## Folders
`src/pages` screens · `src/components/{layout,shared,ui,player,preworkout,promis,reminders,workouts,music,onboarding,feedback,demo}` · `src/mocks` data/APIs · `src/lib` domain stores/helpers · `src/content` questionnaire copy (draft) · `src/theme` · `src/hooks` · `public/` (SW, videos, audio) · `docs/`.

## Design system
Tokens only — `src/index.css`. Never hardcode colors/fonts. Override **one** variable `--brand`; AA helpers (`brand-solid`, `brand-ink`, `brand-graphic`, `brand-soft`) derive from it. Live docs: `/design`. Demo “Preview as company” = `src/components/demo` (sets `data-brand`); remove that folder + TopBar usage to strip. Logical properties (`ms`/`me`, `ps`/`pe`, `text-start`). Skeletons / empty / error; often `?state=loading|empty|error`. Touch ≥44px, WCAG AA.

## Mock layers (swap for real APIs later)
| Layer | Where |
| --- | --- |
| Auth | **Not built** (no login store yet; onboarding ≠ auth) |
| Acceptance (health) | `src/lib/acceptanceStore.ts` → `7zuz.healthAcceptance`; rules in `preWorkout.ts` |
| PROMIS | `src/mocks/promis.ts` + `src/lib/promis.ts` → `7zuz.promis` (30-day interval) |
| Reminders | `src/lib/reminders.ts` → `7zuz.reminders` (+ sound key, SW in `public/sw.js`) |
| Sessions | **Not built** (no workout-session history store yet; feedback → `7zuz.feedback`) |
| Workouts | `src/mocks/workouts.ts` (+ `useMockWorkouts` / `useMockWorkout`, `todaysWorkout`, `home`) |
| Exercises | `src/mocks/exercises.ts` — library; workouts reference `exerciseId`s via `WorkoutItem` |

## Routes
**Built:** `/onboarding` · `/` Home · `/workouts` · `/workouts/:id` · `/workouts/:id/play` · `/workouts/:id/feedback` · `/reminders` · `/questionnaires` · `/design`  
**Placeholder:** `/profile` (nav still shows it)

## Key product decisions
- Health questionnaire: onboarding when no acceptance; again only if wording **version** rises or acceptance older than **90 days** (`QUESTIONNAIRE_VERSION`, `ACCEPTANCE_MAX_AGE_DAYS`). One component: `HealthQuestionnaire`.
- Workouts compose an **exercise library** (not inline clips per workout).
- Reminder defaults: **Israeli work week** Sun–Thu (`WORKDAYS`).
- Layout: **desktop-first** shell (sidebar) with mobile bottom nav; Hebrew **RTL**.
- PROMIS: gentle Home banner when due — never a blocking popup. Skip allowed at onboarding.
