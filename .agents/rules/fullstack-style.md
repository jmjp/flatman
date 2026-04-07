---
trigger: always_on
---

You are an expert assistant for a full-stack monorepo using **Go 1.26** (backend) and **SvelteKit + Svelte 5** (frontend).

### Monorepo Structure
```
/
/
├── backend/
│   ├── cmd/api/main.go
│   ├── internal/
│   │   ├── adapters/in/  │ HTTP Handlers
│   │   ├── adapters/out/  │ Repository implementations
│   │   └── core/
│   │       ├── domain/   │ Entities, errors (zero external imports)
│   │       ├── ports/   │ Pure interfaces
│   │       └── services/  │ Application logic
│   └── scripts/migrations/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── services/  │ Zod schemas + typed API functions
│   │   │   ├── components/
│   │   │   └── server/   │ Private server-only logic
│   │   └── routes/
│   └── svelte.config.js
└── brain/
    ├── spec.yaml    │ Product spec (approved: true before any work)
    ├── tasks.yaml    │ Task plan (status tracking)
    ├── api_contract.yaml  │ Handoff gate BE → FE
    └── design.yaml    │ Design system
```

---

### Brain YAML Status Lifecycle
Tasks in `brain/tasks.yaml` flow through these statuses — agents update them atomically:
```
todo → in_progress → in_review → done
     → blocked (with reason in notes)
```
- `@test-engineer` sets `in_progress` when starting tests.
- `@engineer` sets `in_progress` when starting implementation.
- `@arch-reviewer` sets `in_review` when reviewing.
- `@qa` sets `done` when APPROVED.
- Any agent sets `blocked` with a `notes` explanation when a dependency is unresolved.

---

### Backend Rules (Go 1.26)
- **Hexagonal Architecture**: All dependencies point inward. `core` has zero external imports.
- **Go 1.26**: Use `iter.Seq`/`iter.Seq2`, `log/slog`, method-based `ServeMux` (`"POST /api/v1/users"`).
- **Context**: Every I/O function accepts `context.Context` as first parameter.
- **Errors**: Wrap with `fmt.Errorf("...: %w", err)`. Domain errors in `core/domain/errors.go`.
- **No third-party for routing/logging**: Standard library only.
- **Tests**: Table-driven unit tests with mocked ports. Integration tests with `httptest`. Minimum 80% service coverage.

---

### Frontend Rules (Svelte 5 + SvelteKit)
- **Runes only**: `$state`, `$derived`, `$effect`, `$props`. Svelte 4 reactivity (`$:`, `let x = 0`) is **forbidden**.
- **Snippets**: `{@render snippet()}` instead of `<slot />`.
- **Events**: `onclick={handler}` instead of `on:click`.
- **Server-first**: Data in `+page.server.ts`. Mutations via `actions` + `use:enhance`. Secrets in `.server.ts` only.
- **Type safety**: All service functions use Zod-validated types. No `any`.
- **A11y**: Semantic HTML, ARIA attributes, sufficient contrast. Zero axe violations.
- **Tests**: Vitest for unit, Playwright for E2E. All E2E support `VITE_USE_MOCKS=true`.

---

### API Contract Rules
- `brain/api_contract.yaml` is the **single source of truth** — it must exist before `[FE]` implementation begins.
- All responses follow the standard envelope:
 - Success: `{ "data": <payload>, "meta": {...} }`
 - Error: `{ "error": { "code": "SCREAMING_SNAKE", "message": "..." } }`
- All endpoints versioned under `/api/v1/`.
- Zod schemas in `frontend/src/lib/services/` must match shapes in `brain/api_contract.yaml` exactly. Any mismatch = contract violation → block + notify @lead.

