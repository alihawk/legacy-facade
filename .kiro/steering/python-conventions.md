---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 

## **1. Naming Conventions**

* **snake_case** for variables, functions, module-level helpers.
* **PascalCase** for classes and exceptions only.
* **UPPER_SNAKE_CASE** for constants; constants must live in a dedicated module when project-wide.
* Names must be **unambiguous, intention-revealing**, and avoid abbreviations unless industry-standard (e.g., `id`, `url`, `http`).
* Private members use leading underscore (`_internal_state`).
* Avoid dynamic attribute creation unless explicitly justified.

---

## **2. Code Style & Linting**

* Code **must** follow PEP 8 and PEP 257.
* **Black** (formatting), **isort** (imports), and **ruff** (linting) are required.
* Line length: **88 characters**, matching Black defaults.
* Enforce typing rigor:

  * All public methods, class attributes, and module APIs must have **explicit type hints**.
  * Use `typing` generics (e.g., `list[str]`) for Python ≥3.9.
  * Avoid `Any` unless unavoidable and documented.
* Prefer **dataclasses** for simple data carriers; avoid overusing classes where functions suffice.
* Use **structural pattern matching** (Python ≥3.10) when it clarifies control flow.

---

## **3. Imports**

* Import order:

  1. Standard library
  2. Third-party libraries
  3. Internal modules
* Absolute imports are required; avoid relative imports except within small leaf modules.
* No wildcard imports.

---

## **4. Error Handling & Exceptions**

* Raise **custom exception types** when domain-specific meaning improves clarity.
* User-facing exceptions must include actionable error messages.
* Never catch broad exceptions (`except Exception:`) unless inside top-level orchestration code, and only if re-raising or logging in a structured format.
* Prefer “EAFP” style when interacting with dynamic Python APIs, but not when it hides real errors.

---

## **5. File & Module Structure**

* One major class per file for maintainability. Small related helpers may co-exist.
* Group related functionality into coherent modules; avoid “utils.py” or “misc.py” dumping grounds.
* Packages must include an explicit `__init__.py`.
* Maintain a clear separation between:

  * **core logic**
  * **I/O and adapters** (API handlers, DB connectors, file readers)
  * **configuration**
  * **tests**
* Tests live under `tests/` mirroring the project’s module structure.
* No circular dependencies; refactor shared logic into dedicated modules.

---

## **6. Documentation Requirements**

* Every public function, class, and module requires a **docstring**.
* Supported styles: **Google** or **NumPy** docstrings; be consistent across a project.
* Docstrings must describe:

  * Purpose
  * Parameters with types
  * Return values
  * Exceptions raised
  * Side effects (I/O, network, disk, global state)
* Inline comments only for non-obvious logic — avoid restating the code.

---

## **7. Testing Guidelines**

* Use `pytest` as the standard test runner.
* Tests must be:

  * deterministic
  * isolated
  * independent of external state
* Use fixtures for shared setup; avoid subclassing `unittest.TestCase` unless required.
* Aim for meaningful coverage over raw percentage metrics:

  * business logic & state transitions are highest priority
  * performance-critical and concurrency-sensitive code must have additional stress or property-based tests
* Mock external services; never hit live systems in tests.

---

## **8. Concurrency & Performance**

* Choose concurrency primitives according to workload:

  * `asyncio` for high-throughput I/O
  * `threading` or `concurrent.futures` for blocking I/O
  * `multiprocessing` only for CPU-bound workloads due to overhead
* Avoid global mutable state; use dependency injection patterns where needed.
* Measure before optimizing; use `cProfile`, `perf`, or application-level metrics.
* Do not prematurely parallelize — prefer clarity first.

---

## **9. Packaging & Dependencies**

* Use **pyproject.toml** for all new projects.
* Pin dependencies using `poetry` or `pip-tools` depending on team preference.
* Avoid transitive dependency sprawl; remove unused libraries regularly.
* Runtime dependencies must be minimal; development tools belong in a dev group.

---

## **10. Logging & Observability**

* Use the standard `logging` module or a structured logging framework (e.g., structlog).
* Never log secrets or sensitive data.
* Log business events at `INFO`, internal state transitions at `DEBUG`, and exceptions at `ERROR`.
* Use correlation IDs for distributed systems visibility.
* Instrument performance-critical paths with metrics (Prometheus/OpenTelemetry).