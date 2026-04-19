# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Pokazaniya — Chrome Extension (Manifest V3), built with React 18, TypeScript, Vite.

## Commands

- `npm start` — dev server
- `npm run build` — type-check + production build to `dist/`
- `npm run lint` — ESLint
- `npm run lint:fix` — ESLint with auto-fix
- `npm run lint:prettier` — Prettier check
- `npm run lint:prettier:fix` — Prettier auto-format
- `npm test` — Vitest (watch mode)

Pre-commit hooks (husky + lint-staged) run Prettier and ESLint on staged files.

## Architecture

Two entry points built by Vite (`vite.config.ts` rollupOptions.input):
- **popup** (`popup.html` → `src/popup/index.tsx`) — extension popup UI (React)
- **content** (`src/content/index.ts`) — content script injected into pages; `src/content/content.css` is copied to `dist/` via a custom Vite plugin

`public/manifest.json` — Chrome extension manifest. Content script matches `http(s)://62.33.168.51:6001/*` only.

Path alias: `@src/*` → `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`).

## API

Base URL: `https://62.33.168.51:6001`

Auth: Bearer token from `localStorage.security_permissions.accessToken`.

Endpoints used by content script:
- `GET /api/v1/meterpoints/getmeterpoints/` — returns array of meter points. Each has `id: number` (points with `id === 0` are skipped).
- `POST /api/v1/meterpointreadings/read/` — body: `{ meterPointId: number, valuesDt: string }`. `valuesDt` is last midnight in local time as ISO string without `Z` suffix (e.g. `2026-03-22T00:00:00.000`). Requests are made sequentially with 1–3s random delay between each.

## Code style

- Prettier: 4 spaces, single quotes, trailing commas, 100 char width
- ESLint enforces `curly: all` (always use braces), `jsx-quotes: prefer-double`
- Import sorting via `eslint-plugin-simple-import-sort` with custom group order: node/react builtins → npm packages → `@src/` internals → side-effects → relative
- Language: Russian in comments is acceptable
