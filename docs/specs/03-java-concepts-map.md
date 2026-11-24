# 03. Java Concepts Map (OOP, DSA, JDBC)

This file shows exactly where each concept your teacher listed appears in the code. Every row must be easy to point at during a viva (oral exam). The code must contain short comments that explain **why** each concept is used.

## 1. Class design

```
BaseEntity (abstract)      id, createdAt
  ├── User                 fullName, email, passwordHash
  ├── EmergencyContact     userId, name, phone, relation
  └── Alert                userId, category, priority, message, locationText, status, updatedAt, recipients

AlertRecipient             alertId, contactName, contactPhone, contactRelation, notifiedAt

enum EmergencyCategory     MEDICAL(1), FIRE(1), ACCIDENT(2), HARASSMENT(2), NATURAL_DISASTER(2), THEFT(3), OTHER(4)
enum AlertStatus           CREATED, SENT, RESOLVED, CANCELLED
enum Relation              PARENT, SIBLING, FRIEND, NEIGHBOR, DOCTOR, OTHER
```

`EmergencyCategory` holds its own priority number and a display name, so the priority rule lives in one place.

## 2. Concept table

| Concept | Where it is used | Classes |
|---|---|---|
| **Encapsulation** | Every model class has `private` fields with getters and setters. Setters check basic rules where it makes sense. | All in `model` |
| **Inheritance** | Shared id and created time live in the parent class. | `BaseEntity` and its children |
| **Abstraction and interfaces** | The service depends on interfaces, not on concrete classes. | `AlertSender`, `UserDao`, `ContactDao`, `AlertDao` |
| **Polymorphism** | Two classes implement the same interface and can be swapped without changing the service. | `SimulatedAlertSender`, `LoggingAlertSender` (wraps another sender and logs each send) |
| **Enums** | Fixed sets of values with behavior. | `EmergencyCategory`, `AlertStatus`, `Relation` |
| **Custom exceptions** | Clear errors for each rule that can fail. | `ValidationException`, `DuplicateResourceException`, `ResourceNotFoundException`, `InvalidStatusChangeException`, `AuthenticationException`, `BusinessRuleException` |
| **Collections** | Lists for contacts and alerts, a `HashSet` to detect duplicate phones, a `HashMap` and `TreeMap` to group alerts for stats. | Service classes |
| **Comparator** | Sorting alerts three ways. | `AlertByNewestFirst`, `AlertByOldestFirst`, `AlertByPriority` (priority first, then newest) |
| **Searching** | Case-insensitive search over contact names and alert messages with a simple loop and a `Predicate`. | `ContactService`, `AlertService` |
| **Conflict check** | Duplicate alert rule: same user, same category, within the last 2 minutes. | `AlertService.isRecentDuplicate()` |
| **Rule-based processing** | Priority comes from the category table. Status changes follow a fixed allowed list. No AI. | `EmergencyCategory`, `AlertStatus.canChangeTo()` |
| **JDBC persistence** | All saving and loading. | `Jdbc*Dao` classes |
| **Transactions** | Creating an alert and its recipients is one all-or-nothing step. | `AlertService.createAlert()` using one `Connection` |
| **try-with-resources** | Connections, statements and result sets always close, even on errors. | Every `Jdbc*Dao` method |
| **Generics and streams** | Used lightly and clearly for filtering and grouping. | `AlertService`, `StatsService` |

## 3. Key interface

```java
public interface AlertSender {
    List<AlertRecipient> send(Alert alert, List<EmergencyContact> contacts);
}
```

`SimulatedAlertSender` builds one `AlertRecipient` per contact (a copy of the contact details with the current time). It sends nothing real. If the project ever needs real SMS, a new class is added and the service does not change.

## 4. Status rules (`AlertStatus.canChangeTo`)

| From | Allowed next |
|---|---|
| CREATED | SENT (automatic only) |
| SENT | RESOLVED, CANCELLED |
| RESOLVED | none |
| CANCELLED | none |

## 5. JDBC rules

- One `DatabaseConnection` helper gives out connections using the settings from configuration. Settings are never hard coded.
- Each DAO method uses `PreparedStatement` with `?` placeholders.
- DAO methods that must run inside a transaction accept a `Connection` as a parameter. The service turns off auto-commit, runs the steps, then commits or rolls back.
- DAO classes map `ResultSet` rows to model objects in one private method each (`mapRow`).
- Every query for contacts and alerts includes `user_id`.

## 6. Where sorting, filtering and paging happen

The DAO returns all of one user's alerts (a small list per person). The **service** then filters by category and status, searches the message text, sorts with a `Comparator`, and cuts out the requested page. This keeps the DSA concepts visible in Java code. (If the data were huge, this work would move into SQL. For this project the per-user data is small, so Java is the better choice.)

## 7. Stats (computed in Java)

`StatsService` loads the user's alerts and uses a `HashMap` to count by category and status, and a `TreeMap` (keeps dates in order) to count alerts per day for the last 30 days. Days with no alerts are filled with zero.

## 8. Unit tests that prove the concepts

- Each Comparator returns the right order, including ties.
- Duplicate check: inside 2 minutes is a duplicate, outside is not, a different category is not.
- Status rules: every allowed and blocked change.
- Validators: good and bad names, emails, passwords and phone numbers.
- Stats grouping with a small fixed list of alerts.
- `SimulatedAlertSender` returns one recipient per contact.
