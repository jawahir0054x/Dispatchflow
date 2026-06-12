# Getting started

## Prerequisites

- **Java 17**
- **Node.js 20+** and npm
- **Docker** (for PostgreSQL via docker-compose)
- **Git**

Maven is bundled via `backend/mvnw` — no global Maven install required.

## 1. Clone and configure environment

```bash
git clone <repository-url>
cd dispatchflow-ai

npm run setup:env
```

This creates `.env` files from templates if they do not exist:

- `/.env` — backend + docker-compose
- `/frontend/.env` — dispatcher portal
- `/frontend-admin/.env` — admin console

See [environment-variables.md](environment-variables.md) for details.

## 2. Install dependencies

```bash
npm run install:all
```

Installs root tooling plus `backend`, `frontend`, and `frontend-admin` packages.

### Backend only (from `backend/`)

```bash
cd backend
npm install
npm start
```

`npm start` runs Spring Boot via Maven and loads env from `../.env`.

## 3. Start the full stack

```bash
npm run dev
```

This command:

1. Starts PostgreSQL (`docker compose up -d`)
2. Waits for PostgreSQL (default port `5433` — avoids conflict with a system Postgres on `5432`)
3. Runs backend, dispatcher portal, and admin console concurrently

### Run services individually

```bash
npm run dev:db          # PostgreSQL only
npm run dev:backend     # Spring Boot API
npm run dev:frontend    # Dispatcher portal → :5173
npm run dev:admin       # Admin console → :5174
npm run dev:apps        # All apps (DB must already be running)
```

Stop PostgreSQL:

```bash
npm run dev:db:down
```

## 4. Sign in

| Portal | URL | Who |
|--------|-----|-----|
| Dispatcher | http://localhost:5173 | Dispatchers |
| Admin | http://localhost:5174 | Admins only |

Default admin (seeded on first backend startup):

- Email: `admin@dispatchflow.com`
- Password: `admin12345`

## 5. Typical workflow

1. **Admin** — sign in at :5174, create dispatcher users if needed
2. **Dispatcher or Admin** — add **carriers** (MC/DOT numbers)
3. Add **drivers** assigned to carriers
4. Create **loads** assigned to drivers and track status

## Build for production

```bash
npm run build
```

Builds the JAR (`backend/target/`) and static assets (`frontend/dist/`, `frontend-admin/dist/`).

Before production frontend builds, set `VITE_API_URL` in each frontend `.env` to your deployed API URL.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 5432 in use | Stop other Postgres instances or change `DB_PORT` in `.env` |
| Backend won't connect to DB | Run `docker compose up -d` from project root; ensure `.env` has `DB_PORT=5433` if system Postgres uses 5432 |
| Port 8080 already in use | Stop the other process or set `server.port` in `application.yml` / use a different port |
| CORS errors | Ensure `CORS_ALLOWED_ORIGINS` includes both `5173` and `5174` |
| Admin can't sign in on :5173 | Expected — admins use :5174; dispatcher portal redirects admins |
| `mvnw: Permission denied` | Run `chmod +x backend/mvnw` |
