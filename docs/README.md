# DispatchFlow AI — Documentation

## Guides

| Document | Description |
|----------|-------------|
| [Getting started](getting-started.md) | Prerequisites, setup, run, and build |
| [Architecture](architecture.md) | System design, modules, and data flow |
| [API reference](api-reference.md) | REST endpoints, payloads, and responses |
| [Database schema](database-schema.md) | Tables, relationships, and constraints |
| [Authentication & RBAC](authentication-and-rbac.md) | JWT, roles, and access control |
| [Environment variables](environment-variables.md) | All configurable env vars |
| [CI/CD](ci-cd.md) | GitHub Actions pipeline |
| [AWS RDS](aws-rds.md) | Production PostgreSQL on Amazon RDS |
| [AWS deployment](aws-deployment.md) | ECS Fargate, ALB, S3, CloudFront |

## Applications

| App | Port | Users |
|-----|------|-------|
| Dispatcher portal (`frontend`) | 5173 | Dispatchers (day-to-day operations) |
| Admin console (`frontend-admin`) | 5174 | Admins (users + full system control) |
| Backend API (`backend`) | 8080 | Both frontends |
| PostgreSQL | 5432 | Backend only |

## Default credentials (local dev)

| Account | Email | Password | Portal |
|---------|-------|----------|--------|
| Admin | `admin@dispatchflow.com` | `admin12345` | Admin console (5174) |

Dispatchers register at http://localhost:5173/register
