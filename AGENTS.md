# Repository Guidelines

## Project Structure & Module Organization
This is a full-stack TypeScript application in a single repository:
- `src/client/`: React 19 app (routes, UI, hooks, and query logic).
- `src/server/`: Express 5 API and server bootstrap using simple-express-framework (`main.ts`, routes, config, error handling).
- `src/shared/`: Shared utilities used across client/server boundaries.
- `public/`: Static assets served by Vite.
- `data/`: Local persisted data files (runtime-generated).

Keep feature logic close to its module (for example, route code in `src/client/routes/`, server modules in `src/server/modules/`).

## Build, Test, and Development Commands
- `bun run dev`: Start full app in development (Bun + hot reload).
- `bun run dev-node`: Node.js fallback dev server (`nodemon` + `tsx`).
- `bun run build`: Build client assets with Vite into `dist/`.
- `bun run start`: Run server in production mode.
- `bun run typecheck`: Run strict TypeScript checks (no emit).
- `bun run prettier`: Format the repository.
- `bun test` or `bun test src/shared/utilities/timer.test.ts`: Run unit tests.

## Coding Style & Naming Conventions
- Use TypeScript with strict typing; avoid `any` unless unavoidable.
- Formatting is enforced by Prettier (`.prettierrc.mjs`): single quotes, trailing commas (es5), sorted imports.
- Use 2-space indentation (Prettier default).
- React components and route files use `PascalCase` (for example, `HeaderMenu.tsx`).
- Utilities and helpers use `camelCase` filenames (for example, `fileCache.ts`).
- Co-locate CSS modules with components using `*.module.css`.

## Testing Guidelines
- Primary framework: Bun test runner (`bun:test`).
- Test files use `*.test.ts` naming (example: `src/shared/utilities/timer.test.ts`).
- Add or update tests for behavioral changes in shared utilities and server modules.
- Run tests and type-check before opening a PR.

## Commit & Pull Request Guidelines
- Follow existing history style: short, imperative, capitalized subjects (for example, `Added docker setup`, `Platform fixes`).
- Keep commits focused and scoped to one change set.
- PRs should include:
  - What changed and why.
  - Validation steps run locally (commands).
  - Linked issue/task when applicable.
  - Screenshots for UI-visible changes.

## Security & Configuration Tips
- Copy `.env.example` to `.env` for local setup; never commit secrets.
- If scaffold placeholders (for example `${ packageName }`) are still present, run `bun run init` once to replace app and Docker naming values.
