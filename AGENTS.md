# FriendFeed Developer Guide

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:4321
pnpm build      # Build to dist/
pnpm lint       # Run ESLint
pnpm preview    # Preview production build
```

## Tech Stack

- **Astro 5.0** + **React 19** (Islands architecture)
- **TypeScript** (strict mode via astro/tsconfigs/strict)
- **pnpm** (required, not npm/yarn)

## Project Structure

| Path | Purpose |
|------|---------|
| `src/config/config.ts` | Friend links, site metadata, social links, PWA config |
| `src/utils/crawler.ts` | RSS/Atom feed fetching and parsing |
| `src/components/react/` | Interactive React Islands |
| `src/components/*.astro` | Static Astro components |

## Key Config Locations

- Friend links: `src/config/config.ts` → `friendLinks` array
- Site metadata: `src/config/config.ts` → `siteConfig`, `profileConfig`
- PWA: `src/config/config.ts` → `serviceWorkerConfig`

## Path Aliases

Configured in `tsconfig.json` and `astro.config.mjs`:
- `@/` → `src/`
- `@config/` → `src/config/`
- `@components/` → `src/components/`

## Linting

ESLint config at `eslint.config.js` enforces:
- No unused vars (prefix with `_` or `_var` to ignore)
- `prefer-const` and `no-var` required
- `no-console` warns (allows `warn`/`error`)

## What's Missing

- No test framework in package.json
- No typecheck script (Astro handles TypeScript internally)