# Repository Guidelines

## Project Structure & Module Organization
This is a full-stack TypeScript application in a single repository:
- `src/client/`: React 19 app (React Router 7, Mantine UI, React Query, route components, and platform utilities).
- `src/server/`: Express 5 API bootstrap using `simple-express-framework` (`main.ts`, routes, config, error handling).
- `src/server/modules/`: Feature modules (routes + services), for example `src/server/modules/example/`.
- `src/shared/`: Shared utilities used across client/server boundaries.
- `public/`: Static assets served by Vite.
- `data/`: Local persisted data files (runtime-generated).

Keep feature logic close to its module (for example, route code in `src/client/routes/`, server modules in `src/server/modules/`).

## Dependency Injection & Services
Backend services use factory functions and explicit dependency injection.

- Service files should export:
  - a `create*Service` factory function,
  - a `*Service` type derived from `ReturnType<typeof create*Service>`.
- Services are plain objects with methods; avoid classes/singletons for app services.
- Dependencies are injected via a typed object argument (see `createExampleService({ multiplyService })` in `src/server/modules/example/Example.service.ts`).
- Compose services in `src/server/main.ts` (create leaf services first, then dependent services).
- Register every injected service in `routeParams` in `simpleExpress(...)` in `src/server/main.ts`.
- Keep `RouteParams` in `src/server/types.ts` in sync with all services added to `routeParams`.
- Route handlers should consume services from handler params (for example `({ exampleService }) => ...`) instead of importing module-level instances.

Service example pattern:

```ts
export type MultiplyService = ReturnType<typeof createMultiplyService>;
export const createMultiplyService = () => ({
  multiply: (a: number, b: number) => a * b,
});

export type ExampleService = ReturnType<typeof createExampleService>;
export const createExampleService = ({
  multiplyService,
}: {
  multiplyService: MultiplyService;
}) => ({
  handleExample: (a: number, b: number) => multiplyService.multiply(a, b),
});
```

## Build, Test, and Development Commands
- `bun run dev`: Start full app in development (Bun + hot reload).
- `bun run dev-node`: Node.js fallback dev server (`nodemon` + `tsx`).
- `bun run build`: Build client assets with Vite into `dist/`.
- `bun run build-node`: Build client assets with Node-based Vite.
- `bun run start`: Run server in production mode.
- `bun run start-node`: Run production server with Node/tsx.
- `bun run typecheck`: Run strict TypeScript checks (no emit).
- `bun run prettier`: Format the repository.
- `bun run init`: Replace scaffold placeholders (for example `${ packageName }`).
- `bun test` or `bun test src/shared/utilities/timer.test.ts`: Run unit tests.

## Architectural guidelines
- Avoid unnecessary abstractions: keep modules simple, focused, and single responsibility
- Always respect established patterns if asked or pointed to explicitly.
- Explicit orchestration over indirection: route/service code should clearly show the data flow.
- Anti-abstraction bias for transformation code: avoid “helper layers” that hide response shaping.
- Strict legacy isolation: backward compatibility is preserved, but legacy terms/fields are not allowed to leak into V2.
- Consistency across code, tests, docs, and Bruno collections is required, not optional.
- Favor readability and local clarity over generic DRY abstractions, especially those that perpetuate legacy architecture.
- Avoid unnecessary abstraction – each abstraction must have a good reason to exist. Prefer verbosity over multiplying abstractions.

## Coding Style & Naming Conventions
- Use TypeScript with strict typing; avoid `any` unless unavoidable.
- Formatting is enforced by Prettier (`.prettierrc.mjs`): single quotes, trailing commas (es5), sorted imports.
- Use 2-space indentation (Prettier default).
- React components and route files use `PascalCase` (for example, `HeaderMenu.tsx`).
- Utilities and helpers use `camelCase` filenames (for example, `fileCache.ts`).
- Backend service files follow `Feature.service.ts` naming (for example, `Example.service.ts`, `Multiply.service.ts`).
- Co-locate CSS modules with components using `*.module.css`.

## Testing Guidelines
- Primary framework: Bun test runner (`bun:test`).
- Test files use `*.test.ts` naming (example: `src/shared/utilities/timer.test.ts`).
- Add or update tests for behavioral changes in shared utilities and server modules.
- Prefer unit tests for service logic and shared utilities; run tests and type-check before opening a PR.

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
