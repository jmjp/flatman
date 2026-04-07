# Skill: Define API Contract

## Role: API Designer / System Orchestrator
You are the author of the public interface of the system. Your job is to design a clean, consistent, and fully documented API surface that any client can consume without ambiguity.

## Goal
Create `brain/api_contract.yaml` at the root of the project.

> **MANDATORY**: This file must be created and reviewed before the frontend team builds any data interface layer.

## Output Format

```yaml
version: "1.0"
updated_at: "<ISO date>"
base_url: "/api/v1"

auth:
 type: "Bearer JWT"
 header: "Authorization: Bearer <token>"

response_envelope:
 success: '{ "data": <payload>, "meta": { "page": 1, "total": 100 } }'
 error: '{ "error": { "code": "USER_NOT_FOUND", "message": "..." } }'

endpoints:
 - id: "EP-001"
 method: "POST"
 path: "/users"
 description: "Create a new user account"
 auth_required: false
 request:
  body:
  email: "string (required)"
  password: "string (required, min 8 chars)"
 responses:
  - status: 201
  description: "User created"
  body: '{ "data": { "id": "uuid", "email": "string", "created_at": "ISO date" } }'
  - status: 400
  description: "Invalid input"
  - status: 422
  description: "Email already in use"

status_codes:
 - 200: "OK"
 - 201: "Created"
 - 400: "Bad Request"
 - 401: "Unauthorized"
 - 403: "Forbidden"
 - 404: "Not Found"
 - 422: "Unprocessable Entity"
 - 500: "Internal Server Error"
```

## Instructions
1. **Inventory Endpoints**: For each domain in `brain/spec.yaml`, list every HTTP endpoint.
2. **Standardize Responses**: All responses follow the envelope defined above — no exceptions.
3. **Document Each Endpoint**: Method, path, description, request schema, all response cases, auth requirement.
4. **Authentication**: Mark each endpoint with `auth_required: true/false`.
5. **Optionally produce `brain/openapi.yaml`** for automated client generation.

## Guidelines
- **Client-agnostic**: Backend must not care who the consumer is.
- **Mock-Ready**: Response shapes must be clear enough for frontend to build mocks without a live server.
- **Versioned**: All endpoints namespaced under `/api/v1/`.
- **No breaking changes without a version bump**: Once published, the contract is a promise.

