# ADR-0006: Error Handling & User Feedback Strategy

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

Assignment explicitly requires: _"Handle cases where the backend fails to perform an operation"_

Possible failure scenarios:

- Network errors (offline, timeout)
- Server errors (500, 503)
- Validation errors (400)
- Backend unavailable
- CORS issues

How should we handle errors and communicate them to users in a way that's helpful and non-disruptive?

## Considered Options

### Error Display

1. **Toast notifications** - Non-blocking popups for all feedback
2. **Inline errors** - Errors next to relevant UI elements
3. **Modal dialogs** - Blocking popups
4. **Banner notifications** - Persistent top/bottom placement
5. **Hybrid approach** - Inline errors + success toasts + offline banner

### Loading States

1. **Spinners** - Traditional loading indicators
2. **Skeleton screens** - Content placeholders
3. **Progress bars** - Determinate loading
4. **No indication** - ❌ Poor UX

### Toast Libraries

1. **shadcn Sonner** - Modern, animated, Radix-based
2. **react-hot-toast** - Simple, popular
3. **react-toastify** - Feature-rich, heavier

## Decision

**Hybrid approach: Inline errors + shadcn Sonner (success only) + skeleton loading**

### Error Display Strategy

| Error Type                            | Display Method     | Duration     | Retry Button |
| ------------------------------------- | ------------------ | ------------ | ------------ |
| Network errors (FETCH_ERROR, timeout) | Inline error state | Persistent   | Yes          |
| Server errors (500, 503)              | Inline error state | Persistent   | Yes          |
| Validation errors (400, 422)          | Inline error state | Persistent   | No           |
| Offline status                        | Top banner         | Until online | No           |
| Success actions                       | Toast (Sonner)     | 3 seconds    | N/A          |

### Loading State Strategy

**Skeleton screens with minimum display time:**

- Prevents flicker on fast networks
- Progressive disclosure (show content as it loads)
- Better perceived performance than spinners
- Implementation: Use timing library (e.g., @tanstack/pacer) or custom hook

### Architecture

```
┌─────────────────────────────────────────┐
│   Offline Banner (persistent, top)      │ ← Critical info
├─────────────────────────────────────────┤
│                                         │
│   ┌──────────────────────────────┐      │
│   │ Todo List                    │      │
│   │  [skeleton... skeleton...]   │ ← Loading
│   │                              │      │
│   │  [inline error: Try again]   │ ← Errors
│   └──────────────────────────────┘      │
│                                         │
└─────────────────────────────────────────┘

  [Success toast: Todo added! ✓]  ← 3s, bottom-right
```

## Rationale

### Why inline errors over toasts?

**Inline error advantages:**

- ✅ **Persistent** - User doesn't miss the error
- ✅ **Contextual** - Error appears where the problem is
- ✅ **Actionable** - Retry button next to error message
- ✅ **Less disruptive** - No popup blocking view
- ✅ **Better for screen readers** - Error in natural flow

**Toast disadvantages for errors:**

- ❌ Can be missed (dismisses automatically)
- ❌ Not contextual (appears in corner)
- ❌ Requires looking away from content

### Why toasts for success only?

**Success toast advantages:**

- ✅ **Non-disruptive confirmation** - User knows action succeeded
- ✅ **Auto-dismiss** - No action needed
- ✅ **Consistent location** - Expected feedback pattern
- ✅ **Brief duration** - 3s industry standard

**Don't need inline success:**

- State change is usually visible (todo appears/updates)
- Toast provides additional confirmation

### Why skeleton screens?

**Skeleton advantages over spinners:**

- ✅ **Better perceived performance** - Feels faster
- ✅ **Progressive disclosure** - Show layout immediately
- ✅ **Less jarring** - Smooth content → loaded transition
- ✅ **Modern standard** - Used by LinkedIn, Facebook, etc.

**Minimum display time:**

- Prevents flicker on fast connections
- Industry standard: 200-300ms threshold
- Implementation handles timing automatically

### Why shadcn Sonner?

**Sonner advantages:**

- ✅ **shadcn integration** - Consistent with our component library
- ✅ **Modern animations** - Smooth transitions
- ✅ **Radix-based** - Accessible by default
- ✅ **Lightweight** - ~3KB
- ✅ **Promise support** - Easy async integration

### Why top offline banner?

**Banner advantages:**

- ✅ **Critical information** - User needs to know immediately
- ✅ **Persistent** - Stays until resolved
- ✅ **Top placement** - Most noticeable position
- ✅ **Prevents confusion** - User knows why actions fail

## Consequences

### Positive

- ✅ Errors are persistent and contextual
- ✅ Users can't miss critical information
- ✅ Success feedback is unobtrusive
- ✅ Better perceived performance (skeletons)
- ✅ Clear retry mechanism for recoverable errors
- ✅ Accessible (inline errors in natural flow)

### Negative

- ❌ More complex than toast-only approach
- ❌ Requires skeleton components for each loading state
- ❌ Inline errors take up space in layout

### Neutral

- ⚪ Mix of patterns (inline + toast + banner) but each serves a purpose
- ⚪ Can add error logging service later (Sentry)

## Implementation Approach

### Error Classification

**Retryable errors (show retry button):**

- Network errors: `FETCH_ERROR`, `TIMEOUT_ERROR`
- Server errors: 5xx status codes

**Non-retryable errors (no retry button):**

- Client errors: 4xx status codes (user needs to fix input)
- Validation errors: 400, 422

**Utility functions needed:**

```typescript
isRetryableError(error: unknown): boolean
getErrorMessage(error: unknown): string
```

### Error Display Patterns

**Query errors (List/Read):**

- Replace content with inline error state
- Show retry button for retryable errors
- Full-width error message

**Mutation errors (Create/Update/Delete):**

- Display inline below action button
- User can re-submit form
- Small error text

**Offline state:**

- Persistent top banner
- Auto-resolves when back online
- Yellow warning color

**Success feedback:**

- Toast notification (bottom-right)
- 3 second duration
- Auto-dismiss

### Installation

```bash
pnpm dlx shadcn@latest add sonner
```

## Testing Strategy

**Test scenarios:**

- Inline error display for network failures
- Retry button shown for 5xx errors
- No retry button for 4xx errors
- Skeleton displays with minimum timing
- Offline banner appears/disappears
- Success toast displays and auto-dismisses

## Future Enhancements (Not in MVP)

- **Error logging:** Sentry for production error tracking
- **Retry logic:** Exponential backoff with RTK Query
- **Error analytics:** Track error frequency to identify issues

## References

- [shadcn Sonner](https://ui.shadcn.com/docs/components/sonner)
- [RTK Query Error Handling](https://redux-toolkit.js.org/rtk-query/usage/error-handling)
- [Skeleton Screens](https://www.lukew.com/ff/entry.asp?1797)
- [Error Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/)
