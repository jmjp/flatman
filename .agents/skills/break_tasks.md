# Skill: Break Down Full-Stack Tasks

## Role: PM Assistant (@assistant)

## Pre-Execution Plan
```
## Execution Plan — @assistant — Task Decomposition
### What I will read: [ ] brain/spec.yaml (approved: true confirmed)
### Context & Sandbox:
- [ ] Checked `brain/assistant/tasks.yaml` for internal sub-tasks
- [ ] Initialized/Updated context in `brain/assistant/context.yaml`
- [ ] Context Pruning: Cleared non-essential buffers
- [ ] Selective Reading: Reading only specified `context_files`
### BE domains → tasks: <list>
### FE screens → tasks: <list>
### Layer order: Domain → Ports → Repo → Service → Handler (BE) | Service → Components → Pages → Routes (FE)
### Anti-hallucination checklist:
- [ ] Every task traces to a spec item
- [ ] All depends_on IDs exist in this file
- [ ] Every @engineer task has a paired @test-engineer task
- [ ] Every [FE] task consuming an endpoint depends on its [BE] task
```

## Dependency & Parallelism Rules

These rules govern how `depends_on` is used and how multiple agents can work in parallel:

1. **`depends_on: []` means parallelizable** — Any task with an empty `depends_on` list can be started immediately. Multiple agents may work on these simultaneously.
2. **`depends_on: ["TASK-XXX"]` means blocked** — A task may only begin when ALL listed dependency IDs have `status: "done"`. Agents must check this before starting.
3. **The API Gate is inviolable** — Every `[FE]` task that consumes a specific BE endpoint MUST list the corresponding `[BE]` handler task in its `depends_on`. No exceptions.
4. **BE/FE squads run in parallel by default** — Tasks with no cross-squad dependencies can be worked on simultaneously by different agents.
5. **Status lifecycle** — An agent MUST update task status:
   - `todo` → `in_progress` when starting
   - `in_progress` → `done` when completed and verified
   - `in_progress` → `blocked` if a dependency is not yet done
6. **No dangling references** — Every ID in `depends_on` must exist in the same file.

## Output Format
```yaml
version: "1.0"
project: "<name>"
updated_at: "<ISO date>"
tasks:
  - id: "TASK-001"
    name: "Write tests for User domain"
    agent: "@be-test-engineer"
    squad: "BE"
    status: "todo"
    depends_on: []            # no dependencies: start immediately
    acceptance_criteria:
      - "User struct has ID, Email, CreatedAt"
      - "ErrUserNotFound defined in domain/errors.go"
    notes: ""

  - id: "TASK-002"
    name: "Implement User domain"
    agent: "@be-engineer"
    squad: "BE"
    status: "todo"
    depends_on: ["TASK-001"]  # blocked: wait for TASK-001
    acceptance_criteria:
      - "go test ./... passes for domain tests"
    notes: ""

  - id: "TASK-010"
    name: "Write tests for LoginForm"
    agent: "@fe-test-engineer"
    squad: "FE"
    status: "todo"
    depends_on: []            # no BE dependency: FE tests can start in parallel
    acceptance_criteria:
      - "Form renders email and password inputs"
      - "Error prop displayed in role=alert"
    notes: ""

  - id: "TASK-011"
    name: "Implement LoginForm"
    agent: "@fe-engineer"
    squad: "FE"
    status: "todo"
    depends_on: ["TASK-010", "TASK-005"]  # TASK-005 = POST /auth/login BE handler
    acceptance_criteria:
      - "Form submits via use:enhance"
      - "Error displayed in role=alert"
    notes: ""

  # TASK-001 and TASK-010 have no dependencies → BE and FE agents can start simultaneously
  # TASK-011 is blocked until both TASK-010 (FE tests) and TASK-005 (BE endpoint) are done
```

## Instructions
1. Write Execution Plan. Verify brain/spec.yaml has approved: true.
2. Tag every task with `squad: BE` or `squad: FE`.
3. Backend layer order: Domain → Ports → Repository → Service → Handler.
4. Frontend layer order: Service Layer → Components → Pages → Routes.
5. The API gate is inviolable: any `[FE]` task consuming a specific endpoint must depend on the `[BE]` task that implements it.
6. Test tasks have no implementation dependencies. Implementation tasks depend on their test tasks.
7. **Identify parallel groups**: After writing all tasks, add a comment block listing which tasks can run simultaneously.
8. **Handover Protocol**: Once finished, conclude by stating: `brain/tasks.yaml is ready. Shifting context to @dba for database design.`

## Guidelines
- Atomicity: one entity, one method, or one component per task.
- MVP-first: build a working vertical slice before adding breadth.
- No orphan tasks: every task traces to the spec.
