# ADR-0004: Runtime Validation Strategy

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

TypeScript provides compile-time type safety, but cannot validate runtime data from external APIs.

**Problems without runtime validation:**

- Backend sends `{id: 123}` instead of `{id: "123"}` → Runtime error
- Backend adds unexpected fields → Silent bugs
- API contract changes → Cryptic errors deep in code
- `JSON.parse(badData)` → Type is `any`, compiler can't help

**Question:** How do we validate API responses at runtime while maintaining type safety?

## Considered Options

1. **@effect/schema** - Modern, powerful type inference
2. **Zod** - Industry standard, simpler
3. **io-ts** - Older, less ergonomic
4. **Yup** - Form-focused, not ideal for APIs
5. **Manual validation** - if/else checks, error-prone
6. **No validation** - ❌ Unacceptable

## Decision

**@effect/schema in RTK Query's `transformResponse`**

### Validation Points

```
API Response (unknown)
    ↓
RTK Query transformResponse
    ↓
@effect/schema validation
    ↓ (success)
Typed data → Redux cache
    ↓
Components (type-safe)

    ↓ (failure)
Error → RTK Query error state
    ↓
Error displayed to user
```

## Rationale

### Why @effect/schema?

**@effect/schema advantages:**

- ✅ **Better error messages** - Tree-structured, detailed paths
- ✅ **Type inference** - Bidirectional (schema ↔ types)
- ✅ **Effect ecosystem** - Future-proof for Effect adoption
- ✅ **Composability** - Better combinator library
- ✅ **OpenAPI validation** - Can validate against backend spec (future)

**Zod advantages:**

- ✅ **Industry standard** - More widely known
- ✅ **Simpler API** - Less learning curve
- ✅ **Larger ecosystem** - More third-party integrations
- ❌ **Less powerful** - Weaker type inference

**Decision:** @effect/schema provides better type safety and error messages compared to alternatives.

### Why in transformResponse?

RTK Query's `transformResponse` is the perfect place:

- ✅ **Early validation** - Before data enters Redux
- ✅ **Centralized** - One place for all API validation
- ✅ **Automatic error handling** - RTK Query catches thrown errors
- ✅ **Type safety** - Validated data typed correctly

## Consequences

### Positive

- ✅ **Runtime safety** - Catches API contract violations
- ✅ **Better errors** - Clear messages instead of undefined errors
- ✅ **Type inference** - Single source of truth (schema → types)
- ✅ **OpenAPI validation** - Can validate against backend spec (future)

### Negative

- ❌ **Learning curve** - Effect is less common than Zod
- ❌ **Bundle size** - ~15KB (Zod is ~10KB)
- ❌ **Less familiar** - Reviewers may not know Effect

### Neutral

- ⚪ Can swap to Zod if needed (similar API)
- ⚪ Form validation not included in MVP

## Implementation Approach

### Schema Definition

```typescript
// schemas/todo-schema.ts
import { Schema } from "@effect/schema";

export const TodoSchema = Schema.Struct({
  id: Schema.String.pipe(Schema.minLength(21)),
  text: Schema.String,
  completed: Schema.Boolean,
  createdDate: Schema.Number,
  completedDate: Schema.Number.pipe(Schema.optional),
});

export const TodosSchema = Schema.Array(TodoSchema);

// Type inference - no separate type definition needed!
export type Todo = Schema.Schema.Type<typeof TodoSchema>;
```

### RTK Query Integration

**Pattern:**

```typescript
// api/todos-api.ts
import { Schema } from "@effect/schema";

export const todosApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  endpoints: (build) => ({
    getTodos: build.query<Todo[], void>({
      query: () => "/tasks",

      // Validate response before caching
      transformResponse: (response: unknown) => {
        try {
          return Schema.decodeUnknownSync(TodosSchema)(response);
        } catch (error) {
          console.error("Validation error:", error);
          throw error; // RTK Query catches and sets error state
        }
      },
    }),

    createTodo: build.mutation<Todo, { text: string }>({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      transformResponse: (response: unknown) => {
        return Schema.decodeUnknownSync(TodoSchema)(response);
      },
    }),
  }),
});
```

### Error Handling

**Components receive validated data or error:**

```typescript
export function TodoList() {
  const { data: todos, error } = useGetTodosQuery()

  if (error) {
    // Could be validation error or network error
    return <ErrorMessage>Failed to load todos</ErrorMessage>
  }

  // todos is guaranteed to be Todo[] here
  return <div>{todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}</div>
}
```

### Validation Error Example

```typescript
// Backend sends: { id: 123, text: "Buy milk", completed: "yes" }
// Effect schema throws:

{
  message: "Expected Boolean, actual \"yes\"",
  path: ["completed"],
  errors: [{
    message: "Expected Boolean, actual \"yes\"",
    path: ["completed"]
  }]
}
```

**Without validation:**

```typescript
// Runtime error somewhere deep in code:
// "Cannot read property 'toLowerCase' of undefined"
// ^^^ Cryptic! Where did the type error originate?
```

## Testing Strategy

### Integration Tests

**Test RTK Query with validation:**

- Mock successful API responses
- Mock invalid API responses
- Verify validation errors surface correctly
- Verify validated data typed correctly

## Installation

```bash
pnpm add @effect/schema
```

## Future Enhancements (Not in MVP)

### Form Validation

```typescript
const CreateTodoFormSchema = Schema.Struct({
  text: Schema.String.pipe(
    Schema.minLength(1, { message: "Todo text is required" }),
    Schema.maxLength(200, { message: "Todo text too long" }),
  ),
});
```

### OpenAPI Schema Validation

Validate Effect schemas match backend OpenAPI spec:

```typescript
// Ensure frontend schema matches backend contract
// Catch breaking changes at build time
```

## Alternative for Production (If Needed)

If reviewers unfamiliar with Effect, can swap to Zod:

```typescript
// Similar API, more familiar library
import { z } from "zod";

const TodoSchema = z.object({
  id: z.string().min(21),
  text: z.string(),
  completed: z.boolean(),
  createdDate: z.number(),
  completedDate: z.number().optional(),
});

// Same transformResponse pattern
transformResponse: (response: unknown) => {
  return TodoSchema.parse(response);
};
```

## References

- [Effect Schema Documentation](https://effect.website/docs/schema/introduction)
- [RTK Query transformResponse](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#customizing-query-responses-with-transformresponse)
- [Runtime Validation in TypeScript](https://www.lloydatkinson.net/posts/2023/runtime-validation-in-typescript-zod-vs-typia/)
- [Zod Documentation](https://zod.dev/) (alternative)
