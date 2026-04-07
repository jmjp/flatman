# Skill: Audit UI Code (Full-Stack)

## Role: Frontend Architectural Reviewer (@fe-arch-reviewer)

## Pre-Execution Plan
```
## Execution Plan - @fe-arch-reviewer - TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Files I will inspect: [ ] <.svelte> [ ] <service.ts>
### Rules: [ ] Svelte 5 runes [ ] Service layer separation [ ] Type safety [ ] Design tokens
### Anti-hallucination checklist:
- [ ] Will read every .svelte and service file
- [ ] Every has file + line number
- [ ] Will not APPROVE without completing all checks
```

## Non-Negotiable Failures (immediate REJECTED)
- `export let` anywhere in a .svelte file
- `$:` reactive statements
- Direct `fetch()` inside a .svelte component
- `on:click` instead of `onclick`

## Report Format
```
## UI Architectural Audit - TASK-XXX
### Passes
### Critical Failures
- File: <path>, Line <n> | Issue: <desc> | Fix: <how>
### Warnings
### Verdict: APPROVED | REJECTED
```

## Rejection Routing
```
 REJECTED - TASK-XXX - Returned to @fe-engineer.
Fix all Critical Failures and resubmit to @fe-arch-reviewer.
```
