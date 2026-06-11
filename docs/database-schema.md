# Database schema

PostgreSQL database: `dispatchflow` (configurable via `DB_NAME`)

Hibernate `ddl-auto: update` manages schema in development. Tables are created/updated automatically on startup.

## Entity relationship diagram

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │
│ email (UQ)   │
│ password     │
│ first_name   │
│ last_name    │
│ role         │
│ created_at   │
│ updated_at   │
└──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   carriers   │ 1   * │   drivers    │ 1   * │    loads     │
│──────────────│───────│──────────────│───────│──────────────│
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │       │ broker_name  │
│ mc_number UQ │       │ phone        │       │ pickup_city  │
│ dot_number UQ│       │ truck_number │       │ delivery_city│
│ phone        │       │ trailer_type │       │ rate         │
│ email        │       │ current_loc  │       │ miles        │
│ created_at   │       │ carrier_id FK│       │ status       │
│ updated_at   │       │ created_at   │       │ driver_id FK │
└──────────────┘       │ updated_at   │       │ created_at   │
                       └──────────────┘       │ updated_at   │
                                              └──────────────┘
```

## Tables

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| email | VARCHAR(255) UNIQUE | Lowercased on save |
| password | VARCHAR | BCrypt hash |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| role | VARCHAR(20) | `ADMIN` or `DISPATCHER` |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `carriers`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| name | VARCHAR(255) | |
| mc_number | VARCHAR(20) UNIQUE | Normalized uppercase |
| dot_number | VARCHAR(20) UNIQUE | Normalized uppercase |
| phone | VARCHAR(20) | |
| email | VARCHAR(255) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `drivers`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| name | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| truck_number | VARCHAR(50) | Unique per carrier |
| trailer_type | VARCHAR(20) | Enum string |
| current_location | VARCHAR(255) | |
| carrier_id | BIGINT FK → carriers | NOT NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `loads`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| broker_name | VARCHAR(255) | |
| pickup_city | VARCHAR(100) | |
| delivery_city | VARCHAR(100) | |
| rate | DECIMAL(10,2) | |
| miles | INTEGER | |
| status | VARCHAR(20) | Enum string |
| driver_id | BIGINT FK → drivers | NOT NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Referential integrity

- Deleting a **carrier** with assigned drivers will fail (FK constraint on `drivers.carrier_id`)
- Deleting a **driver** with assigned loads will fail (FK constraint on `loads.driver_id`)
- Delete loads first, then drivers, then carriers

## Seed data

On first startup (`SEED_ADMIN=true`), a default admin user is created if the email does not exist. See `DataInitializer.java` and `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars.
