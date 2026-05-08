# FriendFeed Developer Guide

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:4321
pnpm build      # Build to dist/
pnpm check      # Run astro check (type-check .astro files)
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
| `src/config/config.ts` | Friend links (multi-group), site metadata, social links, PWA config |
| `src/config/type.ts` | TypeScript types: `FriendLink`, `FriendLinkGroup`, `AppData`, `PostItem`, etc. |
| `src/context/AppContext.tsx` | React Context + Provider wrapping the friend feed store |
| `src/hooks/useFriendFeedStore.ts` | State management hook; persists edits to `localStorage` |
| `src/components/react/FeedIsland.tsx` | Single client island wrapping AppProvider + ArticleList + AdminPanel |
| `src/components/react/ArticleList.tsx` | Fetches & displays RSS articles for the active group |
| `src/components/react/AdminPanel.tsx` | Hidden admin panel (dblclick `.site-title` or `Ctrl+Shift+K`) |
| `src/components/react/ArticleCard.tsx` | Single article card |
| `src/components/*.astro` | Static Astro components (Background, ProfileHeader, Footer, SocialLinks) |
| `src/utils/crawler.ts` | RSS/Atom feed fetching and parsing |

## Key Config Locations

- Friend links (multi-group): `src/config/config.ts` → `friendLinkGroups` array, plus `friendLinks` for backward compat
- Types: `src/config/type.ts` → `FriendLinkGroup { name, links[] }`, `AppData { groups[], activeGroupIndex }`
- Site metadata: `src/config/config.ts` → `siteConfig`, `profileConfig`
- PWA: `src/config/config.ts` → `serviceWorkerConfig`

## Path Aliases

Configured in `tsconfig.json` and `astro.config.mjs`:
- `@/` → `src/`
- `@config/` → `src/config/`
- `@components/` → `src/components/`
- `@utils/` → `src/utils/`

## Architecture Notes

- **State flows through React Context**: `FeedIsland` (single `client:load` island) wraps `AppProvider` which provides the store to `ArticleList` + `AdminPanel`. Multiple `client:load` islands create separate React roots — they can't share context.
- **localStorage persistence**: `useFriendFeedStore` loads initial data from `friendLinkGroups` in config, then persists all edits (add/delete groups, add/edit/delete links, active group) to `localStorage` key `friendfeed_data`.
- **Group switching re-fetches**: When active group changes, `ArticleList` resets selected friend filter and re-crawls all feeds in the new group. A `groupRef` guards against stale async results.

## Linting

ESLint config at `eslint.config.js` enforces:
- No unused vars (prefix with `_` or `_var` to ignore)
- `prefer-const` and `no-var` required
- `no-console` warns (allows `warn`/`error`)

## What's Missing

- No test framework in package.json

## Git Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/). Format:

```

<type>[optional scope]: <description>

[optional body]

[optional footer]

```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect meaning (white-space, formatting, etc.) |
| `refactor` | Code change that is neither a fix nor a feature |
| `perf` | A code change that improves performance |
| `test` | Adding or correcting tests |
| `chore` | Changes to the build process or auxiliary tools |
| `ci` | Changes to CI/CD configuration |
| `build` | Changes to build system or external dependencies |

### Rules

- Write commit messages in **Chinese**, no trailing period.
- Keep lines to 72 characters or fewer (body and footer).
- Run `pnpm lint` before committing to ensure the code passes lint checks.