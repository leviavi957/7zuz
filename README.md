# 7zuz
7ZUZ – workplace micro-workout web app (Hebrew, RTL). React + TypeScript + Vite + Supabase.

Stack: Vite, React, TypeScript, Tailwind CSS, shadcn/ui, react-router-dom, lucide-react, recharts, framer-motion. The UI is Hebrew and RTL by default (`<html lang="he" dir="rtl">`).

## Run the app

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Other scripts: `npm run build` (type-check and production build), `npm run lint`.

## Design system

All design tokens (colors, type, radius, shadows, motion) live in src/index.css. The accent is a single variable, `--brand`; AA-safe derived tokens follow it automatically. Open `/design` for live documentation in light and dark. The top-bar palette button (`src/components/demo`) is a demo-only brand switcher; delete that folder and the `<BrandPreview />` line in `TopBar.tsx` to remove it. Append `?state=loading|empty|error` to the Home URL to preview its states.

Project rules live in `.cursor/rules/project.mdc`. Secrets go only in `.env` files, which are git-ignored.
