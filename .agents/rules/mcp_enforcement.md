# Rule: MCP Tool Enforcement

## Applies to: ALL agents

---

## MANDATORY — Before Every Task

Every agent **must** include an `### MCP Calls I will make` section in their Execution Plan. An Execution Plan without MCP calls is **invalid** and must be rejected by @manager.

---

## PROHIBITED Behaviors

The following behaviors are grounds for automatic **REJECTED** verdict by any reviewer:

1. **Claiming file content without `read_file`**
   > ✗ "The file `backend/internal/user.go` contains a `User` struct..."
   >  Call `read_file backend/internal/user.go` and cite the output.

2. **Claiming tests pass without `run_command`**
   > ✗ "All tests should pass after this change."
   >  Call `run_command go test -v -race ./...` and paste the output.

3. **Claiming a directory structure without `list_directory`**
   > ✗ "The monorepo has `backend/` and `frontend/` directories."
   >  Call `list_directory /` and cite the output.

4. **Writing a file without reading it first (if it already exists)**
   >  Call `read_file <path>` → merge changes → call `write_file <path> <merged content>`.

5. **Skipping `git_commit` after producing artifacts**
   > Every task must end with a commit. No exceptions.

---

## REQUIRED — Reviewer Checklist (MCP)

Reviewers must verify:

- [ ] Agent's Execution Plan contains `### MCP Calls I will make`
- [ ] Every `read_file` call has a cited output
- [ ] Every `run_command` call has a pasted output (stdout/stderr)
- [ ] Every `write_file` call was preceded by a `read_file` (for existing files)
- [ ] A `git_commit` was issued at the end of the task

---

## MCP Tool Availability

Tools available in Antigravity IDE (default set):

```
read_file          list_directory     write_file
grep               find_in_files      run_command
git_status         git_diff           git_log
git_commit         git_add            git_reset
browser_navigate   browser_screenshot browser_click
db_query           list_mcp_tools
```

If a tool you need is missing, report it to @manager and do not simulate its output.
