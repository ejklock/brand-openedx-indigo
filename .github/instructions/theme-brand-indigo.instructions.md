---
description: "Use when working on the OpenEdX Indigo brand theme: editing SCSS overrides, managing design tokens (JSON), building CSS, or understanding the Paragon theming pipeline. Covers build process, file structure rules, token naming conventions, !important policy, and critical constraints like the no-runtime-dependencies rule."
applyTo:
  [
    "paragon/**/*.scss",
    "paragon/tokens/**/*.json",
    "themes/**/*.scss",
    "paragon/build/**",
    "build/**",
  ]
---

# Indigo Brand OpenEdX Theme — Project Guidelines

## Build Pipeline (Critical)

The build has two sequential stages run by `make build` / `npm run build`:

1. `npm run build-tokens` — Compiles `.json` token files into CSS variable files under `paragon/build/`
2. `npm run build-scss` — Compiles SCSS using the generated token CSS files

**NEVER edit any file inside `paragon/build/` or the root `build/` folder — they are auto-generated and will be overwritten on the next build.**

```bash
npm run build-tokens    # Regenerate CSS vars from token JSON files
npm run build-scss      # Compile SCSS using generated tokens
npm run build           # Full pipeline: clean dist/ + both steps above
npm run build:watch     # Watch mode for development
npm run serve           # Serve generated theme CSS locally
```

## Where to Make Changes

| Type of Change                       | File to Edit                                          |
| ------------------------------------ | ----------------------------------------------------- |
| Color, spacing, elevation (light)    | `paragon/tokens/src/themes/light/color.json`          |
| Color, spacing, elevation (dark)     | `paragon/tokens/src/themes/dark/color.json`           |
| Dark theme elevation/shadows         | `paragon/tokens/src/themes/dark/elevation.json`       |
| Dark component tokens (Button, etc.) | `paragon/tokens/src/themes/dark/components/**/*.json` |
| SCSS custom variables                | `paragon/_variables.scss`                             |
| Global / component style overrides   | `paragon/_overrides.scss`                             |
| Dark utility classes                 | `themes/dark/_utilities.scss`                         |
| Dark extra overrides                 | `themes/dark/_extras.scss`                            |

> The light theme inherits more defaults from Paragon base; the dark theme requires explicit component token overrides.

## Design Token Naming Convention

Tokens follow the [Design Tokens Community Group spec](https://tr.designtokens.org/format/) with a `categoria.item.subitem.tipo.estado` hierarchy. The Paragon build tool converts them to CSS variables with the `--pgn-*` prefix:

```json
{
  "color": {
    "primary": {
      "base": { "$value": "#15376D" }
    }
  }
}
```

→ compiles to `--pgn-color-primary-base: #15376D`

Use token references (instead of hardcoded values) whenever possible to keep themes consistent:

```json
{ "$value": "{color.primary.base}" }
```

## CSS Variables in SCSS Overrides

Always prefer Paragon's CSS variables (`--pgn-*`) over hardcoded values when writing overrides. This ensures values adapt correctly when themes switch:

```scss
// Preferred — adapts to token value
background-color: var(--pgn-color-primary-base);
color: var(--pgn-color-text-light);

// Avoid — hardcoded values break theme switching
background-color: #15376d;
```

## Typography

- Font family: **Inter** (Google Fonts — weights: 400, 500, 600, 700, 800)
- Loaded in `paragon/_fonts.scss` via a single Google Fonts `@import`
- Applied globally in `paragon/_overrides.scss`
- Do not introduce other font families without discussing the design system impact first

## `!important` Policy

`!important` is used in `_overrides.scss` to override Paragon's third-party base styles (e.g., `font-family`, certain backgrounds). Add it **only when**:

1. Overriding a Paragon component style that cannot be targeted with a more specific selector
2. The override is intentional, justified, and clearly necessary

Do not add `!important` for custom component styles or local layout rules — explore more specific selectors first.

## Dependency Constraints (ADR-0002)

This package is a **pure asset directory** (CSS, SCSS, JSON, images). It must:

- Have **no runtime dependencies** — the package is consumed by JS, Python, and Ruby applications
- Only `devDependencies` are acceptable (e.g., `@openedx/paragon`, `nodemon`)
- Remain compatible with `@openedx/paragon ^23.0.0`

## Breaking Changes Policy (ADR-0003)

Follow the **"expand and contract"** pattern for any breaking change:

1. Add the new token or class while keeping the old one
2. Migrate all known consumers to the new one
3. Remove the old token or class in a future major release

Avoid removing or renaming tokens directly without this process.

## Entry Point

`paragon/core.scss` is the main SCSS entry point. Import order matters:

```scss
@use "~@openedx/paragon/styles/css/themes/light/abstraction-variables.css";
@import "./build/core/index.css"; // compiled tokens (auto-generated)
@import "./variables"; // custom SCSS variables
@import "./fonts"; // Inter font
@import "./overrides"; // component and global overrides
```

Do not reorder these imports without verifying cascade dependencies.
