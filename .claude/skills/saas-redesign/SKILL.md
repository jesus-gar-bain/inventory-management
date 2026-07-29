---
name: saas-redesign
description: Redesign this app's UI into a modern SaaS-style interface with a left vertical navigation sidebar replacing the top nav bar, consistent spacing via design tokens, and a polished professional look. Use when asked to modernize, redesign, restyle, or "make the UI look like a real SaaS product", or to move navigation into a sidebar.
---

# SaaS Redesign

Converts the Factory Inventory Management client from its current top-nav layout to a modern SaaS shell: fixed vertical sidebar on the left, tokenized spacing/color scale, and consistently styled pages.

## Non-negotiable rules

1. **Delegate all `.vue` edits to the `vue-expert` subagent.** The root `CLAUDE.md` mandates this for any create-or-significantly-modify operation on a `.vue` file. This skill's phases are written as briefs you hand to `vue-expert`. Do not edit `.vue` files directly.
2. **Preserve behavior.** This is a visual redesign. Router paths, `useFilters` state, `useI18n` calls, API calls, props/emits, and modal wiring must work exactly as before. No logic rewrites.
3. **No emojis in UI, and no icon libraries.** Use inline SVG only — the codebase already does this (see `FilterBar.vue`, `Inventory.vue` search box). Match that style: 20x20 viewBox, `fill="currentColor"`.
4. **All nav labels go through i18n.** Never hardcode a nav string. Existing keys live in `client/src/locales/en.js` and `ja.js` under `nav.*`. If you need a new label, add the key to **both** locale files.
5. **Verify visually before reporting done.** Screenshots via Playwright MCP are the acceptance test. See Phase 4.

## The target shell

```
┌──────────┬────────────────────────────────────────┐
│          │  Page header (title + description)     │  ← per-view, unchanged markup
│ SIDEBAR  ├────────────────────────────────────────┤
│  240px   │  FilterBar (sticky, top: 0)            │
│  fixed   ├────────────────────────────────────────┤
│          │                                        │
│ logo     │  router-view content                   │
│ nav      │  (cards, tables, charts)               │
│  items   │                                        │
│          │                                        │
│ ───────  │                                        │
│ lang     │                                        │
│ profile  │                                        │
└──────────┴────────────────────────────────────────┘
```

Key structural changes from today's layout:
- `.app` flips from `flex-direction: column` to `flex-direction: row`.
- `LanguageSwitcher` and `ProfileMenu` move out of the header into a sidebar footer.
- `FilterBar`'s sticky offset changes from `top: 70px` to `top: 0` (no more 70px header above it).
- `.main-content`'s `max-width: 1600px; margin: 0 auto` is replaced by sidebar-offset padding — a centered max-width column inside an already-offset region reads as misaligned.

## Phase 1 — Design tokens

Before touching layout, establish the token scale in the **unscoped** `<style>` block of `client/src/App.vue` (that block is the app's global stylesheet — `.card`, `.stat-card`, `table`, `.badge` etc. all live there).

Add a `:root` block and refactor the existing global rules to consume it. Values below are derived from the current palette in `App.vue` — keep them, don't invent a new brand.

```css
:root {
  /* Surfaces */
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --bg-subtle: #f1f5f9;
  --bg-sidebar: #0f172a;

  /* Text */
  --text-primary: #0f172a;
  --text-body: #334155;
  --text-muted: #64748b;
  --text-on-dark: #e2e8f0;
  --text-on-dark-muted: #94a3b8;

  /* Borders */
  --border: #e2e8f0;
  --border-strong: #cbd5e1;
  --border-on-dark: #1e293b;

  /* Accent + status (already used across views) */
  --accent: #2563eb;
  --accent-subtle: #eff6ff;
  --success: #059669;
  --warning: #ea580c;
  --danger: #dc2626;

  /* Spacing — 4px base. Use these instead of ad-hoc rem values. */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-8: 3rem;

  /* Radii + elevation */
  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 10px 24px rgba(15, 23, 42, 0.08);

  /* Shell */
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 68px;
}
```

Then rewrite the existing global rules to reference tokens (`.card { background: var(--bg-surface); border-radius: var(--radius); ... }`). This is a mechanical substitution — the rendered result should be pixel-identical at this phase. That is the point: tokens land first and verifiably change nothing, so any visual diff in later phases is attributable to the layout work.

## Phase 2 — Sidebar component

Create `client/src/components/AppSidebar.vue`. Brief for `vue-expert`:

**Nav model** — derive from the actual routes in `client/src/main.js`. All six exist today; do not add or drop entries:

| Path | i18n key | Icon subject |
|---|---|---|
| `/` | `nav.overview` | grid / dashboard squares |
| `/inventory` | `nav.inventory` | boxes / archive |
| `/orders` | `nav.orders` | clipboard list |
| `/spending` | `nav.finance` | currency / chart |
| `/demand` | `nav.demandForecast` | trending-up line |
| `/reports` | `nav.reports` | document |

`nav.reports` does not exist yet — `App.vue` currently hardcodes `Reports`. Add `reports: 'Reports'` to `en.js` and the Japanese equivalent to `ja.js`, then use the key. This fixes an existing i18n gap.

Define the list as a data array in `setup()` and render with `v-for` keyed on `path` (never index — per project convention). Inline the SVG path strings in that array so the template stays declarative.

**Structure:**
- Brand block at top: `nav.companyName` as the primary line, `nav.subtitle` beneath it, small and muted. On the dark sidebar the current `.subtitle` border-left divider doesn't read well — stack them instead.
- Nav list in the middle, `flex: 1`.
- Footer block: `<LanguageSwitcher />` and `<ProfileMenu />`, separated by a `1px` top border in `--border-on-dark`. `ProfileMenu` must keep emitting `show-profile-details` and `show-tasks` — re-emit them from the sidebar so `App.vue` keeps its existing handlers.

**Active state** — use `router-link`'s built-in classes rather than the current `:class="{ active: $route.path === '/' }"` pattern. Pass `active-class` / `exact-active-class`; the `/` route needs exact matching or it stays active on every page. Styling: left accent rail (3px, `--accent`), `--accent-subtle` at low opacity for the background on dark, brighter text.

**Sidebar CSS:**
```css
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-on-dark);
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;   /* top/bottom 0, left 0 */
  z-index: 100;
  overflow-y: auto;
}
```
Because it's `position: fixed`, the content region needs `margin-left: var(--sidebar-width)` — the sidebar is out of flow and won't reserve space on its own. This is the single most common mistake in this conversion; if content slides under the sidebar, that margin is missing.

**Collapse toggle** — include one. Button at the bottom of the nav list toggles a `collapsed` ref; when set, the sidebar drops to `--sidebar-width-collapsed`, hides label text and the brand subtitle, and keeps icons centered. Persist to `localStorage` and read it back in `setup()` so the choice survives reload. The content region's `margin-left` must be bound reactively to the same state.

**Responsive** — under 900px viewport width, the sidebar should collapse to icons automatically. A full off-canvas drawer with a backdrop is out of scope unless the user asks.

## Phase 3 — Wire the shell in App.vue

Brief for `vue-expert`, editing `client/src/App.vue`:

Template becomes:
```vue
<div class="app">
  <AppSidebar
    @show-profile-details="showProfileDetails = true"
    @show-tasks="showTasks = true"
  />
  <div class="app-body">
    <FilterBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
  <!-- modals unchanged -->
</div>
```

Remove the entire `<header class="top-nav">` block and its CSS (`.top-nav`, `.nav-container`, `.logo`, `.subtitle`, `.nav-tabs` and descendants). Drop the now-unused `ProfileMenu` / `LanguageSwitcher` imports and `components` entries from `App.vue` — they belong to the sidebar now. **Keep** all the task logic (`tasks`, `addTask`, `deleteTask`, `toggleTask`, `loadTasks`, `onMounted`) and both modals exactly as they are.

Shell CSS:
```css
.app {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background: var(--bg-app);
}

.app-body {
  flex: 1;
  min-width: 0;                              /* lets tables scroll instead of forcing overflow */
  margin-left: var(--sidebar-width);         /* bind reactively to the collapse state */
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  padding: var(--space-5) var(--space-6);
}
```

`min-width: 0` matters: several views (`Inventory`, `Orders`, `Spending`) contain wide tables in `.table-container`. Without it the flex child refuses to shrink and the whole page gains a horizontal scrollbar.

Then update `client/src/components/FilterBar.vue`: sticky offset `top: 70px` → `top: 0`, and swap its hardcoded colors/spacing for tokens. Remove `max-width: 1600px; margin: 0 auto` from `.filters-container` so its left edge aligns with `.main-content`'s padding — use `padding: 0 var(--space-6)` to match.

## Phase 4 — Page-level consistency sweep

Now make the pages look like one product. Go view by view: `Dashboard.vue`, `Inventory.vue`, `Orders.vue`, `Spending.vue`, `Demand.vue`, `Reports.vue`, `Backlog.vue`.

For each, hand `vue-expert` this checklist:
- **Spacing** — replace ad-hoc `rem` values in scoped styles with `--space-*` tokens. Round to the nearest step rather than adding new ones.
- **Colors** — replace hex literals with tokens. Any hex that has no token is a signal: either it maps to an existing token or the design has drifted; prefer mapping.
- **Local duplicates** — a scoped `.card` / `.stat-card` / `.badge` that merely restates the global rule should be deleted so the global one applies. Only keep a scoped override that genuinely differs. `Inventory.vue` and `Reports.vue` are the two views that currently carry such top-level overrides — start there.
- **Card rhythm** — every `.card` gets the same padding and `margin-bottom`; section titles use `.card-title`; every card header uses the `.card-header` divider pattern.
- **Page header** — every view opens with `.page-header` containing `h2` + `p`, both i18n'd. All seven views already follow this; preserve it rather than restructuring.
- **Tables** — keep the global `table` styling; don't add per-view header colors.

Batch this: `Dashboard.vue` (1271 lines) and `Spending.vue` (852 lines) are large enough to warrant one `vue-expert` invocation each. The four smaller views can be grouped, but give the agent the explicit file list and this checklist verbatim so nothing is silently skipped.

Do **not** restyle chart internals (SVG geometry, scales, data mapping) in this phase. Chart colors should come from tokens, but if the user wants charts genuinely reworked, that's the `dataviz` skill's job — say so rather than improvising a palette here.

## Phase 5 — Verify

1. Start the servers (the `/start` skill does this if available; otherwise `cd server && uv run python main.py` and `cd client && npm run dev`).
2. Use **Playwright MCP tools** — `mcp__playwright__*`, per the project's tool rules — against `http://localhost:3000`.
3. Screenshot every route: `/`, `/inventory`, `/orders`, `/spending`, `/demand`, `/reports`.
4. Check, on each:
   - Sidebar is full-height, fixed, and content is not sliding beneath it.
   - Exactly one nav item is active, and it's the right one (verify `/` isn't active while on `/orders`).
   - FilterBar sits flush under the top with no 70px gap, and its left edge aligns with the page content.
   - No horizontal scrollbar on table-heavy views.
   - Collapse toggle works, content reflows, and the state survives a reload.
5. Exercise the preserved behavior: change a filter and confirm data updates; open the profile modal and the tasks modal; switch language via the sidebar and confirm nav labels translate.
6. Read the browser console for Vue warnings — unresolved components and missing-key warnings surface here after a shell refactor.

Report what you actually observed. If a screenshot shows a defect, fix it and re-verify rather than describing it as done.

## Failure modes seen in this conversion

| Symptom | Cause |
|---|---|
| Content underlaps sidebar | `position: fixed` sidebar without `margin-left` on `.app-body` |
| Horizontal scrollbar on Inventory/Orders | missing `min-width: 0` on the flex content child |
| Every nav item active at once | `router-link` without `exact-active-class` on the `/` route |
| Gap above FilterBar | `top: 70px` sticky offset left over from the removed header |
| Content visually off-center | leftover `max-width: 1600px; margin: 0 auto` inside the already-offset region |
| Profile/tasks modals stop opening | sidebar swallowed `ProfileMenu`'s emits instead of re-emitting them |
| Japanese UI shows English "Reports" | `nav.reports` added to `en.js` only |
