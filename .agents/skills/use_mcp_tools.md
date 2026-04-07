# Skill: use_mcp_tools

## Purpose
Standardized protocol for agents to discover and invoke MCP tools available in the Antigravity IDE environment. Apply this skill whenever you need to read files, run commands, search code, or interact with git — do not guess file contents or command outputs.

---

## Step 1 — Discover Available Tools

At the start of every session, call:
```
list_mcp_tools
```
This returns the full list of tools registered in the current Antigravity MCP server. Cache this list for the session. Do not assume a tool exists until it appears in this list.

---

## Step 2 — Tool Selection Heuristics

| Intent | Preferred Tool | Notes |
|---|---|---|
| Read a file | `read_file <path>` | Always prefer over grep for full content |
| List a directory | `list_directory <path>` | Use before read_file when path is uncertain |
| Search code | `grep <pattern> <path>` | Use for targeted pattern searches |
| Run a command | `run_command <cmd>` | Use for tests, builds, linters |
| Write a file | `write_file <path> <content>` | Always include full file content |
| Git status | `git_status` | Inspect staged/unstaged changes |
| Git diff | `git_diff [<ref>]` | Scope review to recent changes |
| Git commit | `git_commit -m "<msg>"` | Commit after all files are written |
| DB query | `db_query <sql>` | Only in backend/DB-aware contexts |
| Browser check | `browser_navigate <url>` | Only for UI/E2E validation |

---

## Step 3 — Required Invocation Pattern

Every MCP tool call must follow this format in your Execution Plan:

```
### MCP Calls I will make
- [ ] read_file: backend/internal/domain/user.go
- [ ] run_command: go test -v -race ./...
- [ ] write_file: backend/internal/domain/user_impl.go
- [ ] git_commit: -m "feat(auth): implement user domain"
```

After each call, record the result inline:
```
 read_file backend/internal/domain/user.go — 42 lines, User struct found
 run_command go test -v -race ./... — 3 tests PASS
✗  write_file backend/... — permission denied → surface blocker to @manager
```

---

## Step 4 — Error Handling

| Error Type | Required Action |
|---|---|
| File not found | Do NOT invent the file. Report: `BLOCKER: <path> does not exist` |
| Command fails | Report full stderr. Do not claim success. |
| Tool not available | Report: `MCP tool <name> is not registered in this session` |
| Permission denied | Escalate to @manager or @devops |

---

## Step 5 — Anti-Patterns (Never Do These)

- ❌ `// I assume this file contains...` — always call `read_file` instead
- ❌ `// Tests should pass because...` — always call `run_command` instead
- ❌ `// The directory structure is...` — always call `list_directory` instead
- ❌ Calling a tool and ignoring the output — always log the result
- ❌ Calling `write_file` on an existing file without first calling `read_file` to check current content

---

## Step 6 — Commit Convention

After producing all files for a task, commit using:
```
git_commit -m "<type>(<scope>): <description>"
```

Types: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`  
Examples:
- `feat(auth): add JWT refresh endpoint`
- `test(user): add unit tests for user domain`
- `fix(fe): correct form validation in LoginPage`
