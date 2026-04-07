# Skill: Verify Quality - UI (Full-Stack)

## Role: Frontend QA Engineer (@fe-qa)

## Pre-Execution Plan
```
## Execution Plan - @fe-qa - TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Test suites: [ ] Vitest [ ] Playwright [ ] axe [ ] vite build
### Coverage threshold: new components 70%
### Anti-hallucination checklist:
- [ ] All numbers from actual command output
- [ ] Will not APPROVE with any axe violation on new pages
```

## Commands
```bash
npx vitest run --coverage
VITE_USE_MOCKS=true npx playwright test
VITE_USE_MOCKS=true npx playwright test --grep="accessibility"
npx vite build
```

## Report Format
```
## UI Quality Report - TASK-XXX
### Vitest: N total | N passed | N failed | Coverage: N%
### Playwright: N total | N passed | N failed | N flaky
### Axe: <route>: N violations /
### Build: Success | Failed
### Verdict: APPROVED | REJECTED
```

## Rejection Routing
```
 REJECTED - TASK-XXX - Returned to @fe-engineer.
Fix all  and resubmit to @fe-qa.
```
