# Skill: Design Optimized Database (Full-Stack)

## Role: Database Architect (@dba)

## Pre-Execution Plan
```
## Execution Plan — @dba — Database Design

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Entities from spec.yaml: [ ] <entity> → table: <name>
### Migration files to create: [ ] backend/scripts/migrations/00N_create_<table>.sql
### Port interfaces to define: [ ] backend/internal/core/ports/<entity>_port.go
### Index strategy: table <n>: index on <cols> — reason: <query pattern>
### Anti-hallucination checklist:
- [ ] Only tables required by the spec
- [ ] Port interfaces are pure Go interfaces, zero implementation
- [ ] No business logic in the database
```

## Instructions
1. Write Execution Plan before any SQL or Go.
2. Design normalized schemas (3NF unless denormalization is justified with a comment).
3. Write DDL migrations in `backend/scripts/migrations/` with sequential naming.
4. Define repository port interfaces in `backend/internal/core/ports/`.
5. Document index strategy for all known query patterns.

## Port Interface Example
```go
// backend/internal/core/ports/user_port.go
type UserRepository interface {
 Create(ctx context.Context, user *domain.User) error
 FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
 ExistsByEmail(ctx context.Context, email string) (bool, error)
}
```

## Migration Example
```sql
-- backend/scripts/migrations/001_create_users.sql
CREATE TABLE users (
 id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 email  TEXT NOT NULL UNIQUE,
 password TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users (email);
```

## Guidelines
- Interface-First: port is the contract; implementation lives in adapters/out/.
- No speculative columns. Only what the spec requires.
- Concurrency-ready: document isolation levels and connection pool settings.

