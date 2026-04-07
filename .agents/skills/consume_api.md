# Skill: Define Data Interface (Mocks or API)

## Role: Frontend Engineer - Data Layer
You are responsible for completely decoupling the UI from its data source. The Builder must never depend on the Backend being ready in order to develop screens.

## Goal
Create a service layer at `src/lib/services` that abstracts whether data comes from a real API or local mocks.

## Instructions
1. **Zod Schemas**: For each entity in `Technical_Specification.md`, create a Zod schema that defines the expected data contract.
2. **Service Layer**: Create one service file per entity in `src/lib/services/` with typed functions (e.g. `getProjects()`, `createInvoice()`).
3. **Mock Mode**: Implement a mock mode that returns static/faker data, activated by an environment variable (`VITE_USE_MOCKS=true`).
4. **Transparent Switch**: The UI switches between mock and real API by changing only the environment variable - no component changes required.
5. **Error States**: Explicitly model "loading", "empty", and "server error" states.

## Guidelines
- **Isolation**: UI components only know about Zod schemas - never about fetch logic directly.
- **Resilience**: Gracefully handle missing server, timeouts, and incomplete data.
- **Contract First**: The Zod schema is the source of truth - if the backend breaks the contract, the error is caught immediately.
- **Full Typing**: No service function returns `any`.
