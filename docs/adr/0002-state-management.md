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

## Implementation Notes

### Store Structure

```typescript
// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { todosApi } from "@/api/todos-api";
import { filterReducer } from "@/store/filter-slice";
import { urlSyncMiddleware } from "@/middleware/url-sync";

export const store = configureStore({
  reducer: {
    [todosApi.reducerPath]: todosApi.reducer,
    filters: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(todosApi.middleware).concat(urlSyncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### RTK Query API

```typescript
// api/todos-api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Schema } from "@effect/schema";
import { TodoSchema, TodosSchema } from "@/schemas/todo-schema";

export const todosApi = createApi({
  reducerPath: "todosApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Todo"],
  endpoints: (build) => ({
    getTodos: build.query({
      query: () => "/tasks",
      transformResponse: (response: unknown) => {
        return Schema.decodeUnknownSync(TodosSchema)(response);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Todo" as const, id })),
              { type: "Todo", id: "LIST" },
            ]
          : [{ type: "Todo", id: "LIST" }],
    }),
    createTodo: build.mutation({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      transformResponse: Schema.decodeUnknownSync(TodoSchema),
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),
    // ... other endpoints
  }),
});

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  // ... other hooks
} = todosApi;
```

### Redux Slice for Client State

```typescript
// store/filter-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FilterType = "all" | "active" | "completed";

interface FilterState {
  current: FilterType;
}

const initialState: FilterState = {
  current: "all",
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.current = action.payload;
    },
  },
});

export const { setFilter } = filterSlice.actions;
export const filterReducer = filterSlice.reducer;

// Selectors
export const selectCurrentFilter = (state: RootState) => state.filters.current;
```

### Usage in Components

```typescript
// components/todo-list.tsx
import { useGetTodosQuery } from '@/api/todos-api'
import { useAppSelector } from '@/store/hooks'
import { selectCurrentFilter } from '@/store/filter-slice'

export function TodoList() {
  const filter = useAppSelector(selectCurrentFilter)
  const { data: todos, isLoading, error } = useGetTodosQuery()

  const filteredTodos = todos?.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  return <div>{/* render filteredTodos */}</div>
}
```

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
