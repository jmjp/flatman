# Skill: Deploy SvelteKit (Full-Stack)

## Role: Infrastructure Lead (@devops - Frontend)

## Pre-Execution Plan
```
## Execution Plan - @devops - SvelteKit Deployment

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Adapter (from svelte.config.js): <adapter>
### Artifacts: [ ] frontend/Dockerfile [ ] .env.example [ ] Makefile targets
### Health check: HTTP 200 on /
### Anti-hallucination checklist:
- [ ] Will not declare done until container starts and health check passes
```

## Dockerfile (multi-stage)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
EXPOSE 3000
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["node", "build"]
```

## Guidelines
- Minimal image. Remove devDependencies.
- No real secrets committed.
- `make up` starts the full stack. Both health checks must pass.
