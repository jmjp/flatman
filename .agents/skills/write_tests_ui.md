# Skill: Write Tests — UI (Full-Stack)

## Role: Frontend Test Engineer (@fe-test-engineer)

## Pre-Execution Plan
```
## Execution Plan — @fe-test-engineer — TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Criterion → test mapping:
- "<criterion>" → Vitest: "<name>" | Playwright: "<name>"
### Test files: [ ] src/lib/components/__tests__/<c>.test.ts [ ] tests/<f>.spec.ts
### A11y checks: [ ] <page>: axe scan
### Anti-hallucination checklist:
- [ ] api_contract.yaml covers all needed endpoints — blocked if not
- [ ] Tests compile before handoff
- [ ] Tests are red before @fe-engineer implements
- [ ] All E2E use VITE_USE_MOCKS=true
```

## Vitest Example
```typescript
import { render, screen } from '@testing-library/svelte';
import LoginForm from '../LoginForm.svelte';
describe('LoginForm', () => {
 it('renders email and password inputs', () => {
 render(LoginForm);
 expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
 });
 it('displays error when error prop provided', () => {
 render(LoginForm, { props: { error: 'Invalid credentials' } });
 expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
 });
});
```

## Playwright + A11y Example
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('login page has no a11y violations', async ({ page }) => {
 await page.goto('/login');
 const results = await new AxeBuilder({ page }).analyze();
 expect(results.violations).toHaveLength(0);
});
```

## Instructions
1. Write Execution Plan. Verify api_contract.yaml covers required endpoints — block if not.
2. Map every criterion to at least one test (happy path + error cases).
3. Include one axe scan per new page or major component.
4. All E2E tests run with VITE_USE_MOCKS=true.
5. Verify compile: `npx tsc --noEmit`. Verify red: `npx vitest run` fails.
6. **Handover Protocol**: Once tests are red, conclude by stating: ` UI tests created and failing. Shifting context to @fe-engineer for implementation.`

