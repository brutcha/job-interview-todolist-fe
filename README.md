# Todo List Application

**Job Interview Assignment**

Modern, type-safe todo list with React 19, Redux Toolkit, and TypeScript.

## Quick Start

```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server (http://localhost:5173)
pnpm test         # Run tests
pnpm build        # Build for production
```

## Features

- ✅ Add, edit, and delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Filter by status (all/active/completed)
- ✅ Bulk actions (complete all, delete completed)
- ✅ Mobile-responsive design
- ✅ Real-time sync with backend
- ✅ Error handling with retry
- ✅ Runtime validation of API responses
- ✅ URL state synchronization

## Technology Stack

- **React 19** with React Compiler (automatic memoization)
- **TypeScript 5.7+** for type safety
- **Redux Toolkit** with RTK Query for state management
- **Vite 6** for fast development and builds
- **Tailwind CSS 4** for styling
- **shadcn/ui** for accessible UI components
- **@effect/schema** for runtime validation
- **Vitest** for testing

## Documentation

### 📐 [Architecture](docs/ARCHITECTURE.md)

System overview, conventions, patterns, and performance strategy.

### 📝 [Architecture Decision Records](docs/adr/)

1. [Tech Stack](docs/adr/0001-tech-stack.md) - Why Vite, React 19, pnpm
2. [State Management](docs/adr/0002-state-management.md) - Redux Toolkit + RTK Query
3. [URL Synchronization](docs/adr/0003-url-sync.md) - Custom middleware
4. [Runtime Validation](docs/adr/0004-validation.md) - @effect/schema
5. [Testing Strategy](docs/adr/0005-testing.md) - Vitest + pure functions
6. [Error Handling](docs/adr/0006-error-handling.md) - Inline errors + skeletons
7. [Mobile Styling](docs/adr/0007-mobile-styling.md) - Tailwind 4 + mobile-first
8. [Scope & Workflow](docs/adr/0008-scope-future.md) - MVP + git workflow

### 📋 [Assignment](docs/ASSIGNMENT.md)

Original requirements.

## Development

### Prerequisites

- Node.js 22+ (LTS)
- pnpm 9+
- Backend API (see Backend section)

### Environment Setup

```env
# .env
VITE_API_BASE_URL=http://localhost:8080
```

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm dev:host         # Start with network access

# Testing
pnpm test             # Run tests once
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
pnpm test:ui          # Vitest UI

# Code Quality
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint (CI only)
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting

# Build
pnpm build            # Production build
pnpm preview          # Preview build locally
```

### Git Workflow

**Local checks (fast):**

- **Pre-commit:** Prettier only (~100ms)
- **Pre-push:** TypeScript (~2s)

**CI checks (comprehensive):**

- Prettier, ESLint, TypeScript, Tests, Build

**Commit convention:** [Conventional Commits](https://www.conventionalcommits.org/) (manual)

```
feat: add optimistic updates
fix: resolve filter sync
docs: update ADRs
```

**Future enhancements:**

- `commitlint` - When team grows
- Branch protection - When production
- Local ESLint - If team prefers

See [docs/adr/0008-scope-future.md](docs/adr/0008-scope-future.md) for details.

## Deployment

### GitHub Pages (Automated)

Deploys automatically on push to `main`.

**Live Demo:** `https://brutcha.github.io/job-interview-todolist-fe/`

**Limitations:**

- Requires public backend API (not `localhost:8080`)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Backend

**Development:** `http://localhost:8080` (configure via `.env`)  
**Production:** Public API URL (GitHub secret)

Compatible todo backend API required.

## Mobile Testing

**Tested breakpoints:**

- Mobile: 375px (iPhone SE) - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Chrome DevTools device emulation recommended.**
