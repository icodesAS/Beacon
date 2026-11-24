# 01. Project Overview

**App name:** Beacon
**Full title:** Emergency SOS and Contact Alert Simulator

## 1. What it is

Beacon is a web app where a person saves emergency contacts. In an emergency they open the app, choose the type of emergency, write or pick a short message, and press SOS. After a short countdown (so nobody sends it by mistake), the app **simulates** sending the alert to all saved contacts.

"Simulate" means the app only pretends to send. No real SMS, call or email leaves the system. The app records who was "notified" and keeps a full history.

## 2. Quality bar

This must NOT look or feel like a class project. It should feel like a real product:

- Professional dark UI with red used only for SOS and danger actions
- Smooth, clear flows with loading, empty and error states on every screen
- Clean, layered, well-named Java code that clearly shows OOP, DSA and JDBC
- Safe by default: strong password storage, safe SQL, and strict data privacy
- Tested, documented and easy to run from the README

## 3. Teacher's required features (all must work)

| Requirement | How we deliver it |
|---|---|
| User registration and login | Email and password, session cookie, protected pages |
| Add and manage emergency contacts | Contacts page: add, edit, delete, search |
| Generate SOS alerts | SOS flow: category, message, countdown, simulated send |
| Select emergency categories | 7 categories, each with a priority |
| Maintain incident records | Every alert is saved with details and who was notified |
| View previous alerts | History page with sort, filter, search and details |
| Alert status | CREATED, SENT, RESOLVED, CANCELLED |
| Java backend, OOP, DSA, JDBC, MySQL | See file 03 |
| SOS is simulated | No real messages, with a visible "Simulation only" badge |

## 4. Extra features (beyond the requirement)

1. **Alert templates:** ready-made messages for each category. The user can tap one and edit it.
2. **Countdown with cancel:** after confirming, a 10-second countdown runs. The user can cancel before anything is sent.
3. **Dashboard with stats and charts:** totals, alerts by category, alerts over the last 30 days, status breakdown.
4. **Dark theme by default, with a light theme switch.**

## 5. Business rules

**Accounts**
- Name: 2 to 50 characters. Email: valid format, unique, saved in lowercase.
- Password: at least 8 characters, with at least one letter and one number.
- Wrong login always shows one general message: "Email or password is incorrect."

**Contacts**
- Fields: name, phone, relation (Parent, Sibling, Friend, Neighbor, Doctor, Other).
- Phone: 10 digits, starting with 6 to 9 (Indian mobile). Saved as digits only, shown as `+91 98765 43210`.
- Maximum 10 contacts per user. The same phone cannot be added twice for one user.
- Delete asks for confirmation.

**Categories and priority** (1 is most urgent)

| Category | Priority |
|---|---|
| Medical | 1 |
| Fire | 1 |
| Accident | 2 |
| Harassment or Threat | 2 |
| Natural Disaster | 2 |
| Theft or Robbery | 3 |
| Other | 4 |

**Alerts**
- A user needs at least one contact before sending SOS.
- Message: 5 to 300 characters. Location text (optional): up to 100 characters.
- **Duplicate check (simple rule, not AI):** if the same user already sent the same category in the last 2 minutes, the server answers with a warning. The user can choose to send anyway.
- Status flow: `CREATED` then `SENT` (set automatically after the simulated send). From `SENT` the user can set `RESOLVED` (emergency over) or `CANCELLED` (false alarm). No other changes are allowed.
- Scheduling and priority are **rule-based**. No AI is used anywhere.

## 6. Main user flows

**First time:** Register, log in, see an empty dashboard with a clear "Add your first contact" step, add contacts, ready to use.

**Emergency:** Dashboard, press SOS, choose category, pick a template or write a message, review, confirm, 10-second countdown (cancel possible), success screen showing each contact as "notified".

**Review:** History, sort or filter, open one alert, see details and notified contacts, mark Resolved or False alarm.

## 7. Out of scope (do not build)

Real SMS, calls or email. Live GPS or maps. AI features. Admin panel. Payments. Mobile app. Forgot-password flow.

## 8. Naming used in this project

The teacher's text mentions "Task and Schedule" classes. In this project the "Task" is the `Alert`, and the "Schedule" (the saved record of what happened and when) is the incident history made of `Alert` plus `AlertRecipient` rows. "Priority or deadline sorting" means sorting by alert priority and time. This still needs the teacher's confirmation.
