# AWS deployment (ECS + RDS + CloudFront)

Full production stack on AWS:

```
Internet
    │
    ├── CloudFront ──► S3 (dispatcher portal)
    ├── CloudFront ──► S3 (admin console)
    │
    └── ALB :80 ──► ECS Fargate (Spring Boot) ──► RDS PostgreSQL
```

| Component | AWS service |
|-----------|-------------|
| Database | RDS PostgreSQL 16 |
| Backend API | ECS Fargate + ALB |
| Docker images | ECR |
| Secrets | Secrets Manager |
| Dispatcher UI | S3 + CloudFront |
| Admin UI | S3 + CloudFront |
| Logs | CloudWatch |

---

## Prerequisites

- AWS account with admin or sufficient IAM permissions
- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- [Terraform](https://www.terraform.io/downloads) 1.5+
- [Docker](https://www.docker.com/) (for backend image builds)
- Node.js 20+ (for frontend builds)

---

## Step 1 — Provision infrastructure

```bash
cd infrastructure/aws/terraform

cp terraform.tfvars.example terraform.tfvars
# Review and edit terraform.tfvars

terraform init
terraform plan
terraform apply
```

Save the outputs:

```bash
terraform output api_url
terraform output dispatcher_url
terraform output admin_url
terraform output ecr_repository_url
```

---

## Step 2 — Deploy backend to ECS

```bash
chmod +x scripts/aws-deploy-backend.sh
./scripts/aws-deploy-backend.sh
```

This script:

1. Builds the Spring Boot Docker image
2. Pushes to ECR
3. Forces a new ECS deployment

Wait 2–3 minutes, then verify:

```bash
curl "$(cd infrastructure/aws/terraform && terraform output -raw api_url)/actuator/health"
```

---

## Step 3 — Deploy frontends to S3 / CloudFront

```bash
chmod +x scripts/aws-deploy-frontends.sh
./scripts/aws-deploy-frontends.sh
```

Builds both React apps with `VITE_API_URL` pointing at the ALB, uploads to S3, and invalidates CloudFront.

Or deploy everything at once:

```bash
chmod +x scripts/aws-deploy-all.sh
./scripts/aws-deploy-all.sh
```

---

## Step 4 — Sign in

| Portal | URL (from `terraform output`) |
|--------|-------------------------------|
| Dispatcher | `dispatcher_url` |
| Admin | `admin_url` |

Admin credentials are in **Secrets Manager**:

```bash
aws secretsmanager get-secret-value \
  --secret-id "$(terraform output -raw secrets_manager_arn)" \
  --query SecretString --output text | jq .
```

Use `ADMIN_EMAIL` from terraform.tfvars and `ADMIN_PASSWORD` from the secret.

---

## Updating after code changes

```bash
# Backend only
./scripts/aws-deploy-backend.sh

# Frontends only
./scripts/aws-deploy-frontends.sh

# Everything
./scripts/aws-deploy-all.sh
```

---

## Terraform variables (key)

| Variable | Default | Description |
|----------|---------|-------------|
| `ecs_cpu` | `512` | Fargate CPU |
| `ecs_memory` | `1024` | Fargate memory (MiB) |
| `ecs_desired_count` | `1` | Number of backend tasks |
| `enable_frontends` | `true` | S3 + CloudFront for both UIs |
| `db_instance_class` | `db.t3.micro` | RDS instance size |

See `infrastructure/aws/terraform/terraform.tfvars.example` for all options.

---

## HTTPS (production)

The ALB and CloudFront use HTTP / default CloudFront certificates for initial setup.

For production domains:

1. Register a domain in Route 53
2. Request an ACM certificate (us-east-1 for CloudFront)
3. Add HTTPS listener on ALB with ACM cert
4. Attach custom domain aliases to CloudFront distributions

---

## Cost estimate (us-east-1, minimal)

| Service | ~Monthly |
|---------|----------|
| RDS `db.t3.micro` | $15–20 |
| ECS Fargate (0.5 vCPU, 1 GB) | $15–20 |
| ALB | $18–25 |
| CloudFront + S3 | $1–5 |
| **Total** | **~$50–70** |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| ECS tasks keep restarting | Check CloudWatch logs: `/ecs/dispatchflow-prod-backend` |
| 502 from ALB | Backend not healthy — wait for startup or check RDS connectivity |
| CORS errors | Re-run `terraform apply` after frontends deploy; verify `cors_origins` output |
| ECR push denied | Re-run `aws ecr get-login-password` login step |

---

## Related docs

- [AWS RDS](aws-rds.md) — database details
- [Environment variables](environment-variables.md)
- [CI/CD](ci-cd.md) — GitHub Actions (extend with deploy job)
