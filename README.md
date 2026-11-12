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

Project rules live in `.cursor/rules/project.mdc`. Secrets go only in `.env` files, which are git-ignored.
