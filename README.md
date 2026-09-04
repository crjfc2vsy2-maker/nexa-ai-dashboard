# Nexa AI — Concept Dashboard

A portfolio-quality concept for an AI-powered content workspace: a full
application-style SaaS dashboard, not a marketing page.

> **Nexa AI is a fictional product.** There is no backend, no real AI model,
> no accounts, and no billing behind this interface. Every number, name, and
> generated result is simulated client-side for demonstration. Built by
> Vladyslav as a portfolio piece.

## Overview

Nexa AI is pitched as an AI content workspace for creators, freelancers,
small teams, and agencies — create, organize, and analyze content in one
place. This build is the full application shell: sidebar navigation, a
top bar with global search and an account/notifications area, and eight
distinct views, all wired together with realistic (but clearly fictional)
interaction and demo data.

## Sections

Dashboard overview · Projects · AI Generator · Content History · Analytics ·
Templates · Notifications · Settings

- **Dashboard** — greeting, quick actions, usage stats with sparklines,
  recent projects, recent generations, content performance cards, an
  activity feed.
- **Projects** — search, status filter, sort, a cards/table view toggle,
  status tags, per-project quick actions, and a validated "Create project"
  modal.
- **AI Generator** — content type / tone / language selectors, a prompt
  field, a simulated generation with a loading state, a result panel with
  copy and regenerate, and a running history rail.
- **Content History** — every generation, searchable and filterable by
  type, with a detail modal.
- **Analytics** — a date-range control (7D/30D/90D), an Overview tab
  (usage trend line chart, content-mix donut chart, top content) and a
  Performance tab (views-by-project bar chart, metrics table).
- **Templates** — a browsable library filterable by category; "Use
  template" hands off into the generator pre-filled.
- **Notifications** — an all/unread filter, per-item toggling, and
  "mark all as read."
- **Settings** — Profile, Workspace (incl. the dark/light theme toggle),
  Notification preferences, and Plan & usage tabs.

## Design direction

Dark-first, neutral-leaning SaaS UI with one restrained accent (indigo),
Inter for UI text and JetBrains Mono for numbers/generated content. No
gradients-as-decoration, no neon. A working light theme is included
("theme-ready structure"), toggled from Settings → Workspace or the
account menu.

## Functional interactions

Responsive/off-canvas sidebar, mobile navigation, custom accessible
dropdowns (account menu, notifications, filters), tabs (Analytics,
Settings), a focus-trapped modal dialog, toast notifications, search +
filter UI (Projects, Content History), copy-to-clipboard, simulated AI
generation with loading/empty/success states, and form validation
(Create project, Generator prompt, Settings profile/email).

## Tech

- HTML, CSS, and vanilla JavaScript — no framework, no build step, no
  backend.
- Classic scripts (not ES modules) namespaced under a single `Nexa` global,
  loaded in dependency order — see `index.html`. Organized as:
  - `js/data.js` — all seed/demo data
  - `js/state.js` — the app's in-memory store + actions
  - `js/utils.js`, `js/icons.js`, `js/charts.js`, `js/ui.js` — shared
    helpers (formatting, hand-rolled SVG icons/charts, toasts/modal/tabs/
    dropdowns)
  - `js/views/*.js` — one module per section, each exposing
    `render()` / `mount()` / `handleAction()`
  - `js/app.js` — boots the shell, owns the hash router (`#/dashboard`,
    `#/projects`, …), and re-renders on state change
- Interactions use a single delegated click handler plus small per-view
  action maps, so views stay independent of each other.

## Run locally

Static site — open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Status

Concept / v1 — first pass in plain HTML/CSS/JS as scoped. A real product
would add a backend, persistence, and an actual model behind the
generator; the client-side architecture here (data → state → views) is
laid out so that swap is mostly additive.
