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

`public/manifest.json` — Chrome extension manifest. Content script loads `content.js` + `content.css` on all URLs.

Path alias: `@src/*` → `src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`).

## Code style

- Prettier: 4 spaces, single quotes, trailing commas, 100 char width
- ESLint enforces `curly: all` (always use braces), `jsx-quotes: prefer-double`
- Import sorting via `eslint-plugin-simple-import-sort` with custom group order: node/react builtins → npm packages → `@src/` internals → side-effects → relative
- Language: Russian in comments is acceptable
