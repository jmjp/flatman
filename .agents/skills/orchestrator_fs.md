# Skill: API Contract & Full-Stack Integration

## Role: System Orchestrator (@orchestrator)

## Pre-Execution Plan
```
## Execution Plan — @orchestrator — API Contract + FE Services

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Endpoints I will document (from implemented handlers): [ ] <METHOD> <path>
### Zod schemas I will generate: [ ] <entity>
### Service files I will create: [ ] frontend/src/lib/services/<entity>.service.ts
### Anti-hallucination checklist:
- [ ] Only document endpoints that are actually implemented in backend/
- [ ] Mock data will match Zod schemas exactly
- [ ] VITE_USE_MOCKS=true requires zero component changes to work
```

## Scope
- `brain/api_contract.yaml` definition.
- Zod schema generation in `frontend/src/lib/schemas/`.
- Typed service layer in `frontend/src/lib/services/`.
- Mock mode activated by `VITE_USE_MOCKS=true`.

## Instructions
1. Write Execution Plan.
2. Read implemented handlers in `backend/internal/adapters/in/http/`.
3. Write `brain/api_contract.yaml` with types and example payloads.
4. Generate Zod schemas for every API response.
5. Implement typed service functions using those schemas.
6. Ensure `VITE_USE_MOCKS=true` returns valid mock data without any network call.

## api_contract.yaml Format
```yaml
version: "1.0"
updated_at: "<ISO date>"
base_url: "/api/v1"
auth:
 type: "Bearer JWT"
 header: "Authorization: Bearer <token>"
response_envelope:
 success: '{ "data": <payload> }'
 error: '{ "error": { "code": "...", "message": "..." } }'
endpoints:
 - id: "EP-001"
 method: "POST"
 path: "/users"
 auth_required: false
 request:
  body:
  email: "string (required)"
  password: "string (required, min 8 chars)"
 responses:
  - status: 201
  body: '{ "data": { "id": "uuid", "email": "string" } }'
  - status: 422
  body: '{ "error": { "code": "EMAIL_IN_USE", "message": "..." } }'
```

## Service Example
```typescript
// frontend/src/lib/services/user.service.ts
import { z } from 'zod';

export const UserSchema = z.object({
 id: z.string().uuid(),
 email: z.string().email(),
});
export type User = z.infer<typeof UserSchema>;

const mockUsers: User[] = [{ id: '1', email: 'demo@example.com' }];

async function getUser(id: string): Promise<User | null> {
 if (import.meta.env.VITE_USE_MOCKS === 'true') {
 return mockUsers.find(u => u.id === id) ?? null;
 }
 const res = await fetch(`/api/v1/users/${id}`);
 if (!res.ok) return null;
 return UserSchema.parse(await res.json());
}

export const userService = { getUser };
```

## Guidelines
- Only document what is implemented. No speculative endpoints.
- Naming consistency: camelCase for JSON fields.
- All endpoints versioned under /api/v1/.

