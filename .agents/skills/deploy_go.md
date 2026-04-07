# Skill: Deploy Go Application (Full-Stack)

## Role: Infrastructure Lead (@devops - Backend)

## Pre-Execution Plan
```
## Execution Plan - @devops - Go Deployment

### Context & Sandbox
- [ ] Context Pruning: I have cleared non-essential file buffers
- [ ] Selective Reading: I will only read files specified in context_files
### Infrastructure deps (from brain/spec.yaml): [ ] <service>
### Artifacts: [ ] backend/Dockerfile [ ] .env.example [ ] Makefile targets
### Health check: endpoint <path>, expected HTTP 200
### Anti-hallucination checklist:
- [ ] Will not declare done until container starts and health check passes
- [ ] .env.example has no real secrets
```

## Dockerfile (multi-stage)
```dockerfile
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/api ./cmd/api

FROM alpine:latest
RUN apk --no-cache add ca-certificates
COPY --from=builder /bin/api /bin/api
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
ENTRYPOINT ["/bin/api"]
```

## Guidelines
- Minimal final image (Alpine or distroless).
- No real secrets in any committed file.
- Makefile target `health-check` must pass before declaring done.
