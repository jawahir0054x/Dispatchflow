# Authentication & RBAC

## JWT authentication

- **Stateless** — no server-side sessions
- Tokens issued on login/register via `POST /api/auth/login` or `/register`
- Default expiration: **24 hours** (`JWT_EXPIRATION_MS=86400000`)
- Algorithm: HMAC-SHA (secret from `JWT_SECRET`, minimum 32 characters)

### Using the token

```http
Authorization: Bearer <token>
```

The `JwtAuthenticationFilter` validates the token on every protected request and sets the Spring Security context.

## Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Full system access, user management, delete carriers/drivers |
| `DISPATCHER` | Operational access — carriers, drivers, loads |

Spring authorities are prefixed: `ROLE_ADMIN`, `ROLE_DISPATCHER`.

## Registration rules

| Scenario | Result |
|----------|--------|
| Public register with `DISPATCHER` | Allowed |
| Public register with `ADMIN` | **403 Forbidden** |
| Authenticated admin registers `ADMIN` | Allowed |
| Admin creates user via `POST /api/users` | Allowed (any role) |

## Endpoint access matrix

| Resource | GET | POST/PUT | DELETE |
|----------|-----|----------|--------|
| `/api/auth/**` | — | Public | — |
| `/api/users/**` | ADMIN | ADMIN | ADMIN |
| `/api/carriers` | ADMIN, DISPATCHER | ADMIN, DISPATCHER | ADMIN |
| `/api/drivers` | ADMIN, DISPATCHER | ADMIN, DISPATCHER | ADMIN |
| `/api/loads` | ADMIN, DISPATCHER | ADMIN, DISPATCHER | ADMIN, DISPATCHER |
| `/actuator/health` | Public | — | — |

## Frontend portals

| Portal | Port | Login rule |
|--------|------|------------|
| Dispatcher (`frontend`) | 5173 | Dispatchers stay; admins redirected to :5174 |
| Admin (`frontend-admin`) | 5174 | **ADMIN only** — dispatchers rejected |

Each portal uses separate localStorage keys so both can run in the same browser without token conflicts.

## User deletion safeguards

- Cannot delete your own account
- Cannot delete the last remaining `ADMIN` user

## Security checklist (production)

- [ ] Change `JWT_SECRET` to a strong random value (32+ chars)
- [ ] Change `ADMIN_PASSWORD` before first deploy
- [ ] Set `SEED_ADMIN=false` after initial admin is created (optional)
- [ ] Use HTTPS for API and frontends
- [ ] Restrict `CORS_ALLOWED_ORIGINS` to real domains
- [ ] Never commit `.env` files with production secrets
