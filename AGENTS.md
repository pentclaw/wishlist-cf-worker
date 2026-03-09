# Repository Guidelines

## Project Structure & Module Organization
- `src/index.ts`: Hono Worker entrypoint, API routes, auth, and KV persistence.
- `src/ui.ts`: server-rendered HTML template and browser-side interaction logic.
- `tests/`: Node test files (`*.test.mjs`) that validate API/privacy and UI-template behavior.
- `README.md`: deployment, local run, and API usage notes.
- `wrangler.toml`: Cloudflare Worker + KV binding configuration.

Keep feature logic close to its layer: API behavior in `src/index.ts`, UI rendering/event handling in `src/ui.ts`.

## Build, Test, and Development Commands
- `npm run dev`: start local Worker (`wrangler dev ... --local`).
- `npm run typecheck`: TypeScript static check (`tsc --noEmit`).
- `npm run test:public-privacy`: compiles `src/` into `.tmp-test-build`, runs Node tests, then cleans temp files.
- `npm run deploy`: deploy Worker to Cloudflare.

Typical local verification before PR:
```bash
npm run test:public-privacy
npm run typecheck
```

## Coding Style & Naming Conventions
- Language: TypeScript (ES modules), 2-space indentation, semicolons enabled.
- Prefer clear camelCase for variables/functions (`loadPublicState`, `manageTotalPages`).
- Keep route constants and limits uppercased (`WISHES_KEY`, `MAX_IMPORT_WISHES`).
- Favor small helper functions for repeated logic (e.g., auth/header helpers).
- UI follows semantic HTML + Pico.css; avoid introducing ad-hoc custom CSS unless explicitly required.

## Testing Guidelines
- Framework: built-in Node test runner (`node --test`) with `assert/strict`.
- Place tests in `tests/` and name as `*.test.mjs`.
- Add/adjust tests for behavior changes (API responses, auth/privacy boundaries, template structure).
- For UI template changes, assert rendered HTML tokens with `assert.match` / `assert.doesNotMatch`.

## Commit & Pull Request Guidelines
- Commit style follows Conventional Commits seen in history: `feat(scope): ...`, `refactor(scope): ...`, `docs(scope): ...`, `style(scope): ...`.
- Keep commits focused and runnable.
- PRs should include:
  - What changed and why.
  - Risk/impact notes (auth, import/export, deletion flows).
  - Verification output (commands run and pass status).
  - UI screenshots/GIFs when interaction or layout changed.

## Security & Configuration Tips
- Never commit secrets or production KV IDs outside intended config.
- Validate destructive flows carefully (`replace` import, delete operations).
- Keep cookie/auth behavior aligned with `src/index.ts` and update tests when auth logic changes.
