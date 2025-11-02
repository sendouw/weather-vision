# Repository Guidelines

## Project Structure & Module Organization
Next.js Pages Router project: screens in `src/pages`, shared UI in `src/components`, API routes in `src/pages/api`, Tailwind tokens in `src/styles/globals.css`, assets in `public`.

## Build, Test, and Development Commands
- `npm run dev` – hot reload on http://localhost:3000
- `npm run build` – production bundle plus lint/type checks
- `npm run start` – serve the compiled app
- `npm run lint` – run ESLint; fix every issue

## Coding Style, UI/UX & Naming
Use TypeScript functional components, hooks, and 2-space indentation; document any ESLint suppression. Components use PascalCase, hooks camelCase with `use`, constants SCREAMING_SNAKE_CASE. Follow best security and best UI/UX design practices: accessible labels, high-contrast tokens, responsive layouts, clear map affordances, and contextual weather copy. Prefer Tailwind utilities over ad hoc CSS.

## Testing Guidelines
Ship tests with `@testing-library/react` on Jest or Vitest. Keep specs beside components as `*.test.tsx` or under `src/__tests__`. Mock `/api` fetches, Google Maps loaders, and geolocation; cover timeouts, permission denials, and deterministic agent JSON.

## Commit & Pull Request Guidelines
Write imperative commit subjects (optional `fix:`/`feat:`) ≤72 chars. PRs should state user impact, reference issues, include UI evidence, and list validation steps (lint, smoke).

## Security & Configuration
Honor best security practices: keep secrets in `.env.local`, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, load OpenWeatherMap via env vars, rotate keys, validate inputs, and sanitize endpoints. Never commit secrets; document configuration shifts in your PR.

## Agents – Best Practices & Context Guide
Agents prioritize accuracy, determinism, scoped intelligence, explainability, and safe failure (`NEEDS_CLARIFICATION`). Roles: WeatherAgent (weather summary), SwimScoreAgent (0–100 score), UIHelperAgent (copy), SearchAgent (autocomplete), AlertAgent (hazards), DevAssistantAgent (tooling). Route out-of-scope work with `{ "error": "OUT_OF_SCOPE", ... }`. Use only approved APIs, derived math, and timestamped caches; missing data returns `{ "status": "INSUFFICIENT_DATA" }`. Responses must be JSON with `agent`, `success`, `data`, and `meta` (source, cached flag, Unix timestamp); warnings add severity and timeframe. Log agent name, timestamp, status, and send errors to `agents_errors.log`. Apply best security practices: refuse to expose secrets, run arbitrary code, process PII, or comply with malicious prompts—respond `SECURITY_REJECTION` when needed. Maintain prompts in `/agents/prompts/{name}.txt` and note updates in `CHANGELOG.md`. Test agents with unit, mocked API, fuzz, snapshot, and JSON schema suites.
Quick start: `npm run agents:list`, `npm run agents:run WeatherAgent --lat=8.02 --lon=98.82`, `npm run agents:validate`.
Roadmap covers TravelAssistantAgent, multilingual output, offline cache, composite marine hazards.
Assets belong to Sendouw Labs / WeatherVision; keep agents honest, aligned with best security/UI/UX.
