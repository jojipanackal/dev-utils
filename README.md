# Dev Utils

A TanStack Start application for developer utilities. The app is built with React, TypeScript, Vite, TanStack Router, Tailwind CSS, shadcn/ui, Better Auth, and Drizzle.

## Getting Started

This project uses `pnpm@11.3.0`.

```bash
pnpm install
pnpm dev
```

The development server runs on <http://localhost:3000>.

## Commands

```bash
pnpm dev        # Start Vite on port 3000
pnpm build      # Build for production
pnpm preview    # Preview the production build
pnpm start      # Run the built Nitro server
pnpm test       # Run Vitest
pnpm lint       # Run Biome linting
pnpm format     # Format with Biome
pnpm check      # Run Biome checks
```

Database commands:

```bash
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations with scripts/migrate.ts
pnpm db:push      # Push schema changes
pnpm db:pull      # Pull database schema
pnpm db:studio    # Open Drizzle Studio
```

## Project Structure

- `src/routes/` contains file-based TanStack Router routes.
- `src/routes/tools/` contains utility tool pages.
- `src/components/tools/` contains reusable tool components.
- `src/components/ui/` contains shadcn/ui primitives.
- `src/lib/` contains shared client and server helpers.
- `src/db/` contains Drizzle database setup and schema.
- `drizzle/` contains generated migrations.
- `public/` contains static assets.

## Styling and UI

Tailwind CSS handles styling, with shadcn/ui components stored in `src/components/ui/`. Add new shadcn components with:

```bash
pnpm dlx shadcn@latest add button
```

Biome is used for formatting and linting. The formatter uses tabs and double quotes for JavaScript and TypeScript.

## Environment

Use `.env.local` for local secrets and deployment environment variables for production. Typical configuration includes auth and database values such as `BETTER_AUTH_SECRET` and `DATABASE_URL`.

## Contributing

See [AGENTS.md](./AGENTS.md) for repository guidelines, coding conventions, testing expectations, and pull request guidance.
