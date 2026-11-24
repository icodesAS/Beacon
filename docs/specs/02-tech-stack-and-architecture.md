# 02. Tech Stack and Architecture

## 1. Stack

| Part | Choice | Why |
|---|---|---|
| Frontend framework | Next.js (latest stable, App Router) with TypeScript | Professional page structure, fast, strong for a portfolio |
| Styling | Tailwind CSS + shadcn/ui | Clean, modern, consistent components |
| Icons / charts | lucide-react, Recharts | Simple, good-looking |
| Forms | React Hook Form + Zod | Easy forms with strict checks |
| Data fetching | TanStack Query | Handles loading, errors and refresh cleanly |
| Theme | next-themes | Dark by default, light switch |
| Toasts | sonner | Small success and error messages |
| Backend | Java 21 + Spring Boot 3 (web and validation only) | Java is required. Spring Boot is used only as a thin web layer (REST API). |
| Database | MySQL 8 | Required |
| Database access | **Plain JDBC** with `PreparedStatement` | Required. **Do NOT use JPA, Hibernate or JdbcTemplate.** |
| Password hashing | BCrypt (`spring-security-crypto` only, no full Spring Security) | Safe passwords without extra complexity |
| API docs | springdoc-openapi (Swagger UI) | A professional touch, easy to demo |
| Backend tests | JUnit 5 + Mockito | Standard |
| Build tools | Maven (backend), npm (frontend) | Standard |

**Terms explained**
- **REST API:** a set of web addresses (for example `/api/contacts`) that the frontend calls to get or send data as JSON.
- **JSON:** a simple text format for data, like `{"name":"Mom"}`.
- **JDBC:** the standard way for Java to run SQL on a database.
- **PreparedStatement:** a safe way to run SQL. It stops SQL injection (an attack where someone types SQL code into a form).
- **Session cookie:** a small piece of data the browser sends with each request so the server knows who is logged in.
- **Transaction:** a group of database steps that either all succeed or all fail.

## 2. Repository layout

```
beacon/
  backend/            Java Spring Boot project (Maven)
  frontend/           Next.js project
  database/           schema.sql and seed.sql
  docs/               these spec files, diagrams, report material
  AGENTS.md           rules for the AI coding agent
  README.md           setup and run steps
```

## 3. How the frontend and backend talk

- Backend runs on port 8080. Frontend runs on port 3000.
- Next.js is set up with a **rewrite** (a proxy rule) so that any request to `/api/*` on port 3000 is passed to `http://localhost:8080/api/*`. To the browser it looks like one site. This avoids CORS problems and lets the login cookie work smoothly.
- Backend address is read from an environment variable `BACKEND_URL`.

## 4. Backend layers

Each layer has one job. Code only calls downward.

1. **controller:** receives web requests, checks input shape, returns JSON. No business rules.
2. **service:** all business rules (duplicate check, limits, sorting, status changes, stats).
3. **dao:** the only place with JDBC and SQL. One interface plus one JDBC class per table.
4. **model:** plain data classes and enums.
5. **dto:** small request and response classes that go in and out of the API.
6. **security:** BCrypt helper and a login-check interceptor (a piece of code that runs before each request).
7. **exception:** custom exceptions and one global error handler.
8. **util:** validators and the database connection helper.

Package root: `com.beacon`.

## 5. Login and security design

- Login creates an `HttpSession`. The cookie is `HttpOnly` (JavaScript cannot read it), `SameSite=Lax`, and `Secure` when running on https. Session lasts 2 hours.
- An interceptor blocks every `/api` route except register, login and health when there is no valid session (answer 401).
- **Every query for contacts and alerts includes the logged-in user's id.** A user can never read or change another user's data, even by guessing an id. If the row is not theirs, answer 404.
- All SQL uses `PreparedStatement` with `?` placeholders. Never join user text into SQL.
- Passwords are saved only as BCrypt hashes. Never log passwords.
- Validate on the frontend (Zod) for fast feedback and again on the backend for real safety.
- Secrets (database password) come from environment variables or a local config file that is in `.gitignore`.

## 6. Database

Name: `beacon`. Encoding `utf8mb4`, engine InnoDB. Times are saved in UTC and shown in the user's local time by the frontend.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone CHAR(10) NOT NULL,
  relation VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, phone),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(30) NOT NULL,
  priority TINYINT NOT NULL,
  message VARCHAR(300) NOT NULL,
  location_text VARCHAR(100),
  status VARCHAR(15) NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_alerts_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE alert_recipients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  contact_phone CHAR(10) NOT NULL,
  contact_relation VARCHAR(20) NOT NULL,
  notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
);
```

`alert_recipients` copies the contact's details on purpose. If a contact is deleted later, the old history must still show who was notified.

## 7. API list

All routes start with `/api`. All answers are JSON. All routes except register, login and health need a logged-in session.

| Method | Address | Purpose | Success |
|---|---|---|---|
| POST | /auth/register | Create account (fullName, email, password) | 201 + user |
| POST | /auth/login | Log in (email, password) | 200 + user |
| POST | /auth/logout | Log out | 204 |
| GET | /auth/me | Current user | 200 + user, or 401 |
| GET | /contacts?search= | List contacts | 200 + list |
| POST | /contacts | Add contact | 201 + contact |
| PUT | /contacts/{id} | Edit contact | 200 + contact |
| DELETE | /contacts/{id} | Delete contact | 204 |
| POST | /alerts | Create and send SOS (category, message, locationText, force) | 201 + alert with recipients |
| GET | /alerts?sort=&category=&status=&search=&page=&size= | List alerts | 200 + page object |
| GET | /alerts/{id} | Alert details with recipients | 200 + alert |
| PATCH | /alerts/{id}/status | Set RESOLVED or CANCELLED | 200 + alert |
| GET | /stats/summary | Dashboard numbers | 200 + stats |
| GET | /health | Simple "OK" check | 200 |

**Alert list options:** `sort` is `newest` (default), `oldest` or `priority`. `size` default 10. The answer is `{ items, page, size, totalItems, totalPages }`.

**Stats answer:** `totalAlerts`, `alertsThisMonth`, `contactCount`, `lastAlert`, `byCategory` (list of category and count), `byStatus` (list of status and count), `last30Days` (list of date and count, with zero-count days included).

**Error answer (always the same shape):**
```json
{ "status": 409, "code": "DUPLICATE_RECENT_ALERT", "message": "You sent a similar alert 1 minute ago.", "fieldErrors": {} }
```

Error codes: `VALIDATION_FAILED` (400), `NO_CONTACTS` (400), `UNAUTHENTICATED` (401), `NOT_FOUND` (404), `EMAIL_TAKEN` (409), `DUPLICATE_CONTACT` (409), `CONTACT_LIMIT_REACHED` (409), `DUPLICATE_RECENT_ALERT` (409), `INVALID_STATUS_CHANGE` (409), `SERVER_ERROR` (500, with a safe message only).

## 8. SOS creation steps (backend, in order)

1. Check login and validate input.
2. Load the user's contacts. If none, answer `NO_CONTACTS`.
3. Unless `force` is true, run the duplicate check. If it fails, answer `DUPLICATE_RECENT_ALERT`.
4. Start a **transaction**. Save the alert as `CREATED`. Call the `AlertSender` to produce recipient records and save them. Change the status to `SENT`. Commit. If any step fails, roll back everything.
5. Return the alert with its recipients.

## 9. Frontend structure

```
frontend/src/
  app/                  pages: login, register, dashboard, sos, contacts, history, history/[id]
  components/ui/        shadcn/ui parts
  components/           app components (AppShell, SosButton, AlertTable, ContactForm, charts)
  lib/api.ts            one small wrapper around fetch (handles errors and 401)
  lib/validation.ts     Zod schemas
  lib/templates.ts      alert message templates
  hooks/                TanStack Query hooks (useContacts, useAlerts, useStats)
  types/                shared TypeScript types
```

A 401 answer from the API sends the user to the login page.

## 10. Configuration

- `backend/src/main/resources/application.properties` reads `DB_URL`, `DB_USER`, `DB_PASSWORD` from environment variables with safe local defaults.
- `frontend/.env.local` holds `BACKEND_URL`.
- `.env` files and any file with passwords are in `.gitignore`. Provide `.env.example` files.
