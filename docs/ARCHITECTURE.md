# GlobeTrotter Architecture

## Overview

GlobeTrotter is a full-stack monorepo travel planning platform with a React SPA frontend and Node.js REST API backend backed by PostgreSQL.

```
┌─────────────┐     HTTPS/REST      ┌─────────────┐
│   Client    │ ◄─────────────────► │   Server    │
│  (React)    │     JWT Auth          │  (Express)  │
└─────────────┘                       └──────┬──────┘
                                             │
                                      ┌──────▼──────┐
                                      │ PostgreSQL  │
                                      └─────────────┘
```

## Monorepo Structure

| Package | Purpose |
|---------|---------|
| `client/` | React + Vite SPA |
| `server/` | Express REST API + Prisma |
| `docs/` | Architecture & API documentation |
| `tests/` | Cross-cutting E2E tests |

## Backend Layers

```
Routes → Controllers → Services → Repositories → Prisma/PostgreSQL
```

- **Routes**: HTTP endpoint definitions, middleware attachment
- **Controllers**: Request/response handling, Zod validation
- **Services**: Business logic, authorization, transactions
- **Repositories**: Data access abstraction over Prisma

## Authentication

- Short-lived JWT access tokens (15 min)
- Long-lived refresh tokens stored in DB (7 days)
- Argon2 password hashing
- Rate limiting on auth endpoints

## Authorization

- Resource ownership checks on all private endpoints
- Trip collaborator roles: OWNER, EDITOR, VIEWER
- Admin role for analytics dashboard

## Key Design Decisions

1. **UUID primary keys** for all entities
2. **Normalized schema** with explicit foreign keys and cascade rules
3. **Server-side search** with pagination for cities/activities
4. **TanStack Query** for server state on frontend
5. **Zod validation** on both client and server
6. **Image URLs** stored as strings; abstraction ready for S3/Cloudinary

## Deployment

Docker Compose orchestrates frontend, backend, and PostgreSQL. Production builds serve static client assets via nginx or CDN; API runs as Node process.
