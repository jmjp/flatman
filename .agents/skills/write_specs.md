# Skill: Write Technical Specification (Full-Stack)

## Role: Product Manager (@pm)

## Pre-Execution Plan
```
## Execution Plan — @pm — Specification
### Context & Sandbox:
- [ ] Checked `brain/pm/tasks.yaml` for internal sub-tasks
- [ ] Initialized/Updated context in `brain/pm/context.yaml`
- [ ] Context Pruning: Cleared non-essential buffers
- [ ] Selective Reading: Reading only specified `context_files`
### Questions I still need answered: [ ] <question>
### Domains identified: <list>
### Screens identified: <list>
### Anti-hallucination checklist:
- [ ] No invented requirements
- [ ] open_decisions captures unknowns — no guesses
- [ ] Will wait for explicit approval before approved: true
```

## Output Format
```yaml
version: "1.0"
approved: false
updated_at: "<ISO date>"
product:
 name: "<name>"
 summary: "<2-3 sentences>"
 in_scope: ["<feature>"]
 out_of_scope: ["<exclusion>"]
stack:
 backend: "Go 1.26 / Hexagonal Architecture"
 frontend: "SvelteKit + Svelte 5 + TypeScript"
 database: "PostgreSQL"
 auth: "JWT Bearer"
user_stories:
 - persona: "<who>"
 action: "<what>"
 goal: "<why>"
entities:
 - name: "User"
 attributes: ["id: uuid", "email: string", "created_at: time.Time"]
api_endpoints:
 - method: "POST"
 path: "/api/v1/users"
 description: "<what it does>"
screens:
 - name: "<screen>"
 route: "/<path>"
 description: "<purpose>"
 data_needed: ["<entity or endpoint>"]
open_decisions:
 - "<unresolved choice>"
```

## Instructions
1. Write Execution Plan before producing the document.
2. Ask clarifying questions until requirements are clear.
3. Define in_scope and out_of_scope explicitly.
4. Every screen needs at least one user story.
5. Set approved: false — wait for explicit user approval.
6. **Handover Protocol**: Once approved, conclude by stating: `brain/spec.yaml is approved. Shifting context to @lead and @designer for monorepo and design system.`

## Guidelines
- No code. Documentation only.
- No invention. Every item comes from user discussions.
- Flag open decisions — never fill unknowns with guesses.

