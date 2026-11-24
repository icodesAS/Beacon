# 05. Build Phases

Build in this order. Finish and test one phase before starting the next. Do not ask the AI agent to build everything at once, because big requests create bugs that are hard to find.

Before each phase, make sure the agent has read `AGENTS.md` and the spec files. At the end of each phase: run the app, run the tests, and fix problems before moving on.

---

## Phase 0: Foundation

**Goal:** an empty but working skeleton of both apps and the database.

**Build**
- Repo folders from file 02. `.gitignore`, `.env.example` files, starter README.
- `database/schema.sql` and `database/seed.sql` (one demo user and a few contacts and alerts).
- Backend: Spring Boot project, package layout, `DatabaseConnection` helper, global error handler with the standard error shape, `/api/health`, Swagger UI.
- Frontend: Next.js with TypeScript, Tailwind, shadcn/ui, theme tokens from file 04, the `/api` rewrite to the backend, `lib/api.ts`.

**Done when:** backend health check returns OK, frontend loads a styled dark page, and the frontend can call the health check through `/api`.

**Prompt for Antigravity:**
> Read AGENTS.md and docs/specs 01, 02 and 04. Complete Phase 0 from docs/specs/05-build-phases.md only. Do not build any feature yet. When done, tell me how to run both apps and how I can check that it works.

---

## Phase 1: Accounts and app shell

**Goal:** register, log in, log out, and a protected app layout.

**Build**
- Backend: `User` model, `UserDao` + `JdbcUserDao`, `AuthService`, BCrypt helper, auth controller, session handling, login interceptor, validators, exceptions.
- Frontend: Login and Register pages with Zod validation, auth provider (loads `/auth/me`), route protection, **AppShell** (sidebar, top bar, mobile bottom tabs, theme switch, user menu).

**Done when:** all account rules in file 01 work, wrong login shows the general message, logged-out users are sent to login, and the shell looks right on phone and desktop.

**Prompt:**
> Complete Phase 1 from docs/specs/05-build-phases.md. Follow the rules in 01, the security design in 02, and the UI in 04. Write unit tests for the validators and AuthService. Do not start Phase 2.

---

## Phase 2: Emergency contacts

**Goal:** full contact management.

**Build**
- Backend: `EmergencyContact`, `ContactDao` + JDBC class, `ContactService` (limit of 10, duplicate phone check, search), controller.
- Frontend: Contacts page, add and edit dialog, delete confirm, search, counter, empty, loading and error states, toasts.

**Done when:** every contact rule works, a user cannot see or change another user's contacts, and the page is smooth on phone and desktop.

**Prompt:**
> Complete Phase 2 from docs/specs/05-build-phases.md. Every contact query must include the logged-in user's id. Add tests for the service rules and for the user-isolation check.

---

## Phase 3: SOS and alerts

**Goal:** the full SOS experience.

**Build**
- Backend: `Alert`, `AlertRecipient`, enums, `AlertSender` interface with `SimulatedAlertSender` and `LoggingAlertSender`, `AlertDao` + JDBC class, `AlertService.createAlert()` with the transaction and duplicate check, status-change endpoint with status rules.
- Frontend: the whole Send SOS flow from file 04: category cards, templates, message form, review, duplicate warning dialog, **10-second countdown with cancel**, success screen.

**Done when:** an alert saves with its recipients, a failed step saves nothing (transaction), the duplicate warning works, cancelling during the countdown creates nothing, and SOS is blocked with no contacts.

**Prompt:**
> Complete Phase 3 from docs/specs/05-build-phases.md. Follow sections 8 in file 02 and the SOS flow in file 04 exactly. Add unit tests for the duplicate check, status rules and SimulatedAlertSender, and a test that proves the transaction rolls back.

---

## Phase 4: History and dashboard

**Goal:** see, search and understand past alerts.

**Build**
- Backend: alert list with filter, search, `Comparator` sorting and paging in the service, alert details, `StatsService` and `/stats/summary`.
- Frontend: History page with filters and pagination, Alert details page with status timeline and actions, Dashboard with stat cards, three charts and recent alerts.

**Done when:** all three sort orders are correct, filters and search work together, status actions follow the rules, and the dashboard numbers match the history data.

**Prompt:**
> Complete Phase 4 from docs/specs/05-build-phases.md. Use the three Comparator classes from file 03. Add tests for the comparators and the stats grouping.

---

## Phase 5: Polish and hardening

**Goal:** make it feel finished.

**Build**
- Check every screen for loading, empty, error and success states.
- Responsive check at 360px, tablet and desktop. Dark and light themes both look right.
- Accessibility pass from file 04 (keyboard, contrast, aria labels, reduced motion).
- Run the full checklist in file 06 and fix everything that fails.
- Final README with setup steps, screenshots and the API overview. Add `docs/` diagrams: class diagram, ER diagram (database tables) and an SOS flow diagram.
- Clean the code: remove unused code, check names and comments.

**Done when:** the whole checklist in file 06 passes and a stranger can set up and run the project from the README.

**Prompt:**
> Complete Phase 5 from docs/specs/05-build-phases.md. Go through docs/specs/06-quality-and-testing.md item by item and report what passes and what you fixed.
