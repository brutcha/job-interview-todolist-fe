# ADR-0002: State Management Architecture

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

The application needs to manage two types of state:

1. **Server state** - Todos from the backend API
2. **Client state** - UI state like filter selection

Assignment requires Redux usage to evaluate Redux skills. How should we structure state management to demonstrate best practices while keeping it maintainable?

## Considered Options

1. **Redux Toolkit (RTK) + RTK Query** - Modern Redux with built-in data fetching
2. **Redux + Redux Thunk** - Traditional approach with manual async handling
3. **Redux + Redux Saga** - Advanced async with generator functions
4. **Redux Toolkit + Axios** - RTK for state, separate HTTP library
5. **TanStack Query + Zustand** - Modern alternatives (not Redux)

## Decision

**Redux Toolkit 2.5+ with RTK Query**

### Architecture

```
State Management:
├── Server State (RTK Query)
│   ├── todos-api.ts - API definitions
│   ├── Automatic caching
│   ├── Automatic refetching
│   └── Loading/error states
│
└── Client State (Redux Slice)
    ├── filter-slice.ts - Filter selection
    ├── Synced with URL
    └── Managed by custom middleware
```

### Responsibilities

**RTK Query handles:**

- HTTP requests to backend
- Response caching
- Request deduplication
- Loading states
- Error handling
- Automatic refetching
- Cache invalidation

**Redux Slice handles:**

- Filter state (all/active/completed)
- Other UI state if needed

**Custom Middleware handles:**

- URL synchronization for filter state

## Rationale

### Why RTK Query over alternatives?

**vs. Redux Thunk:**

- ✅ Less boilerplate (no manual action creators)
- ✅ Built-in caching and loading states
- ✅ Automatic request deduplication
- ✅ Better TypeScript support

**vs. Redux Saga:**

- ✅ Simpler mental model (no generators)
- ✅ Less code to maintain
- ✅ Saga is overkill for this scope
- ✅ I would prefer a Effects for more complex async flow anyway
- ❌ Saga better for complex async flows (not needed here)

**vs. Redux + Axios:**

- ✅ No need for separate HTTP library
- ✅ RTK Query handles caching automatically
- ✅ Integrated with Redux DevTools
- ✅ Less manual state management

**vs. TanStack Query + Zustand:**

- ⚠️ Assignment requires Redux
- ✅ TanStack Query is excellent but doesn't demonstrate Redux skills
- ✅ This is about showing Redux competency

### Why Redux Toolkit?

- ✅ **Official Recommendation** - Redux team's recommended approach
- ✅ **Less Boilerplate** - Immer, createSlice reduce code
- ✅ **Built-in DevTools** - Time travel debugging
- ✅ **TypeScript First** - Excellent type inference
- ✅ **Modern Patterns** - Follows current best practices

### Why separate client state from server state?

- ✅ **Clear Separation** - Server data vs. UI state
- ✅ **RTK Query Optimized** - For server data management
- ✅ **Testability** - Pure reducers for client state
- ✅ **Performance** - RTK Query handles caching efficiently

## Consequences

### Positive

- ✅ Automatic caching reduces backend load
- ✅ Less code than traditional Redux
- ✅ Better DX with DevTools integration
- ✅ Strong TypeScript support
- ✅ Built-in loading/error states
- ✅ Automatic request deduplication

### Negative

- ❌ RTK Query is opinionated (less flexibility)
- ❌ Overkill for simple CRUD (but assignment requires Redux)

### Neutral

- ⚪ For production SPA, might use TanStack Query instead
- ⚪ Redux requirement is for demonstrating skills, not technical need

## Alternative Considered for Production

In a non-Redux-required project, I would use:

- **TanStack Query** for server state (better DX than RTK Query)
- **Zustand** or **URL state** for client state (simpler than Redux)

This decision prioritizes demonstrating Redux skills for interview evaluation while using the most modern Redux patterns available.

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Style Guide](https://redux.js.org/style-guide/)
- [RTK Query Comparison with other tools](https://redux-toolkit.js.org/rtk-query/comparison)
