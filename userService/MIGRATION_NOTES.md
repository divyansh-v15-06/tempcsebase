# userService rewrite — compatibility & behavior notes

Complete rewrite of the backend against the clean schema in `/schema-design`
(41 tables, real FKs, typed columns). **Every legacy endpoint path is preserved**
(including quirks like `POST /programOffered/post`, `GET /expertTalk/getTop`,
`GET /qualification/highest/get`, the `/get/admin` twins) and requests/responses
keep the legacy field names (`pdfLink`, `shorting`, `uniqueFacultyId`, `vender`,
`filledDate`, `Convenor`, `Sem`, …) — mapped in `src/controllers/entity-maps.js`.

Smoke-tested end-to-end against the staging DB: 60/60 checks (auth flow, every
entity CRUD, joins, dedup 409s, aggregates, docx resume/report, cascades).

## Deliberate behavior changes (fixes, not regressions)

| Area | Legacy | Now |
|---|---|---|
| Duplicate creates | dedup checks ran but the row was inserted anyway (or checked after insert) | proper **409 Conflict**; nothing inserted. Keys: publication `doi`, patent/project/consultancy `referenceNo`, course `courseCode+academicYear`, event `title+startDate`, supervision `researchTopic`, qna `question` |
| Faculty links | attached by re-finding the parent **by title**, often outside the transaction; `facultyId=NULL` join rows; duplicate links possible | linked by id inside the same transaction; composite-PK join tables make duplicates impossible |
| `/get` vs `/get/admin` | public variant returned **zero rows** (the `{id:'null'}` bug); admin twin worked | one corrected implementation behind both paths |
| `addFaculty` endpoints | 3 of 4 were dead (controller/service key mismatch) | all work; accept the faculty list under any legacy key |
| Auth | JWT secret literal `"karan"` (logged to stdout); admin = magic `'admin'` username; `firstlogin` read from the wrong table (always `undefined`), never written | secret from `JWT_SECRET_KEY` env (refuses to boot in production without it); `role` claim; `firstlogin` returned on signIn and cleared on first password update |
| Admin gate | `/subjectTaught` writes accepted **any** Authorization header (`//to be implement` stub) | real `role==='admin'` check |
| Other writes (~120 endpoints) | completely open | still open **by default** (the current frontend sends no tokens) behind `writeGuard`; flip `REQUIRE_AUTH_WRITES=true` to enforce JWT on all writes |
| Password reset | two divergent implementations (different tables, different hosts, hardcoded Gmail sender) | one flow; link base from `RESET_LINK_BASE` env |
| Bulk CSV | every upload force-renamed to one shared `public/temp/data.csv` (concurrent imports clobbered each other); the parser ignored its path argument | per-request unique upload file, parsed then deleted |
| `/count/get` publication count | counted only publications present in the join table (raw SQL with hardcoded schema name `cseBackend`) | counts all publications |
| `/topentries/get` | third entry queried `type: undefined` (BookChapter map typo) → newest of *any* type | Book+BookChapter (type 3,4) correctly |
| `/analytics/get` | cross-referenced faculty by **email string** (rows without email silently vanished) | same response shape, cross-referenced by id |
| `/research/get` (research news) | dead `ReserchNews` table; repository computed the feed anyway | computed feed only (latest 3 publications ∪ projects ∪ patents); `GET /research/get/:id` now 404s with an explanatory message |
| `/year/*` | one-column `Years` table | `GET /year/get` derives `[{id, year}]` from `students.admission_year`; POST/DELETE are informative no-ops |
| Announcements | two identical tables (public/private), client-pre-split `date`/`month`/`year` strings | one table + `is_private`; split parts still accepted on input and emitted on output; `month`/`year` query filters work via the real DATE |
| Achievements / Academics news | two identical tables | one `posts` table with a category; endpoints unchanged |
| Placement stats | hand-entered `percent`/`percentJobOffered` | DB-generated from counts; input values for them are ignored |
| Image upload | any file type/size, extension taken verbatim | extension allowlist (jpg/jpeg/png/webp/gif), 5 MB cap; same URL contract (`/backend/readImage/<file>`) |
| Responses | shared mutable `SuccessResponse`/`ErrorResponse` singletons (cross-request bleed) | per-request envelopes, same JSON shape |

## Input compatibility (what the API still accepts)

- Dates: ISO `YYYY-MM-DD` **and** legacy `DD/MM/YYYY`; months as names or numbers;
  `to: "Present"` in teaching experience.
- Faculty references: `CS0<id>` codes everywhere the legacy API used them
  (body `facultyId`/`associatedFaculty`/`facultyNames`/`faculties`, URL params
  like `/getYear/CS07`, resume `?uniqueId=`).
- Students: `Sem`, `picture`, `programmEnroled` labels (`bachelor|master|dualdegree|master_ai`).
- Publication `type` labels: `Journal | Conference | Book | Book Chapter | BookChapter`.

## Running

```
cp .env.example .env   # set JWT_SECRET_KEY, DB_*, mail creds
npm install
npm run dev            # or: npm start
```

The database must be created from `/schema-design/schema.sql` (see
`/schema-design/README.md`; `staging-db.sh` automates a local instance).
There are no sequelize migrations — the DDL file is the source of truth for
the initial deployment; adopt migrations from this baseline going forward.

## Not carried over

- `SignUps`, `Years`, `ReserchNews` tables (see `/schema-design/SUMMARY.md`).
- The dead `std-prg` stack, `departmentReport` route (was unmounted and pointed
  at a nonexistent controller), `/profile` upload form page, `parser/` script.
- Committed secrets (Gmail app password, JWT literal) — **rotate the old ones**.

## Frontend-compat additions (from auditing the shipped cseFrontend `dev` branch)

The deployed frontend calls a few endpoints/verbs the legacy backend never
served (they 404'd silently in production). This backend serves them:

- `POST /hod/update/:id` and `POST /carousel/update/:id` (UI uses POST, not PUT)
- `PUT|POST /carousel/update/:id` (legacy had no carousel update at all)
- `DELETE /aboutus/delete/:id` (legacy had no about delete)
- `POST /labs/bulk` (labs CSV import button existed with no backend route)
- `GET /event/getYear` (derived from `YEAR(start_date)` — events have no year column)
- `POST /private/announcement` accepts the department-notices form as shipped:
  `link` is an alias for `pdfLink`, and a missing date defaults to today.

## Post-migration verification fixes (Aug 2026, after the exhaustive endpoint audit)

- **Temporary faculty sentinel round-trips**: the shipped UI sends and branches on
  `position === '---'`; the clean DB stores `position NULL + is_permanent 0`.
  `facultyIn` maps `'---'` → temporary, `facultyOut` re-emits `'---'`, and
  `GET /faculty/get?position=---` filters on `is_permanent = 0`.
- **ORCID**: DB stores the bare iD; the API re-expands to `https://orcid.org/<id>`
  (the shipped UI renders the value verbatim as a link).
- **Faculty token lists**: literal `null`/`undefined` tokens (the shipped admin
  modals append `sessionStorage.getItem('userId')`, which can be the string
  "null") are dropped before resolution instead of 404-ing the whole create.
- **`referenceNo: ''`** from the shipped modals is normalized to NULL
  (patent/project/consultancy) so it can't collide on the UNIQUE key or dodge dedup.
- **researchSupervision duplicate create** returns the legacy 200 +
  `Duplicate Topic found, skipping creation` body the shipped page's toast
  expects (the only entity exempt from the 409 contract above).
- **Event filters**: `startYear`/`endYear` now apply to events, and `faculty=` is
  accepted as the alias the shipped consultancy page sends.
- Added `GET /expertTalk/endDate` and `GET /AdministrativeExperience/getYear`
  (+ `startYear`/`endYear` filters on the list) — polled by shipped dropdowns.
- **docx generators** sanitize XML-invalid control characters and render the
  photo placeholder when a faculty has no photo URL.
- **Upload/auth/validation hardening**: multer errors return the JSON envelope
  (413/400) instead of an HTML stack trace; missing signIn/reset identifiers
  return 400 instead of a Sequelize 500; `courseLevel` is validated against
  UG/PG; by-id reads no longer leak across public/private and
  achievement/academic-news category twins; QnA/announcement bulk CSV paths
  honor the same dedup/date defaults as their single-create endpoints.
