-- ============================================================================
-- CSE Department Backend — proposed clean schema
-- MySQL 8.0+ · InnoDB · utf8mb4
--
-- Design-only deliverable. Tables appear in dependency order (referenced
-- tables before referencing tables), so the file runs top-to-bottom on an
-- empty schema without FOREIGN_KEY_CHECKS tricks.
--
-- FK policy:
--   * CASCADE  — rows owned by a faculty member (CV entries, join rows,
--                account): deleting the faculty removes them, matching the
--                behavior today's code relies on.
--   * RESTRICT — lookup tables (programs, research_types, supervision_types):
--                today's migrations cascade here, which would silently delete
--                publications/students when a seeded lookup row is removed
--                (the seeders' down() even truncates them). Restricting is a
--                deliberate fix, justified inline.
--   * SET NULL — optional attributions (hod_messages.faculty_id).
-- Timestamps: managed by Sequelize; DB defaults kept as a safety net for
-- non-ORM writes (imports, fixes).
-- ============================================================================

-- CREATE DATABASE IF NOT EXISTS cse_department
--   DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- USE cse_department;

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------
-- 1. Lookups (manually-assigned IDs — application code hardcodes them;
--    seed with the exact values currently in src/seeders/)
-- ----------------------------------------------------------------------------

CREATE TABLE programs (
  id          INT          NOT NULL,               -- 1=bachelor, 2=master, 3=dualdegree, 4=master_ai
  name        VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_programs_name (name)               -- code looks programs up by name
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE research_types (
  id          INT          NOT NULL,               -- 1=Journal, 2=Conference, 3=Book, 4=BookChapter
  name        VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_research_types_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE supervision_types (
  id          INT          NOT NULL,               -- 1=MTech, 2=PhD
  name        VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_supervision_types_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 2. People & auth
-- ----------------------------------------------------------------------------

CREATE TABLE faculty (
  id                 INT           NOT NULL AUTO_INCREMENT,
  faculty_code       VARCHAR(20)   NOT NULL,       -- business key 'CS0<id>' used in URLs/CSVs/JWTs
  name               VARCHAR(255)  NOT NULL,
  position           VARCHAR(100)  NULL,           -- 'Professor' / 'Associate Professor' / 'Assistant Professor' / ...
  is_permanent       TINYINT(1)    NOT NULL DEFAULT 1,  -- replaces the position='---' sentinel
  phone              VARCHAR(20)   NULL,
  email              VARCHAR(255)  NOT NULL,       -- de-obfuscate '[at]'/'[dot]' values on import
  portfolio_url      VARCHAR(512)  NULL,
  photo_url          VARCHAR(1024) NULL,
  sort_order         INT           NULL,           -- was 'shorting'; only ORDER BY of the faculty list
  research_interests TEXT          NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_faculty_code (faculty_code),
  UNIQUE KEY uq_faculty_email (email),
  UNIQUE KEY uq_faculty_portfolio_url (portfolio_url),
  KEY idx_faculty_name (name),                     -- resume/report/analytics filter joins on name
  KEY idx_faculty_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_profiles (
  id                 INT           NOT NULL AUTO_INCREMENT,
  faculty_id         INT           NOT NULL,
  date_of_birth      DATE          NULL,
  date_of_joining    DATE          NULL,
  google_scholar_url VARCHAR(512)  NULL,
  scopus_url         VARCHAR(512)  NULL,
  publons_url        VARCHAR(512)  NULL,
  orcid              VARCHAR(32)   NULL,
  research_gate_url  VARCHAR(512)  NULL,           -- absorbs researchGate + duplicate rgLink
  vidwan_url         VARCHAR(512)  NULL,
  linkedin_url       VARCHAR(512)  NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_faculty_profiles_faculty (faculty_id),   -- true 1:1
  CONSTRAINT fk_faculty_profiles_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_accounts (
  id            INT                      NOT NULL AUTO_INCREMENT,
  faculty_id    INT                      NULL,     -- NULL for non-faculty accounts (admin)
  username      VARCHAR(50)              NULL,     -- login id for accounts without a faculty row
  role          ENUM('faculty','admin')  NOT NULL DEFAULT 'faculty',
  email         VARCHAR(255)             NULL,     -- only for accounts without a faculty row
  password_hash VARCHAR(100)             NOT NULL, -- bcrypt
  first_login   TINYINT(1)               NOT NULL DEFAULT 1,  -- moved from Faculties.firstlogin
  created_at    DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME                 NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_accounts_faculty (faculty_id),        -- at most one account per faculty
  UNIQUE KEY uq_user_accounts_username (username),
  CONSTRAINT fk_user_accounts_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE    -- account dies with the person
  -- Invariant "faculty_id OR username must be set" is enforced at the model layer
  -- (models/user-account.js validate.hasIdentity): MySQL forbids CHECK constraints
  -- on columns used in a foreign key with a CASCADE referential action.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE staff (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255)  NOT NULL,
  phone       VARCHAR(20)   NULL,
  email       VARCHAR(255)  NOT NULL,
  designation VARCHAR(100)  NOT NULL,
  photo_url   VARCHAR(1024) NULL,
  time        VARCHAR(100)  NULL,                  -- semantics unclear in source; verify against dump
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_staff_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE students (
  id               INT           NOT NULL AUTO_INCREMENT,
  name             VARCHAR(255)  NOT NULL,
  roll_no          VARCHAR(20)   NOT NULL,
  email            VARCHAR(255)  NOT NULL,
  photo_url        VARCHAR(1024) NULL,
  program_id       INT           NOT NULL,         -- was typo'd 'programmEnroled'
  current_semester TINYINT       NOT NULL,
  admission_year   SMALLINT      NOT NULL,         -- replaces Students.year / the Years lookup
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_roll_no (roll_no),
  UNIQUE KEY uq_students_email (email),
  KEY idx_students_program (program_id),           -- count-service + list filters
  KEY idx_students_semester (current_semester),    -- DISTINCT semester dropdown + filters
  KEY idx_students_admission_year (admission_year),
  CONSTRAINT fk_students_program FOREIGN KEY (program_id)
    REFERENCES programs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- RESTRICT (not the current CASCADE): deleting a seeded program must not
    -- mass-delete its students.
  CONSTRAINT chk_students_semester CHECK (current_semester BETWEEN 1 AND 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE phd_scholars (
  id                 INT           NOT NULL AUTO_INCREMENT,
  name               VARCHAR(255)  NOT NULL,
  roll_no            VARCHAR(20)   NULL,
  email              VARCHAR(255)  NULL,
  supervisor         VARCHAR(255)  NULL,           -- COALESCE(Supervisor, guide) on import; may be external → no FK (flagged)
  co_supervisor      VARCHAR(255)  NULL,
  status             VARCHAR(30)   NULL,           -- 'pursuing' / 'passed' (count-service matches exactly)
  registration_year  YEAR          NULL,
  dissertation_title VARCHAR(500)  NULL,           -- COALESCE(title, dissertation) on import
  last_qualification VARCHAR(255)  NULL,
  research_area      VARCHAR(500)  NULL,
  end_date           DATE          NULL,
  time               VARCHAR(100)  NULL,           -- semantics unclear in source; verify against dump
  photo_url          VARCHAR(1024) NULL,
  portfolio_url      VARCHAR(512)  NULL,
  linkedin_url       VARCHAR(512)  NULL,
  google_scholar_url VARCHAR(512)  NULL,
  scopus_url         VARCHAR(512)  NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_phd_scholars_status (status)             -- pursuing/passed counters
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 3. Faculty CV satellites (1:N, all CASCADE — deleting a faculty removes
--    their CV, which is what today's code assumes where FKs exist at all)
-- ----------------------------------------------------------------------------

CREATE TABLE faculty_qualifications (
  id              INT          NOT NULL AUTO_INCREMENT,
  faculty_id      INT          NOT NULL,
  degree_name     VARCHAR(255) NOT NULL,           -- was nameOfDegree
  university_name VARCHAR(255) NOT NULL,
  passing_year    YEAR         NOT NULL,           -- was VARCHAR; 'highest' query sorts it
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faculty_qualifications_faculty (faculty_id),
  CONSTRAINT fk_faculty_qualifications_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_teaching_experiences (
  id         INT          NOT NULL AUTO_INCREMENT,
  faculty_id INT          NOT NULL,
  position   VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  start_date DATE         NOT NULL,                -- was 'from' VARCHAR
  end_date   DATE         NULL,                    -- was 'to'; NULL = present (replaces the 'Present' magic string)
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faculty_teaching_exp_faculty (faculty_id),
  CONSTRAINT fk_faculty_teaching_exp_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_administrative_experiences (
  id           INT          NOT NULL AUTO_INCREMENT,
  faculty_id   INT          NOT NULL,
  position     VARCHAR(255) NOT NULL,
  organisation VARCHAR(255) NULL,
  start_date   DATE         NULL,                  -- was VARCHAR DD/MM/YYYY (junk values exist in sample CSV)
  end_date     DATE         NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faculty_admin_exp_faculty (faculty_id),
  CONSTRAINT fk_faculty_admin_exp_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_honors (
  id         INT          NOT NULL AUTO_INCREMENT,
  faculty_id INT          NOT NULL,                -- had NO FK constraint today
  title      VARCHAR(500) NOT NULL,
  given_by   VARCHAR(255) NOT NULL,
  year       YEAR         NOT NULL,                -- was VARCHAR
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faculty_honors_faculty (faculty_id),
  CONSTRAINT fk_faculty_honors_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_exposures (
  id          INT          NOT NULL AUTO_INCREMENT,
  faculty_id  INT          NOT NULL,               -- had NO FK constraint today
  title       VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_faculty_exposures_faculty (faculty_id),
  CONSTRAINT fk_faculty_exposures_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE expert_talks (
  id               INT          NOT NULL AUTO_INCREMENT,
  faculty_id       INT          NOT NULL,
  title            VARCHAR(500) NOT NULL,
  venue            VARCHAR(255) NULL,
  start_date       DATE         NULL,              -- was VARCHAR
  end_date         DATE         NULL,
  academic_session VARCHAR(9)   NULL,
  description      TEXT         NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expert_talks_faculty (faculty_id),
  KEY idx_expert_talks_session (academic_session), -- distinct-values dropdown
  CONSTRAINT fk_expert_talks_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 4. Research output (shared entities + faculty join tables)
--    Join tables: composite PK (entity_id, faculty_id) — duplicate links are
--    impossible by construction (today none of the seven have any uniqueness,
--    and duplicates are freely created). Reverse index serves faculty-scoped
--    reads (auth views, DISTINCT facultyId, resume).
-- ----------------------------------------------------------------------------

CREATE TABLE publications (
  id               INT           NOT NULL AUTO_INCREMENT,
  title            VARCHAR(500)  NOT NULL,
  venue_name       VARCHAR(500)  NULL,             -- was 'name' (journal/conference/book name)
  volume           VARCHAR(100)  NULL,            -- legacy data: one row stores an SSRN note here
  issue            VARCHAR(50)   NULL,
  page_range       VARCHAR(50)   NULL,             -- was pageNo
  year             YEAR          NULL,             -- was VARCHAR; sorted/range-filtered everywhere
  month            TINYINT       NULL,             -- was VARCHAR; Op.between used on it
  academic_session VARCHAR(9)    NULL,
  doi              VARCHAR(255)  NULL,            -- legacy data: many rows have no DOI; UNIQUE ignores NULLs
  research_type_id INT           NULL,             -- was 'type'
  indexing         ENUM('SCI(E)','Scopus','ESCI','Other') NOT NULL DEFAULT 'Other',
                                                   -- model said INTEGER, DB said STRING; code compares these literals
  journal_quartile VARCHAR(3)    NOT NULL DEFAULT 'T',  -- 'T' semantics unconfirmed → not an ENUM yet (flagged)
  author_text      VARCHAR(1000) NULL,             -- printed author list incl. external authors
  isbn             VARCHAR(32)   NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_publications_doi (doi),            -- create-dedup key today is (doi,title); see SUMMARY flag
  KEY idx_publications_type_session (research_type_id, academic_session), -- report counts group by exactly this
  KEY idx_publications_year (year),
  KEY idx_publications_indexing (indexing),
  KEY idx_publications_title (title(191)),         -- findOne({title}) re-lookups
  CONSTRAINT fk_publications_research_type FOREIGN KEY (research_type_id)
    REFERENCES research_types (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- RESTRICT (migration had CASCADE): removing a lookup row must not delete publications.
  CONSTRAINT chk_publications_month CHECK (month IS NULL OR month BETWEEN 1 AND 12)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_publications (
  publication_id INT      NOT NULL,
  faculty_id     INT      NOT NULL,                -- was STRING in the model / nullable in the DB
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (publication_id, faculty_id),
  KEY idx_faculty_publications_faculty (faculty_id),
  CONSTRAINT fk_faculty_publications_publication FOREIGN KEY (publication_id)
    REFERENCES publications (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_publications_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE patents (
  id               INT           NOT NULL AUTO_INCREMENT,
  title            VARCHAR(500)  NOT NULL,
  status           VARCHAR(50)   NOT NULL,
  reference_no     VARCHAR(100)  NULL,            -- legacy data: junk refs ('NA') normalized to NULL
  year             YEAR          NOT NULL,
  month            TINYINT       NULL,
  place            VARCHAR(255)  NULL,
  filed_date       DATE          NULL,             -- fixes 'filledDate'; was VARCHAR
  granted_date     DATE          NULL,
  academic_session VARCHAR(9)    NULL,
  author_text      VARCHAR(1000) NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_patents_reference_no (reference_no),  -- service dedup key
  KEY idx_patents_year (year),
  KEY idx_patents_session (academic_session),
  KEY idx_patents_title (title(191)),
  CONSTRAINT chk_patents_month CHECK (month IS NULL OR month BETWEEN 1 AND 12)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_patents (
  patent_id  INT      NOT NULL,
  faculty_id INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (patent_id, faculty_id),
  KEY idx_faculty_patents_faculty (faculty_id),
  CONSTRAINT fk_faculty_patents_patent FOREIGN KEY (patent_id)
    REFERENCES patents (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_patents_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE projects (
  id                        INT           NOT NULL AUTO_INCREMENT,
  title                     VARCHAR(500)  NOT NULL,
  status                    VARCHAR(30)   NOT NULL, -- 'Ongoing' filter in count-service; ENUM candidate
  reference_no              VARCHAR(100)  NULL,     -- legacy data: blank/junk refs normalized to NULL
  funding_agency            VARCHAR(255)  NULL,
  funding_amount            DECIMAL(14,2) NULL,     -- was VARCHAR
  duration                  VARCHAR(50)   NULL,     -- free text; nothing parses it; blank in legacy rows
  year                      YEAR          NOT NULL,
  month                     TINYINT       NULL,
  academic_session          VARCHAR(9)    NULL,
  principal_investigator    VARCHAR(255)  NULL,     -- free text, may be external (flagged)
  co_principal_investigator VARCHAR(255)  NULL,
  created_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_reference_no (reference_no), -- service dedup key
  KEY idx_projects_year (year),
  KEY idx_projects_status (status),
  KEY idx_projects_session (academic_session),
  KEY idx_projects_funding_agency (funding_agency),   -- distinct-values dropdown
  KEY idx_projects_title (title(191)),
  CONSTRAINT chk_projects_month CHECK (month IS NULL OR month BETWEEN 1 AND 12)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_projects (
  project_id INT      NOT NULL,
  faculty_id INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, faculty_id),
  KEY idx_faculty_projects_faculty (faculty_id),
  CONSTRAINT fk_faculty_projects_project FOREIGN KEY (project_id)
    REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_projects_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE consultancies (
  id                 INT           NOT NULL AUTO_INCREMENT,
  reference_no       VARCHAR(100)  NULL,          -- legacy data: every ref was blank/'.'; normalized to NULL
  title              VARCHAR(500)  NOT NULL,
  client_organisation VARCHAR(255) NULL,
  amount             DECIMAL(14,2) NULL,           -- was VARCHAR
  start_year         YEAR          NULL,           -- default sort key
  academic_session   VARCHAR(9)    NULL,
  status             VARCHAR(30)   NULL,
  author_text        VARCHAR(1000) NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_consultancies_reference_no (reference_no), -- bulk dedup key
  KEY idx_consultancies_start_year (start_year),
  KEY idx_consultancies_session (academic_session),
  KEY idx_consultancies_client (client_organisation),      -- distinct-values dropdown
  KEY idx_consultancies_title (title(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_consultancies (
  consultancy_id INT      NOT NULL,                -- today BOTH join columns are nullable
  faculty_id     INT      NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (consultancy_id, faculty_id),
  KEY idx_faculty_consultancies_faculty (faculty_id),
  CONSTRAINT fk_faculty_consultancies_consultancy FOREIGN KEY (consultancy_id)
    REFERENCES consultancies (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_consultancies_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE research_supervisions (
  id                  INT          NOT NULL AUTO_INCREMENT,
  supervision_type_id INT          NOT NULL,       -- was 'program'
  scholar_name        VARCHAR(255) NOT NULL,
  roll_no             VARCHAR(20)  NULL,          -- legacy data: missing for 92 of 233 rows
  research_topic      VARCHAR(500) NULL,
  status              VARCHAR(30)  NULL,
  year                YEAR         NULL,
  academic_session    VARCHAR(9)   NULL,
  co_supervisor       VARCHAR(255) NULL,           -- fixes 'coSupervisior'
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_research_supervisions_type (supervision_type_id),
  KEY idx_research_supervisions_year (year),
  KEY idx_research_supervisions_session (academic_session),
  KEY idx_research_supervisions_topic (research_topic(191)), -- service dedup lookup (fragile; intentionally NOT unique)
  CONSTRAINT fk_research_supervisions_type FOREIGN KEY (supervision_type_id)
    REFERENCES supervision_types (id) ON DELETE RESTRICT ON UPDATE CASCADE
    -- RESTRICT (migration had CASCADE): removing 'MTech'/'PhD' must not delete CV entries.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_research_supervisions (
  research_supervision_id INT      NOT NULL,
  faculty_id              INT      NOT NULL,       -- was STRING in model; NULL rows were inserted on purpose — dropped (see SUMMARY)
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (research_supervision_id, faculty_id),
  KEY idx_faculty_research_supervisions_faculty (faculty_id),
  CONSTRAINT fk_frs_supervision FOREIGN KEY (research_supervision_id)
    REFERENCES research_supervisions (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_frs_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE courses (
  id              INT             NOT NULL AUTO_INCREMENT,
  course_code     VARCHAR(20)     NOT NULL,
  course_name     VARCHAR(255)    NOT NULL,
  semester        TINYINT         NOT NULL,
  course_level    ENUM('UG','PG') NOT NULL,
  lecture_hours   TINYINT         NOT NULL,
  tutorial_hours  TINYINT         NOT NULL,
  practical_hours TINYINT         NOT NULL,
  academic_year   VARCHAR(9)      NOT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_code_year (course_code, academic_year),
    -- today the app enforces globally-unique courseCode; year-scoped keeps history possible (flagged)
  CONSTRAINT chk_courses_semester  CHECK (semester BETWEEN 1 AND 10),
  CONSTRAINT chk_courses_lecture   CHECK (lecture_hours BETWEEN 0 AND 4),
  CONSTRAINT chk_courses_tutorial  CHECK (tutorial_hours BETWEEN 0 AND 1),
  CONSTRAINT chk_courses_practical CHECK (practical_hours IN (0, 2, 4))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_courses (
  course_id  INT      NOT NULL,
  faculty_id INT      NOT NULL,                    -- was STRING in model, broken belongsTo("Id")
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (course_id, faculty_id),
  KEY idx_faculty_courses_faculty (faculty_id),
  CONSTRAINT fk_faculty_courses_course FOREIGN KEY (course_id)
    REFERENCES courses (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_courses_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE events (
  id                INT           NOT NULL AUTO_INCREMENT,
  title             VARCHAR(500)  NOT NULL,
  category          VARCHAR(50)   NULL,
  event_type        VARCHAR(50)   NULL,            -- was 'type' ('STC','E-STC','FDP',...)
  venue             VARCHAR(255)  NULL,           -- legacy data: blank for some rows
  sponsoring_agency VARCHAR(255)  NULL,           -- legacy data: blank for 22 of 74 rows
  start_date        DATE          NOT NULL,        -- was VARCHAR; (start_date,end_date) is the bulk dedup key
  end_date          DATE          NULL,
  academic_session  VARCHAR(9)    NULL,
  convenor          VARCHAR(255)  NULL,            -- was PascalCase 'Convenor'
  coordinator       VARCHAR(255)  NULL,
  link_url          VARCHAR(1024) NULL,            -- was 'Link'
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_start_date (start_date),
  KEY idx_events_category (category),              -- distinct-values dropdown
  KEY idx_events_type (event_type),                -- distinct-values dropdown
  KEY idx_events_session (academic_session),
  KEY idx_events_title (title(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE faculty_events (
  event_id   INT      NOT NULL,
  faculty_id INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (event_id, faculty_id),
  KEY idx_faculty_events_faculty (faculty_id),
  CONSTRAINT fk_faculty_events_event FOREIGN KEY (event_id)
    REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_faculty_events_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- 5. Department content
-- ----------------------------------------------------------------------------

CREATE TABLE announcements (
  id           INT           NOT NULL AUTO_INCREMENT,
  title        VARCHAR(500)  NOT NULL,
  pdf_url      VARCHAR(1024) NOT NULL,
  announced_on DATE          NOT NULL,             -- merges the date/month/year VARCHAR triplet
  is_private   TINYINT(1)    NOT NULL DEFAULT 0,   -- merges privateAnnouncements (was a separate identical table)
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_announcements_visibility_date (is_private, announced_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE posts (
  id           INT           NOT NULL AUTO_INCREMENT,
  category     ENUM('achievement','academic_news') NOT NULL, -- merges Achievements + AcademicsNews (identical shape/CRUD)
  title        VARCHAR(500)  NOT NULL,
  description  TEXT          NOT NULL,             -- was VARCHAR with a 10k app validator
  photo_url    VARCHAR(1024) NULL,
  pdf_url      VARCHAR(1024) NULL,
  published_on DATE          NULL,                 -- was VARCHAR 'date'
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_category_date (category, published_on)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE about_sections (
  id          INT          NOT NULL AUTO_INCREMENT,
  title       VARCHAR(255) NULL,
  description TEXT         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE programs_offered (
  id          INT          NOT NULL AUTO_INCREMENT,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE home_slides (
  id         INT           NOT NULL AUTO_INCREMENT,
  image_url  VARCHAR(1024) NOT NULL,               -- was Homes.photo
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE hod_messages (
  id         INT           NOT NULL AUTO_INCREMENT,
  faculty_id INT           NULL,                   -- new optional link: the HOD is a faculty member
  name       VARCHAR(255)  NULL,
  message    TEXT          NULL,
  image_url  VARCHAR(1024) NULL,                   -- was 'image'
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_hod_messages_faculty (faculty_id),
  CONSTRAINT fk_hod_messages_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculty (id) ON DELETE SET NULL ON UPDATE CASCADE
    -- SET NULL: the message is historical content; it must outlive the person's row.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE qna (
  id         INT          NOT NULL AUTO_INCREMENT,
  question   VARCHAR(500) NOT NULL,
  answer     TEXT         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_qna_question (question(191))             -- create-path dedup does findOne({question})
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE syllabus_documents (
  id         INT           NOT NULL AUTO_INCREMENT,
  title      VARCHAR(255)  NOT NULL,
  pdf_url    VARCHAR(1024) NOT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE calendar_documents (
  id         INT           NOT NULL AUTO_INCREMENT,
  title      VARCHAR(255)  NOT NULL,
  pdf_url    VARCHAR(1024) NOT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE labs (
  id                INT           NOT NULL AUTO_INCREMENT,
  title             VARCHAR(255)  NOT NULL,
  description       TEXT          NOT NULL,
  photo_url         VARCHAR(1024) NOT NULL,
  officer_in_charge VARCHAR(255)  NOT NULL,        -- was 'OIC'; free-text faculty name (FK candidate, flagged)
  technician        VARCHAR(255)  NOT NULL,        -- free-text staff name
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE equipment (
  id               INT           NOT NULL AUTO_INCREMENT,
  name             VARCHAR(255)  NOT NULL,
  quantity         INT           NOT NULL,
  purchase_date    DATE          NULL,             -- was VARCHAR 'date' (assumed purchase date; verify)
  stock            INT           NOT NULL,
  invoice_no       VARCHAR(100)  NULL,             -- was 'invoice'
  indenter         VARCHAR(255)  NULL,
  vendor           VARCHAR(255)  NULL,             -- fixes 'vender'
  address_contact  VARCHAR(500)  NULL,             -- was 'addressAndCon'
  amount           DECIMAL(12,2) NOT NULL,         -- was FLOAT (money)
  academic_session VARCHAR(9)    NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_equipment_session (academic_session)     -- annual report groups per session
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE placement_stats (
  id             INT               NOT NULL AUTO_INCREMENT,
  branch         VARCHAR(50)       NOT NULL,
  year           YEAR              NOT NULL,
  candidates     SMALLINT UNSIGNED NOT NULL,
  placed         SMALLINT UNSIGNED NOT NULL,
  jobs_offered   SMALLINT UNSIGNED NOT NULL,
  max_ctc        DECIMAL(10,2)     NULL,
  -- replaces the hand-entered, drift-prone 'percent' / 'percentJobOffered' VARCHARs:
  placed_percent DECIMAL(5,2) GENERATED ALWAYS AS
                   (ROUND(placed * 100.0 / NULLIF(candidates, 0), 2)) STORED,
  offers_percent DECIMAL(5,2) GENERATED ALWAYS AS
                   (ROUND(jobs_offered * 100.0 / NULLIF(candidates, 0), 2)) STORED,
  created_at     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_placement_stats_branch_year (branch, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- Seed data for lookups (values preserved from src/seeders/ — application code
-- hardcodes these IDs)
-- ----------------------------------------------------------------------------
INSERT INTO programs (id, name) VALUES
  (1, 'bachelor'), (2, 'master'), (3, 'dualdegree'), (4, 'master_ai');

INSERT INTO research_types (id, name) VALUES
  (1, 'Journal'), (2, 'Conference'), (3, 'Book'), (4, 'BookChapter');

INSERT INTO supervision_types (id, name) VALUES
  (1, 'MTech'), (2, 'PhD');
