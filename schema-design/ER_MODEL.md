# Proposed ER Model — CSE Department Backend (userService)

**Scope.** Clean, normalized MySQL 8 schema reverse-engineered from the code in `userService/src`
(models, migrations, repositories, services, controllers, routes, seeders, docx templates).
Design-only: no live DB touched. To be validated against the real dump.

**ORM detected:** Sequelize 6 over `mysql2` (`sequelize` + `sequelize-cli` in `package.json`,
`src/models/*` + `src/migrations/*` in sequelize-cli layout). All raw SQL found is one
`Sequelize.literal` subquery in `count-service.js`. → Deliverable model files are **Sequelize**.

**Conventions used below (and in `schema.sql` / `models/`):**
- `snake_case` table and column names; plural table names; surrogate `id INT AUTO_INCREMENT` PK unless stated.
- Every table: `created_at DATETIME NOT NULL`, `updated_at DATETIME NOT NULL` (Sequelize `timestamps` + `underscored`). Not repeated in the column tables below.
- Engine `InnoDB`, charset `utf8mb4`, collation `utf8mb4_0900_ai_ci`.
- Money → `DECIMAL`, real dates → `DATE`, calendar years → `YEAR`, months → `TINYINT (1–12)`,
  long prose → `TEXT`, URLs → `VARCHAR(1024)` (current `VARCHAR(255)` truncates the absolute
  URLs the app stores).
- `academic_session VARCHAR(9)` holds `'2023-2024'`-style strings (the format the report
  generator produces and compares against).
- FK columns are always `<entity>_id`; every FK has an explicit `ON DELETE` / `ON UPDATE`.

---

## 1. Lookup tables

### 1.1 `programs`  *(replaces `programs`; seed values preserved)*
Degree programs students enrol in. Seeded with fixed IDs that live application code hardcodes
(`user-service.js` map `{bachelor:1, master:2, dualdegree:3, master_ai:4}`, `count-service.js`
counts by literal 1/2/3/(2,4)) — so IDs are **manually assigned, not auto-increment**.

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK**, no auto-increment (seeded: 1=bachelor, 2=master, 3=dualdegree, 4=master_ai) |
| name | VARCHAR(50) | NO | **UNIQUE** (`std-prg-repository` looks programs up by name) |

### 1.2 `research_types`  *(replaces `researchTypes`; seed values preserved)*
Publication categories. IDs hardcoded in `publication-service.js` maps
(`{Journal:1, Conference:2, Book:3, "Book Chapter":4}`).

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK**, manual (1=Journal, 2=Conference, 3=Book, 4=BookChapter) |
| name | VARCHAR(50) | NO | **UNIQUE** |

### 1.3 `supervision_types`  *(replaces `supervisionTypes`; seed values preserved)*
Research-supervision program level. IDs hardcoded (`{MTech:1, PhD:2}` — one map even typos `MTEch`).

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK**, manual (1=MTech, 2=PhD) |
| name | VARCHAR(50) | NO | **UNIQUE** |

---

## 2. People & auth

### 2.1 `faculty`  *(replaces `Faculties`)*

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** AUTO_INCREMENT |
| faculty_code | VARCHAR(20) | NO | **UNIQUE**. Replaces `uniqueFacultyId` (`'CS0'+id`, e.g. `CS07`). It is a real business key: CSV imports, URL params, JWT claims and the auth link all use it, so it stays — but now constrained unique (today it is unconstrained with default `'CS0'`, and bulk-import failures can leave colliding `'CS0'` rows) |
| name | VARCHAR(255) | NO | **INDEX** — used as a de-facto join key by resume/report/analytics faculty filters (`facultyFilter.name`) |
| position | VARCHAR(100) | YES | e.g. 'Professor', 'Associate Professor', 'Assistant Professor' (report generator groups on these exact strings) |
| is_permanent | TINYINT(1) | NO | DEFAULT 1. Replaces the sentinel `position = '---'` that `faculty-service.js` uses to mean "not permanent" (`?parmanent=` filter → `position != '---'`) |
| phone | VARCHAR(20) | YES | from `phoneNo` |
| email | VARCHAR(255) | NO | **UNIQUE** (already unique today). NOTE: current data stores obfuscated `name[at]nith[dot]ac[dot]in` — normalize on import |
| portfolio_url | VARCHAR(512) | YES | **UNIQUE** (already unique today; multiple NULLs allowed) |
| photo_url | VARCHAR(1024) | YES | absolute URL produced by `/upload/image` |
| sort_order | INT | YES | **INDEX**. Replaces misspelled `shorting` — the only ORDER BY of the faculty list |
| research_interests | TEXT | YES | from `researchInterests` (VARCHAR(255) today) |

`first_login` moves to `user_accounts` (it is an auth concern; today it sits on `Faculties`
but is read off the `SignUps` row — always `undefined`).

### 2.2 `faculty_profiles`  *(replaces `FacultyInfos` — extended profile a faculty fills in after login)*

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | NO | **UNIQUE**, FK → `faculty.id` ON DELETE CASCADE (true 1:1; today `facultyId` has an FK but no unique, and controllers even write the *string* code into this INT column) |
| date_of_birth | DATE | YES | was VARCHAR |
| date_of_joining | DATE | YES | was VARCHAR |
| google_scholar_url | VARCHAR(512) | YES | |
| scopus_url | VARCHAR(512) | YES | |
| publons_url | VARCHAR(512) | YES | |
| orcid | VARCHAR(32) | YES | identifier, not URL |
| research_gate_url | VARCHAR(512) | YES | absorbs BOTH `researchGate` and its duplicate `rgLink` |
| vidwan_url | VARCHAR(512) | YES | |
| linkedin_url | VARCHAR(512) | YES | |

Dropped free-text columns `educationalQualification`, `teachingExperience`,
`administrativeExperience`, `honorsRecognitions` — they duplicate the real child tables
(`faculty_qualifications`, `faculty_teaching_experiences`, `faculty_administrative_experiences`,
`faculty_honors`). Migration: port any non-empty values into those tables (see SUMMARY).

### 2.3 `user_accounts`  *(replaces `SignUps` — login credentials)*

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | YES | **UNIQUE**, FK → `faculty.id` ON DELETE CASCADE. NULL for non-faculty accounts (admin). Replaces the string `uniqueFacultyId` app-side join (no FK today) |
| username | VARCHAR(50) | YES | **UNIQUE**. Only for accounts with no faculty row — today's admin is literally a `SignUps` row with `uniqueFacultyId='admin'` |
| role | ENUM('faculty','admin') | NO | DEFAULT 'faculty'. Today "admin" is a magic string compared in controllers; the admin middleware is a stub |
| email | VARCHAR(255) | YES | only for accounts with no faculty row (faculty email lives on `faculty`; today `SignUps` duplicates `name` + `email` and they drift) |
| password_hash | VARCHAR(100) | NO | bcrypt (`beforeCreate` hook today) |
| first_login | TINYINT(1) | NO | DEFAULT 1. Moved here from `Faculties.firstlogin` |

CHECK: `faculty_id IS NOT NULL OR username IS NOT NULL`.
`SignUps.name` dropped (join to `faculty`).

### 2.4 `staff`  *(replaces `Staffs`)*

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| name | VARCHAR(255) | NO | |
| phone | VARCHAR(20) | YES | |
| email | VARCHAR(255) | NO | **UNIQUE** |
| designation | VARCHAR(100) | NO | report template groups staff by this |
| photo_url | VARCHAR(1024) | YES | |
| time | VARCHAR(100) | YES | ⚠ semantics never used in code — **AMBIGUOUS**, verify against dump before keeping/renaming |

### 2.5 `students`  *(replaces `Students`; `Years` lookup dropped — see Cleanup note 14)*

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| name | VARCHAR(255) | NO | |
| roll_no | VARCHAR(20) | NO | **UNIQUE** (already) |
| email | VARCHAR(255) | NO | **UNIQUE** (already) |
| photo_url | VARCHAR(1024) | YES | today dead: controller reads `picture`, column is `photo`, value silently dropped |
| program_id | INT | NO | **INDEX**, FK → `programs.id` ON DELETE RESTRICT (fixes typo'd `programmEnroled`; today ON DELETE CASCADE would delete students with their program) |
| current_semester | TINYINT | NO | **INDEX**, CHECK 1–10 (model validator, now DB-enforced) |
| admission_year | SMALLINT | NO | **INDEX**. Replaces `year`. See Cleanup note 14 for the `Years`-table decision |

### 2.6 `phd_scholars`  *(replaces `PhdScholars` — public research-scholar directory)*

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| name | VARCHAR(255) | NO | |
| roll_no | VARCHAR(20) | YES | |
| email | VARCHAR(255) | YES | |
| supervisor | VARCHAR(255) | YES | merges duplicate columns `Supervisor` + `guide` (migration: `COALESCE(Supervisor, guide)`) — free text; may name external people, so no FK (flagged) |
| co_supervisor | VARCHAR(255) | YES | from `CoSupervisor` |
| status | VARCHAR(30) | YES | **INDEX** — `count-service` matches exact strings `'pursuing'` / `'passed'`; ENUM candidate once dump confirms the value set |
| registration_year | YEAR | YES | written only via CSV bulk import today |
| dissertation_title | VARCHAR(500) | YES | merges duplicate columns `title` + `dissertation` (migration: `COALESCE(title, dissertation)`) |
| last_qualification | VARCHAR(255) | YES | |
| research_area | VARCHAR(500) | YES | |
| end_date | DATE | YES | was VARCHAR |
| time | VARCHAR(100) | YES | ⚠ semantics unclear (duration? timing?) — **AMBIGUOUS**, verify against dump |
| photo_url | VARCHAR(1024) | YES | |
| portfolio_url | VARCHAR(512) | YES | model declared this column twice |
| linkedin_url | VARCHAR(512) | YES | from `LinkedIn` |
| google_scholar_url | VARCHAR(512) | YES | from `GoogleScholar` |
| scopus_url | VARCHAR(512) | YES | from `Scopus` |

---

## 3. Faculty CV satellites (1:N, real FKs)

Today `Honors`, `Exposures`, `Qualification` (singular table!), `teachingExps` carry a bare
`facultyId INT` with **no FK constraint**; `AdministrativeExperiences` and `expertTalks` have real
FKs. All six now get `faculty_id INT NOT NULL, FK → faculty.id ON DELETE CASCADE ON UPDATE CASCADE`
+ **INDEX (faculty_id)** (every read path filters on it).

### 3.1 `faculty_qualifications`  *(replaces `Qualification`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | NO | FK as above |
| degree_name | VARCHAR(255) | NO | from `nameOfDegree` |
| university_name | VARCHAR(255) | NO | |
| passing_year | YEAR | NO | was VARCHAR — "highest qualification" query sorts this; string sort was lexicographic |

### 3.2 `faculty_teaching_experiences`  *(replaces `teachingExps`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | NO | FK |
| position | VARCHAR(255) | NO | |
| department | VARCHAR(255) | NO | |
| start_date | DATE | NO | from `from` (reserved-word-adjacent name) |
| end_date | DATE | YES | from `to`; **NULL = current** (replaces the magic string `'Present'` the resume generator special-cases) |

### 3.3 `faculty_administrative_experiences`  *(replaces `AdministrativeExperiences`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | NO | FK |
| position | VARCHAR(255) | NO | |
| organisation | VARCHAR(255) | YES | |
| start_date | DATE | YES | was VARCHAR (`DD/MM/YYYY` strings via CSV, incl. junk like `15/2/224`) |
| end_date | DATE | YES | |

### 3.4 `faculty_honors`  *(replaces `Honors`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | NO | FK |
| title | VARCHAR(500) | NO | |
| given_by | VARCHAR(255) | NO | |
| year | YEAR | NO | was VARCHAR |

### 3.5 `faculty_exposures`  *(replaces `Exposures`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | NO | FK |
| title | VARCHAR(255) | NO | drops the odd default `'Untitled Exposure'` |
| description | TEXT | YES | |

### 3.6 `expert_talks`  *(replaces `expertTalks`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | NO | FK |
| title | VARCHAR(500) | NO | |
| venue | VARCHAR(255) | YES | |
| start_date | DATE | YES | was VARCHAR |
| end_date | DATE | YES | |
| academic_session | VARCHAR(9) | YES | **INDEX** (distinct-values dropdown) |
| description | TEXT | YES | |

---

## 4. Research output entities (shared rows, M:N to faculty)

Pattern preserved from the current code: the entity row is shared, internal co-authors are join
rows, and a free-text `author_text` keeps the *printed* author list (it legitimately includes
external authors, so it is not derivable from the join). What changes: real types, unique keys the
services already assume, composite-PK join tables (today duplicate links are freely created), and
no more `facultyId = NULL` join rows (see Cleanup note 8).

### 4.1 `publications`  *(replaces `publications`)*

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| title | VARCHAR(500) | NO | **INDEX (prefix)** — `findOne({title})` is how services re-find rows |
| venue_name | VARCHAR(500) | YES | from `name` (journal/conference/book name) |
| volume | VARCHAR(50) | YES | |
| issue | VARCHAR(50) | YES | |
| page_range | VARCHAR(50) | YES | from `pageNo` |
| year | YEAR | YES | **INDEX** — was VARCHAR; every list sorts `year DESC` (lexicographic today), filters `Op.between` 1999..now |
| month | TINYINT | YES | CHECK 1–12; was VARCHAR (`Op.between` used on it) — migration maps names→numbers |
| academic_session | VARCHAR(9) | YES | in composite index below |
| doi | VARCHAR(255) | NO | **UNIQUE** — the create-dedup key is `(doi, title)`; a plain-`doi` unique is the honest constraint. ⚠ Flagged: if the dump holds placeholder DOIs ('NA', ''), relax to plain INDEX (see SUMMARY) |
| research_type_id | INT | YES | FK → `research_types.id` ON DELETE RESTRICT (from `type`; migration had CASCADE — deleting a lookup must not delete publications) |
| indexing | ENUM('SCI(E)','Scopus','ESCI','Other') | NO | DEFAULT 'Other'. Today: model says INTEGER, DB says STRING, code compares `'SCI(E)'/'Scopus'/'ESCI'` and buckets everything else 'Other' |
| journal_quartile | VARCHAR(3) | NO | DEFAULT 'T'. ⚠ 'T' semantics unknown (default only, never explained) — ENUM('Q1'..'Q4',…) once dump confirms values |
| author_text | VARCHAR(1000) | YES | from `authorName` — printed author list incl. externals |
| isbn | VARCHAR(32) | YES | |

**Indexes:** `(research_type_id, academic_session)` (report counts group by exactly this pair),
`(year)`, `(indexing)`, `(title(191))`.

### 4.2 `faculty_publications`  *(replaces `facultypublications`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| publication_id | INT | NO | FK → `publications.id` ON DELETE CASCADE |
| faculty_id | INT | NO | FK → `faculty.id` ON DELETE CASCADE. Was declared STRING in the model vs INT in the DB; now INT, NOT NULL (no more null-faculty membership rows) |

**PK (publication_id, faculty_id)** — kills duplicate links by construction. **INDEX (faculty_id)**
for the faculty-scoped reads (`auth/get`, DISTINCT facultyId, per-faculty resume).

### 4.3 `patents`  *(replaces `Patents`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| title | VARCHAR(500) | NO | **INDEX (prefix)** |
| status | VARCHAR(50) | NO | |
| reference_no | VARCHAR(100) | NO | **UNIQUE** — the service dedup key |
| year | YEAR | NO | **INDEX** |
| month | TINYINT | YES | CHECK 1–12 |
| place | VARCHAR(255) | YES | |
| filed_date | DATE | YES | fixes `filledDate` typo; was VARCHAR |
| granted_date | DATE | YES | was VARCHAR |
| academic_session | VARCHAR(9) | YES | **INDEX** |
| author_text | VARCHAR(1000) | YES | |

### 4.4 `faculty_patents`  *(replaces `FacultyPatents`)* — PK (patent_id, faculty_id), both FK CASCADE, INDEX (faculty_id).

### 4.5 `projects`  *(replaces `Projects`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| title | VARCHAR(500) | NO | **INDEX (prefix)** |
| status | VARCHAR(30) | NO | **INDEX** — `count-service` filters `status='Ongoing'`; ENUM candidate |
| reference_no | VARCHAR(100) | NO | **UNIQUE** — service dedup key |
| funding_agency | VARCHAR(255) | YES | **INDEX** (distinct-values dropdown) |
| funding_amount | DECIMAL(14,2) | YES | was VARCHAR |
| duration | VARCHAR(50) | NO | free text ('3 years'); left as-is — no code parses it |
| year | YEAR | NO | **INDEX** |
| month | TINYINT | YES | CHECK 1–12 |
| academic_session | VARCHAR(9) | YES | **INDEX** |
| principal_investigator | VARCHAR(255) | YES | free text (can be external) — see Cleanup note 7 |
| co_principal_investigator | VARCHAR(255) | YES | from `coprincipalInvestigator` |

### 4.6 `faculty_projects`  *(replaces `FacultyProjects`)* — PK (project_id, faculty_id), FKs CASCADE, INDEX (faculty_id).

### 4.7 `consultancies`  *(replaces `Consultancies`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| reference_no | VARCHAR(100) | NO | **UNIQUE** — bulk dedup key |
| title | VARCHAR(500) | NO | **INDEX (prefix)** |
| client_organisation | VARCHAR(255) | YES | **INDEX** (distinct-values dropdown) |
| amount | DECIMAL(14,2) | YES | was VARCHAR |
| start_year | YEAR | YES | **INDEX** — default sort key |
| academic_session | VARCHAR(9) | YES | **INDEX** |
| status | VARCHAR(30) | YES | |
| author_text | VARCHAR(1000) | YES | |

### 4.8 `faculty_consultancies`  *(replaces `facultyconsultancies`)* — PK (consultancy_id, faculty_id), FKs CASCADE (today both FK columns are even nullable), INDEX (faculty_id).

### 4.9 `research_supervisions`  *(replaces `researchSupervisions` — supervision entries on faculty CVs)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| supervision_type_id | INT | NO | FK → `supervision_types.id` ON DELETE RESTRICT (from `program`; migration had CASCADE) |
| scholar_name | VARCHAR(255) | NO | |
| roll_no | VARCHAR(20) | NO | |
| research_topic | VARCHAR(500) | YES | **INDEX (prefix)** — the (fragile) service dedup key; deliberately *not* unique |
| status | VARCHAR(30) | YES | |
| year | YEAR | YES | **INDEX** |
| academic_session | VARCHAR(9) | YES | **INDEX** |
| co_supervisor | VARCHAR(255) | YES | fixes `coSupervisior` typo |

Overlaps `phd_scholars` (both carry scholar name/roll/status) — kept separate on purpose:
`phd_scholars` is the public directory, `research_supervisions` the per-faculty CV line items.
Flagged in SUMMARY as a candidate future merge.

### 4.10 `faculty_research_supervisions` — PK (research_supervision_id, faculty_id), FKs CASCADE, INDEX (faculty_id). No more `facultyId = NULL` rows.

### 4.11 `courses`  *(replaces `subjectTaughts`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| course_code | VARCHAR(20) | NO | in **UNIQUE (course_code, academic_year)** — code enforces global `courseCode` uniqueness app-side (the only enforced dedup in the codebase); scoping by year keeps history possible. Flagged |
| course_name | VARCHAR(255) | NO | |
| semester | TINYINT | NO | CHECK 1–10 (model validator → DB) |
| course_level | ENUM('UG','PG') | NO | already the schema's only ENUM |
| lecture_hours | TINYINT | NO | CHECK 0–4 (model said 1–4; 0 allowed for lab-only safety) |
| tutorial_hours | TINYINT | NO | CHECK 0–1 |
| practical_hours | TINYINT | NO | CHECK IN (0,2,4) |
| academic_year | VARCHAR(9) | NO | |

### 4.12 `faculty_courses`  *(replaces `facultysubjects`)* — PK (course_id, faculty_id), FKs CASCADE, INDEX (faculty_id). Was the worst join table: STRING facultyId, broken `belongsTo` on literal `"Id"`.

### 4.13 `events`  *(replaces `Events`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| title | VARCHAR(500) | NO | **INDEX (prefix)** |
| category | VARCHAR(50) | YES | **INDEX** (distinct-values dropdown) |
| event_type | VARCHAR(50) | YES | **INDEX** — from `type` ('STC', 'E-STC', 'FDP', …; analytics collapses STC variants) |
| venue | VARCHAR(255) | NO | |
| sponsoring_agency | VARCHAR(255) | NO | |
| start_date | DATE | NO | **INDEX** — was VARCHAR; analytics does `new Date(startDate).getFullYear()`; `(start_date, end_date)` is the bulk dedup key |
| end_date | DATE | YES | |
| academic_session | VARCHAR(9) | YES | **INDEX** |
| convenor | VARCHAR(255) | YES | from PascalCase `Convenor` |
| coordinator | VARCHAR(255) | YES | from `Coordinator` |
| link_url | VARCHAR(1024) | YES | from `Link` |

`authorName` dropped — never populated by any controller (commented out twice); verify dump is
empty before discarding (SUMMARY checklist).

### 4.14 `faculty_events`  *(replaces `facultyevents`)* — PK (event_id, faculty_id), FKs CASCADE, INDEX (faculty_id).

---

## 5. Department content

### 5.1 `announcements`  *(merges `announcements` + `privateAnnouncements`)*
Both tables are byte-identical in shape; "private" was only a URL prefix (with zero auth).
One table + a visibility flag.

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| title | VARCHAR(500) | NO | search endpoint filters on it (in JS today) |
| pdf_url | VARCHAR(1024) | NO | from `pdfLink` |
| announced_on | DATE | NO | merges the client-pre-split `date` + `month` + `year` VARCHAR triplet. Month/year filters become `MONTH()`/`YEAR()` or range scans on the index |
| is_private | TINYINT(1) | NO | DEFAULT 0 |

**Index:** `(is_private, announced_on)`.

### 5.2 `posts`  *(merges `Achievements` + `AcademicsNews`; `ReserchNews` dropped — see Cleanup notes 10–11)*
The two tables have identical columns, identical CRUD, identical top-N endpoints.

| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| category | ENUM('achievement','academic_news') | NO | discriminator (source table on migration) |
| title | VARCHAR(500) | NO | |
| description | TEXT | NO | today VARCHAR(255-10000) with a 10k app validator — guaranteed truncation bugs |
| photo_url | VARCHAR(1024) | YES | |
| pdf_url | VARCHAR(1024) | YES | NOT NULL in models today, but nullable here — dump likely has blanks |
| published_on | DATE | YES | from VARCHAR `date`; "top N" can finally order by date instead of `id DESC` |

**Index:** `(category, published_on)`.

### 5.3 `about_sections`  *(replaces `Abouts`)* — id PK; `title VARCHAR(255) NULL`; `description TEXT NOT NULL`. (App truncate-then-insert makes it a de-facto singleton; keeping a table.)

### 5.4 `programs_offered`  *(replaces `ProgramsOffereds` — double plural)* — id PK; `title VARCHAR(255) NOT NULL`; `description TEXT NOT NULL`. Page content describing offered programs; distinct from the `programs` enrollment lookup (naming kept close to code to avoid confusion — documented).

### 5.5 `home_slides`  *(replaces `Homes`)* — id PK; `image_url VARCHAR(1024) NOT NULL`. Homepage carousel.

### 5.6 `hod_messages`  *(replaces `hods`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| faculty_id | INT | YES | FK → `faculty.id` ON DELETE SET NULL — the HOD *is* a faculty member; optional link added, free-text kept for history/externals |
| name | VARCHAR(255) | YES | |
| message | TEXT | YES | |
| image_url | VARCHAR(1024) | YES | from `image` |

App reads it with `findOne()` (singleton semantics).

### 5.7 `qna`  *(replaces `QnAs`)* — id PK; `question VARCHAR(500) NOT NULL` (**INDEX (prefix)** — create dedups by exact question), `answer TEXT NOT NULL`. Model demanded NOT NULL, DB allowed NULL; now enforced.

### 5.8 `syllabus_documents`  *(replaces `Syllabuses`)* — id PK; `title VARCHAR(255) NOT NULL`; `pdf_url VARCHAR(1024) NOT NULL`.

### 5.9 `calendar_documents`  *(replaces `Calendars`)* — id PK; `title VARCHAR(255) NOT NULL`; `pdf_url VARCHAR(1024) NOT NULL`.

### 5.10 `labs`  *(replaces `labs`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| title | VARCHAR(255) | NO | |
| description | TEXT | NO | |
| photo_url | VARCHAR(1024) | NO | |
| officer_in_charge | VARCHAR(255) | NO | from `OIC` — free-text name of a faculty member; FK candidate flagged in SUMMARY, kept text for now |
| technician | VARCHAR(255) | NO | free-text name of a staff member |

### 5.11 `equipment`  *(replaces `equipment`)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| name | VARCHAR(255) | NO | report template calls it "manufacturer" for `vender` and "cost" for `amount` — template labels, not schema |
| quantity | INT | NO | |
| purchase_date | DATE | YES | from VARCHAR `date` — ⚠ assumed purchase date; verify |
| stock | INT | NO | |
| invoice_no | VARCHAR(100) | YES | from `invoice` |
| indenter | VARCHAR(255) | YES | |
| vendor | VARCHAR(255) | YES | fixes `vender` typo |
| address_contact | VARCHAR(500) | YES | from `addressAndCon` |
| amount | DECIMAL(12,2) | NO | was FLOAT — never store money in FLOAT |
| academic_session | VARCHAR(9) | YES | **INDEX** (report groups equipment per session) |

### 5.12 `placement_stats`  *(replaces `placementStats` — every column was VARCHAR)*
| Column | Type | Null | Notes |
|---|---|---|---|
| id | INT | NO | **PK** |
| branch | VARCHAR(50) | NO | in **UNIQUE (branch, year)** — one stats row per branch per year |
| year | YEAR | NO | |
| candidates | SMALLINT UNSIGNED | NO | |
| placed | SMALLINT UNSIGNED | NO | |
| jobs_offered | SMALLINT UNSIGNED | NO | |
| max_ctc | DECIMAL(10,2) | YES | |
| placed_percent | DECIMAL(5,2) | — | **STORED GENERATED** `ROUND(placed*100/NULLIF(candidates,0),2)` — replaces the hand-entered, drift-prone `percent` |
| offers_percent | DECIMAL(5,2) | — | **STORED GENERATED** from `jobs_offered` — replaces `percentJobOffered` |

---

## 6. Relationship list

| A | Cardinality | B | Why |
|---|---|---|---|
| faculty | 1:1 | faculty_profiles | extended profile filled post-login; today hasOne without unique FK |
| faculty | 1:0..1 | user_accounts | login credentials; today linked only by a string code across `SignUps`/`Faculties` |
| faculty | 1:N | faculty_qualifications | CV entries; today FK-less `facultyId` |
| faculty | 1:N | faculty_teaching_experiences | CV entries; today FK-less |
| faculty | 1:N | faculty_administrative_experiences | CV entries; already FK'd today |
| faculty | 1:N | faculty_honors | CV entries; today FK-less |
| faculty | 1:N | faculty_exposures | CV entries; today FK-less |
| faculty | 1:N | expert_talks | already FK'd today |
| faculty | 1:N (optional) | hod_messages | HOD is a faculty member; new optional FK |
| faculty | M:N | publications | via `faculty_publications` (internal co-authors); external authors stay in `publications.author_text` |
| faculty | M:N | patents | via `faculty_patents` |
| faculty | M:N | projects | via `faculty_projects` |
| faculty | M:N | consultancies | via `faculty_consultancies` |
| faculty | M:N | research_supervisions | via `faculty_research_supervisions` (co-supervision) |
| faculty | M:N | courses | via `faculty_courses` (co-teaching) |
| faculty | M:N | events | via `faculty_events` (organizers) |
| research_types | 1:N | publications | lookup (`type` today, id map hardcoded in services) |
| supervision_types | 1:N | research_supervisions | lookup (`program` today) |
| programs | 1:N | students | lookup (`programmEnroled` today); the dead `std-prg` M:N stack is dropped |

Not modeled on purpose (free text kept): `projects.principal_investigator`,
`phd_scholars.supervisor`, `labs.officer_in_charge`, `events.convenor/coordinator` — all may
reference people outside `faculty`; candidates for optional FKs later (flagged in SUMMARY).

---

## 7. Cleanup notes — what was messy, what changed, why

1. **Dates/years/months stored as VARCHAR everywhere** (`year`, `month`, `startDate`, `endDate`,
   `filledDate`, `grantedDate`, `passingYear`, `from`/`to`, `dateOfBirth`, `date`, …). Every
   `ORDER BY year DESC` and `Op.between` was lexicographic. → real `YEAR`/`DATE`/`TINYINT month`
   types throughout; announcement `date+month+year` triplets collapsed to one `announced_on DATE`.
2. **Money as VARCHAR or FLOAT** (`Project.fundingAmount`, `Consultancy.amount` VARCHAR;
   `equipment.amount` FLOAT) → `DECIMAL`.
3. **Descriptions in VARCHAR(255) with 10,000-char app validators** (About, Achievements,
   AcademicsNews, ProgramsOffered — and ReserchNews validated 10k against a VARCHAR(1000) column)
   → `TEXT`.
4. **Missing FKs on child tables** (`Honors`, `Exposures`, `Qualification`, `teachingExps` had bare
   `facultyId` INTs) → real constrained FKs with CASCADE, matching the FK'd siblings.
5. **Join-table chaos**: model-vs-DB type mismatch (`facultyId` STRING in 3 join models, INT in
   DB), no composite uniqueness anywhere (duplicate links freely created), surrogate `id` PKs,
   nullable FK columns, four naming conventions (`FacultyPatents` vs `facultypublications` vs
   `facultyevent`…), a `belongsTo` on a literal `"Id"` column, and a `through: "facultyevents"`
   string not matching the `facultyevent` model. → seven uniform join tables, composite PK
   `(entity_id, faculty_id)`, both columns INT NOT NULL CASCADE, reverse index on `faculty_id`.
6. **Derived data stored**: `uniqueFacultyId = 'CS0'+id` written back after insert (twice — hook +
   bulk loop, collides on failure at default `'CS0'`); `placementStats.percent`/`percentJobOffered`
   hand-entered. → `faculty_code` kept (it is a genuine business key used in URLs/CSVs/JWTs) but
   UNIQUE-constrained; placement percentages become STORED GENERATED columns.
7. **Same fact written to two places**: `publication.authorName` + join rows; `Patent.authorName`,
   `Consultancy.authorName` likewise; `Project.principalInvestigator`/`co…` + join rows;
   `FacultyInfo.{educationalQualification, teachingExperience, administrativeExperience,
   honorsRecognitions}` free-texts duplicating four real tables; `SignUp.{name,email}` duplicating
   `Faculty`; `FacultyInfo.rgLink` duplicating `researchGate`; `PhdScholar.guide` vs `Supervisor`,
   `dissertation` vs `title` (+ `portfolio` declared twice in the model). → one canonical home per
   fact: `author_text` kept *only* as the printed-authors string (documented), profile free-texts
   dropped in favor of child tables, account table stores credentials only, duplicate columns merged.
8. **`facultyId = NULL` membership rows** deliberately inserted into `facultypublications` /
   `facultyresearchsupervision` so faculty-less items still "exist" (the site's publication count
   even counts via `id IN (SELECT publicationId FROM facultypublications)` with the schema name
   hardcoded). → join columns NOT NULL; membership = the row existing in `publications`; counts
   query the entity table directly.
9. **Auth model**: `SignUps` ↔ `Faculties` joined by an unconstrained string; admin = a `SignUps`
   row whose `uniqueFacultyId` is literally `'admin'` (checked via string compares in controllers;
   the "admin" middleware is an empty stub); `firstlogin` lives on `Faculties` but is read from
   `SignUps` (always undefined, never written). → `user_accounts` with real `faculty_id` FK,
   `role` enum, `first_login` in the right place, `username` for non-faculty accounts.
10. **Dead table**: `ReserchNews` (typo name) — no create/update endpoint exists and its own
    repository ignores the model, computing "research news" as the latest 3 publications ∪
    projects ∪ patents. → dropped (verify dump rows first; SUMMARY checklist).
11. **Near-identical content tables**: `Achievements` and `AcademicsNews` (same 5 columns, same
    CRUD, same top-N) → merged into `posts` with a `category` enum. `announcements` and
    `privateAnnouncements` (identical shape) → merged with `is_private`.
12. **Lookup FKs under misleading names**: `publication.type` → researchTypes,
    `researchSupervision.program` → supervisionTypes, `Student.programmEnroled` (typo) → programs —
    with the id maps re-hardcoded (and typo'd: `MTEch`, `"Book Chapter"` vs `"BookChapter"`) in
    services. → `research_type_id`, `supervision_type_id`, `program_id`; seed values preserved so
    existing ids keep meaning.
13. **Naming normalized**: snake_case everywhere; fixes `shorting`→`sort_order`, `vender`→`vendor`,
    `filledDate`→`filed_date`, `coSupervisior`→`co_supervisor`, `addressAndCon`→`address_contact`,
    `pageNo`→`page_range`, PascalCase columns (`Convenor`, `Coordinator`, `Link`, `Supervisor`,
    `CoSupervisor`, `LinkedIn`, `GoogleScholar`, `Scopus`) lowered; table-name chaos
    (`Qualification` singular, `subjectTaughts`, `ProgramsOffereds` double-plural, `equipment`
    uncountable, `ReserchNews` typo, `placementStats` camelCase) unified.
14. **`Years` table dropped**: it held a single `year INT` per row; `Student.year` was associated
    to it by FK-less convention while queries treat it as a plain value. A one-column entity earns
    nothing — `students.admission_year SMALLINT` + DISTINCT covers the dropdown. ⚠ Flagged: if the
    dump shows `Students.year` containing `Years.id` references (1,2,3…) rather than literal years,
    map through the `Years` rows during import.
15. **Sentinel values → real columns**: `position = '---'` meaning "not permanent" →
    `faculty.is_permanent`; `to = 'Present'` in teaching experience → `end_date NULL`.
16. **Model/DB drift resolved** (migrations vs models disagreed): `publications.indexing`
    INTEGER-in-model vs STRING-in-DB → ENUM; `authorName` accidental NOT NULL (duplicate
    `allowNull` keys) → nullable; `FacultyInfos.createdAt/updatedAt` typed STRING → DATETIME;
    `journalQuartile` created twice across migrations (fresh migrate breaks) → single definition;
    nullability drift on `announcements.month/year`, `QnAs.question/answer`, `equipment.name`,
    `PhdScholars.email`, `supervisionTypes.name` → the stricter, intended side.
17. **Indexes added where the code's query patterns need them** (there are none today beyond four
    unique columns): FK columns on all child/join tables; `faculty.name` (resume/report/analytics
    filter joins on it), `faculty.sort_order` (the only faculty ORDER BY);
    `(research_type_id, academic_session)`, `year`, `indexing`, `title` prefix on `publications`
    (report counts, filters, dedup lookups); `year`/`academic_session` on patents, projects
    (+ `status`, `funding_agency`), consultancies (+ `client_organisation`, `start_year`),
    research_supervisions, expert_talks, events (+ `category`, `event_type`, `start_date`),
    equipment; `students.program_id/current_semester/admission_year`; `phd_scholars.status`;
    `(is_private, announced_on)` on announcements; `(category, published_on)` on posts;
    `(branch, year)` unique on placement_stats.
18. **URL columns widened**: the app stores full absolute URLs (built by `/upload/image`) and
    client-sent `pdfLink`s in VARCHAR(255) → `VARCHAR(1024)` `*_url` columns, consistently named.
