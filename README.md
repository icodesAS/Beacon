# Beacon — Emergency SOS and Contact Alert Simulator

Beacon is a web-based emergency assistance simulator built with **Next.js (TypeScript)**, **Spring Boot 3 (Java 21)**, **plain JDBC**, and **MySQL 8**.

> **Simulation Only:** All SOS alerts in Beacon are **simulated**. No real SMS messages, phone calls, or emails are sent. Do not rely on this application in a real emergency.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod, `next-themes`, `sonner`, Recharts, `lucide-react`
- **Backend:** Java 21, Spring Boot 3 (thin REST layer), plain JDBC (`PreparedStatement` + `try-with-resources`), BCrypt (`spring-security-crypto`), `springdoc-openapi` (Swagger UI)
- **Database:** MySQL 8 (InnoDB, `utf8mb4`)

## Project Structure

```text
beacon/
  backend/      Spring Boot 3 REST API (port 8080)
  frontend/     Next.js web app (port 3000)
  database/     MySQL schema.sql and seed.sql
  docs/         Project specs and architecture diagrams (docs/diagrams.md)
```

## Getting Started

### 1. Database Setup (MySQL 8)

Create the `beacon` schema and load the demo seed data on your local MySQL 8 server:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend Setup (`backend/`)

Copy `backend/.env.example` to `backend/.env` or set `DB_PASSWORD` (and optionally `DB_URL`, `DB_USER`) in your environment, then start the API:

**Windows PowerShell:**

```powershell
cd backend
$env:DB_PASSWORD="your_mysql_password"
.\mvnw.cmd spring-boot:run
```

**macOS / Linux:**

```bash
cd backend
DB_PASSWORD="your_mysql_password" ./mvnw spring-boot:run
```

- Health check: `http://localhost:8080/api/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend Setup (`frontend/`)

Copy `frontend/.env.example` to `frontend/.env.local`, install dependencies, and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. Requests to `/api/*` are proxied to `http://localhost:8080/api/*`.

## Demo Account

Seeded by `database/seed.sql` with sample contacts and alerts:

- **Email:** `demo@beacon.local`
- **Password:** `Demo1234`

## Running Automated Tests

**Backend (JUnit 5 + Mockito):**

```powershell
cd backend
.\mvnw.cmd test
```

**Frontend (Node.js built-in test runner for Zod schemas & SOS templates):**

```powershell
cd frontend
npm test
```

Additional frontend checks:

```powershell
cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

## API Endpoint Overview

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/auth/register` | Public | Create a new user account |
| `POST` | `/api/auth/login` | Public | Log in and start an `HttpOnly` session |
| `POST` | `/api/auth/logout` | Session | Invalidate current session |
| `GET` | `/api/auth/me` | Session | Get current logged-in user |
| `GET` | `/api/contacts` | Session | List user's contacts (optional `?q=` search) |
| `POST` | `/api/contacts` | Session | Add emergency contact (max 10, unique phone) |
| `PUT` | `/api/contacts/{id}` | Session | Update an emergency contact |
| `DELETE` | `/api/contacts/{id}` | Session | Delete an emergency contact |
| `GET` | `/api/alerts` | Session | List alerts with `category`, `status`, `q`, `sort`, `page`, `size` |
| `POST` | `/api/alerts` | Session | Create & dispatch simulated SOS (2m duplicate check, JDBC tx) |
| `GET` | `/api/alerts/{id}` | Session | Get alert details and notified recipients |
| `PATCH` | `/api/alerts/{id}/status` | Session | Mark a `SENT` alert as `RESOLVED` or `CANCELLED` |
| `GET` | `/api/stats/summary` | Session | Dashboard counts, category/status breakdowns, and 30-day trend |

Interactive API documentation is available at `http://localhost:8080/swagger-ui.html` when the backend is running.

## Architecture & Flow Diagrams

See [docs/diagrams.md](docs/diagrams.md) for the **Class Diagram**, **ER Diagram**, and **SOS Dispatch Flow Diagram**.
