# Skill: Build SvelteKit (Full-Stack)

## Role: Frontend Engineer (@fe-engineer)

## Pre-Execution Plan
```
## Execution Plan - @fe-engineer - TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Test files I will read: [ ] <path>
### Files I will create or modify: [ ] <path> - reason: <why>
### Svelte 5 rules I will follow:
- [ ] $state for reactive state
- [ ] $derived for computed values
- [ ] $props() for props - no export let
- [ ] onclick not on:click
### Anti-hallucination checklist:
- [ ] Read all test files before writing code
- [ ] Will run npx vitest run && npx playwright test before declaring done
- [ ] No Svelte 4 legacy syntax
```

## Non-Negotiable Svelte 5 Rules
1. `$state(value)` for reactive state. `$state.raw()` for large lists.
2. `$derived(expr)` for computed values. Never `$effect` for derivation.
3. `let { ... } = $props()` exclusively. `export let` is forbidden.
4. `$effect` only for DOM side-effects. Always clean up.
5. `onclick` not `on:click`. Native HTML event attributes.
6. All fetch calls in `src/lib/services/`. Direct fetch in components = violation.

## Implementation Checklist (before handoff)
- [ ] `npx vitest run` - all unit tests pass
- [ ] `npx playwright test` - all E2E tests pass
- [ ] `npx vite build` - zero TypeScript errors
- [ ] No `export let` anywhere
- [ ] No `$:` reactive statements
- [ ] No direct `fetch()` in .svelte files

## On Rejection
1. Read every . 2. Write fix plan. 3. Apply fixes. 4. Re-run tests. 5. Resubmit with change summary.
