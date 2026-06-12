# Environment variables

## Setup

```bash
npm run setup:env
```

Copies `.env.example` → `.env` in the root and both frontend folders (skips if `.env` already exists).

---

## Root `.env` (backend + docker-compose)

Loaded by `docker compose` and `npm run dev:backend` (via `dotenv-cli`).

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5433` | PostgreSQL port (5433 avoids WSL/system Postgres on 5432) |
| `DB_NAME` | `dispatchflow` | Database name |
| `DB_USERNAME` | `dispatchflow` | Database user |
| `DB_PASSWORD` | `dispatchflow` | Database password |
| `JWT_SECRET` | *(dev default)* | HMAC signing key (min 32 chars) |
| `JWT_EXPIRATION_MS` | `86400000` | Token TTL in milliseconds (24h) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:5174` | Comma-separated allowed origins |
| `SEED_ADMIN` | `true` | Create default admin on startup if missing |
| `ADMIN_EMAIL` | `admin@dispatchflow.com` | Seeded admin email |
| `ADMIN_PASSWORD` | `admin12345` | Seeded admin password |

**File:** `/.env.example` → copy to `/.env`

---

## `frontend/.env` (dispatcher portal)

Read by Vite at build/dev time. Only `VITE_*` vars are exposed to the browser.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Backend URL. Empty in dev = use Vite proxy |
| `VITE_ADMIN_URL` | `http://localhost:5174` | Admin console URL for redirects/links |

**File:** `/frontend/.env.example` → copy to `/frontend/.env`

---

## `frontend-admin/.env` (admin console)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Backend URL. Empty in dev = use Vite proxy |
| `VITE_DISPATCHER_URL` | `http://localhost:5173` | Dispatcher portal link in sidebar |

**File:** `/frontend-admin/.env.example` → copy to `/frontend-admin/.env`

---

## Backend standalone (without npm)

If you run the backend directly:

```bash
cd backend
export $(grep -v '^#' ../.env | xargs)
./mvnw spring-boot:run
```

See `backend/.env.example` for the variable list.

---

## AWS RDS (production)

Use `.env.aws.example` as the template. Set `SPRING_PROFILES_ACTIVE=prod` and point `DB_HOST` at your RDS endpoint.

See [aws-rds.md](aws-rds.md) for Terraform provisioning and full setup.

| Variable | Production value |
|----------|------------------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | RDS endpoint, e.g. `dispatchflow.xxx.us-east-1.rds.amazonaws.com` |
| `DB_SSL_MODE` | `require` |

---

## Production examples

**Root `.env.aws` (AWS RDS):**

```env
SPRING_PROFILES_ACTIVE=prod
DB_HOST=dispatchflow.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=dispatchflow
DB_USERNAME=dispatchflow_admin
DB_PASSWORD=<strong-password>
DB_SSL_MODE=require
JWT_SECRET=<random-64-char-string>
CORS_ALLOWED_ORIGINS=https://app.dispatchflow.com,https://admin.dispatchflow.com
SEED_ADMIN=false
```

**`frontend/.env` (production build):**

```env
VITE_API_URL=https://api.dispatchflow.com
VITE_ADMIN_URL=https://admin.dispatchflow.com
```

**`frontend-admin/.env` (production build):**

```env
VITE_API_URL=https://api.dispatchflow.com
VITE_DISPATCHER_URL=https://app.dispatchflow.com
```

---

## Git ignore

Local `.env` files are gitignored. Only `.env.example` templates are committed.
