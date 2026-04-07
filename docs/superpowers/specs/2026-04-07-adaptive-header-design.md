# Adaptive Header — Design Spec

**Date:** 2026-04-07
**Status:** Approved

## Summary

Replace the inline `<header>` in `default.vue` with a responsive `AppHeader` component. On desktop the header is unchanged in behaviour but gains a new logo. On mobile the nav links are replaced by a hamburger that opens a full-screen overlay with a pinned Profile hero card and a scrollable nav list.

---

## Scope

- **In scope:** responsive header, mobile overlay, new logo, theme toggle placement
- **Out of scope:** context-aware header (hiding nav during gameplay), route-specific layouts

---

## Component Structure

**Single component:** `app/components/AppHeader.vue`

- Replaces the inline `<header>` block in `app/layouts/default.vue`
- `default.vue` change: remove `<header>…</header>`, add `<AppHeader />`
- Internal state: `isOpen` ref (`boolean`) — controls overlay visibility
- No new composable; no child component for the overlay (P2 is simple enough)
- Reuses existing `<ThemeToggle />` as-is in both desktop nav and overlay header

---

## Logo

A `<NuxtLink to="/">` containing:

- A `28×28` div: `bg-gradient` (primary-600 → primary-400), `rounded-xl`, displaying 🧠 emoji at `text-lg`
- `"Memojo"` wordmark: `font-bold text-surface-900 dark:text-surface-50`

Same markup on both breakpoints. Replaces the current plain text `NuxtLink`.

---

## Desktop Layout (≥ md / 768px)

```
[🧠 Memojo]    [Topics] [Daily] [Leaderboard] [Profile] [ThemeToggle]
```

- Existing nav links unchanged: `text-sm font-medium`, hover + dark variants
- Active route: `router-link-active` → `text-primary-600 dark:text-primary-400`
- `ThemeToggle` stays at the far right

---

## Mobile Layout (< md / 768px)

Header bar:

```
[🧠 Memojo]                                              [☰ hamburger]
```

- Nav links hidden (`hidden md:flex`)
- `ThemeToggle` hidden in header bar on mobile (lives inside overlay instead)
- Hamburger button: three-line SVG, `24×24`, `rounded-lg p-2 hover:bg-surface-200 dark:hover:bg-surface-700`

---

## Mobile Overlay

Triggered by hamburger. Mounts as `fixed inset-0 z-50 bg-surface-50 dark:bg-surface-900`.

**Structure (top → bottom):**

1. **Header bar** — same height as main header
   - Left: logo (`<NuxtLink to="/">`, closes overlay on click)
   - Right: `<ThemeToggle />` + close (`✕`) button

2. **Profile hero card** — full-width, accent gradient (`bg-primary-600` → `bg-primary-500`), `rounded-card`
   - 👤 emoji + "Profile" label (`font-bold`) + "Your stats & history" subtitle + chevron `›`
   - Navigates to `/profile`, closes overlay on tap

3. **Nav list** — `overflow-y-auto flex-1`, compact rows
   - Each row: emoji + label, full-width tap target, `py-4 px-6`
   - Current items: Daily (`📅`), Topics (`📚`), Leaderboard (`🏆`)
   - Active route: `router-link-active` → `text-primary-600 dark:text-primary-400`
   - Scalable: adding future items = appending to a `navLinks` array

**Transition:** fade (`opacity 0 → 1`, `150ms ease`)

---

## Behaviour

| Event                  | Action                                                       |
| ---------------------- | ------------------------------------------------------------ |
| Hamburger tap          | `isOpen = true`                                              |
| Close button / `✕` tap | `isOpen = false`                                             |
| Any nav link tap       | navigate + `isOpen = false`                                  |
| Logo tap (in overlay)  | navigate to `/` + `isOpen = false`                           |
| `Escape` key           | `isOpen = false`                                             |
| Overlay open           | lock body scroll (`document.body.style.overflow = 'hidden'`) |
| Overlay close          | restore body scroll                                          |

Scroll lock and `Escape` listener managed via `watch(isOpen, …)` + cleanup in `onUnmounted`.

---

## Accessibility

- Hamburger: `aria-label="Open menu"` / `"Close menu"` (dynamic on `isOpen`)
- Overlay: `role="dialog"`, `aria-modal="true"`, `aria-label="Navigation"`
- Focus: on open, focus moves to close button; `Escape` closes
- `<SkipToContent />` remains in `default.vue`, unaffected

---

## Files Changed

| File                                | Change                                        |
| ----------------------------------- | --------------------------------------------- |
| `app/components/AppHeader.vue`      | **New** — full component                      |
| `app/layouts/default.vue`           | Remove inline `<header>`, add `<AppHeader />` |
| `app/components/ui/ThemeToggle.vue` | No changes                                    |
