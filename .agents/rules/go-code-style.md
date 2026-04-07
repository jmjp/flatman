---
trigger: always_on
---

You are an expert AI programming assistant specializing in **Go 1.26 APIs with Hexagonal Architecture**.

### Brain Files (YAML)
The project uses YAML files in `brain/` for structured communication between agents:
- `brain/spec.yaml` — product spec (`approved: true` before any work begins)
- `brain/tasks.yaml` — task plan with status tracking (`todo → in_progress → in_review → done → blocked`)
- `brain/api_contract.yaml` — API surface contract

When reading a task, always check its `status` field. Only work on tasks with `status: "todo"` or `status: "in_progress"`.

---

### Mandatory Project Structure

```
.
.
├── cmd/api/main.go    │ Wiring, config, server startup
├── internal/
│   ├── adapters/
│   │   ├── in/     │ HTTP Handlers
│   │   └── out/    │ Repository implementations, external API clients
│   └── core/
│       ├── domain/    │ Entities, value objects, domain errors (zero external imports)
│       ├── ports/    │ Pure interfaces (primary & secondary)
│       └── services/   │ Application logic implementing primary ports
├── pkg/      │ Shared, framework-agnostic utilities
├── scripts/migrations/   │ DDL migration files
└── brain/      │ Spec, tasks, contract (YAML)
```

---

### Go 1.26 Mandates

1. **Iterators**: Use `iter.Seq` and `iter.Seq2` for collections and stream processing.
2. **slog**: Use `log/slog` for ALL logging. `fmt.Println` and external loggers are forbidden.
3. **ServeMux**: Use method-based routing — `mux.HandleFunc("POST /api/v1/users", handler)`.
4. **Context**: Every I/O or database function must accept `context.Context` as first parameter.
5. **Standard library only**: No third-party routing, logging, or assertion libraries.

---

### Hexagonal Architecture Rules

- **Dependency direction**: All dependencies point INWARD toward `core`.
- **Core purity**: `core/domain` must have ZERO external imports (standard library only).
- **Ports**: Define pure interfaces in `core/ports/`. No implementation logic.
- **Adapters**: Implement those interfaces in `adapters/out/`.
- **Violation**: If `core` imports anything from `adapters` → immediate architectural rejection by @arch-reviewer.

---

### Error Handling

- Define domain-specific errors in `core/domain/errors.go` (e.g., `ErrNotFound`, `ErrEmailAlreadyExists`).
- Wrap errors with `fmt.Errorf("layer: %w", err)` at every boundary.
- Use `errors.Is` and `errors.As` for checking. Never compare error strings.
- Never silently discard errors (`_ = err` requires an explicit justifying comment).

---

### Testing Standards

- **Unit Tests**: Test `core/services` with mocked repository ports (`testify/mock` or `mockery`).
- **Integration Tests**: Test `adapters/in` handlers with `httptest` and real/test DBs.
- **Table-driven**: All tests use `[]struct{ name, input, wantErr }` pattern.
- **Race-safe**: All tests must pass `go test -v -race ./...`.
- **Benchmarks**: Add `BenchmarkXxx` for performance-critical functions.
- **Coverage floors**: Services ≥ 80%, handlers ≥ 70%.

