# ADR-0005: Testing Strategy

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

Need a testing strategy that:

- Provides confidence in code correctness
- Supports refactoring
- Is maintainable and not brittle
- Demonstrates testing best practices
- Balances coverage vs. development speed
- Replaces comment based documentation of code

What testing tools and approaches should be used?

## Considered Options

### Test Runners

1. **Vitest** - Modern, Vite-native, fast
2. **Jest** - Traditional, widely adopted
3. **Mocha + Chai** - Flexible but requires more setup

### Testing Approaches

1. **Unit tests** - Test pure functions in isolation
2. **Integration tests** - Test components with dependencies
3. **E2E tests** - Test full user flows (Playwright/Cypress)
4. **Visual regression** - Screenshot comparison testing

## Decision

**Vitest 4+ with @testing-library/react**

### Testing Pyramid (for MVP)

```
       /\
      /E2\      ← Not in MVP (time vs. value)
     /----\
    / Integ\    ← Minimal (Redux middleware, ~10%)
   /--------\
  /   Unit   \  ← Primary focus (~90% of tests)
 /____________\
```

### Test Coverage Goals

- **Pure functions:** >95% coverage (easy to test)
- **Redux middleware:** ~80% coverage (integration tests)
- **React components:** ~70% coverage (key user flows)
- **Overall:** >80% coverage

## Rationale

### Why Vitest over Jest?

- ✅ **Vite Native** - Same config as build tool, no extra setup
- ✅ **Faster** - ESM-native, no transpilation for modern code
- ✅ **Better DX** - Faster watch mode, better error messages
- ✅ **Compatible** - Jest-like API, easy for reviewers to read
- ✅ **Modern** - Built for current ecosystem
- ❌ Jest has more ecosystem packages (not critical here)

### Why focus on unit tests?

**Pure functions are:**

- ✅ Fast to test (no mocking)
- ✅ Easy to test (just input → output)
- ✅ Stable (don't break on refactoring)
- ✅ High value (catch bugs early)

**Example:**

```typescript
// Pure function - 1 line test, no mocks
addFilterToUrl("http://localhost/", "active");
// → 'http://localhost/?filter=active'

// vs. Component test - needs render, providers, mocking...
```

### Why minimize integration tests?

- ⚠️ Slower to run
- ⚠️ More brittle (break on implementation changes)
- ⚠️ Harder to maintain (mocking complexities)
- ✅ Still valuable for critical paths

**Strategy:** Test middleware integration but trust RTK Query (well-tested library).

### Why no E2E in MVP?

- ❌ Time investment vs. value for interview
- ❌ Requires backend running
- ❌ Slower feedback loop
- ⚪ Could add later if time permits

### Why @testing-library/react?

- ✅ **User-centric** - Tests what users see/do
- ✅ **Best practices** - Encourages accessible markup
- ✅ **No implementation details** - Tests behavior not internals
- ✅ **Industry standard** - Reviewers will recognize it

## Consequences

### Positive

- ✅ Fast test execution (unit test focused)
- ✅ High confidence from pure function coverage
- ✅ Maintainable tests (minimal mocking)
- ✅ Good developer experience (Vitest watch mode)
- ✅ Demonstrates testing best practices

### Negative

- ❌ No E2E coverage (acceptable for MVP)
- ❌ Some integration scenarios untested
- ❌ Visual regressions not caught (Vitest browser mode + Docker required, P3 priority)

### Neutral

- ⚪ Can add E2E tests later if needed
- ⚪ Pure function approach limits testing complexity

## Implementation Notes

### CI Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm typecheck
      - run: pnpm lint
```

## Test Philosophy

### What to Test

✅ **Test behavior, not implementation:**

```typescript
// ✅ Good - tests what user sees
expect(screen.getByText("3 items left")).toBeInTheDocument();

// ❌ Bad - tests implementation
expect(component.state.count).toBe(3);
```

✅ **Test pure functions exhaustively:**

```typescript
// Cover edge cases - fast and valuable
describe("addFilterToUrl", () => {
  it("handles empty URL");
  it("handles URL with existing params");
  it("handles URL with hash");
  it("handles URL with port");
  it("handles special characters");
});
```

✅ **Test critical user flows in components:**

- Adding a todo
- Marking todo complete
- Filtering todos
- Error states

### What NOT to Test

❌ **External libraries** (trust them):

```typescript
// Don't test Redux Toolkit
// Don't test React itself
// Don't test shadcn/ui components
```

❌ **Implementation details:**

```typescript
// Don't test internal state
// Don't test private functions
// Don't test CSS classes (unless functional)
```

❌ **Trivial code:**

```typescript
// Don't test simple getters
// Don't test constants
```

## Future Enhancements (Not in MVP)

### E2E Tests with Playwright

```typescript
// e2e/todo-flow.spec.ts
import { test, expect } from "@playwright/test";

test("complete todo flow", async ({ page }) => {
  await page.goto("/");

  // Add todo
  await page.fill('[data-testid="todo-input"]', "Buy milk");
  await page.click('[data-testid="add-button"]');

  // Mark complete
  await page.click('[data-testid="todo-checkbox"]');

  // Filter
  await page.click("text=Completed");

  expect(await page.textContent('[data-testid="todo-item"]')).toContain("Buy milk");
});
```

### Visual Regression with Vitest

```typescript
// Vitest browser mode for visual regression testing
// Uses @vitest/browser with playwright or webdriverio
// Note: Requires Docker for cross-platform rendering consistency
// Browser rendering differs between OS (antialiasing, fonts, etc.)
// Priority: P3 (not worth Docker complexity for MVP)

import { test, expect } from "@vitest/browser";

test("button renders correctly", async () => {
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot();
});
```

### Performance Tests

```typescript
// Measure render performance
import { renderHook } from "@testing-library/react";
import { performance } from "perf_hooks";

it("renders large list performantly", () => {
  const start = performance.now();
  const { result } = renderHook(() => useFilteredTodos(1000));
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(100); // 100ms threshold
});
```

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Effective Testing](https://martinfowler.com/articles/practical-test-pyramid.html)
