# Summary — current implicit schema vs proposed clean schema

> **Validated:** `schema.sql` was loaded into a throwaway local MariaDB 11.8 instance and the
> Sequelize models in `models/` were run against it — 31/31 checks passed: a column-mapping audit
> of all 41 models against `information_schema` (every attribute ↔ column, nullability, ENUM
> values), plus a full ORM round-trip (inserts on every table, snake_case mapping verified via raw
> SQL, all 9 faculty associations eager-loaded, composite-PK duplicate-link rejection, unique DOI /
> (branch,year) rejection, CHECK + ENUM enforcement, generated percentage columns, CASCADE /
> RESTRICT / SET NULL behavior). Two fixes came out of testing: the `user_accounts` identity CHECK
> moved to the model layer (MySQL forbids CHECKs on FK-CASCADE columns) and that validator's
> null-vs-undefined bug. Caveat: the local server is MariaDB, so `utf8mb4_0900_ai_ci` was swapped
> to `utf8mb4_unicode_ci` for the test only — the shipped DDL keeps the MySQL 8 collation.

## Table count & structure

| | Current (implicit, from models/migrations) | Proposed |
|---|---|---|
| Tables | **45** | **41** |
| …of which join tables | 7 (no uniqueness, surrogate PKs, 3 with STRING facultyId, nullable FK cols, NULL-faculty rows) | 7 (composite PK `(entity_id, faculty_id)`, all INT NOT NULL, CASCADE both ways, reverse index) |
| FK constraints | 10 tables (7 joins + FacultyInfos + expertTalks + AdministrativeExperiences + Students→programs); 4 child tables FK-less | every relationship constrained (19 FKs), explicit ON DELETE/ON UPDATE |
| Unique constraints | 4 columns total (Faculties.email/portfolio, Students.rollNo/email) | 14 (+ the 7 composite join PKs): faculty_code, emails, reference_nos, doi, programs/research_types/supervision_types names, username, (course_code, academic_year), (branch, year) |
| Secondary indexes | none | ~40, derived from actual query patterns (filters, DISTINCT dropdowns, report groupings, sort keys) |
| Date/year columns typed as strings | ~30 | 0 (DATE / YEAR / TINYINT month) |
| Money as VARCHAR/FLOAT | 3 | 0 (DECIMAL) |
| ENUM/CHECK | 1 ENUM (courseLevel), 0 CHECKs | 5 ENUMs, 8 CHECKs |

### Old → new mapping

| Current table(s) | Proposed |
|---|---|
| Faculties | `faculty` (+ `is_permanent` replacing the `'---'` sentinel; `firstlogin` moved out) |
| FacultyInfos | `faculty_profiles` (CV free-text duplicate columns dropped) |
| SignUps | `user_accounts` (FK to faculty, `role` enum, `first_login`, `username`) |
| Staffs | `staff` |
| Students + Years | `students` (`admission_year` inline; **Years dropped**) |
| PhdScholars | `phd_scholars` (dup columns merged: guide/Supervisor, title/dissertation, portfolio×2) |
| Qualification (singular) | `faculty_qualifications` |
| teachingExps | `faculty_teaching_experiences` |
| AdministrativeExperiences | `faculty_administrative_experiences` |
| Honors | `faculty_honors` |
| Exposures | `faculty_exposures` |
| expertTalks | `expert_talks` |
| publications (+facultypublications) | `publications` (+`faculty_publications`) |
| Patents (+FacultyPatents) | `patents` (+`faculty_patents`) |
| Projects (+FacultyProjects) | `projects` (+`faculty_projects`) |
| Consultancies (+facultyconsultancies) | `consultancies` (+`faculty_consultancies`) |
| researchSupervisions (+facultyresearchsupervisions) | `research_supervisions` (+`faculty_research_supervisions`) |
| subjectTaughts (+facultysubjects) | `courses` (+`faculty_courses`) |
| Events (+facultyevents) | `events` (+`faculty_events`; dead `authorName` dropped) |
| announcements + privateAnnouncements | `announcements` (merged; `is_private` flag; one `announced_on DATE`) |
| Achievements + AcademicsNews | `posts` (merged; `category` enum) |
| **ReserchNews** | **dropped** (no write endpoint; its repo computes the feed from publications/projects/patents) |
| Abouts | `about_sections` |
| ProgramsOffereds | `programs_offered` |
| Homes | `home_slides` |
| hods | `hod_messages` (+ optional `faculty_id`) |
| QnAs | `qna` |
| Syllabuses / Calendars | `syllabus_documents` / `calendar_documents` |
| labs | `labs` |
| equipment | `equipment` (typos fixed, money → DECIMAL) |
| placementStats | `placement_stats` (INT counts, generated percentages, UNIQUE(branch, year)) |
| programs / researchTypes / supervisionTypes | kept as lookups, same manual IDs + seed values |
| *(dead)* std-prg M:N stack | dropped (was fully commented out; `program_id` 1:N is the live design) |

---

## ⚠ Flagged ambiguities — please confirm against tomorrow's dump

Guesses I had to make from code alone, in order of impact:

1. **`publications.doi UNIQUE`.** The code's dedup key is the *pair* `(doi, title)` — same DOI
   with a retyped title creates a second row today. I constrained plain `doi` (semantically
   correct). **Check the dump for repeated/placeholder DOIs** (`'NA'`, `''`, `'-'`): if present,
   drop `uq_publications_doi` to a plain index and dedup app-side.
2. **`Students.year` semantics → `admission_year` + Years dropped.** The `Year` model association
   implies `Students.year` stores `Years.id`, but every query treats it as a plain value.
   **Check whether `Students.year` values look like row ids (1,2,3…) or literal years (2021…)**;
   if ids, map through the `Years` table on import.
3. **`posts` merge (Achievements + AcademicsNews) and the announcements merge.** Structurally
   safe (identical shapes), but it changes two API surfaces into one table each. If you'd rather
   keep 1:1 API↔table parity for the frontend, both splits are trivial to restore — say the word
   and I'll split them back.
4. **`ReserchNews` dropped.** No write endpoint exists and the live "research news" feed is
   computed. **Check the dump: if the table holds rows that the site still serves via
   `/research/get`, keep it** (as `research_news` under `posts.category` or its own table).
5. **`journal_quartile` default `'T'`.** Values are unvalidated anywhere; `'T'` is unexplained
   (Top? placeholder?). Kept `VARCHAR(3)` — **once the dump shows the real value set, convert to
   ENUM** and rename the default if `'T'` is junk.
6. **`staff.time` and `phd_scholars.time`.** Never read or transformed by any code path I found.
   Kept verbatim with a comment. **Confirm meaning (office hours? tenure period?) or drop.**
7. **`courses` uniqueness.** App enforces globally-unique `course_code`; I scoped it
   `(course_code, academic_year)` so history doesn't collide. Tighten to global if you prefer
   exact behavioral parity.
8. **`equipment.date` → `purchase_date`.** Assumed purchase date (invoice/vendor context).
9. **`user_accounts` shape.** Admin today is a `SignUps` row with `uniqueFacultyId='admin'`
   (no faculty row, no role, stub middleware). I modeled `role` + nullable `faculty_id` +
   `username` for non-faculty accounts. If more roles exist in practice (e.g. office/editor
   accounts in the dump), extend the enum.
10. **Free-text people references kept as text** (`phd_scholars.supervisor`,
    `projects.principal_investigator`, `labs.officer_in_charge`, `events.convenor/coordinator`,
    `hod_messages.name`): they can name external people. If the dump shows they always match
    `faculty.name`, several can become FKs (I already added the optional `hod_messages.faculty_id`).
11. **`phd_scholars` vs `research_supervisions` overlap** (both carry scholar name/roll/status).
    Kept separate (public directory vs CV line items). If the dump shows them mirroring each
    other row-for-row, consider merging in a later pass.
12. **`faculty.position` values.** The annual report groups on exact strings
    ('Professor', 'Associate Professor', substring-'Assistant Professor'). Left VARCHAR;
    ENUM once the dump shows the full value set.

## Migration-day data transforms (what the import script must handle)

- **Emails are stored obfuscated** (`name[at]nith[dot]ac[dot]in`) in `Faculties`/`SignUps` —
  normalize to real addresses before the UNIQUE + isEmail constraints.
- Parse VARCHAR dates: `DD/MM/YYYY` CSV imports (junk exists, e.g. `15/2/224`), month *names* vs
  numbers in `month` columns, `'Present'` in `teachingExps.to` → `end_date NULL`,
  announcement `date+month+year` triplets → one DATE (day=1 when missing).
- `position='---'` → `is_permanent=0`, position NULL.
- Join tables: drop rows with `facultyId IS NULL` (they only existed to make faculty-less items
  "visible"), dedup `(entity_id, faculty_id)` pairs, cast the STRING `facultyId` columns to INT.
- `SignUps` → `user_accounts`: resolve `uniqueFacultyId` → `faculty.id`; the `'admin'` row gets
  `role='admin'`, `username='admin'`, `faculty_id=NULL`. Seed `first_login` from
  `Faculties.firstlogin`.
- `PhdScholars`: `supervisor = COALESCE(Supervisor, guide)`,
  `dissertation_title = COALESCE(title, dissertation)`.
- `FacultyInfos`: port non-empty `educationalQualification` / `teachingExperience` /
  `administrativeExperience` / `honorsRecognitions` free-texts into the respective child tables
  (or an archive column) before dropping.
- Orphan scan before FK creation: child rows whose `facultyId` has no `Faculties` row
  (nothing stopped deletes on the FK-less tables), `Students.programmEnroled` outside 1–4.
- `placementStats`: cast counts to INT; discard stored `percent`/`percentJobOffered`
  (now generated).
- Uniqueness collisions to pre-check: `reference_no` on patents/projects/consultancies,
  `courseCode`, `faculty.uniqueFacultyId` (bulk-import failures can have left duplicate `'CS0'`).
- MySQL `CHECK`s (semester/hours/month) may reject legacy junk — run the orphan/violation scan
  first, or create constraints after cleaning.

## Security observations (outside schema scope, but found while reading — worth fixing)

- JWT secret is the hardcoded literal `"karan"` (also printed to stdout); admin middleware is an
  empty stub (`//to be implement`) — the `/subjectTaught` "admin" writes accept any Bearer junk.
- Gmail app-password committed in `src/config/server-config.js`, and another password-looking
  comment at `src/repositories/faculty-repository.js:57`. Rotate both.
- ~120 write endpoints (deletes included, e.g. `DELETE /student/deleteall`) have **no auth at all**.
- Deploy workflow SSHes as root to a hardcoded IP with `StrictHostKeyChecking=no`.

*(These don't change the schema, but the `user_accounts.role` design gives the auth layer
something real to enforce when you get to it.)*
