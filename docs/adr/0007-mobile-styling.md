# ADR-0007: Mobile-First Styling Strategy

**Status:** Accepted  
**Date:** 2025-10-24  
**Decision makers:** Vojtěch Boček
**Context:** Job Interview Todo List Assignment

## Context and Problem Statement

Assignment explicitly requires:

- _"App should display correctly on mobile devices"_
- _"Tested in latest Chrome"_
- _"Usability and approach to styling"_ are evaluation criteria

How should we implement responsive, mobile-friendly styling that demonstrates modern CSS practices?

## Considered Options

### CSS Frameworks

1. **Tailwind CSS 4** - Utility-first, mobile-first
2. **CSS Modules** - Scoped styles, traditional
3. **Styled Components** - CSS-in-JS
4. **Vanilla CSS** - No framework

### UI Component Libraries

1. **shadcn/ui** - Copy-paste components, Tailwind-based
2. **Radix UI** - Headless primitives (shadcn uses this)
3. **Material UI** - Complete component system
4. **None** - Build all components from scratch

## Decision

**Tailwind CSS 4 (alpha) + shadcn/ui with mobile-first approach**

### Mobile-First Approach

```
Design Breakpoints:
├── Mobile (default): 375px - 767px
├── Tablet: 768px - 1023px
└── Desktop: 1024px+

Development Flow:
1. Design for mobile first (default styles)
2. Add tablet adjustments (md: prefix)
3. Add desktop enhancements (lg: prefix)
```

## Rationale

### Why Tailwind CSS 4?

**Tailwind advantages:**

- ✅ **Mobile-first** - Default approach matches requirement
- ✅ **Utility-first** - Rapid development, no CSS files
- ✅ **Responsive** - Built-in breakpoint utilities
- ✅ **Consistent** - Design system through config
- ✅ **Performance** - Purges unused styles
- ✅ **DX** - IntelliSense support in VS Code

**v4 Specific:**

- ✅ **CSS-first config** - No JS config file needed
- ✅ **Oxide Engine** - Rust-based, very fast
- ✅ **Simpler setup** - `@import "tailwindcss"` in CSS
- ⚠️ **Alpha** - Stable enough for production use
- ⚠️ **Fallback** - Can use v3 patterns if issues

**vs. CSS Modules:**

- ❌ Require separate files
- ❌ Need custom responsive system
- ❌ More boilerplate for variants

**vs. Styled Components:**

- ❌ Runtime CSS-in-JS (performance cost)
- ❌ Heavier bundle size
- ❌ More complex responsive logic

### Why shadcn/ui?

**shadcn/ui advantages:**

- ✅ **Own the code** - Copy-paste, not npm dependency
- ✅ **Customizable** - Full control over components
- ✅ **Accessible** - WCAG-compliant, ARIA attributes
- ✅ **Tailwind-based** - Consistent with our stack
- ✅ **Radix UI** - Built on solid primitives
- ✅ **TypeScript** - Full type safety

**vs. Material UI:**

- ❌ MUI is heavy (~300KB+)
- ❌ MUI opinions hard to override
- ❌ Design language tied to Material Design
- ❌ Complex theme extension

**vs. Building from scratch:**

- ❌ Time-consuming for interview
- ❌ Accessibility is complex to get right
- ❌ Reinventing the wheel

### Why Mobile-First?

**Mobile-first advantages:**

- ✅ **Progressive enhancement** - Add features for larger screens
- ✅ **Performance** - Loads less CSS on mobile
- ✅ **Forces prioritization** - Essential features first
- ✅ **Modern standard** - Industry best practice
- ✅ **Assignment requirement** - Explicitly tested

## Consequences

### Positive

- ✅ Rapid development (Tailwind utilities)
- ✅ Consistent design (Tailwind config)
- ✅ Accessible components (shadcn/ui)
- ✅ Mobile-optimized by default
- ✅ Small bundle size (purged CSS)
- ✅ Modern, professional appearance

### Negative

- ❌ Tailwind 4 alpha has rough edges
- ❌ HTML can be verbose with utilities
- ❌ Learning curve for reviewers unfamiliar with Tailwind
- ❌ Tailwind in JSX can be harder to read

### Neutral

- ⚪ Can fall back to Tailwind v3 if v4 issues
- ⚪ CSS Modules backup if Tailwind rejected

## Implementation Approach

### Installation

```bash
pnpm add tailwindcss@next @tailwindcss/vite@next
pnpm add -D @tailwindcss/typography class-variance-authority clsx tailwind-merge
pnpm dlx shadcn@latest init
```

### Tailwind 4 Configuration (CSS-First)

**Vite plugin:**

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**CSS configuration (no tailwind.config.ts):**

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}
```

### Responsive Breakpoints

**Tailwind defaults:**

- `sm`: 640px - Small tablets
- `md`: 768px - Tablets
- `lg`: 1024px - Desktops
- `xl`: 1280px - Large desktops

**This project uses:**

- Mobile: default (< 768px)
- Tablet: `md:` prefix (768px - 1023px)
- Desktop: `lg:` prefix (1024px+)

### Mobile-First Pattern

```typescript
// Mobile-first responsive classes
<div className="
  p-3 text-base           // Mobile (default)
  md:p-4 md:text-sm       // Tablet (768px+)
  lg:p-6 lg:text-base     // Desktop (1024px+)
">
```

### Touch-Friendly Targets

**WCAG 2.1 Level AAA:**

- Minimum touch target: 44×44px
- Minimum spacing: 8px

**shadcn/ui button sizes:**

- `default`: 40px height (acceptable)
- `sm`: 36px height (small but usable)
- `lg`: 48px height (ideal for mobile)
- `icon`: 44×44px (WCAG compliant)

### Mobile Optimizations

**Prevent iOS zoom on input focus:**

```typescript
// Use font-size >= 16px on inputs
<Input className="text-base" /> // 16px minimum
```

**No hover states on mobile:**

```typescript
<Button className="
  active:scale-95         // Touch feedback
  lg:hover:bg-gray-100    // Hover only on desktop
">
```

**Safe areas for iOS notch:**

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Testing Strategy

**Chrome DevTools device emulation:**

- iPhone SE (375×667) - Smallest common mobile
- iPhone 14 Pro (393×852) - Modern mobile
- iPad (768×1024) - Tablet
- Desktop (1280×720+) - Desktop

**Performance testing:**

- Chrome DevTools Performance tab (not Lighthouse - SPA not suited)
- Network throttling (Fast 3G, Slow 3G)
- Frame rate monitoring (60fps target)

**Manual testing checklist:**

- [ ] All touch targets ≥44×44px
- [ ] No horizontal scroll on mobile
- [ ] Text readable without zoom (≥16px)
- [ ] Buttons easy to tap (not too close)
- [ ] Forms usable with touch keyboard
- [ ] Images scale properly
- [ ] No hover-dependent functionality

## Accessibility

**WCAG 2.1 Level AA Compliance (via shadcn/ui):**

- Semantic HTML
- Keyboard navigation support
- Focus indicators visible
- Color contrast ratios meet 4.5:1 minimum
- Touch target sizing meets guidelines
- Screen reader support via ARIA attributes

## Dark Mode Consideration

**Not implementing in MVP:**

- Browser extensions (Dark Reader) handle this well
- Architecture supports it via Tailwind's `@media (prefers-color-scheme: dark)`
- Can be added later with minimal changes

## Future Enhancements (Not in MVP)

- **Dark mode toggle:** Explicit implementation with user preference
- **Advanced animations:** Framer Motion for complex transitions
- **PWA support:** Manifest and service worker for installable app

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Mobile-First Design](https://www.lukew.com/ff/entry.asp?933)
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Responsive Web Design Best Practices](https://web.dev/responsive-web-design-basics/)
