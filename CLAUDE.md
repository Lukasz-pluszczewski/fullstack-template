# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

Use Node 24 via nub (`.node-version`). Prefer `nub <file>`, `nub run <script>`,
`nubx <tool>`, and `nub install` / `nub add`. Keep the existing `bun.lock` format.
Use `nub --node <file>` for unaugmented Node.

```bash
# Development with restart on changes
nub run dev

# Production build and server
nub run build
nub run start

# Format, lint, and type check
nub run format
nub run lint
nub run typecheck

# Initialize a new project from the template
nub run init

# Tests (single run or watch mode)
nub run test
nub run test:watch
```

Tests use Vitest on Node with explicit imports from `vitest`. Bun is not required.
Set `NODE_ENV` in scripts or the process environment; nub ignores assignments in
`.env` files.

## Architecture Overview

Full-stack TypeScript application with React frontend and Express backend, bundled together via vite-express.

### Frontend (`src/client/`)
- **React 19** with **React Router 7** for client-side routing
- **React Query** for server state management with custom hooks in `platform/react-query.ts`
- **Mantine UI 8** component library with PostCSS integration
- Query keys centralized in `queries/keys.ts`
- Context providers composed via `platform/ComposeContextProviders.tsx`
- Config loaded from server and validated with Zod before app renders (`platform/config.tsx`)

### Backend (`src/server/`)
- **Express 5** wrapped with `simple-express-framework` for type-safe routing
- Routes defined in `routes/index.ts`, mounted at `/api` prefix
- Configuration validated with Zod in `config.ts`
- Built-in persistence via `fullstack-simple-persist` at `/api/keyvalue` and `/api/collection` endpoints
- Health check at `/api/health`

### Dependency Injection & Services

Services use **factory functions** (not classes). Each service file exports a `create*` function and a type derived from its return type:

```typescript
// Multiply.service.ts — service with no dependencies
export type MultiplyService = ReturnType<typeof createMultiplyService>;
export const createMultiplyService = () => {
  return {
    multiply: (a: number, b: number) => a * b,
  };
};

// Example.service.ts — service with dependencies injected via parameter
export type ExampleService = ReturnType<typeof createExampleService>;
export const createExampleService = ({ multiplyService }: { multiplyService: MultiplyService }) => {
  return {
    handleExample: (a: number, b: number) => multiplyService.multiply(a, b),
  };
};
```

**Wiring services together** — instantiate in `main.ts` and pass via `routeParams`:

1. Create service instances in `main.ts`, injecting dependencies manually
2. Add the service type to `RouteParams` in `types.ts`
3. Pass instances into `simpleExpress({ routeParams: { ... } })`
4. Services are then available as destructured params in route handlers (e.g. `({ exampleService }) => ...`)

### Key Patterns
- Zod schemas for runtime validation on both client and server
- Custom error classes extending `BaseError` for consistent error handling
- Error details only exposed in development mode
- Type-safe route params via `RouteParams` type
- Always use typescript, avoid "any" and "ts-ignore"
- Use zustand on frontend if complex state is needed
- Always use custom hooks for API calls. For each call create custom hook, instead of separate "fetch" method
- Avoid classes and inheritance (except for errors), use factory functions returning plain objects
- Always put request parameters validation directly in anonymous function in route

## Tech Stack

- **Runtime**: Node 24 via nub
- **Build**: Vite 7
- **Frontend**: React 19, React Router 7, React Query 5, Mantine 8, Tabler Icons
- **Backend**: Express 5, simple-express-framework, node-persist
- **Validation**: Zod 4
- **Utilities**: axios, lodash, dayjs

## Code Style

- Biome (`biome.json`) for formatting, linting, and import organization
- TypeScript strict mode enabled
- Single quotes, trailing commas (es5 style)
