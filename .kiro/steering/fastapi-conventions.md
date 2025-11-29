---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 

# FastAPI Development Guidelines

## 1. Project Structure

* Keep a **single FastAPI app (monolith)** with clear separation:

  * `api/` – routers (endpoints)
  * `schemas/` – Pydantic models (request/response)
  * `services/` – business logic
  * `db/` – DB models and session handling
  * `core/` – config, security, utilities
* Avoid putting logic directly in `main.py` beyond:

  * app creation
  * router inclusion
  * middleware & startup/shutdown hooks

---

## 2. API Design & Routing

* Group endpoints into **routers** by feature/domain (e.g. `users`, `auth`, `tasks`).
* Use clear, REST-like paths:

  * Collections: `/users`, `/tasks`
  * Individual resources: `/users/{user_id}`
* Use proper HTTP methods:

  * `GET` – read
  * `POST` – create
  * `PUT` / `PATCH` – update
  * `DELETE` – delete
* Always return **structured JSON** using response models (Pydantic), not raw dicts.
* Set explicit `status_code` on endpoints (e.g. `201` on create, `204` on delete).

---

## 3. Pydantic Schemas (Request & Response Models)

* Separate **input** and **output** models:

  * `XCreate` / `XUpdate` for incoming payloads
  * `XRead` or `XPublic` for responses
* Never expose internal fields (password hashes, secret tokens, internal IDs).
* Keep schemas **thin**: validate and shape data; don’t put business logic in them.
* Use type hints consistently (including enums and optional fields) to get good validation.

---

## 4. Business Logic & Services

* Keep routes **thin** – they should:

  * Parse input (via schemas/dependencies)
  * Call a service function
  * Return a response model
* Put business logic in `services/`:

  * `services/users.py` for user operations
  * `services/tasks.py` for main domain logic, etc.
* Services should hide DB specifics from routes:

  * Routes shouldn’t know table names or ORM details.

---

## 5. Database Access Patterns

* Use a **single DB session per request** via FastAPI dependency injection.
* Only interact with the DB in:

  * `db/` (models, repositories)
  * or service layer that wraps these.
* Avoid running blocking DB or heavy I/O in the main thread in async endpoints (prefer async DB driver or background tasks).
* Keep queries simple and readable; if they get complex, extract them into dedicated repository functions.

---

## 6. Dependency Injection (FastAPI Dependencies)

* Use dependencies for:

  * DB session
  * Authenticated user
  * Common query params or filters
  * Shared configuration (e.g. current environment, feature flags)
* Prefer dependency injection over global variables.
* Keep dependency functions small and focused; don’t hide big business logic inside dependencies.

---

## 7. Error Handling & HTTP Responses

* Use `HTTPException` with appropriate `status_code` and human-readable `detail`.
* Centralize common errors where possible (e.g. “resource not found” helpers).
* Return:

  * `400` for invalid input (beyond normal validation)
  * `401` for unauthenticated
  * `403` for unauthorized
  * `404` when resource is missing
  * `409` for conflicts (e.g. duplicate unique field)
* For hackathon speed: fail **loudly but clearly**; don’t swallow errors silently.

---

## 8. Authentication & Authorization (If Used)

* Keep auth logic in dedicated modules (`core/auth.py`, `api/auth.py`).
* Use dependencies to inject the current user into routes:

  * e.g. `get_current_user`
* Don’t pass raw tokens around between layers; decode and validate once in dependencies.

---

## 9. Validation & Security Basics

* Let Pydantic handle as much validation as possible (types, regex, enums).
* Sanitize or validate any user-controlled input used in:

  * file paths
  * external requests
  * database queries (even with ORM)
* Never return sensitive information in error messages or logs.

---

## 10. Background Tasks & Async Work

* For short, fire-and-forget work tied to a single request (e.g. send email, log analytics), use **FastAPI’s BackgroundTasks**.
* For truly heavy or long-running tasks, design them so the endpoint immediately returns an acknowledgment and the work is done out-of-band (even if the actual worker is very simple for the hackathon).

---

## 11. Testing Patterns (Lightweight but Useful)

* Use `pytest` with FastAPI’s `TestClient` (or async client) for API tests.
* Write tests for:

  * critical endpoints (login, main flows)
  * basic happy-path + obvious edge cases
* Aim for simple, readable tests over full coverage given hackathon time.

---

## 12. Performance & Practical Optimization

* Use `uvicorn` with sensible defaults; don’t over-tune workers for a hackathon.
* Prefer async endpoints when doing I/O (DB, HTTP calls).
* Avoid N+1 patterns in DB access; batch queries when possible.
* Add very minimal logging at key points:

  * incoming request context (route, user, key params)
  * major failures / exceptions

---

## 13. Frontend–Backend Integration

* Keep your response shapes consistent and stable so the frontend doesn’t chase changes.
* Use clear, predictable JSON keys that match the frontend’s expectations.
* Prefer a small number of well-designed endpoints over many ad-hoc ones:

  * Focus on flows your hackathon demo needs (signup/login, main feature actions).
