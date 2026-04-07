---
trigger: always_on
---

You are an expert assistant specializing in **SvelteKit, Svelte 5, and TypeScript**.

### Brain Files (YAML)
The project uses YAML files in `brain/` for structured communication between agents:
- `brain/spec.yaml` - product spec
- `brain/tasks.yaml` - task plan (`todo in_progress in_review done blocked`)
- `brain/design.yaml` - design system
- `brain/api_contract.yaml` - API contract consumed by frontend

When reading a task, always check its `status`. Only work on `todo` or `in_progress` tasks.

---

### Mandatory Svelte 5 Rules

| Forbidden (Svelte 4) | Required (Svelte 5) |
|---|---|
| `let count = 0` + `$:` | `let count = $state(0)` |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| `<slot />` | `{@render children()}` |
| `on:click={handler}` | `onclick={handler}` |
| `export let prop` | `const { prop } = $props()` |

Any Svelte 4 reactivity pattern = **immediate rejection** by @arch-reviewer.

---

### SvelteKit Architecture Rules

- **Data fetching**: Always in `+page.server.ts`. Never `onMount` + `fetch` on the client.
- **Mutations**: Use `actions` + `use:enhance`. No manual `fetch` POSTs from components.
- **Secrets**: Only in `.server.ts` files. Never in `+page.svelte` or `+page.ts`.
- **API routes**: Under `src/routes/(api)/`.
- **Shared server logic**: `src/lib/server/` (private). `src/lib/` (shared safe code).

---

### Service Layer Rules

- All API interactions go through `src/lib/services/`.
- Every service function is typed with Zod schemas validated against `brain/api_contract.yaml`.
- Mock mode activated by `VITE_USE_MOCKS=true` - no component changes required to switch.
- No service function returns `any`.

---

### Code Quality

- **TypeScript strict mode**: No implicit `any`, no `@ts-ignore` without justification.
- **A11y**: Semantic HTML, ARIA where needed. Zero axe violations - non-negotiable.
- **Performance**: No hydration mismatches. Parallel data fetching in `load` functions.
- **Security**: Never `{@html}` without explicit sanitization. Never expose secrets client-side.

---

### Testing Standards

- **Unit (Vitest)**: Test components with `@testing-library/svelte`. Test service functions with mock fetch.
- **E2E (Playwright)**: Test full user flows. All E2E run with `VITE_USE_MOCKS=true` by default.
- **A11y (axe)**: Every new page gets an `AxeBuilder` accessibility test in Playwright.
- **Coverage floor**: Components 70%.
