# Architecture

## High-level overview

```
┌─────────────────────┐     ┌─────────────────────┐
│  frontend (:5173)   │     │ frontend-admin      │
│  Dispatcher portal  │     │ (:5174) Admin UI    │
└──────────┬──────────┘     └──────────┬──────────┘
           │         JWT / REST         │
           └────────────┬───────────────┘
                        ▼
           ┌────────────────────────┐
           │  backend (:8080)       │
           │  Spring Boot + Security│
           └────────────┬───────────┘
                        │ JPA
                        ▼
           ┌────────────────────────┐
           │  PostgreSQL (:5432)  │
           └────────────────────────┘
```

## Backend (`backend/`)

Package root: `com.dispatchflow`

| Package | Responsibility |
|---------|----------------|
| `controller` | REST endpoints, request validation |
| `service` | Business logic, transactions |
| `repository` | Spring Data JPA |
| `entity` | JPA models |
| `dto` | Request/response objects |
| `security` | JWT filter, user details, token service |
| `config` | Security, CORS, data seeding |
| `exception` | Global error handling |

### Design principles

- **MVC separation** — controllers do not access repositories directly
- **DTOs** at API boundaries — entities are not exposed
- **Stateless auth** — JWT, no server sessions
- **Pagination** on all list endpoints (`PageResponse`)

## Frontends

Two independent Vite + React apps sharing the same API:

| | `frontend` | `frontend-admin` |
|---|------------|------------------|
| **Audience** | Dispatchers | Admins |
| **Auth storage** | `dispatchflow_token` | `dispatchflow_admin_token` |
| **Unique feature** | Self-registration | User management |
| **Delete carriers/drivers** | Admin role only in UI | Always available |

In development, Vite proxies `/api` to `localhost:8080`.

## Domain model

```
User (ADMIN | DISPATCHER)

Carrier 1 ── * Driver 1 ── * Load
```

- A **driver** belongs to exactly one **carrier**
- A **load** is assigned to exactly one **driver**
- **Users** are separate from operational entities (auth only)

## Monorepo scripts (`package.json`)

Root `package.json` orchestrates docker, backend, and both frontends via `concurrently`. Backend env vars are loaded from root `.env` using `dotenv-cli`.
