# Production cut-over runbook

State as of 2026-08-05: branch `new-optimisedbackend` is pushed, the migrated
data is validated 29/29, and this exact runbook was rehearsed end-to-end on a
local staging DB (schema → dump → password reset → backend boot → smoke checks).
The hand-off artifacts live in this directory. What remains is executed **on
the server**.

Artifacts:

| File | Purpose |
|---|---|
| `schema.sql` | The clean 41-table schema (creates database `cse_department`) |
| `cse_department-data-20260805-2109.sql` | Migrated production data — **data-only**, load after `schema.sql` (excludes the three lookup tables `schema.sql` seeds itself) |
| `force-password-reset.sql` | Invalidates every migrated password hash (see step 6) |
| `migration-review.md` | Row-level log of every merge/drop decision, for reference |

The data dump is **gitignored** (`*-data-*.sql`) — `git pull` on the server will
not bring it. Copy it over by hand (`scp`) from this machine.

## 1. Freeze and back up the legacy system

- Announce a maintenance window; stop the legacy backend (or block writes).
- `mysqldump --single-transaction cseBackend > cseBackend-final-$(date +%Y%m%d).sql`
  and copy it off the server. This is the rollback point — the migration
  intentionally drops/merges rows (13 duplicate publications, 3 patents,
  3 projects, test rows, faculty CS019, 120 lowercase-`students` rows, orphaned
  `facultysubjects`), so the legacy dump is the only place that data survives.

## 2. Load the new database

```sh
mysql -u root -p < schema.sql                       # creates cse_department
mysql -u root -p cse_department < cse_department-data-20260805-2109.sql
```

Create a dedicated app user; do not reuse the legacy DB credentials:

```sql
CREATE USER 'cse_app'@'localhost' IDENTIFIED BY '<new strong password>';
GRANT SELECT, INSERT, UPDATE, DELETE ON cse_department.* TO 'cse_app'@'localhost';
```

## 3. Deploy the backend

```sh
git fetch && git checkout new-optimisedbackend
cd userService && npm ci
```

## 4. Write the production `.env` (all secrets NEW — never reuse legacy values)

The legacy JWT secret was the literal `"karan"` and was logged to stdout;
treat every legacy secret as burned.

```
BACKEND_PORT=<production port>
NODE_ENV=production
CORS_ORIGIN=<site origin>
DB_NAME=cse_department
DB_USER=cse_app
DB_PASSWORD=<from step 2>
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET_KEY=<openssl rand -hex 32>        # boot refuses to start without it in production
EXPIRES_IN=1h
REQUIRE_AUTH_WRITES=false                    # frontend sends no tokens yet; flip later
ADMIN_EMAIL=webmaster.cse@nith.ac.in
ADMIN_EMAIL_PASSWORD=<NEW app password — rotate the old one>
RESET_LINK_BASE=https://cse.nith.ac.in/reset-password
LIBREOFFICE_PATH=<path to soffice>           # docx→pdf conversion
```

`REQUIRE_AUTH_WRITES=false` matches legacy behavior (~120 write endpoints
open). Flip to `true` the moment the frontend attaches Authorization headers.

## 5. Point the frontend at the new backend

The shipped pages call through the `/backend` proxy prefix (inferred from code —
there is no committed `NEXT_PUBLIC_API_URL`). Update the reverse-proxy upstream
for `/backend` to the new service port; no frontend redeploy should be needed.
Keep the legacy proxy behavior: strip `/backend` and forward to the service
**root** (e.g. nginx `location /backend/ { proxy_pass http://127.0.0.1:<port>/; }`).
The backend serves the full legacy route table at root for exactly this reason
(`/api/v1/...` is the same table, for new clients), and stored image URLs
(`/backend/readImage/<file>`) also resolve at root.

## 6. Invalidate migrated credentials

The dump carries the live legacy bcrypt hashes, and rotating the JWT secret
already logs everyone out — but the passwords themselves must die too:

```sh
mysql -u root -p cse_department < force-password-reset.sql   # expect accounts_invalidated = 19
```

Recovery paths (verify mail sends before announcing):

- 18 faculty accounts: "forgot password" → `POST /auth/passwordreset` with their
  `uniqueFacultyId`; the 15-minute link goes to the email on their faculty row
  (every faculty row has one).
- Admin (`username: admin`): `POST /auth/passwordreset/admin` — link goes to
  `webmaster.cse@nith.ac.in`.
- 9 faculty (the newer rows, ids 42–51) never had accounts; they register
  through the normal `POST /auth/signUp` flow.

Then notify faculty that passwords were reset and how to recover.

## 7. Smoke-check

- `GET /faculty/get` returns 27 rows; homepage, publications, students pages render.
- Reset mail arrives and the link sets a new password; `signIn` returns
  `firstlogin: false` afterwards.
- An image URL (`/backend/readImage/…`) and a docx/pdf resume download work.
- Watch the backend log for 500s during the first day; the JSON error envelope
  is intact, so client-visible failures will be explicit.

## Known losses (deliberate — documented in `migration-review.md`)

- Legacy `courses` table content (its `facultysubjects` links were orphaned).
- 120 rows from the lowercase `students` table (unmigratable).
- Faculty CS019 (Preeti Soni) dropped per review.
- DST-FST project amount discrepancy (₹2.23L vs ₹2.23Cr) left as-is — flag to the department.
- Free-text `FacultyInfos.{educationalQualification, teachingExperience, administrativeExperience, honorsRecognitions}` and `SignUps.name` have no home in the new schema; they exist only in the legacy backup from step 1.
