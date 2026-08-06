# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Shanbora is a Symfony 6.4 (PHP 8.1+) monolith with server-rendered Twig pages that mount React 18 islands for interactive UI. It's a multi-tenant SaaS: each client ("Society") can be provisioned with its own isolated MySQL/MariaDB database and Doctrine entity manager, created dynamically at runtime.

## Development environment (Docker)

The project runs via docker-compose with four services: `php`, `nginx`, `db_default` (MariaDB), and `node` (yarn watch). Common commands (see `makefile`):

```
make build            # docker-compose build
make up               # start containers
make down             # stop containers
make composer         # composer install (inside php container)
make yarn             # yarn install (inside node container)
make yarn-watch       # yarn watch (inside node container)
make yarn-build       # production asset build
make db-create        # doctrine:database:create
make db-make-migrate  # make:migration
make db-migrate       # doctrine:migrations:migrate --no-interaction
make cache-clear
make install          # full first-time setup: build up composer yarn db-create db-make-migrate db-migrate
make reset            # full teardown + rebuild
```

Nginx serves on `${NGINX_PORT:-8080}`, MariaDB on `${DB_PORT:-3306}`.

## Build / lint / test commands

- Route dump for JS (needed after adding/renaming routes with `options: ['expose' => true]`): `php bin/console fos:js-routing:dump --format=json --target=public/js/fos_js_routes.json` (or `make route`)
- Frontend dev build with watch: `yarn watch` (or `encore dev --watch`)
- Frontend one-off dev build: `yarn dev`
- Frontend production build: `yarn build`
- Init test database: `php bin/console --env=test doctrine:schema:update -f` (`make init_test_db`)
- Load test fixtures + run PHPUnit: `php bin/console do:fi:lo --env=test && symfony php bin/phpunit` (`make check_test`)
- Run a single test: `symfony php bin/phpunit --filter TestName path/to/TestFile.php`

Note: there is no `phpunit.xml` checked in and `tests/` currently only contains `bootstrap.php` — the test suite is not fleshed out yet.

## Architecture

### Multi-database multi-tenancy

This is the most important non-obvious piece of the system. A `Society` (`src/Entity/Main/Society.php`) represents a tenant/client. When "multiple database" mode is enabled (`SettingsService` / `Settings::isMultipleDatabase()`), each Society gets:

- Its own MySQL database, named `{DATABASE_PREFIX}{code}` (e.g. `init_ACME`)
- Its own Doctrine entity manager/connection, named `{DATABASE_NAME_MANAGER}{code}`
- Its own env var `DATABASE_URL_CLIENT_{code}` appended to `.env`

This provisioning happens **at runtime** via `App\Service\MultipleDatabase\MultipleDatabase`:
- `createManager()` creates the database, appends a `DATABASE_URL_CLIENT_*` line to the env file, and rewrites `config/packages/doctrine.yaml` to register a new `dbal.connections` / `orm.entity_managers` entry (mapping to `src/Entity/{DATABASE_NAME_FOLDER}`, default folder name from `.env`'s `DATABASE_NAME_FOLDER`).
- `updateManager()` renames a tenant's connection/manager when its `code` changes, by string-replacing names in both the env file and `doctrine.yaml`.

`App\Service\DatabaseService` is the read-side helper: `getManagerByUser()` / `getManagerBySociety()` pull the correct `ObjectManager` out of Doctrine's `ManagerRegistry` by manager name (`User::getManager()` / `Society::getManager()` store which manager a record belongs to). The `default` entity manager (mapped to `src/Entity/`) always holds the tenant-management data (`Society`, `User`, `Settings`, etc. under `src/Entity/Main`); per-tenant entity managers point at a different entity folder.

Because `doctrine.yaml` and `.env` are mutated as plain text/YAML at runtime, be careful with manual edits to those files while this feature is in use — coordinate with the `MultipleDatabase` service rather than hand-editing entity manager config.

### Backend structure (`src/`)

- `Entity/Main/` — core/tenant-management entities (`User`, `Society`, `Settings`, `Contact`, `Mail`, `Notification`, `Changelog`, `Agenda/`, `Gallery/`). `Entity/Blog/`, `Entity/Billing/` are feature-specific entity groups. `Entity/Enum/` holds PHP enums. `Entity/DataEntity.php` is a common base class (file-or-default helper, AES-256-CBC crypt helper) — most entities extend it.
- `Controller/` splits by audience/purpose:
  - `Admin/*Controller.php` — server-rendered admin back-office pages (`/admin/...`, `ROLE_ADMIN`)
  - `InternApi/*Controller.php` — JSON API consumed by the React admin/app frontends (`/intern/api/...`, generally `ROLE_USER`/`ROLE_ADMIN` via `#[IsGranted]`)
  - `App/*Controller.php` — public-facing site pages (blog, etc.)
  - `AdminController.php`, `AppController.php`, `UserController.php`, `LoginController.php` — top-level/misc controllers
- `Service/` — business logic layer. Notable ones: `Api/ApiResponse.php` (standardized JSON response helper — always go through this rather than building `JsonResponse` manually in new API controllers), `ValidatorService` (wraps Symfony validator, returns `[{name, message}]` arrays), `SanitizeData`, `Data/DataMain|DataBlog|DataGallery` (map request payloads onto entities — `setData*` methods), `FileUploader`, `StorageService`, `Expiration`, `Export`, `SettingsService`, `MultipleDatabase/`, `Billing/` (quote generation + PDF).
- `Repository/` — only a few custom repositories exist beyond Doctrine defaults; most repos are plain `ServiceEntityRepository` subclasses with a `save()`/`remove()` helper.
- `Command/` — Symfony console commands, including `MultipleDatabase/AdminDatabaseUpdateCommand`, `Fake/` (fixture/faker commands), `Fix/` (one-off data-fix commands).
- `EventListener/SecurityListener.php` — auth-related event handling.
- `Twig/*Extension.php` — custom Twig filters/functions (phone formatting, pluralization, price formatting).

**Controller CRUD convention**: InternApi/Admin controllers for a resource typically implement a private/protected `submitForm($type, ...)` method shared by `create`/`update` actions, which: decodes `data` JSON from the request, checks uniqueness constraints, maps data onto the entity via a `Data*` service, validates via `ValidatorService`, handles file uploads via `FileUploader`, persists via the repository, and returns via `ApiResponse`. Follow this pattern for new CRUD endpoints rather than inventing a new shape.

### Frontend structure (`assets/`)

Multi-app Webpack Encore setup — **not** a single-page app. Each Twig page mounts one or more independent React roots into DOM elements by id, passing data via `data-*` attributes (see `assets/admin/js/pages/users.js` for the canonical pattern: `document.getElementById(id)` → `createRoot(el).render(<Component {...el.dataset} />)`).

- `assets/app/` — public site frontend (blog, security/login pages)
- `assets/admin/` — admin back-office frontend (`js/pages/*.js` = one entry per admin page; `js/pages/components/` = page-specific React components; `js/hooks/` = admin-specific hooks)
- `assets/user/` — member-space (`espace-membre`) frontend
- `assets/common/` — shared JS: `components/`, `functions/`, `hooks/` used across app/admin/user
- `assets/theme/tailwind/` — Tailwind-based UI kit/components/functions (e.g. `Menu`, `Notifications`)
- `assets/theme/shadcn/` — shadcn/ui components (see `components.json`; installed via the shadcn CLI, aliased through `@shadcnComponents`)
- `assets/controllers.json` / `assets/bootstrap.js` — Symfony UX Stimulus bridge (currently minimal/unused beyond bootstrap)

Webpack entries are declared individually in `webpack.config.js` (`.addEntry(...)`) — **when adding a new admin/app/user page that needs its own JS bundle, add a corresponding `addEntry` line** following the existing `{area}_{page}` naming convention (e.g. `admin_users`, `app_blog`).

Path aliases (defined in both `webpack.config.js` and `jsconfig.json` — keep them in sync): `@publicFolder`, `@tailwindFolder`/`@tailwindComponents`/`@tailwindFunctions`, `@shadcnComponents`, `@commonFolder`/`@commonComponents`/`@commonFunctions`/`@commonHooks`, `@appFolder`, `@adminPages`/`@adminHooks`, `@userPages`.

Routing on the frontend uses `FOSJsRoutingBundle`: routes exposed with `options: ['expose' => true]` in PHP route attributes become available to JS via `Routing.generate('route_name', params)` after `Routing.setRoutingData(routes)` is called (see `assets/admin/js/app.js`). Re-run `make route` after adding/changing exposed routes.

### Templates (`templates/`)

Twig templates mirror the controller split: `templates/admin/`, `templates/app/`, `templates/user/`, `templates/bundles/`, `templates/emails/`, `templates/layout/`, `templates/pdfs/` (mPDF-rendered quote/document templates, used by `Service/Billing/QuotePdfService`).

## Security

- Auth: form login (`security.yaml`), firewall provider is `App\Entity\Main\User` (loaded via `username`).
- Roles: `ROLE_USER` < `ROLE_ADMIN` < `ROLE_DEVELOPER` (role hierarchy in `security.yaml`).
- `access_control` gates `/admin` to `ROLE_ADMIN`, `/intern/api` and `/api` and `/espace-membre` to `ROLE_USER`, with specific public exceptions carved out above the generic `/intern/api` rule (e.g. blog stats/comments creation, password reset, contact form creation) — when adding a new public InternApi endpoint, add its own `PUBLIC_ACCESS` line *before* the catch-all `^/intern/api` rule, since Symfony uses the first matching rule.
- Most `InternApi` controllers additionally guard at the class/method level with `#[IsGranted('ROLE_...')]`.
