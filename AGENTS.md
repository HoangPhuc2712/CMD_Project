# CMD Web Report – Codex Working Guide

## Project Goal

Build a new CMD Website Report source that is separate from the old Internal Patrol Website Report. The UI direction should follow the Sakai PrimeVue dashboard style: clean left sidebar, topbar, rounded white cards, light gray page background, dashboard cards, and DataTable-based report pages.

This project currently uses mock login and mock data. Backend token/API behavior is not confirmed yet.

## Current Stack

- Vue 3 + TypeScript + Vite
- Vue Router
- Pinia
- PrimeVue v4
- PrimeIcons
- TailwindCSS v4
- Axios
- ExcelJS

## Development Rules

- Do not copy the whole Internal Patrol UI. This is a new CMD template.
- Reuse only suitable ideas/components from Internal Patrol when useful.
- Keep the UI visually close to Sakai PrimeVue: sidebar + topbar + card-based content.
- Do not introduce new packages unless explicitly requested.
- Do not rename existing files, components, functions, or routes unless needed for the requested change.
- Keep code modular and easy to replace with real APIs later.
- Prefer mock data modules under `src/mocks/` until backend endpoints are confirmed.
- Keep mock login in `src/stores/auth.store.ts` until backend authentication is finalized.
- When editing, return only modified or newly created files, not the entire project.

## Current Sidebar Menu

The CMD sidebar should contain:

- Dashboard
- Users
- Roles
- Areas
- Routes
- Reports

## Current Base Components

Base components are under `src/components/base/`.

### Button

- `BaseButton.vue`
- `BaseGroupButton.vue`

Supported behavior should cover:

- severity
- size
- label
- icon start / icon end
- outline / outlined
- raised
- rounded
- loading
- disabled
- class

### Input

- `BaseInput.vue`
- `BasePasswordInput.vue`
- `BaseInputNumber.vue`

Common behavior should cover:

- label
- severity
- placeholder
- size
- disabled
- invalid
- error message
- class

Extra behavior:

- `BasePasswordInput`: `toggleMask`
- `BaseInputNumber`: `prefix`, `suffix`, `showButtons`

### Feedback

- `BaseInlineMessage.vue`
- `BaseToast.vue`

Inline message should cover:

- icon
- severity
- variant: `outlined` or `simple`
- size

Toast should cover:

- position
- PrimeVue ToastService usage

### DataTable

- `BaseDataTable.vue`

Supported behavior should cover:

- grid lines
- size
- striped rows
- skeleton/loading state
- pagination
- toolbar slots
- filter display menu/row
- checkbox selection
- dynamic columns
- min-height / max-height

## Page Rules

### Login

- Keep login as mock login for now.
- Current default mock credential fields are prefilled for easier testing.
- Do not add real token logic yet unless backend behavior is confirmed.

### Reports

- Only one CMD report page is needed for the first template phase.
- Use mock data for now.
- Keep Excel export dynamic using `import('exceljs')` so ExcelJS does not load until export is clicked.
- More report pages should be added later only after CMD report flow is finalized.

## API Rules

- Use `src/services/http.ts` as the Axios instance.
- Do not hard-code real endpoints until backend confirms the API contract.
- When APIs are added later, keep payload mapping in service files rather than directly inside pages.

## UI Rules

- Keep layout responsive.
- Desktop: fixed left sidebar and sticky topbar.
- Tablet/mobile: sidebar opens as overlay.
- Use rounded cards, soft shadows, clear spacing, and light background.
- Avoid heavy custom CSS in pages; prefer shared layout classes in `src/assets/styles/`.
