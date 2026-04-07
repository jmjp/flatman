# Skill: Verify Quality - Go (Full-Stack)

## Role: Backend QA Engineer (@be-qa)

## Pre-Execution Plan
```
## Execution Plan - @be-qa - TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Test suites to run: [ ] go test -v -race ./...
### Coverage thresholds: core/services 80%, adapters/in 70%
### Anti-hallucination checklist:
- [ ] All numbers from actual command output
- [ ] Will not declare APPROVED without thresholds met
```

## Commands
```bash
go test -v -race -count=1 ./...
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
go test -bench=. -benchmem ./...
```

## Report Format
```
## Quality Report - TASK-XXX
### Test Results: N total | N passed | N failed
### Coverage: internal/core/services: N% / | internal/adapters/in: N% /
### Race Conditions: None | Found
### Verdict: APPROVED | REJECTED
```

## Rejection Routing
```
 REJECTED - TASK-XXX - Returned to @be-engineer.
Fix all  and resubmit to @be-qa.
```
