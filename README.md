# Full-stack template

React, Mantine, and Express with TypeScript. The application runs on Node 24
through [nub](https://nubjs.com/); Vite builds the client.

## Setup

Install nub (validated with 0.9.5), then run:

```sh
nub install
nub run init
nub run dev
```

Initialization replaces the app and Docker placeholders and can create `.env`
from `.env.example`. Run it once in a new project, leaving this template's
placeholders intact. If you skip env creation, copy `.env.example` to `.env`
before running `dev`. Optional prompt settings are commented out so the AI example uses its defaults.

`.node-version` selects Node 24. Keep `bun.lock`: nub reads and updates it.
Use `nub add` / `nub remove` for dependencies and `nubx` for installed CLIs.

## Commands

| Command | Purpose |
| --- | --- |
| `nub run dev` | Start the app with restart on changes |
| `nub run build` | Build production client assets |
| `nub run start` | Serve the production app after building |
| `nub run typecheck` | Check TypeScript |
| `nub run format` | Format source files with Biome |
| `nub run lint` | Lint source files with Biome |
| `nub run test` | Run the Vitest suite once |
| `nub run test:watch` | Run Vitest in watch mode |

Tests run on Node with Vitest; Bun is not required. To run one test file, use
`nub run test src/shared/utilities/timer.test.ts`.

The scripts set `NODE_ENV`; do not set it in `.env` files. Nub ignores that
assignment. `dev` explicitly loads `.env`; values passed with `--env-file` are
literal, so do not rely on variable expansion there.

## Docker

```sh
docker build -t my-app .
docker run --rm -p 3000:3000 -e PORT=3000 my-app
```

The image uses Node 24 and nub 0.9.5, installs production dependencies with
`nub ci --prod`, and runs as the non-root `node` user. Pass configuration through
environment variables; local env files are excluded from the image. Mount a
writable volume at `/usr/src/app/data` to persist data across containers.
