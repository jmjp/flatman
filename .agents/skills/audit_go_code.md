# Skill: Audit Go Code - Architectural Review (Full-Stack)

## Role: Backend Architectural Reviewer (@be-arch-reviewer)

## Pre-Execution Plan
```
## Execution Plan - @be-arch-reviewer - TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Files I will inspect: [ ] <file>
### Rules I will apply:
- [ ] Hexagonal integrity
- [ ] Go 1.26 idioms
- [ ] Security
- [ ] Error handling
### Anti-hallucination checklist:
- [ ] Will read every file before issuing verdict
- [ ] Every will have file + line number
- [ ] Will not issue APPROVED without completing all checks
```

## Review Checklist
**Hexagonal**: `core` imports nothing from `adapters` - violation = immediate REJECTED.
**Go 1.26**: slog, iter.Seq, method routing, context as first param.
**Security**: No raw SQL interpolation, no hardcoded secrets, input validation before domain layer.
**Errors**: All wrapped with %w, no silent `_ = err`, domain errors in errors.go.
**Performance**: No goroutine leaks, no unbounded allocations in loops.

## Report Format
```
## Architectural Audit - TASK-XXX
### Passes
- <what is correct>
### Critical Failures (must fix)
- File: <path>, Line <n> | Issue: <desc> | Fix: <how>
### Warnings (non-blocking)
- File: <path>, Line <n> | Issue: <desc>
### Verdict: APPROVED | REJECTED
```

## Rejection Routing
```
 REJECTED - TASK-XXX - Returned to @be-engineer.
Fix all Critical Failures and resubmit to @be-arch-reviewer.
```
