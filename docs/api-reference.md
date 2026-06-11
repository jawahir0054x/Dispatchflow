# API reference

Base URL: `http://localhost:8080`

All protected endpoints require:

```http
Authorization: Bearer <jwt_token>
```

## Authentication

### POST `/api/auth/register`

Public. Creates a **DISPATCHER** account by default. Only an authenticated **ADMIN** can register another admin (send `role: "ADMIN"` with admin JWT).

**Request:**

```json
{
  "email": "dispatcher@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "DISPATCHER"
}
```

**Response `201`:** `AuthResponse` with JWT token.

### POST `/api/auth/login`

Public.

**Request:**

```json
{
  "email": "admin@dispatchflow.com",
  "password": "admin12345"
}
```

**Response `200`:** `AuthResponse`

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "admin@dispatchflow.com",
  "firstName": "System",
  "lastName": "Admin",
  "role": "ADMIN"
}
```

---

## Users (ADMIN only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users (paginated) |
| GET | `/api/users/{id}` | Get user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

**Create request:**

```json
{
  "email": "new@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Smith",
  "role": "DISPATCHER"
}
```

Password is optional on update (omit to keep existing password).

---

## Carriers

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/carriers` | ADMIN, DISPATCHER | List (paginated) |
| GET | `/api/carriers/{id}` | ADMIN, DISPATCHER | Get by ID |
| POST | `/api/carriers` | ADMIN, DISPATCHER | Create |
| PUT | `/api/carriers/{id}` | ADMIN, DISPATCHER | Update |
| DELETE | `/api/carriers/{id}` | ADMIN | Delete |

**Request body:**

```json
{
  "name": "Swift Logistics LLC",
  "mcNumber": "MC-123456",
  "dotNumber": "DOT-789012",
  "phone": "555-123-4567",
  "email": "dispatch@swift.com"
}
```

`mcNumber` and `dotNumber` are unique (stored uppercase).

---

## Drivers

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/drivers` | ADMIN, DISPATCHER | List (paginated) |
| GET | `/api/drivers?carrierId={id}` | ADMIN, DISPATCHER | Filter by carrier |
| GET | `/api/drivers/{id}` | ADMIN, DISPATCHER | Get by ID |
| POST | `/api/drivers` | ADMIN, DISPATCHER | Create |
| PUT | `/api/drivers/{id}` | ADMIN, DISPATCHER | Update |
| DELETE | `/api/drivers/{id}` | ADMIN | Delete |

**Request body:**

```json
{
  "carrierId": 1,
  "name": "Mike Johnson",
  "phone": "555-987-6543",
  "truckNumber": "TRK-1042",
  "trailerType": "DRY_VAN",
  "currentLocation": "Dallas, TX"
}
```

**Trailer types:** `DRY_VAN`, `REEFER`, `FLATBED`, `STEP_DECK`, `LOWBOY`, `TANKER`, `OTHER`

Truck number is unique per carrier.

---

## Loads

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/loads` | ADMIN, DISPATCHER | List (paginated) |
| GET | `/api/loads?driverId={id}` | ADMIN, DISPATCHER | Filter by driver |
| GET | `/api/loads?status={status}` | ADMIN, DISPATCHER | Filter by status |
| GET | `/api/loads/{id}` | ADMIN, DISPATCHER | Get by ID |
| POST | `/api/loads` | ADMIN, DISPATCHER | Create |
| PUT | `/api/loads/{id}` | ADMIN, DISPATCHER | Update |
| DELETE | `/api/loads/{id}` | ADMIN, DISPATCHER | Delete |

**Request body:**

```json
{
  "driverId": 1,
  "brokerName": "TQL Logistics",
  "pickupCity": "Chicago, IL",
  "deliveryCity": "Atlanta, GA",
  "rate": 2850.00,
  "miles": 720,
  "status": "DISPATCHED"
}
```

**Load statuses:** `PENDING`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`

---

## Pagination

List endpoints accept:

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `0` | Zero-based page index |
| `size` | `20` | Page size (max 100) |
| `sort` | varies | e.g. `name,asc` or `createdAt,desc` |

**Response:**

```json
{
  "content": [ ... ],
  "page": 0,
  "size": 20,
  "totalElements": 42,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

---

## Error responses

```json
{
  "timestamp": "2026-06-11T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/carriers",
  "details": ["name: Name is required"]
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Invalid credentials / missing token |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Duplicate email, MC, DOT, or truck number |

---

## Health

```http
GET /actuator/health
```

Public. No authentication required.
