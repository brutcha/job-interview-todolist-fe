# Architecture Overview

**Project:** Todo List Application  
**Purpose:** Job Interview Assignment  
**Date:** October 2025

## Quick Start

```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server
pnpm test         # Run tests
pnpm build        # Build for production
pnpm typecheck    # Type check
pnpm lint         # Lint code
```

## Technology Stack

- **Runtime:** Node.js 22+ (LTS)
- **Package Manager:** pnpm 9+
- **Build Tool:** Vite 6+
- **Framework:** React 19
- **Language:** TypeScript 5.7+
- **State Management:** Redux Toolkit 2.5+ with RTK Query
- **Styling:** Tailwind CSS 4+ (alpha)
- **UI Components:** shadcn/ui
- **Validation:** @effect/schema 0.77+
- **Testing:** Vitest 4+ with @testing-library/react

See [ADR-0001: Tech Stack Selection](adr/0001-tech-stack.md) for rationale.

## Project Structure

```
src/
  components/       # React components
    ui/            # shadcn/ui components
  api/             # RTK Query API definitions
  store/           # Redux store + slices
  schemas/         # @effect/schema definitions
  utils/           # Pure utility functions
  middleware/      # Custom Redux middleware
  hooks/           # Custom React hooks
  types/           # Shared TypeScript types
```

## Architecture Decision Records

Key technical decisions documented in `docs/adr/`:

1. [Tech Stack Selection](adr/0001-tech-stack.md) - Vite, React 19, TypeScript, Redux Toolkit
2. [State Management](adr/0002-state-management.md) - Redux Toolkit + RTK Query
3. [URL Synchronization](adr/0003-url-sync.md) - Custom middleware approach
4. [Runtime Validation](adr/0004-validation.md) - @effect/schema in transformResponse
5. [Testing Strategy](adr/0005-testing.md) - Vitest with pure function focus
6. [Error Handling](adr/0006-error-handling.md) - Inline errors + skeleton loading
7. [Mobile-First Styling](adr/0007-mobile-styling.md) - Tailwind 4 + shadcn/ui
8. [Scope & Workflow](adr/0008-scope-future.md) - MVP + extensibility + git workflow

## Development Workflow

### Code Quality

**Local checks (fast):**

- **Pre-commit:** Prettier only (~100ms)
- **Pre-push:** TypeScript (~2s)

**CI checks (comprehensive):**

- Prettier, ESLint, TypeScript, Tests, Build

See [ADR-0008](adr/0008-scope-future.md) for rationale.

### File Naming

- **Files:** kebab-case (`todo-item.tsx`, `url-sync.ts`)
- **Exports:** PascalCase (`TodoItem`, `useAppDispatch`)
- **Path alias:** `@/*` → `src/*`

### Commit Convention

Conventional Commits (manual, not enforced):

```
feat: add filtering
fix: resolve sync issue
docs: update ADR
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Core Patterns

### State Management

**Redux as source of truth:**

- Server state: RTK Query (auto-cached)
- Client state: Redux slices
- URL sync: Custom middleware

```typescript
// Server state
const { data: todos } = useGetTodosQuery();

// Client state
const filter = useAppSelector(selectFilter);
```

### Error Handling

**Hybrid approach:**

| Context         | Display             | Retry              |
| --------------- | ------------------- | ------------------ |
| Query errors    | Inline error state  | Yes (network/5xx)  |
| Mutation errors | Inline below button | User resubmits     |
| Offline         | Top banner          | Auto (when online) |
| Success         | Toast (3s)          | N/A                |

See [ADR-0006](adr/0006-error-handling.md) for details.

### Loading States

**Skeleton screens:**

- Show placeholder matching component structure
- Minimum display time to prevent flicker
- Better perceived performance than spinners

### Responsive Design

**Mobile-first with Tailwind:**

- Mobile: default (< 768px)
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)

**Touch targets:** Minimum 44×44px (WCAG 2.1)

## Testing Strategy

**Test pyramid:**

- **Unit tests** (~90%): Pure functions, schemas
- **Integration tests** (~10%): Middleware, RTK Query
- **Component tests**: Key user flows

**Not in MVP:** E2E tests, visual regression (Vitest browser mode)

See [ADR-0005](adr/0005-testing.md) for details.

## Performance

**Targets:**

- Time to Interactive: <1s
- Bundle size: <100KB gzipped
- CSS: <10KB gzipped

**Monitoring:**

- Chrome DevTools Performance tab
- Vite bundle analyzer

**Optimizations:**

- React Compiler (automatic memoization)
- RTK Query (request deduplication, caching)
- Tailwind purge (removes unused CSS)

## Build & Deployment

**GitHub Pages (automated):**

- Deploy on push to `main`
- Live URL: `https://<username>.github.io/job-interview-todolist-fe/`
- Environment: Backend API URL via GitHub secret

See [ADR-0008](adr/0008-scope-future.md) for deployment strategy.

## Environment Variables

```env
# .env (development)
VITE_API_BASE_URL=http://localhost:8080

# Production (GitHub secret)
VITE_API_BASE_URL=https://api.example.com
```

## References

- [Redux Toolkit](https://redux-toolkit.js.org/)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui](https://ui.shadcn.com/)
- [Effect Schema](https://effect.website/docs/schema/introduction)
- [Vitest](https://vitest.dev/)
- [ADR Process](https://adr.github.io/)
