# AGENTS.md: Rules for the AI coding agent

You are building **Beacon** (Emergency SOS and Contact Alert Simulator), a college project that must feel like a real, professional product. Read these before writing code:

- `docs/specs/01-project-overview.md` (what and rules)
- `docs/specs/02-tech-stack-and-architecture.md` (stack, database, API)
- `docs/specs/03-java-concepts-map.md` (Java concepts that must be visible)
- `docs/specs/04-ui-ux-design.md` (design and screens)
- `docs/specs/05-build-phases.md` (what to build and in what order)
- `docs/specs/06-quality-and-testing.md` (checklists)

## How to work

1. Work **one phase at a time**, only the phase the user names. Do not build ahead.
2. Before coding a phase, say in a few lines what you will build and which files you will create or change.
3. After coding, run the app and the tests. Report what you ran and the real results. Never say something works if you did not run it.
4. If the specs are unclear or conflict, ask the user. Do not guess silently.
5. Do not add libraries, features or files that the specs do not call for. If you think something is needed, explain why and ask first.
6. Keep changes small and focused. Explain things in simple English, because the user is a student who must be able to explain every part in a viva.

## Hard rules (never break)

**Backend**
- Java 21, Spring Boot 3, Maven. Package root `com.beacon`.
- Database access is **plain JDBC only**. No JPA, no Hibernate, no JdbcTemplate, no Spring Data.
- Every SQL statement uses `PreparedStatement` with `?`. Never join user input into SQL.
- Every query for contacts and alerts includes the logged-in user's id.
- Passwords are saved only as BCrypt hashes. Never log passwords or secrets.
- Layers: controller, service, dao, model, dto, security, exception, util. Controllers have no SQL or business rules. Only DAOs have SQL.
- Creating an alert plus its recipients is one **transaction**.
- Use try-with-resources for every connection, statement and result set.
- Use the exact error codes and error shape from file 02.
- Spring Security is not used. Only the BCrypt crypto module and our own login interceptor.
- SOS is a **simulation**. Never add real SMS, email or call sending.
- No AI features anywhere. All logic is rule-based.

**Frontend**
- Next.js (App Router), TypeScript (no `any`), Tailwind, shadcn/ui, TanStack Query, React Hook Form + Zod, next-themes, sonner, Recharts, lucide-react.
- Use the design tokens and rules in file 04. Dark theme is the default. Red only for SOS and danger.
- All API calls go through `lib/api.ts`. A 401 sends the user to login.
- Every screen has loading, empty, error and success states. Follow the accessibility rules in file 04.
- The SOS alert is created on the server only **after** the 10-second countdown ends. Cancel during the countdown creates nothing.

**General**
- No secrets in the repo. Use `.env.example` files.
- Comments explain **why**. Mark each place that shows a concept from file 03 with a short comment.
- No dead code, no commented-out code, no copy-pasted blocks.
- Keep the README, `schema.sql` and Swagger docs up to date with your changes.

## Definition of done for any task

- Code compiles and the app runs.
- Relevant tests are written and pass.
- The related checklist items in file 06 pass.
- You gave the user a short summary: what changed, how to run it, and how to check it.
