# AWS RDS PostgreSQL

DispatchFlow uses **PostgreSQL**. For production, host it on **Amazon RDS**. Local development can still use Docker (`docker compose`).

> **Full AWS deployment** (ECS + ALB + CloudFront + RDS) is documented in [aws-deployment.md](aws-deployment.md).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        AWS                              │
│                                                         │
│   ┌──────────────┐         ┌─────────────────────────┐  │
│   │ EC2 / ECS /  │  :5432  │  RDS PostgreSQL 16      │  │
│   │ Elastic      │ ──────► │  (private subnet)       │  │
│   │ Beanstalk    │  SSL    │  dispatchflow database  │  │
│   └──────────────┘         └─────────────────────────┘  │
│         ▲                                               │
└─────────┼───────────────────────────────────────────────┘
          │
    Spring Boot backend (SPRING_PROFILES_ACTIVE=prod)
```

| Environment | Database runs on |
|-------------|------------------|
| **Local dev** | Docker (`dispatchflow-postgres` on `localhost:5432`) |
| **CI (GitHub Actions)** | Ephemeral Postgres service container |
| **Production** | **AWS RDS** |

---

## Option A — Provision with Terraform (recommended)

### Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- [Terraform](https://www.terraform.io/downloads) 1.5+

### Steps

```bash
cd infrastructure/aws/terraform

cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set allowed_cidr_blocks to your VPC/app subnet

terraform init
terraform plan
terraform apply
```

### Get connection details

```bash
terraform output rds_endpoint
terraform output -raw db_password
```

### Configure the backend

```bash
cp .env.aws.example .env.aws
```

Fill in values from Terraform outputs:

```env
SPRING_PROFILES_ACTIVE=prod
DB_HOST=<rds_endpoint>
DB_PORT=5432
DB_NAME=dispatchflow
DB_USERNAME=dispatchflow_admin
DB_PASSWORD=<from terraform output>
DB_SSL_MODE=require
```

Run the backend against RDS:

```bash
export $(grep -v '^#' .env.aws | xargs)
./backend/mvnw -f backend/pom.xml spring-boot:run
```

---

## Option B — AWS Console (manual)

1. Open **RDS** → **Create database**
2. Choose **PostgreSQL 16**
3. Template: **Production** or **Dev/Test**
4. Settings:
   - DB identifier: `dispatchflow-prod`
   - Master username: `dispatchflow_admin`
   - Master password: strong password
   - Database name: `dispatchflow`
5. Instance: `db.t3.micro` (dev) or larger for production
6. Storage: **gp3**, enable encryption
7. Connectivity:
   - Same VPC as your backend
   - **Not** publicly accessible (recommended)
   - VPC security group: allow inbound **5432** from backend security group only
8. Backups: 7+ days retention
9. Enable **deletion protection** for production

Copy the **Endpoint** from the RDS instance details → set as `DB_HOST`.

---

## Spring Boot production profile

When `SPRING_PROFILES_ACTIVE=prod`, the backend loads `application-prod.yml`:

- JDBC URL with `sslmode=require` (RDS SSL)
- Connection pooling via HikariCP
- Admin seed disabled by default (`SEED_ADMIN=false`)

---

## Security checklist

- [ ] RDS in a **private subnet** (no public access)
- [ ] Security group allows **only** the backend server on port 5432
- [ ] Storage encryption enabled (default on RDS)
- [ ] Strong `DB_PASSWORD` and `JWT_SECRET` in AWS Secrets Manager or Parameter Store
- [ ] `SEED_ADMIN=false` after first admin is created
- [ ] Regular automated backups enabled

---

## Connecting from your laptop (dev only)

If you need to inspect RDS from your machine temporarily:

1. Use an **SSH tunnel** through a bastion EC2 host, or
2. Use **AWS Session Manager** port forwarding, or
3. Set `publicly_accessible = true` in Terraform **only for testing** and restrict `allowed_cidr_blocks` to your IP

Never leave a production database publicly open.

---

## Cost estimate (us-east-1)

| Resource | Approx. monthly |
|----------|----------------|
| `db.t3.micro` RDS | ~$15–20 |
| 20 GB gp3 storage | ~$2–3 |
| Backups (within free tier) | $0–5 |

Use [AWS Pricing Calculator](https://calculator.aws/) for your region and instance size.

---

## Files reference

| File | Purpose |
|------|---------|
| `infrastructure/aws/terraform/` | Terraform RDS module |
| `.env.aws.example` | Production env template |
| `backend/.../application-prod.yml` | Spring prod profile for RDS |
