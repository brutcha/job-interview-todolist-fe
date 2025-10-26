# ADR-0003: URL Synchronization Strategy

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

The application needs to persist filter state (all/active/completed) in the URL query string for:

- Browser back/forward button support
- Bookmarkable state

The assignment requires Redux usage. How should we synchronize filter state between Redux store and URL query parameters?

## Considered Options

### 1. URL as Source of Truth (nuqs or similar)

- URL is single source of truth
- No Redux state for filters
- Direct URL manipulation via hooks

### 2. Redux as Source of Truth + Middleware Sync

- Redux store is source of truth
- Custom middleware syncs Redux → URL
- useEffect syncs URL → Redux on mount/popstate

### 3. Both as Independent Sources (no sync)

- Redux for component state
- URL for initial load only
- No bidirectional sync

## Decision

**Redux as source of truth with custom middleware for bidirectional sync**

### Architecture

```
User Action → Redux → Middleware → URL
    ↑                                ↓
    └─────── popstate event ─────────┘

Components read from Redux only (single source of truth)
```

### Sync Flow

**Redux → URL (via middleware):**

1. User clicks filter button
2. Redux action dispatched (`setFilter`)
3. Reducer updates Redux state
4. Middleware intercepts action
5. Middleware updates URL via `history.replaceState()`

**URL → Redux (via app initialization):**

1. App mounts, reads URL parameter
2. Dispatches `setFilter` action to Redux
3. User clicks browser back/forward
4. `popstate` event fires
5. Read URL, dispatch `setFilter` to Redux

## Rationale

### Why Redux-first approach?

**Custom middleware (Redux-first approach):**

- ✅ **Assignment requires Redux** - provides full Redux implementation
- ✅ Middleware pattern for side effects
- ✅ Testing best practices (pure functions)
- ✅ Full control over sync logic
- ✅ Works perfectly with RTK Query
- ❌ More code to maintain (~100 LOC)
- ❌ Manual bidirectional sync needed

**URL-first approach (nuqs):**

- ✅ Simpler, less code (~20 LOC vs ~100 LOC)
- ✅ URL is single source of truth (better pattern)
- ✅ Browser back/forward works automatically
- ❌ Assignment requires Redux for state management
- ❌ Doesn't utilize middleware capabilities

**Decision:** Use Redux-first to fulfill assignment requirements and demonstrate middleware knowledge.

## Consequences

### Positive

- ✅ Redux middleware pattern for side effects
- ✅ Testing best practices (pure functions)
- ✅ Full control over sync logic
- ✅ No external dependencies for state sync
- ✅ Works perfectly with RTK Query
- ✅ Browser back/forward support

### Negative

- ❌ More code than URL-first approach
- ❌ Manual bidirectional sync (Redux ↔ URL)
- ❌ Need to handle browser back/forward manually
- ❌ Potential edge cases with sync timing

### Neutral

- ⚪ In production app, would likely use nuqs for UI state
- ⚪ Assignment requires Redux - this fulfills that requirement
- ⚪ Can refactor to nuqs later if needed

## Implementation Approach

### File Structure

```
src/
  utils/
    url-sync.ts          # Pure functions (URL manipulation)
    url-sync.test.ts     # Unit tests (no mocking needed)
  middleware/
    url-sync.ts          # Middleware (side effects only)
    url-sync.test.ts     # Integration tests (minimal mocking)
```

### Pure Functions (utils/url-sync.ts)

**Function signatures:**

```typescript
// Add or update filter param in URL
export function addFilterToUrl(currentUrl: string, filter: FilterType): string;

// Extract filter from URL, default to 'all'
export function getFilterFromUrl(currentUrl: string): FilterType;
```

**Why pure functions:**

- Easy to test (no mocking)
- Deterministic (same input → same output)
- No side effects
- Can be used in middleware and components

### Middleware (middleware/url-sync.ts)

**Responsibilities:**

- Intercept `filters/setFilter` actions
- Read filter value from Redux state
- Update URL using `window.history.replaceState()`
- Use pure functions for URL manipulation

**Pattern:**

```typescript
export const urlSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action); // Let reducer run first

  if (action.type === "filters/setFilter") {
    // Read from Redux, update URL
    const filter = store.getState().filters.current;
    const newUrl = addFilterToUrl(window.location.href, filter);
    window.history.replaceState(null, "", newUrl);
  }

  return result;
};
```

### App Initialization (URL → Redux)

**Responsibilities:**

- Read filter from URL on mount
- Dispatch to Redux
- Listen for browser back/forward (`popstate`)
- Update Redux when URL changes

**Pattern:**

```typescript
useEffect(() => {
  // Initialize from URL
  const filter = getFilterFromUrl(window.location.href);
  dispatch(setFilter(filter));

  // Handle back/forward
  const handlePopState = () => {
    const filter = getFilterFromUrl(window.location.href);
    dispatch(setFilter(filter));
  };

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, []);
```

## Testing Strategy

### Unit Tests (Pure Functions)

**No mocking needed:**

- Test `addFilterToUrl()` with various inputs
- Test `getFilterFromUrl()` with valid/invalid filters
- Test edge cases (empty URL, existing params, etc.)
- Expected coverage: >95%

### Integration Tests (Middleware)

**Minimal mocking:**

- Mock `window.history.replaceState`
- Mock `window.location.href`
- Test middleware intercepts correct actions
- Test URL updates with correct values
- Expected coverage: ~80%

## Alternative for Production (Without Redux)

In a production app without Redux requirements, use URL-first approach:

```typescript
// Using nuqs - much simpler!
import { useQueryState, parseAsStringEnum } from 'nuqs'

function TodoFilters() {
  const [filter, setFilter] = useQueryState(
    'filter',
    parseAsStringEnum(['all', 'active', 'completed'])
      .withDefault('all')
  )

  // URL is source of truth, no sync needed!
  return <FilterButtons filter={filter} onChange={setFilter} />
}
```

**Benefits of nuqs:**

- ~80% less code
- URL is single source of truth
- Browser back/forward automatic
- No sync timing issues

## References

- [Redux Middleware Documentation](https://redux.js.org/tutorials/fundamentals/part-4-store#middleware)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [nuqs Documentation](https://nuqs.dev/) (alternative approach)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
