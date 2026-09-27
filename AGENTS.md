# Repository Guidelines

## Simplicity and Design

- Prefer simple, readable, cohesive code with few abstractions and little indirection. Keep modules focused, but do not split code merely to shorten functions or files.
- Keep domain rules, execution order, and data transformations visible. Prefer straightforward code and some repetition over helper or strategy layers that make the reader jump between files.
- Give every abstraction a concrete reason to exist. Avoid single-use, case-specific helpers. When extracting shared logic, identify the smallest meaningful operation that stands on its own across different uses. Keep domain decisions and orchestration in the caller. Generalize by narrowing responsibility, not by adding options or speculative features.
- Reusable utilities belong in separate files and must have no side effects.
- Use precise domain names that reflect meaning, ownership, and lifecycle.
- Understand the existing design before changing it. Follow patterns explicitly requested by the user and preserve unrelated work.
- Preserve behavior unless a change is approved. When dropping an edge case, removing a feature, or slightly changing behavior would materially simplify the code, suggest it: explain the simplification and its practical impact. Never implement that tradeoff without explicit approval.
- Keep affected code, tests, documentation, and API examples (including Bruno collections) consistent.

Helper examples:

- Extract a geometric `raycast` operation rather than the entire `findEnemy` workflow; keep enemy selection and targeting rules in the caller.
- Prefer a reusable `countBy` utility over a case-specific `summarizeResults` helper that counts results by category.
- Keep a one-off `normalizeDataset` conversion inline, or use consistent data shapes to avoid the conversion.

## Project Structure

- `src/client/`: React app, routes, and platform utilities.
- `src/server/`: Express API bootstrap, configuration, and error handling.
- `src/server/modules/`: Feature routes and services.
- `src/shared/`: Utilities shared by client and server.
- `public/`: Static assets served by Vite.
- `data/`: Runtime-generated persisted files.

Keep feature logic close to its module.

## Dependency Injection and Services

- Backend services are plain objects created by `create*Service` factories, not classes or singletons. Export a service type derived from `ReturnType<typeof create*Service>`.
- Inject dependencies through a typed object argument. Compose services in `src/server/main.ts`, creating dependencies before their consumers.
- Register route dependencies in `simpleExpress(...)` through `routeParams`; keep `RouteParams` in `src/server/types.ts` in sync.
- Route handlers consume services from handler params, for example `({ exampleService }) => ...`, rather than importing module-level instances.

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

## Tooling

Use nub: `nub <file>` for files, `nub run <script>` for scripts, `nubx <tool>` for local CLIs, and `nub install` / `nub add` for dependencies. Keep `bun.lock`; nub maintains it. See [README.md](README.md) for setup, commands, and environment configuration.

## Code Style

- Use strict TypeScript; avoid `any` unless unavoidable.
- Follow `biome.json` for formatting and import organization.
- Use `PascalCase` for React components and route files (for example, `HeaderMenu.tsx`), `camelCase` for utility files (`fileCache.ts`), and `Feature.service.ts` for backend services (`Example.service.ts`).
- Co-locate CSS modules with components using `*.module.css`.

## Testing

- Use Vitest on Node with explicit imports from `vitest`. Use `vi.fn` for mocks and `vi.spyOn` for spies; restore spies after each test.
- Name tests `*.test.ts` (for example, `src/shared/utilities/timer.test.ts`).
- Add or update unit tests for behavioral changes in shared utilities and server modules. Run tests and typecheck before opening a PR.

## Commits and Pull Requests

- Keep commits focused. Follow the existing short, capitalized subject style (for example, `Added docker setup`, `Platform fixes`).
- PRs explain what changed and why, include validation commands and relevant issue links, and include screenshots for UI changes.

## Security and Template Setup

- Never commit secrets. Use `.env.example` for local setup.
- Initialize scaffold placeholders only when creating a project from this template; follow the README setup instructions.
