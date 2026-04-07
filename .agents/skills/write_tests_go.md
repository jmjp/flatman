# Skill: Write Tests — Go (Full-Stack)

## Role: Backend Test Engineer (@be-test-engineer)

## Pre-Execution Plan
```
## Execution Plan — @be-test-engineer — TASK-XXX

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Criterion → test case mapping:
- "<criterion>" → "<test name>"
### Test files I will create: [ ] <path>_test.go
### Mocks needed: [ ] <interface>
### Anti-hallucination checklist:
- [ ] Every criterion has at least one test case
- [ ] Tests compile before handoff
- [ ] Tests are red (failing) before @be-engineer implements
```

## Unit Test Example
```go
func TestUserService_Create(t *testing.T) {
 tests := []struct {
  name string
  input domain.CreateUserInput
  mockFn func(*mocks.UserRepository)
  wantErr error
 }{
  {name: "success", input: domain.CreateUserInput{Email: "a@b.com", Password: "secret123"},
   mockFn: func(m *mocks.UserRepository) {
    m.On("ExistsByEmail", mock.Anything, "a@b.com").Return(false, nil)
    m.On("Create", mock.Anything, mock.AnythingOfType("*domain.User")).Return(nil)
   }, wantErr: nil},
  {name: "duplicate email", input: domain.CreateUserInput{Email: "a@b.com", Password: "secret123"},
   mockFn: func(m *mocks.UserRepository) {
    m.On("ExistsByEmail", mock.Anything, "a@b.com").Return(true, nil)
   }, wantErr: domain.ErrEmailAlreadyExists},
 }
 for _, tt := range tests {
  t.Run(tt.name, func(t *testing.T) {
   repo := mocks.NewUserRepository(t)
   tt.mockFn(repo)
   svc := services.NewUserService(repo)
   _, err := svc.Create(context.Background(), tt.input)
   assert.ErrorIs(t, err, tt.wantErr)
  })
 }
}
```

## Instructions
1. Write Execution Plan mapping every criterion to a test.
2. Write mocks with testify/mock for all port interfaces.
3. Verify tests compile: `go build ./...`
4. Verify tests are red: `go test ./...` must fail.
5. Update brain/tasks.yaml notes with test file paths.
6. **Handover Protocol**: Once tests are red, conclude by stating: ` Tests created and failing. Shifting context to @be-engineer for implementation.`

