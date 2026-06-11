# CI/CD (GitHub Actions)

Workflow file: [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml)

## Triggers

| Event | Branches |
|-------|----------|
| `push` | `main`, `develop` |
| `pull_request` | `main`, `develop` |

Concurrent runs on the same branch are cancelled automatically.

## CI jobs (every push / PR)

| Job | What it does |
|-----|----------------|
| **Backend** | Java 17, PostgreSQL 16 service, `./backend/mvnw clean verify` |
| **Dispatcher Frontend** | `npm ci`, `lint`, `build` in `frontend/` |
| **Admin Frontend** | `npm ci`, `lint`, `build` in `frontend-admin/` |

All three jobs run **in parallel**.

## CD job (main branch only)

After all CI jobs pass on a **push to `main`**:

1. Uploads individual artifacts (JAR, `frontend/dist`, `frontend-admin/dist`)
2. Bundles everything into `dispatchflow-release` (30-day retention)

Download artifacts from the GitHub Actions run → **Artifacts** section.

## Required secrets (for future deployment)

No secrets are required for CI builds. When you add deployment, configure these in **GitHub → Settings → Secrets**:

| Secret | Used for |
|--------|----------|
| `JWT_SECRET` | Production backend |
| `DB_PASSWORD` | Production database |
| `ADMIN_PASSWORD` | Initial admin seed |

## Local parity

Reproduce CI locally:

```bash
# Backend
docker compose up -d
export $(grep -v '^#' .env | xargs)
./backend/mvnw -f backend/pom.xml clean verify

# Frontends
cd frontend && npm ci && npm run lint && npm run build
cd ../frontend-admin && npm ci && npm run lint && npm run build
```

## Extending deployment

Add a deploy job after `cd` that targets your host (AWS, Azure, VPS, etc.) using the downloaded artifacts. Example placeholders:

```yaml
deploy:
  needs: cd
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/download-artifact@v4
      with:
        name: dispatchflow-release
        path: release
    # - name: Deploy backend JAR to server
    # - name: Deploy frontend dist to CDN/static host
```
