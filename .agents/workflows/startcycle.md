---
description: Start the Full-Stack Development Pipeline (Go 1.26 + SvelteKit)
---

When the user types `/startcycle <idea>`, follow this optimized sequential workflow using `.agents/agents.md`.

> All docs in `brain/` at monorepo root, YAML format.
> backend/ → Go 1.26 | frontend/ → SvelteKit + Svelte 5 | brain/ → All docs

When the user types `/startcycle <idea>`, execute this pipeline.

---

##  Execution Plan Protocol — MANDATORY FOR ALL AGENTS
Before touching any file, every agent outputs:
```
## Execution Plan — <AGENT> — <TASK or Stage>

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### What I will read: [ ] <file>
### What I will produce: [ ] <artifact>
### Steps: 1. ... 2. ...
### Anti-hallucination checklist:
- [ ] Not claiming files exist without verifying
- [ ] Not claiming tests pass without running them
- [ ] Not skipping acceptance criteria
- [ ] Surfacing blockers instead of inventing workarounds
```

##  Rejection Feedback Loop — MANDATORY FOR ALL REVIEWERS
When any reviewer issues REJECTED/VULNERABLE:
1. Stop. Do not advance the pipeline.
2. Send full report to the implementing engineer with prefix:
 ` REJECTED — TASK-XXX — Returned to @<engineer>. Fix all  and resubmit.`
3. Engineer acknowledges, writes fix plan, applies fixes, resubmits.
4. Reviewer re-runs the FULL audit — no shortcuts.
5. Repeat until APPROVED.

---

### Stage 1 — Specification
**Action**: Shift context and act as the `@pm`.
**Task**: Transform raw ideas into a clear, approved specification.
**Skill**: `write_specs`
**Deliverable**: `brain/spec.yaml` (approved: false)

`@pm` writes Execution Plan → clarifies requirements → writes spec.
> 🛑 GATE: explicit user approval required. Set approved: true then proceed.

### Stage 2 — Architecture & Design
**Action**: Shift context and act as the `@lead` and `@designer`.
**Task**: Define monorepo structure and produce the design system.
**Deliverables**: monorepo structure + `brain/design.yaml`

Both write Execution Plans first.
> 🛑 GATE: explicit design approval required before proceeding.

### Stage 3 — Task Decomposition
**Action**: Shift context and act as the `@assistant`.
**Task**: Convert the approved spec into a granular, ordered implementation plan.
**Skill**: `break_tasks`
**Deliverable**: `brain/tasks.yaml`

Writes Execution Plan. Tags every task [BE] or [FE]. Every [FE] task that consumes an endpoint depends on the [BE] task that implements it.

### Stage 4 — Database Architecture
**Action**: Shift context and act as the `@dba`.
**Task**: Design normalized schemas and define Go repository ports.
**Skill**: `design_database`
**Deliverable**: `backend/scripts/migrations/`, `backend/internal/core/ports/`

Writes Execution Plan listing every table and port before creating any file.

### Stage 5 — Backend Implementation Loop
For each [BE] task with status: "todo", in dependency order:

**A — Tests First**
**Action**: Shift context and act as the `@be-test-engineer`.
**Task**: Write TDD tests (unit + integration) for the current task.
**Skill**: `write_tests_go`
Writes Execution Plan mapping each criterion to a test case. Tests must compile and be red before handoff.

**B — Implementation**
**Action**: Shift context and act as the `@be-engineer`.
**Task**: Implement the logic to make the tests pass.
**Skill**: `generate_golang_code`
Writes Execution Plan. Implements until `go test -v -race ./...` is green.

**C — Architectural Review**
**Action**: Shift context and act as the `@be-arch-reviewer`.
**Task**: Audit the implementation for Hexagonal integrity and Go idioms.
**Skill**: `audit_go_code`
Writes Execution Plan.  If REJECTED → Rejection Feedback Loop to @be-engineer. If APPROVED → @be-qa.

**D — Quality Verification**
**Action**: Shift context and act as the `@be-qa`.
**Task**: Verify tests pass and coverage thresholds are met.
**Skill**: `verify_quality_go`
Writes Execution Plan.  If REJECTED → Rejection Feedback Loop to @be-engineer. If APPROVED → set status: "done".

> ⚠️ Never start the next [BE] task until current has status: "done".

### Stage 6 — API Contract (Hardest Gate)
**Action**: Shift context and act as the `@orchestrator`.
**Task**: Define the API surface contract and generate frontend services.
**Skill**: `orchestrator_fs`
**Deliverable**: `brain/api_contract.yaml` + `frontend/src/lib/services/`
Writes Execution Plan listing every endpoint. Only documents endpoints that are actually implemented.
> 🛑 GATE: `brain/api_contract.yaml` must be complete and reviewed by @lead before ANY [FE] implementation begins.

### Stage 7 — Frontend Implementation Loop
For each [FE] task with status: "todo", in dependency order:

**A — Tests First**
**Action**: Shift context and act as the `@fe-test-engineer`.
**Task**: Write UI tests (Vitest + Playwright) for the current task.
**Skill**: `write_tests_ui`
Writes Execution Plan. Verifies api_contract.yaml covers required endpoints — blocks and notifies @lead if not. All E2E tests run with VITE_USE_MOCKS=true.

**B — Implementation**
**Action**: Shift context and act as the `@fe-engineer`.
**Task**: Implement the UI logic to make the tests pass.
**Skill**: `build_sveltekit`
Writes Execution Plan. Implements until `npx vitest run && npx playwright test` pass.

**C — Architectural Review**
**Action**: Shift context and act as the `@fe-arch-reviewer`.
**Task**: Audit the implementation for Svelte 5 correctness and design compliance.
**Skill**: `audit_ui_code`
Writes Execution Plan.  If REJECTED → Rejection Feedback Loop to @fe-engineer. If APPROVED → @fe-qa.

**D — Quality Verification**
**Action**: Shift context and act as the `@fe-qa`.
**Task**: Verify all UI tests pass and accessibility is clean.
**Skill**: `verify_quality_ui`
Writes Execution Plan.  If REJECTED → Rejection Feedback Loop to @fe-engineer. If APPROVED → set status: "done".

> ⚠️ Never start the next [FE] task until current has status: "done".

### Stage 8 — Deployment
**Action**: Shift context and act as the `@devops`.
**Task**: Deliver a reproducible production environment for the full stack.
**Skills**: `deploy_go` + `deploy_sveltekit`
**Deliverable**: `backend/Dockerfile`, `frontend/Dockerfile`, root `docker-compose.yml`, `.env.example`, `Makefile`
Writes Execution Plan. `make up` starts full stack. Does not declare done until BOTH health checks pass.

---

## Pipeline Rules
- Execution Plan first — every agent, every task, no exceptions.
- Tests before implementation — in both squads.
- Rejection loops are mandatory — REJECTED always returns to the implementing engineer.
- Stage 6 is the hardest gate — no [FE] implementation without complete api_contract.yaml.
- All docs in brain/ in YAML format.
- Mock mode always available — frontend never blocks on a live backend.
