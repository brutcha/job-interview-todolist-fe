# ADR-0001: Technology Stack Selection

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček  
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

Need to select a technology stack for a todo list application that:

- Meets assignment requirements (TypeScript, React, Redux)
- Enables rapid development
- Demonstrates modern best practices
- Works well for single-page application
- Supports mobile-responsive design

Which build tool, package manager, and supporting libraries should be used?

## Considered Options

### Build Tools

1. **Vite** - Modern, fast, ESM-native
2. **Create React App** - Traditional, webpack-based
3. **Next.js** - Full-featured framework with SSR
4. **Remix** - Modern framework with nested routing
5. **Expo** - Full-featured framework with React-Native and SSR support

### Package Managers

1. **pnpm** - Fast, disk-efficient, strict
2. **npm** - Default, widely supported
3. **yarn** - Popular alternative
4. **bun** - Newest, fastest (experimental)

### React Version

1. **React 19** - Latest, includes compiler
2. **React 18** - Stable, widely adopted

## Decision

**Selected Stack:**

### Core

- **Build Tool:** Vite 6.x
- **Package Manager:** pnpm 9.x
- **React:** React 19 (latest)
- **TypeScript:** 5.7+ (latest)
- **State Management:** Redux Toolkit 2.5+ with RTK Query

### Styling

- **CSS Framework:** Tailwind CSS 4.x (alpha)
- **UI Components:** shadcn/ui
- **Icons:** lucide-react

### Validation & Schemas

- **Runtime Validation:** @effect/schema 0.77+
- **Type Generation:** TypeScript inference from Effect schemas

### Testing

- **Test Runner:** Vitest 4.x
- **Testing Library:** @testing-library/react
- **Assertion Library:** Vitest built-in

### Developer Experience

- **Linting:** ESLint + typescript-eslint + eslint-plugin-react
- **Formatting:** Prettier
- **Git Hooks:** husky + lint-staged

## Rationale

### Why Vite?

- ✅ **Fast HMR** - Instant feedback during development
- ✅ **Modern** - Built for ESM, works with latest tools
- ✅ **Simple** - Minimal configuration needed
- ✅ **React 19 Support** - First-class support for React Compiler
- ✅ **Small Scope** - Perfect for SPA without routing complexity
- ❌ No SSR needed for this assignment
- ❌ Next.js/Remix/Expo would be overkill

### Why pnpm?

- ✅ **Fast** - Faster than npm/yarn, competitive with bun
- ✅ **Disk Efficient** - Symlinks prevent duplication
- ✅ **Strict** - Enforces proper dependency declarations
- ✅ **Production Ready** - Used by major companies
- ❌ bun is too experimental for interview context

### Why React 19?

- ✅ **React Compiler** - Automatic memoization (no manual React.memo)
- ✅ **Latest Features** - use(), useOptimistic (future use)
- ✅ **Performance** - Built-in optimizations
- ⚠️ Note: Assignment doesn't specify version, so latest is acceptable

### Why Tailwind CSS 4?

- ✅ **Mobile-First** - Assignment requires mobile support
- ✅ **Rapid Development** - No CSS files to maintain
- ✅ **Responsive** - Built-in breakpoint utilities
- ✅ **Customizable** - Can match any design
- ✅ **v4 Alpha** - Stable enough for production
- ⚠️ Alpha version risk mitigated by using stable v3 fallback patterns

### Why shadcn/ui?

- ✅ **Copy-Paste** - Own the code, not an npm dependency
- ✅ **Accessible** - WCAG-compliant components
- ✅ **Customizable** - Tailwind-based, easy to modify
- ✅ **TypeScript** - Full type safety
- ✅ **Modern** - Uses Radix UI primitives

### Why @effect/schema?

- ✅ **Runtime Safety** - Validates API responses
- ✅ **Type Inference** - Types derived from schemas (DRY)
- ✅ **Better Errors** - Tree-structured error messages
- ✅ **OpenAPI Validation** - Can validate schemas against backend OpenAPI spec
- ✅ **Modern Patterns** - Effect platform provides robust error handling
- ⚠️ More complex than Zod, but provides better type safety

### Why Vitest?

- ✅ **Vite Native** - Same config as build tool
- ✅ **Fast** - Parallel execution, ESM-native
- ✅ **Compatible** - Jest-like API, easy migration
- ✅ **Modern** - Built for current ecosystem

## Consequences

### Positive

- ✅ Fast development experience (Vite HMR)
- ✅ Modern tooling for forward thinking implementation
- ✅ Automatic performance optimization (React Compiler)
- ✅ Small bundle size from tree-shaking
- ✅ Strong type safety (TypeScript + Effect Schema)
- ✅ Mobile-responsive by default (Tailwind)
- ✅ Production-ready stack

### Negative

- ❌ React 19 is brand new and untested
- ❌ Tailwind 4 alpha has some rough edges
- ❌ Effect Schema has learning curve (less common than Zod)
- ❌ pnpm not as universal as npm

### Neutral

- ⚪ Tailwind 4 will release stable soon
- ⚪ React 19 compiler is optional (can disable if issues)
- ⚪ Effect Schema can be swapped for Zod if needed

## Implementation Notes

### Alternative if React 19 Issues Arise

If environment doesn't support React 19:

- Fallback to React 18.3
- Remove React Compiler plugin
- Use manual memoization (React.memo, useMemo, useCallback)
- Core functionality remains the same

## References

- [Vite Documentation](https://vitejs.dev/)
- [pnpm Documentation](https://pnpm.io/)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [Tailwind CSS v4 Alpha](https://tailwindcss.com/docs/v4-beta)
- [Effect Schema Documentation](https://effect.website/docs/schema/introduction)
