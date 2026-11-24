# 06. Quality and Testing

The project is "done" only when everything in this file is true.

## 1. Code quality rules

**Java**
- Layers stay clean: controllers have no SQL and no business rules, DAOs have no business rules.
- Meaningful names, short methods (about 30 lines or less), one job per class.
- Comments explain **why**, not what. Add a short comment at each place that shows a concept from file 03.
- No `System.out.println` for logging. Use a logger.
- No unused code, no commented-out code, no copy-pasted blocks.
- Never catch an exception and ignore it.

**Frontend**
- TypeScript with no `any`.
- Small components with one job. Shared logic goes in hooks or `lib/`.
- All colors, spacing and fonts come from design tokens (file 04). No random hard-coded colors.
- Every form uses Zod validation with clear messages.

**General**
- No secrets in the repo. `.env.example` files exist.
- Consistent formatting (Prettier for frontend, standard Java formatting).
- Small, clear commit messages like "Add contact limit rule".

## 2. Security checklist

- [ ] Passwords are saved only as BCrypt hashes.
- [ ] Every SQL statement uses `PreparedStatement`.
- [ ] Every contact and alert query includes the logged-in user's id.
- [ ] Changing an id in the address bar never shows another user's data (answer is 404).
- [ ] Protected routes answer 401 without a session. The frontend sends the user to login.
- [ ] Session cookie is `HttpOnly` and `SameSite=Lax`.
- [ ] Error messages never show stack traces, SQL or internal details.
- [ ] Input is checked again on the backend, even if the frontend already checked it.
- [ ] Text like `' OR 1=1 --` and `<script>alert(1)</script>` in any field does not break anything and is shown as plain text.

## 3. Functional test checklist

**Accounts**
- [ ] Register works with valid data.
- [ ] Duplicate email, weak password, bad name and mismatched confirm password are rejected with clear messages.
- [ ] Login works. Wrong password and unknown email show the same general message.
- [ ] Logout ends the session. Back button does not show protected data.

**Contacts**
- [ ] Add, edit, delete work. Delete asks to confirm.
- [ ] Bad phone numbers are rejected. Duplicate phone is rejected. The 11th contact is blocked.
- [ ] Search works. Counter is correct.
- [ ] Deleting a contact does not change old alert history.

**SOS**
- [ ] SOS is blocked with no contacts and offers a way to add one.
- [ ] Every category works. Templates fill the message and can be edited.
- [ ] Message length rules (5 to 300) and the character counter work.
- [ ] Review step shows the right contacts.
- [ ] Countdown runs from 10 to 0. **Cancel stops it and nothing is saved.** Escape also cancels.
- [ ] After the countdown, the alert and recipients are saved and the success screen shows them.
- [ ] Duplicate warning appears for the same category inside 2 minutes. "Send anyway" works. "Go back" works.
- [ ] If saving recipients fails, the alert is not saved either (transaction rollback).

**History and details**
- [ ] Newest, Oldest and Priority sorting are correct (priority ties are sorted by newest).
- [ ] Category filter, status filter and search work alone and together.
- [ ] Pagination works. Empty results show a friendly state.
- [ ] Details page shows all data and the notified contacts.
- [ ] Resolve and false alarm work only from SENT. Other changes are blocked with a clear message.

**Dashboard**
- [ ] Stat numbers match the real data. Charts match the history.
- [ ] A new user with no data sees friendly empty states, not broken charts.

## 4. UI and UX checklist

- [ ] Works at 360px, tablet and desktop. No horizontal scrolling.
- [ ] Dark theme is default. Light theme works and looks right.
- [ ] Red is used only for SOS and danger.
- [ ] Every screen has loading, empty, error and success states.
- [ ] Keyboard-only use works everywhere with a visible focus ring.
- [ ] Contrast is at least 4.5 to 1 for text.
- [ ] Reduced-motion setting turns off the pulse and other animation.
- [ ] "Simulation only" badge is visible on SOS screens.
- [ ] Time is shown in the user's local time.

## 5. Automatic tests (minimum)

Backend (JUnit 5 and Mockito):
- Validators (name, email, password, phone, message).
- `AuthService` (register, login, duplicate email).
- `ContactService` (limit, duplicate phone, search, user isolation).
- `AlertService` (duplicate check, no-contacts rule, status rules, transaction rollback).
- Three Comparators.
- `StatsService` grouping.
- `SimulatedAlertSender`.

Frontend: tests for the Zod schemas and the template list. Optional: one end-to-end test of the SOS flow.

All tests pass with one command, written in the README.

## 6. Documentation checklist

- [ ] README: what it is, screenshots, stack, how to set up MySQL, how to run backend and frontend, demo account.
- [ ] `database/schema.sql` and `seed.sql` work on a clean MySQL.
- [ ] Swagger UI lists and describes every endpoint.
- [ ] `docs/` has a class diagram, an ER diagram and an SOS flow diagram.

## 7. Demo script (5 minutes)

1. Show the dashboard and explain the idea.
2. Register a new user and add two contacts.
3. Send an SOS: pick Medical, use a template, review, watch the countdown, show the success screen.
4. Cancel one SOS during the countdown to show nothing is saved.
5. Open History: sort by priority, filter, open details, mark as resolved.
6. Show the dashboard charts updated.
7. Open the code and point to: the `AlertSender` interface, a Comparator, a DAO with `PreparedStatement`, and the transaction in `createAlert`.

## 8. Definition of done

All checklists above pass, all tests pass, the README works for a new person, and you can explain every concept in file 03 in simple words.
