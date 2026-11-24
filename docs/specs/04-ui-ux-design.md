# 04. UI and UX Design

## 1. Design direction

**Modern dark theme with red SOS accents.** Calm, serious and trustworthy, like a real safety product. Dark is the default. A light theme switch is available in the user menu.

Rules that keep it looking professional:
- **Red is rare.** Use red only for the SOS button, danger actions (delete, cancel) and high-priority badges. Everything else is neutral.
- Lots of space, few colors, one clear action per screen.
- Same spacing, corner radius and shadows everywhere.
- A small badge "Simulation only" is always visible on SOS screens.

## 2. Design tokens

Use CSS variables (shadcn/ui style) so light and dark themes switch cleanly.

| Token | Dark | Light |
|---|---|---|
| Background | `#0B0F14` | `#F8FAFC` |
| Surface (cards) | `#121821` | `#FFFFFF` |
| Surface raised | `#1A2230` | `#F1F5F9` |
| Border | `#1F2937` | `#E2E8F0` |
| Text | `#E5E7EB` | `#0F172A` |
| Muted text | `#9CA3AF` | `#64748B` |
| SOS red | `#EF4444` (glow `#EF444455`) | `#DC2626` |
| Success | `#22C55E` | `#16A34A` |
| Warning | `#F59E0B` | `#D97706` |
| Info | `#3B82F6` | `#2563EB` |

- **Font:** Inter via `next/font`. Sizes: 12, 14 (body), 16, 20, 24, 32. Headings semi-bold.
- **Radius:** 12px on cards, 8px on inputs and buttons.
- **Category colors** (for badges and charts), soft and consistent: Medical red, Fire orange, Accident amber, Harassment purple, Natural Disaster teal, Theft blue, Other gray.
- **Priority badges:** P1 red, P2 amber, P3 blue, P4 gray.
- **Status badges:** CREATED gray, SENT blue, RESOLVED green, CANCELLED muted gray with strike style.

## 3. Layout

- **Desktop:** left sidebar (Dashboard, Send SOS, Contacts, History) and a top bar with the page title, theme switch and user menu (name, logout). Content is centered, max width about 1100px.
- **Phone:** top bar plus a **bottom tab bar** with the same four items. The SOS tab is a larger red round button in the middle.
- Mobile first: every screen must work at 360px width.

## 4. Screens

### Login and Register
Centered card on the dark background with the app name and one line of text ("Stay connected when it matters."). Show/hide password button. Inline errors under fields. A clear button loading state. Links between login and register.

### Dashboard
- Greeting with the user's name.
- Big **SOS card** with a large red button (soft pulsing glow, stops with reduced-motion setting). If there are no contacts, the card shows "Add a contact to enable SOS" with a button.
- Four stat cards: Total alerts, This month, Contacts, Last alert (relative time like "2 days ago").
- Charts: **Alerts by category** (donut), **Last 30 days** (bar or area chart), **Status breakdown** (small horizontal bars or donut).
- Recent alerts: last 5 in a compact list, with "View all".

### Contacts
- Header with search box and "Add contact" button. Counter "3 of 10".
- Contact cards (phone) or table (desktop): avatar circle with initials, name, relation badge, formatted phone, edit and delete icons.
- Add and edit in a **dialog** with the form. Delete shows a confirm dialog.
- Empty state: friendly icon, "No contacts yet", add button.

### Send SOS (a guided flow in one page)
1. **Choose category:** 7 large selectable cards with icons and a small priority tag. Medical and Fire appear first.
2. **Message:** template chips for the chosen category (tap to fill), a text area with character counter (5 to 300), optional location field. The user can edit any template.
3. **Review:** summary card showing category, message, location, and the list of contacts who will be notified. Button: "Send SOS" (red).
4. **Duplicate warning dialog (only if the server says so):** "You sent a similar alert 1 minute ago. Send again?" with "Send anyway" and "Go back".
5. **Countdown screen:** full-screen dark overlay, a large circular ring counting down from **10 to 0**, text "Sending SOS in 7...", and a big, easy **Cancel** button. Pressing Cancel returns to the review step with nothing sent. Pressing Escape also cancels.
6. **Success screen:** green check animation, "SOS sent (simulated)", time, and the list of contacts appearing one by one with check marks. Buttons: "View alert" and "Back to dashboard".

The alert is only created on the server **after** the countdown ends. Cancelling during the countdown creates nothing.

### History
- Filter bar: category dropdown, status dropdown, search box, sort dropdown (Newest, Oldest, Priority).
- Table on desktop and cards on phone. Columns: date and time, category (with icon), priority badge, status badge, short message.
- Pagination at the bottom. Empty state when there is no result ("No alerts match your filters" with a clear-filters button).

### Alert details (`/history/[id]`)
Header with category, status and priority. Full message, location, created and updated times. "Notified contacts" list. Actions (only when status is SENT): **Mark as resolved** and **Mark as false alarm**, each with a confirm dialog. A status timeline: Created, Sent, then Resolved or Cancelled.

## 5. Alert templates (`lib/templates.ts`)

Three short templates per category. Examples:

- **Medical:** "I need urgent medical help. Please call me or come to my location as soon as you can." / "Someone near me needs urgent medical attention. Please call emergency services and me."
- **Fire:** "There is a fire near me. I am trying to move to safety. Please call the fire service."
- **Accident:** "I have been in an accident and need help. Please call me right away."
- **Harassment or Threat:** "I feel unsafe and need help. Please call me or stay on the line with me."
- **Natural Disaster:** "I am affected by a natural disaster nearby. I am trying to reach safety. Please check on me."
- **Theft or Robbery:** "I have been robbed. I am safe but need help. Please call me."
- **Other:** "I need help. Please call me as soon as possible."

(Write all three variants per category in the code. Keep each under 150 characters.)

## 6. Motion

Short and calm (150 to 250 ms). Used for: dialogs, page changes, the SOS pulse, the countdown ring, the success check and contact list reveal. All motion is turned off when the user's system asks for reduced motion.

## 7. Every screen needs these states

- **Loading:** skeleton shapes, not spinners alone.
- **Empty:** icon, short text, one action.
- **Error:** clear message and a "Try again" button.
- **Success:** a toast message for saves and deletes.

## 8. Accessibility and usability

- Text contrast meets WCAG AA (at least 4.5 to 1).
- Everything works with the keyboard, with a visible focus ring.
- Buttons have text or an `aria-label`. Dialogs trap focus and close with Escape.
- Never use color alone to show meaning. Badges always have text.
- Tap targets are at least 44px on phones.
- The countdown is announced to screen readers ("Sending in 10 seconds") with a polite live region.
- Form errors are linked to their fields.

## 9. Microcopy (tone)

Clear, calm, short. Examples: "Add your first contact", "Nothing was sent", "Your contacts were notified (simulated)". Avoid scary or joking text. Never blame the user in error messages.
