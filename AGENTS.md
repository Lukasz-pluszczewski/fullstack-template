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
- Use Node 24 via nub; `.node-version` pins the major version.
- Prefer `nub <file>` for files, `nub run <script>` for scripts, `nubx <tool>` for local CLIs, and `nub install` / `nub add` for dependencies. Use `nub --node <file>` for unaugmented Node.
- Keep `bun.lock`; nub reads and updates this lockfile format.
- `nub run dev`: Start the full app on Node with restart on changes and `.env` loading.
- `nub run build`: Build production client assets with Vite into `dist/`.
- `nub run start`: Run the server in production mode.
- `nub run typecheck`: Run strict TypeScript checks (no emit).
- `nub run format`: Format source files with Biome.
- `nub run lint`: Lint source files with Biome.
- `nub run init`: Replace scaffold placeholders (for example `${ packageName }`).
- `nub run test`: Run the Vitest suite once on Node. Pass a file path to run one test file.
- `nub run test:watch`: Run Vitest in watch mode.
- Set `NODE_ENV` in scripts or the process environment, not `.env` files.

## Architecture guidelines
- Avoid unnecessary abstractions: keep modules simple, focused, and single responsibility, each abstraction must have a good reason to exist. Prefer verbosity over multiplying abstractions.
- Always respect established patterns if asked or pointed to explicitly.
- Explicit orchestration over indirection: route/service code should clearly show the data flow.
- Anti-abstraction bias for transformation code: avoid “helper layers” that hide response shaping.
- Consistency across code, tests, docs, and Bruno collections is required, not optional.
- Favor readability and local clarity over generic DRY abstractions, especially those that perpetuate legacy architecture.
- Avoid helpers/utilities used once.
- If you create a helper/utility put it in a separate file and make sure that it does not have side effects!
- Helpers must be reusable and generalised, examples:
  - `summarizeResults` helper that sums number of results in each category - BAD, case specific.
  - `normalizeDataset` helper converting one shape to the other - most likely BAD, works for this particular dataset, it's better to have consistent shapes or to have a case-specific conversion inline.
  - `countBy` - GOOD. Can be used to for results summarization and in many different places. Should be put in general `utils` module/folder/file.


## Coding Style & Naming Conventions
- Use TypeScript with strict typing; avoid `any` unless unavoidable.
- Formatting is configured in `biome.json`: single quotes, trailing commas (es5), and import organization.
- Use 2-space indentation.
- React components and route files use `PascalCase` (for example, `HeaderMenu.tsx`).
- Utilities and helpers use `camelCase` filenames (for example, `fileCache.ts`).
- Backend service files follow `Feature.service.ts` naming (for example, `Example.service.ts`, `Multiply.service.ts`).
- Co-locate CSS modules with components using `*.module.css`.

## Architecture guidelines
- Avoid unnecessary abstractions: keep modules simple, focused, and single responsibility, each abstraction must have a good reason to exist. Prefer verbosity over multiplying abstractions.
- Always respect established patterns if asked or pointed to explicitly.
- Explicit orchestration over indirection: route/service code should clearly show the data flow.
- Anti-abstraction bias for transformation code: avoid “helper layers” that hide response shaping.
- Consistency across code, tests, docs, and Bruno collections is required, not optional.
- Favor readability and local clarity over generic DRY abstractions, especially those that perpetuate legacy architecture.
- Avoid helpers/utilities used once.
- If you create a helper/utility put it in a separate file and make sure that it does not have side effects!
- Helpers must be reusable and generalised, examples:
  - `summarizeResults` helper that sums number of results in each category - BAD, case specific.
  - `normalizeDataset` helper converting one shape to the other - most likely BAD, works for this particular dataset, it's better to have consistent shapes or to have a case-specific conversion inline.
  - `countBy` - GOOD. Can be used to for results summarization and in many different places. Should be put in general `utils` module/folder/file.

## Testing Guidelines
- Primary framework: Vitest on Node. Import test functions and `vi` from `vitest`.
- Use `vi.fn` for mocks and `vi.spyOn` for spies; restore spies after each test.
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
- If scaffold placeholders (for example `${ packageName }`) are still present, run `nub run init` once to replace app and Docker naming values.
