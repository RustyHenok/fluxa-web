# fluxa-web

Next.js + TypeScript frontend for the Fluxa task platform.

## API Contract

This repo consumes the REST contract published by `fluxa-backend`.

- source of truth in the sibling workspace: `../fluxa-backend/openapi/fluxa-openapi.json`
- local copy in this repo: `contracts/fluxa-openapi.json`

Sync the checked-in backend contract into this repo with:

```bash
corepack pnpm sync:openapi
```

If your backend checkout lives somewhere else, override the source path:

```bash
BACKEND_OPENAPI_PATH=/path/to/fluxa-backend/openapi/fluxa-openapi.json corepack pnpm sync:openapi
```

This sync command copies the OpenAPI file and regenerates the typed schema under `lib/api/generated/schema.ts`.

## UI Stack

- `Next.js App Router`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui` patterns and primitives

## Planned Stack

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- generated API types/client from the synced OpenAPI file

## Local Setup

Install dependencies and start the dev server with:

```bash
corepack pnpm install
cp .env.example .env.local
corepack pnpm dev
```

Build and lint with:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

## Environment

- `FLUXA_API_BASE_URL`
  - server-side URL used by the Next.js BFF routes and server components
- `NEXT_PUBLIC_FLUXA_API_BASE_URL`
  - optional browser-readable mirror for later client-side fetches

For local development the scaffold defaults to `http://127.0.0.1:18080`.

## Next Implementation Step

The current scaffold now includes:

- `pnpm`-based Next.js app setup
- `Tailwind CSS` + `shadcn/ui` primitives
- typed REST client wrappers around the synced backend contract
- cookie-backed auth route handlers
- silent session renewal via `/api/auth/refresh`, proxy recovery, and browser keepalive
- loading skeletons for route transitions across auth, tasks, task detail, and exports
- live dashboard summary and task list bootstrap on `/tasks`
- task creation from the web workspace
- task detail, audit history, and patch flows
- export job creation, polling, and result rendering on `/exports`

Next, wire generated client usage and richer app flows around:

- generated contract clients backed by `openapi-fetch` + `openapi-typescript`
- richer task filters and dashboard polish
