# Repository Guidelines

## Project Structure & Module Organization

- `src/routes/` contains file-based TanStack Router routes. Tool pages live in `src/routes/tools/`.
- `src/components/tools/` contains reusable tool implementations; route files should stay thin and compose these components.
- `src/components/ui/` contains shadcn/ui primitives. Prefer adding generated shadcn components here.
- `src/lib/` contains shared app logic, state helpers, auth clients, and server data helpers.
- `src/db/` contains Drizzle schema and database setup; `drizzle/` contains generated migrations.
- `public/` stores static assets.

## Build, Test, and Development Commands

Use pnpm; the project declares `pnpm@11.3.0`.

- `pnpm install` installs dependencies.
- `pnpm dev` starts Vite on port `3000`.
- `pnpm build` creates a production build.
- `pnpm preview` serves the built app locally.
- `pnpm test` runs Vitest once.
- `pnpm lint` runs Biome linting.
- `pnpm format` formats files with Biome.
- `pnpm check` runs Biome formatting and lint checks.
- `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:studio` manage Drizzle.

## Coding Style & Naming Conventions

Biome is the source of truth for formatting and linting. It uses tabs for indentation and double quotes in JavaScript/TypeScript. Prefer the `#/*` import alias for files under `src`.

Name React components in PascalCase, hooks and helpers in camelCase, and route files by URL segment, such as `src/routes/tools/base64.tsx`. Keep generated files like `src/routeTree.gen.ts` unedited.

## Testing Guidelines

Vitest is configured as the test runner, with Testing Library available for React component tests. Place tests beside the code they cover using names like `json-comparison-tool.test.tsx` or `utils.test.ts`. Focus tests on parsing, transformations, server helpers, and user-facing tool behavior. Run `pnpm test` before opening a PR.

## Commit & Pull Request Guidelines

The repository history currently has only an initial commit, so no detailed convention is established. Use short, imperative commit messages such as `Add UUID tool validation` or `Fix timestamp timezone parsing`.

Pull requests should include a summary, testing notes, linked issues when relevant, and screenshots or short recordings for UI changes. Call out schema, migration, auth, or environment changes explicitly.

## Security & Configuration Tips

Keep secrets in `.env.local` or deployment environment variables, never in committed code. Database and auth changes should be paired with the relevant Drizzle migration or setup note. Avoid logging sensitive input from tools such as redaction, auth, or database flows.
