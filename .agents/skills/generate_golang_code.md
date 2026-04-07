# Skill: Generate Go 1.26 Code (Full-Stack)

## Role: Backend Engineer (@be-engineer)

## Pre-Execution Plan
```
## Execution Plan - @be-engineer - TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Test files I will read: [ ] <path>
### Files I will create or modify: [ ] <path> - reason: <why>
### Acceptance criteria I will satisfy: [ ] "<criterion>"
### Anti-hallucination checklist:
- [ ] Read all test files before writing code
- [ ] Will run `go test -v -race ./...` before declaring done
- [ ] No acceptance criterion skipped
- [ ] No files outside defined project structure
```

## Non-Negotiable Go 1.26 Rules
1. **Iterators**: Use `iter.Seq` / `iter.Seq2` for collections.
2. **Logging**: `log/slog` only. No fmt.Println, no external loggers.
3. **HTTP Routing**: Method-based on `net/http.ServeMux`: `mux.HandleFunc("POST /v1/users", h)`.
4. **Hexagonal**: `core` has zero imports from `adapters` or external packages.
5. **Context**: Every I/O function takes `context.Context` as first param.
6. **Errors**: Wrap with `fmt.Errorf("...: %w", err)`. Domain errors in `internal/core/domain/errors.go`.

## Implementation Checklist (before handoff)
- [ ] `go build ./...` succeeds
- [ ] `go test -v -race ./...` green for this task's tests
- [ ] `go vet ./...` no warnings
- [ ] No imports from `adapters` in `core/`
- [ ] No `fmt.Println` - slog only

## On Rejection
1. Read every . 2. Write fix plan. 3. Apply fixes. 4. Re-run tests. 5. Resubmit with change summary.
