# Beacon — Emergency SOS and Contact Alert Simulator

Beacon is a web-based emergency assistance simulator built with **Next.js (TypeScript)**, **Spring Boot 3 (Java 21)**, **plain JDBC**, and **MySQL 8**.

> **Note:** All SOS alerts are **simulated**. No real SMS, phone calls, or emails are sent.

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod, next-themes, sonner, Recharts, lucide-react
- **Backend:** Java 21, Spring Boot 3 (thin REST layer), plain JDBC (`PreparedStatement`), BCrypt (`spring-security-crypto`), springdoc-openapi (Swagger UI)
- **Database:** MySQL 8

## Project Structure

```text
beacon/
  backend/      Spring Boot 3 REST API (port 8080)
  frontend/     Next.js web app (port 3000)
  database/     MySQL schema.sql and seed.sql
  docs/         Project specs and diagrams
```

## Setup (Phase 0 — Foundation)

### 1. Database (MySQL 8)

Run `database/schema.sql` and `database/seed.sql` on your local MySQL 8 server:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend (`backend/`)

Copy `backend/.env.example` to `backend/.env` (or set environment variables `DB_URL`, `DB_USER`, `DB_PASSWORD`), then run:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- Health check: `http://localhost:8080/api/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend (`frontend/`)

Copy `frontend/.env.example` to `frontend/.env.local`, install dependencies, and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. Requests to `/api/*` are proxied to `http://localhost:8080/api/*`.
