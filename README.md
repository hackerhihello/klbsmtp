# Email SaaS Platform (Admin-Controlled Multi-Tenant)

Production-ready multi-tenant Email Automation SaaS with strict admin-controlled onboarding:

- Admin-only onboarding and organization provisioning
- Node.js + Express + Prisma + PostgreSQL
- BullMQ + Redis worker for background email delivery
- SMTP email delivery through Nodemailer
- Daily per-organization limit enforcement
- API-key protected email APIs
- Next.js + Tailwind dashboards for Admin and Organization
- Swagger docs at `/api-docs`

## Folder Structure

- `server/`: backend API, queue, worker, Prisma, seed
- `client/`: role selection, admin dashboard, organization dashboard

## Backend Features

- **Auth**
  - Role selection UI (`/`) with Admin and Organization entry points
  - `POST /api/v1/admin/login` (JWT admin login)
  - Organization login via API key validation against `GET /api/v1/email/logs`
  - No public registration route
  - Seeded default admin
- **Organization Management**
  - `POST /api/v1/admin/create-org`
  - `GET /api/v1/admin/orgs`
  - Organization fields: `name`, `apiKey`, `dailyLimit`, `status`
- **Email APIs (API key required)**
  - `POST /api/v1/email/send` (single or multiple)
  - `GET /api/v1/email/logs` (includes daily usage summary)
  - Email deduplication + validation
  - Attachments support (`base64`, PDF supported)
  - Queue retries: 3 attempts
- **Admin Monitoring**
  - `GET /api/v1/admin/stats`
  - `GET /api/v1/admin/logs`

## Prisma Models

- `Admin`
- `Organization`
- `EmailLog`
- `EmailDailyCount` (for per-day quota tracking)

## Environment Variables

Set these in `server/.env` (template in `server/.env.example`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/email_saas?schema=public
REDIS_URL=redis://127.0.0.1:6379
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=no-reply@yourdomain.com
SMTP_PASS=yourpassword
JWT_SECRET=super-secret-jwt
```

## Setup (Windows)

### 1) Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### 2) Worker (new terminal)

```bash
cd server
npm run worker
```

### 3) Frontend

```bash
cd client
npm install
npm run dev
```

## Default Seed Admin

- email: `admin@gmail.com`
- password: `admin123`

## Swagger

- URL: `http://localhost:4000/api-docs`
- Includes admin and email APIs with JWT/API-key auth testing support

## Curl Examples

Admin login:

```bash
curl -X POST http://localhost:4000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gmail.com\",\"password\":\"admin123\"}"
```

Create organization (replace `ADMIN_JWT`):

```bash
curl -X POST http://localhost:4000/api/v1/admin/create-org \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT" \
  -d "{\"name\":\"Acme Inc\",\"dailyLimit\":100,\"status\":\"active\"}"
```

List organizations:

```bash
curl -X GET http://localhost:4000/api/v1/admin/orgs \
  -H "Authorization: Bearer ADMIN_JWT"
```

Send single email by API key (replace `ORG_API_KEY`):

```bash
curl -X POST http://localhost:4000/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: ORG_API_KEY" \
  -d "{\"to\":\"user@example.com\",\"subject\":\"Test\",\"html\":\"<p>Hello</p>\"}"
```

Expected success response:

```json
{"message":"Emails queued","warning":null,"queued":1}
```

Organization dashboard:

```bash
curl -X GET http://localhost:4000/api/v1/org/dashboard \
  -H "x-api-key: ORG_API_KEY"
```

Organization logs:

```bash
curl -X GET http://localhost:4000/api/v1/email/logs \
  -H "x-api-key: ORG_API_KEY"
```

## Railway Deployment

- Backend and frontend are ready as separate Railway services
- `railway.toml` present in both `server` and `client`
