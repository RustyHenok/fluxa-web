# fluxa-web

Next.js + TypeScript frontend for the Fluxa task platform.

## API Contract

This repo consumes the REST contract published by `fluxa-backend`.

- source of truth in the sibling workspace: `../fluxa-backend/openapi/fluxa-openapi.json`
- local copy in this repo: `contracts/fluxa-openapi.json`

Sync the checked-in backend contract into this repo with:

```bash
./scripts/sync_openapi.sh
```

If your backend checkout lives somewhere else, override the source path:

```bash
BACKEND_OPENAPI_PATH=/path/to/fluxa-backend/openapi/fluxa-openapi.json ./scripts/sync_openapi.sh
```

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
corepack pnpm dev
```

## Next Implementation Step

After the scaffold, wire generated client usage around:

- auth and tenant switching
- task list/detail flows
- export job polling
- dashboard summary
