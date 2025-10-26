# ADR-0008: Scope Management & Future Enhancements

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

Assignment guidance:

- _"Don't over-engineer solutions"_
- _"Code will be reviewed in full, so keep it reasonable"_
- _"Optional enhancements (e.g., optimistic updates) are welcome, but keep concise"_

Need to define clear scope boundaries while demonstrating architectural thinking for future extensibility.

## Decision

**Implement MVP features with architecture that supports future enhancements without over-engineering for interview context.**

## MVP Scope (Phase 1)

### ✅ Required Features (All Implemented)

**Core Functionality:**

- Add todos
- Remove todos
- Rename/edit todos
- Mark todos as complete/incomplete
- Filter todos (all/active/completed)
- Mark all visible as complete
- Delete all completed todos
- Display completion count

**Quality Requirements:**

- Error handling with user feedback
- Loading states for async operations
- Mobile-responsive design
- Form validation
- Type-safe API calls with runtime validation
- Comprehensive test coverage
- Automated deployment to GitHub Pages

### ⏸️ Explicitly NOT Implementing

**Performance Optimizations:**

- ❌ Optimistic updates
- ❌ Virtual scrolling
- ❌ Manual React.memo (React Compiler handles this)
- ❌ Request debouncing (RTK Query handles this)

**User Experience Enhancements:**

- ❌ Offline support / Service Worker
- ❌ Drag-and-drop reordering
- ❌ Keyboard shortcuts
- ❌ Undo/redo functionality
- ❌ Dark mode toggle (browser extensions handle this)
- ❌ Todo due dates
- ❌ Todo categories/tags
- ❌ Search functionality

**Development Tools:**

- ❌ E2E tests (Playwright)
- ❌ Visual regression tests
- ❌ Vitest browser mode for visual regression
- ❌ Performance monitoring (Sentry)
- ❌ Analytics integration

## Rationale

### Why This Scope?

**Demonstrates Core Competencies:**

- ✅ Modern React patterns (React 19, hooks)
- ✅ Redux expertise (RTK Query, middleware)
- ✅ TypeScript proficiency
- ✅ Testing best practices
- ✅ Error handling
- ✅ Mobile-first responsive design
- ✅ Code organization and architecture
- ✅ CI/CD and deployment automation

**Avoids Over-Engineering:**

- ✅ No features assignment doesn't require
- ✅ Reasonable code volume for review
- ✅ Focus on quality over quantity

**Shows Architectural Thinking:**

- ✅ Design decisions documented (ADRs)
- ✅ Architecture supports future features
- ✅ Can discuss extensibility in interview

## Architecture Support for Future Features

### 1. Optimistic Updates (Future Phase 2)

**Current Architecture Supports:**

- RTK Query's `onQueryStarted` lifecycle hook
- Manual cache updates via `dispatch` and `updateCachedData`
- Error rollback mechanisms

**Implementation Path:**

```typescript
// Future implementation example
updateTodo: build.mutation({
  query: ({ id, ...patch }) => ({
    url: `/tasks/${id}`,
    method: "PATCH",
    body: patch,
  }),

  // Optimistic update
  async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
    // Update cache optimistically
    const patchResult = dispatch(
      todosApi.util.updateQueryData("getTodos", undefined, (draft) => {
        const todo = draft.find((t) => t.id === id);
        if (todo) Object.assign(todo, patch);
      }),
    );

    try {
      await queryFulfilled;
    } catch {
      // Rollback on error
      patchResult.undo();
      toast.error("Failed to update todo");
    }
  },
});
```

**Why Not Now:**

- Adds complexity to code review
- Can explain approach in interview

### 2. Offline Support (Future Phase 2)

**Current Architecture Supports:**

- Service Worker integration with Vite
- redux-persist for state persistence
- RTK Query cache can be persisted

**Implementation Path:**

```typescript
// Future implementation
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: [todosApi.reducerPath], // Only persist API cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
```

**Why Not Now:**

- Assignment doesn't mention offline support
- Adds bundle size (~20KB)
- More complex testing requirements

### 3. Drag-and-Drop Reordering (Future Phase 3)

**Current Architecture Supports:**

- @dnd-kit integration
- Backend could add `order` field
- Redux state already organized for reordering

**Implementation Path:**

```typescript
// Future implementation with @dnd-kit
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

// Add reorder mutation
reorderTodos: build.mutation({
  query: (todoIds: string[]) => ({
    url: "/tasks/reorder",
    method: "POST",
    body: { order: todoIds },
  }),
});
```

**Why Not Now:**

- Not in assignment requirements
- Adds complexity and dependency
- Backend may not support it

### 4. Keyboard Shortcuts (Future Phase 3)

**Current Architecture Supports:**

- Accessible markup already in place
- Could add react-hotkeys-hook

**Implementation Path:**

```typescript
// Future implementation
import { useHotkeys } from "react-hotkeys-hook";

function TodoList() {
  useHotkeys("ctrl+a", () => addTodo());
  useHotkeys("ctrl+f", () => focusFilter());
  useHotkeys("ctrl+/", () => showShortcuts());

  // ... rest of component
}
```

**Why Not Now:**

- Nice-to-have, not essential
- Assignment doesn't mention it
- Adds learning curve for users

### 5. Dark Mode (Future Phase 3)

**Current Architecture Supports:**

- Tailwind configured with `darkMode: 'class'`
- shadcn/ui components support dark mode
- CSS custom properties ready

**Implementation Path:**

```typescript
// Future implementation
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
```

**Why Not Now:**

- Browser extensions (Dark Reader) handle this well
- Assignment doesn't require it
- Adds UI complexity (toggle button)

## Performance Strategy

### Current Approach

**React Compiler (React 19):**

- ✅ Automatic memoization
- ✅ No manual `React.memo`, `useMemo`, `useCallback`
- ✅ Compiler optimizes re-renders

**RTK Query Optimization:**

- ✅ Automatic request deduplication
- ✅ Normalized caching
- ✅ Stale-while-revalidate
- ✅ Background refetching

**Tailwind CSS:**

- ✅ Purged unused styles
- ✅ Small bundle (~10-20KB gzipped)

### Performance Budget

**Target Metrics:**

- First Contentful Paint (FCP): <1s
- Time to Interactive (TTI): <1s
- Total Bundle Size: <100KB gzipped
- CSS: <15KB gzipped

**Expected Performance:**

- Initial bundle: ~85-95KB gzipped
  - React + ReactDOM: ~45KB
  - Redux Toolkit: ~20KB
  - Effect Schema: ~15KB
  - Other deps: ~10KB
- CSS: ~10KB gzipped (Tailwind purged)

### When to Optimize

**Reactive Optimization (Only If Needed):**

1. Profile with React DevTools
2. Identify actual bottlenecks
3. Apply targeted fixes
4. Measure improvement

**Scenarios that would trigger optimization:**

- > 1000 todos causing slow rendering
- Scroll lag on mobile devices
- > 1s Time to Interactive
- User reports of sluggishness

**Optimization Techniques (Future):**

```typescript
// Virtual scrolling (if >1000 todos)
import { useVirtualizer } from "@tanstack/react-virtual";

// Debounced filter input (if filter is slow)
import { useDebouncedValue } from "@/hooks/use-debounced-value";
```

### Performance Monitoring

**Development:**

- Chrome DevTools Performance tab (primary tool)
- React DevTools Profiler (component-level analysis)
- Vite bundle analyzer (`pnpm build --analyze`)

**Why not Lighthouse:**

- Lighthouse optimized for multi-page apps
- SPAs score artificially low on some metrics
- Chrome DevTools Performance tab more relevant for SPAs

**Future (Production):**

```typescript
// Would add Sentry Performance Monitoring
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "...",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
});
```

## Testing Strategy Scope

### Current Testing (Implemented)

**Unit Tests:**

- Pure utility functions (>95% coverage)
- Redux reducers
- Schema validation

**Integration Tests:**

- Redux middleware (~80% coverage)
- RTK Query with mocked backend

**Component Tests:**

- Key user flows
- Error states
- Accessibility checks

### Future Testing (Not in MVP)

**E2E Tests:**

```typescript
// Playwright example
test("complete todo flow", async ({ page }) => {
  await page.goto("/");
  await page.fill('[data-testid="todo-input"]', "Buy milk");
  await page.click('[data-testid="add-button"]');
  await page.click('[data-testid="todo-checkbox"]');
  await expect(page.locator('[data-testid="count"]')).toContainText("1");
});
```

**Visual Regression:**

```typescript
// Vitest browser mode with screenshot comparison
// Uses @vitest/browser + image snapshot plugin
// Note: Requires Docker for cross-platform consistency
// Priority: P3 (not worth complexity for MVP)

import { test, expect } from '@vitest/browser'

test('todo list renders correctly', async () => {
  render(<TodoList todos={mockTodos} />)
  const screenshot = await page.screenshot()
  expect(screenshot).toMatchImageSnapshot()
})
```

## Consequences

### Positive

- ✅ Clear, focused scope for interview review
- ✅ Demonstrates core competencies thoroughly
- ✅ Code volume reasonable for full review
- ✅ Easy to discuss future enhancements

### Negative

- ❌ Some expected features not implemented (optimistic updates)
- ❌ May seem "basic" compared to over-engineered submissions
- ❌ No E2E tests (acceptable trade-off)

### Neutral

- ⚪ Feature set matches assignment exactly
- ⚪ Can add features incrementally without refactoring
- ⚪ Architecture supports scaling to production

## Feature Priority Matrix

### If Time Permits (Ordered by Value/Effort)

| Feature                    | Value  | Effort | Priority | Status          |
| -------------------------- | ------ | ------ | -------- | --------------- |
| Optimistic updates         | High   | Low    | P0       | Future          |
| Keyboard shortcuts         | Medium | Low    | P1       | Future          |
| Offline support            | High   | High   | P2       | Future          |
| Drag-and-drop              | Medium | Medium | P2       | Future          |
| E2E tests                  | High   | Medium | P1       | Future          |
| Visual regression (Vitest) | Medium | Medium | P3       | Future (Docker) |
| Dark mode                  | Low    | Low    | P3       | Future          |
| Undo/redo                  | Medium | High   | P3       | Future          |
| Search                     | Medium | Low    | P2       | Future          |

## Development Workflow Enhancements (Not in MVP)

### Commitlint

**Not implementing in MVP:**

- Solo developer project (no team consistency needed)
- Manual conventional commits sufficient
- Adds setup complexity without team benefits

**Future implementation (if team grows):**

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore", "revert"]
    ]
  }
}
```

**When to add:**

- Team collaboration starts
- Automatic changelog generation needed (semantic-release)
- Enforced git workflow policy

### Branch Protection Rules

**Not implementing in MVP:**

- Single developer workflow
- Reviewers clone/test locally anyway
- Adds friction without collaboration benefits
- CI runs on all pushes already

**Future implementation (production):**

```yaml
# GitHub branch protection for main:
- Require pull request reviews (1 approver)
- Require status checks to pass:
    - CI: lint, typecheck, test, build
    - No force push
    - No deletion
```

**When to add:**

- Multiple developers
- Production deployment automation
- Formal code review process

### Local ESLint Enforcement

**Current approach:**

- ESLint runs in CI only
- Pre-commit: Prettier only (fast)
- Pre-push: TypeScript only

**Why not local ESLint:**

- Slow (3-5s on typical project)
- Blocks rapid development flow
- CI catches everything anyway
- Prettier handles formatting

**Could add later:**

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix"]
  }
}
```

**Trade-off:**

- ✅ Catches lint errors earlier
- ❌ Slower commits (3-5s → 5-10s)
- ❌ Blocks flow when iterating quickly

## Deployment Strategy

### GitHub Pages (Included in MVP)

**Decision: Deploy to GitHub Pages automatically on push to main.**

**Why include deployment in MVP:**

✅ **Interview value:**

- Reviewers can test live without local setup
- Easy to share URL during interview

✅ **Minimal effort:**

- ~10-15 minutes setup
- Single GitHub Actions workflow
- No infrastructure costs
- Automated on every push

✅ **Production-ready practice:**

- Environment variable management
- Static hosting patterns
- CI/CD pipeline setup

**Implementation:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

**Configuration required:**

1. **Vite config** - Base path for GitHub Pages:

   ```typescript
   // vite.config.ts
   export default defineConfig({
     base: "/job-interview-todolist-fe/",
     // ...
   });
   ```

2. **GitHub repository settings:**
   - Pages enabled (Source: GitHub Actions)
   - Repository secret: `VITE_API_BASE_URL`

3. **Backend consideration:**
   - Cannot use `localhost:8080` in production
   - Options:
     - Public demo backend
     - Mock API for demo
     - Document backend requirement

**Benefits:**

- Live demo URL for reviewers
- Automated deployment (zero manual steps)
- Production build verification
- Free hosting

**Trade-offs:**

- Requires public backend API or mock
- Adds ~100 LOC of workflow config
- Need to configure base path in Vite

**Alternative hosting options (future):**

| Platform                | Pros                             | Cons                | When to use        |
| ----------------------- | -------------------------------- | ------------------- | ------------------ |
| **Vercel**              | Preview deployments, zero config | Vendor lock-in      | Team collaboration |
| **Netlify**             | Form handling, split testing     | Build minutes limit | Marketing sites    |
| **Cloudflare Pages**    | Global CDN, unlimited bandwidth  | Complex setup       | High traffic       |
| **AWS S3 + CloudFront** | Full control, enterprise         | Manual setup, cost  | Production scale   |

**Verdict: GitHub Pages for MVP, Vercel for production team workflow.**

## Git Workflow Strategy

### Current (MVP):

```bash
# Fast local workflow
git commit  # → Prettier only (<100ms)
git push    # → TypeScript check (<2s)
# → CI runs: Prettier check, ESLint, TypeScript, tests, build
```

### Future (Team Production):

```bash
# Comprehensive local checks
git commit  # → Prettier + ESLint + commitlint (5-10s)
git push    # → TypeScript + tests (10-30s)
# → PR required, branch protection, reviews
# → CI runs full suite
# → Auto-deploy on merge
```

### Rationale:

**MVP priorities:**

1. Fast iteration speed
2. Code quality (via CI)
3. Solo developer efficiency

**Production priorities:**

1. Team consistency (commitlint)
2. Branch stability (protection)
3. Comprehensive local checks (ESLint)
4. Deployment safety (reviews + CI)

## References

- [Minimum Viable Product (MVP)](https://en.wikipedia.org/wiki/Minimum_viable_product)
- [YAGNI Principle](https://martinfowler.com/bliki/Yagni.html)
- [Feature Prioritization](https://www.productplan.com/glossary/feature-prioritization/)
- [Technical Debt Management](https://martinfowler.com/bliki/TechnicalDebt.html)
