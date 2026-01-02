# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development (primary - uses Bun with hot reload)
bun run dev

# Development (Node.js fallback - uses nodemon + tsx)
bun run dev-node

# Production build
bun run build

# Production server
bun run start

# Format code
bun run prettier
```

**No testing framework is currently configured.**

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

- **Runtime**: Bun (primary), Node.js (fallback)
- **Build**: Vite 7
- **Frontend**: React 19, React Router 7, React Query 5, Mantine 8, Tabler Icons
- **Backend**: Express 5, simple-express-framework, node-persist
- **Validation**: Zod 4
- **Utilities**: axios, lodash, dayjs

## Code Style

- Prettier with `@ianvs/prettier-plugin-sort-imports` for automatic import ordering
- TypeScript strict mode enabled
- Single quotes, trailing commas (es5 style)
