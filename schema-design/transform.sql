-- ============================================================================
-- Legacy `cseBackend` (loaded as legacy_cse) → clean `cse_department` transform
--
-- Run AFTER `./staging-db.sh create-schema` and `./staging-db.sh load-legacy`:
--   mariadb -h 127.0.0.1 -P 3307 -u root cse_department < transform.sql
--
-- Decisions (agreed 2026-08-05, see migration-review.md for the row-level log):
--   * indexing mapped into the existing ENUM; publisher names → 'Other'
--   * junk DOIs/refs ('NULL', '--', '.', 'NA', google.com) → NULL; UNIQUE kept;
--     where distinct papers share one DOI, the lowest id keeps it
--   * test rows and true duplicate rows deleted (links repointed to the keeper)
--   * orphan rows of deleted faculty id 19 dropped; CS019 login skipped
--   * FacultyInfos free-text columns exported for review, not loaded
--   * ISO timestamps are IST dates stored in UTC → +05:30 then take the date
--   * legacy ids preserved on all migrated entities
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;   -- deliberately ON: inserts are dependency-ordered

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS clean_txt;
DROP FUNCTION IF EXISTS clean_req;
DROP FUNCTION IF EXISTS legacy_date;
DROP FUNCTION IF EXISTS legacy_month;

DELIMITER //

-- Trim whitespace/tabs/NBSP, strip control bytes; junk placeholder tokens → NULL.
CREATE FUNCTION clean_txt(v TEXT) RETURNS TEXT DETERMINISTIC
BEGIN
  DECLARE t TEXT;
  IF v IS NULL THEN RETURN NULL; END IF;
  SET t = REPLACE(v, UNHEX('C2A0'), ' ');                 -- NBSP (survives TRIM otherwise)
  SET t = REGEXP_REPLACE(t, '[\\x00-\\x1F\\x7F]', ' ');   -- control bytes (0x02 seen in venue_name; corrupts docx XML)
  SET t = TRIM(REGEXP_REPLACE(t, ' {2,}', ' '));
  -- comparison is utf8mb4 CI, so 'NIL' also catches 'nil', 'None' catches 'NONE'/'none'
  IF t IN ('', '-', '--', '.', '_', '0', 'NA', 'N/A', 'NULL', 'NIL', 'None') THEN RETURN NULL; END IF;
  RETURN t;
END//

-- clean_txt for NOT NULL columns: junk still collapses, but to '' instead of NULL
CREATE FUNCTION clean_req(v TEXT) RETURNS TEXT DETERMINISTIC
  RETURN COALESCE(clean_txt(v), '')//

-- 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS.mmmZ' (UTC-stored IST) or 'Present' → DATE
CREATE FUNCTION legacy_date(v VARCHAR(255)) RETURNS DATE DETERMINISTIC
BEGIN
  DECLARE t VARCHAR(255);
  SET t = TRIM(COALESCE(v, ''));
  IF t = '' OR UPPER(t) = 'PRESENT' THEN RETURN NULL; END IF;
  IF t LIKE '____-__-__T%' THEN
    RETURN DATE(DATE_ADD(STR_TO_DATE(CONCAT(LEFT(t, 10), ' ', SUBSTRING(t, 12, 8)),
                                     '%Y-%m-%d %H:%i:%s'), INTERVAL 330 MINUTE));
  END IF;
  IF t LIKE '____-__-__%' THEN RETURN STR_TO_DATE(LEFT(t, 10), '%Y-%m-%d'); END IF;
  RETURN NULL;
END//

-- month number out of a legacy ISO timestamp (the year part is entry noise)
CREATE FUNCTION legacy_month(v VARCHAR(255)) RETURNS TINYINT DETERMINISTIC
BEGIN
  IF v IS NULL OR v NOT LIKE '____-__-__T%' THEN RETURN NULL; END IF;
  RETURN MONTH(legacy_date(v));
END//

DELIMITER ;

-- ----------------------------------------------------------------------------
-- 1. faculty  (position '---' = the 9 temporary TF-code faculty)
-- ----------------------------------------------------------------------------
INSERT INTO faculty (id, faculty_code, name, position, is_permanent, phone, email,
                     portfolio_url, photo_url, sort_order, research_interests,
                     created_at, updated_at)
SELECT id, uniqueFacultyId, clean_req(name),
       IF(position = '---', NULL, clean_txt(position)),
       IF(position = '---', 0, 1),
       clean_txt(phoneNo),
       REPLACE(REPLACE(REPLACE(clean_req(email), '[at]', '@'), '[dot]', '.'), ' ', ''),
       clean_txt(portfolio), clean_txt(photo), shorting, clean_txt(researchInterests),
       createdAt, updatedAt
FROM legacy_cse.Faculties;

-- ----------------------------------------------------------------------------
-- 2. faculty_profiles  (FacultyInfos; free-text CV columns exported, not loaded;
--    ORCID URLs reduced to the bare 16-digit iD)
-- ----------------------------------------------------------------------------
INSERT INTO faculty_profiles (faculty_id, date_of_birth, date_of_joining,
                              google_scholar_url, scopus_url, publons_url, orcid,
                              research_gate_url, vidwan_url, linkedin_url)
SELECT facultyId, legacy_date(dateOfBirth), legacy_date(dateOfJoining),
       clean_txt(googleScholar), clean_txt(scopus), clean_txt(publons),
       NULLIF(REGEXP_SUBSTR(orcid, '[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9Xx]{4}'), ''),  -- MariaDB returns '' (not NULL) on no match
       COALESCE(clean_txt(researchGate), clean_txt(rgLink)),
       clean_txt(vidwan), clean_txt(linkedIn)
FROM legacy_cse.FacultyInfos;

-- faculty 15's recorded date of birth (2025-03-31) is impossible — entry error
-- (updated_at = updated_at everywhere below: stops ON UPDATE CURRENT_TIMESTAMP
--  from stamping migration time over the copied legacy timestamps)
UPDATE faculty_profiles SET date_of_birth = NULL, updated_at = updated_at WHERE faculty_id = 15;

-- ----------------------------------------------------------------------------
-- 3. user_accounts  (SignUps ⋈ Faculties by code; CS019 has no faculty row →
--    skipped; the 'admin' row becomes the username-based admin account)
-- ----------------------------------------------------------------------------
INSERT INTO user_accounts (faculty_id, role, password_hash, first_login, created_at, updated_at)
SELECT f.id, 'faculty', s.password, COALESCE(lf.firstlogin, 1), s.createdAt, s.updatedAt
FROM legacy_cse.SignUps s
JOIN faculty f ON f.faculty_code = s.uniqueFacultyId
JOIN legacy_cse.Faculties lf ON lf.id = f.id;

INSERT INTO user_accounts (username, role, email, password_hash, first_login, created_at, updated_at)
SELECT 'admin', 'admin',
       REPLACE(REPLACE(REPLACE(clean_req(email), '[at]', '@'), '[dot]', '.'), ' ', ''),
       password, 1, createdAt, updatedAt
FROM legacy_cse.SignUps WHERE uniqueFacultyId = 'admin';

-- ----------------------------------------------------------------------------
-- 4. staff / students / phd_scholars
--    (lowercase legacy `students` table was never read by the app — exported)
-- ----------------------------------------------------------------------------
INSERT INTO staff (id, name, phone, email, designation, photo_url, created_at, updated_at)
SELECT id, clean_req(name), clean_txt(phoneNo), clean_req(email), clean_req(designation),
       clean_txt(photo), createdAt, updatedAt
FROM legacy_cse.Staffs;

INSERT INTO students (id, name, roll_no, email, photo_url, program_id,
                      current_semester, admission_year, created_at, updated_at)
SELECT id, clean_req(name), clean_req(rollNo), clean_req(email), clean_txt(photo),
       programmEnroled, currentSemester, year, createdAt, updatedAt
FROM legacy_cse.Students;

INSERT INTO phd_scholars (id, name, roll_no, email, supervisor, co_supervisor,
                          status, dissertation_title, last_qualification,
                          research_area, end_date, time, photo_url, portfolio_url,
                          linkedin_url, google_scholar_url, scopus_url,
                          created_at, updated_at)
SELECT id, clean_req(name), clean_txt(rollNo), clean_txt(email),
       COALESCE(clean_txt(Supervisor), clean_txt(guide)), clean_txt(CoSupervisor),
       clean_txt(status), COALESCE(clean_txt(title), clean_txt(dissertation)),
       clean_txt(lastQualification), clean_txt(researchArea),
       legacy_date(endDate), clean_txt(time), clean_txt(photo), clean_txt(portfolio),
       clean_txt(LinkedIn), clean_txt(GoogleScholar), clean_txt(Scopus),
       createdAt, updatedAt
FROM legacy_cse.PhdScholars;

-- ----------------------------------------------------------------------------
-- 5. Faculty CV satellites (rows of deleted faculty 19 are dropped by the JOIN)
-- ----------------------------------------------------------------------------
INSERT INTO faculty_qualifications (id, faculty_id, degree_name, university_name,
                                    passing_year, created_at, updated_at)
SELECT q.id, q.facultyId, clean_req(q.nameOfDegree), clean_req(q.universityName),
       q.passingYear, q.createdAt, q.updatedAt
FROM legacy_cse.Qualifications q
JOIN faculty f ON f.id = q.facultyId;

INSERT INTO faculty_teaching_experiences (id, faculty_id, position, department,
                                          start_date, end_date, created_at, updated_at)
SELECT t.id, t.facultyId, clean_req(t.position), clean_req(t.department),
       legacy_date(t.`from`), legacy_date(t.`to`), t.createdAt, t.updatedAt
FROM legacy_cse.teachingExps t
JOIN faculty f ON f.id = t.facultyId;

INSERT INTO faculty_administrative_experiences (id, faculty_id, position, organisation,
                                                start_date, end_date, created_at, updated_at)
SELECT a.id, a.facultyId, clean_req(a.position), clean_txt(a.organisation),
       legacy_date(a.startDate), legacy_date(a.endDate), a.createdAt, a.updatedAt
FROM legacy_cse.AdministrativeExperiences a
JOIN faculty f ON f.id = a.facultyId;

INSERT INTO faculty_honors (id, faculty_id, title, given_by, year, created_at, updated_at)
SELECT h.id, h.facultyId, clean_txt(h.title), clean_txt(h.givenBy), h.year,
       h.createdAt, h.updatedAt
FROM legacy_cse.Honors h
JOIN faculty f ON f.id = h.facultyId;

INSERT INTO faculty_exposures (id, faculty_id, title, description, created_at, updated_at)
SELECT e.id, e.facultyId, clean_req(e.title), clean_txt(e.description), e.createdAt, e.updatedAt
FROM legacy_cse.Exposures e
JOIN faculty f ON f.id = e.facultyId;

INSERT INTO expert_talks (id, faculty_id, title, venue, start_date, end_date,
                          academic_session, description, created_at, updated_at)
SELECT e.id, e.facultyId, clean_req(e.title), clean_txt(e.venue),
       legacy_date(e.startDate), legacy_date(e.endDate),
       clean_txt(e.academicSession), clean_txt(e.description), e.createdAt, e.updatedAt
FROM legacy_cse.expertTalks e
JOIN faculty f ON f.id = e.facultyId;

-- ----------------------------------------------------------------------------
-- 6. Publications: id map (test rows out, duplicate groups → keeper), then load
-- ----------------------------------------------------------------------------
CREATE TEMPORARY TABLE pub_map (old_id INT PRIMARY KEY, new_id INT NOT NULL);

INSERT INTO pub_map
SELECT id, id FROM legacy_cse.publications
WHERE id NOT IN (1515, 1526, 1528, 1530, 1533);          -- test rows ('gdfs','dfg','fdg','test','wqw')

-- duplicate groups: losers point at the keeper (newest entry of each group)
UPDATE pub_map SET new_id = 1524 WHERE old_id IN (1518, 1519, 1522, 1523); -- Brain Tumor Volume Estimation ×5
UPDATE pub_map SET new_id = 1480 WHERE old_id = 1479;    -- Distributed Routing for UWSN
UPDATE pub_map SET new_id = 1096 WHERE old_id = 781;     -- Efficient VANET Traffic Information
UPDATE pub_map SET new_id = 1424 WHERE old_id = 1422;    -- Hop-Constrained Oblivious Routing
UPDATE pub_map SET new_id = 1046 WHERE old_id = 688;     -- Incentive based scheme
UPDATE pub_map SET new_id = 668  WHERE old_id = 665;     -- IndNet peer-to-peer community network
UPDATE pub_map SET new_id = 1511 WHERE old_id = 1510;    -- Optimized U-Net Architecture
UPDATE pub_map SET new_id = 1495 WHERE old_id = 1471;    -- Scalable Leader Election
UPDATE pub_map SET new_id = 1443 WHERE old_id IN (1395, 1442); -- ESB Performance Metric ×3

INSERT INTO publications (id, title, venue_name, volume, issue, page_range, year,
                          month, academic_session, doi, research_type_id, indexing,
                          journal_quartile, author_text, isbn, created_at, updated_at)
SELECT p.id, clean_req(p.title), clean_txt(p.name), clean_txt(p.volume), clean_txt(p.issue),
       clean_txt(p.pageNo), NULLIF(TRIM(COALESCE(p.year, '')), ''),
       legacy_month(p.month), clean_txt(p.academicSession),
       NULL,                                                 -- DOIs assigned below (shared ones → keeper only)
       p.type,
       CASE
         WHEN p.indexing IN ('SCI(E)', 'SCI') THEN 'SCI(E)'
         WHEN p.indexing = 'Scopus'           THEN 'Scopus'
         WHEN p.indexing = 'ESCI'             THEN 'ESCI'
         WHEN clean_txt(p.indexing) IS NULL   THEN 'Other'   -- blanks/'--'
         ELSE 'Other'                                        -- publisher names etc.
       END,
       IF(clean_txt(p.journalQuartile) IN ('Q1','Q2','Q3','Q4','T'),
          clean_txt(p.journalQuartile), 'T'),
       clean_txt(p.authorName), clean_txt(p.isbn), p.createdAt, p.updatedAt
FROM legacy_cse.publications p
JOIN pub_map m ON m.old_id = p.id AND m.new_id = p.id;   -- keepers only

-- research type for the handful of NULL-type keepers (inferred from the venue)
UPDATE publications SET research_type_id = 1, updated_at = updated_at WHERE id = 1504 AND research_type_id IS NULL; -- J. of Information Security and Applications
UPDATE publications SET research_type_id = 1, updated_at = updated_at WHERE id = 1511 AND research_type_id IS NULL; -- Cognitive Computation (Springer journal)
UPDATE publications SET research_type_id = 2, updated_at = updated_at WHERE id = 1520 AND research_type_id IS NULL; -- ICACDS 2025 proceedings
UPDATE publications SET research_type_id = 2, updated_at = updated_at WHERE id = 1524 AND research_type_id IS NULL; -- Int. Conf. on Computer Vision and Robotics

-- DOI assignment: junk → NULL (clean_txt); where distinct papers share one
-- (mis-entered) DOI, only the lowest id gets it — UNIQUE(doi) holds.
CREATE TEMPORARY TABLE doi_clean AS
SELECT p.id, NULLIF(clean_txt(p.doi), 'https://www.google.com') AS doi
FROM legacy_cse.publications p
JOIN pub_map m ON m.old_id = p.id AND m.new_id = p.id;

UPDATE publications pub
JOIN (SELECT MIN(id) AS keeper, doi FROM doi_clean
      WHERE doi IS NOT NULL GROUP BY doi) k
  ON pub.id = k.keeper
SET pub.doi = k.doi, pub.updated_at = pub.updated_at;

INSERT INTO faculty_publications (publication_id, faculty_id)
SELECT DISTINCT m.new_id, l.facultyId
FROM legacy_cse.facultypublications l
JOIN pub_map m ON m.old_id = l.publicationId
JOIN faculty f ON f.id = l.facultyId;

-- ----------------------------------------------------------------------------
-- 7. Patents (rows 41–43 duplicate row 40: same title/ref/year/status)
-- ----------------------------------------------------------------------------
CREATE TEMPORARY TABLE patent_map (old_id INT PRIMARY KEY, new_id INT NOT NULL);
INSERT INTO patent_map SELECT id, id FROM legacy_cse.Patents;
UPDATE patent_map SET new_id = 40 WHERE old_id IN (41, 42, 43);

INSERT INTO patents (id, title, status, reference_no, year, month, place,
                     filed_date, granted_date, academic_session, author_text,
                     created_at, updated_at)
SELECT p.id, clean_req(p.title), clean_req(p.status), clean_txt(p.referenceNo),
       p.year, NULLIF(FIELD(LEFT(TRIM(p.month), 3),
                     'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'), 0),
       clean_txt(p.place), legacy_date(p.filledDate), legacy_date(p.grantedDate),
       clean_txt(p.academicSession), clean_txt(p.authorName), p.createdAt, p.updatedAt
FROM legacy_cse.Patents p
JOIN patent_map m ON m.old_id = p.id AND m.new_id = p.id;

-- the four copies of the cobweb-broom patent shared one real reference number;
-- clean_txt already nulled the two 'NA' refs, no shared-ref conflict remains

INSERT INTO faculty_patents (patent_id, faculty_id)
SELECT DISTINCT m.new_id, l.facultyId
FROM legacy_cse.FacultyPatents l
JOIN patent_map m ON m.old_id = l.patentId
JOIN faculty f ON f.id = l.facultyId;

-- ----------------------------------------------------------------------------
-- 8. Projects (47 duplicates 6; 42 duplicates 41 — ISEA project entered twice)
-- ----------------------------------------------------------------------------
CREATE TEMPORARY TABLE project_map (old_id INT PRIMARY KEY, new_id INT NOT NULL);
INSERT INTO project_map SELECT id, id FROM legacy_cse.Projects;
UPDATE project_map SET new_id = 6  WHERE old_id = 47;
UPDATE project_map SET new_id = 41 WHERE old_id = 42;
UPDATE project_map SET new_id = 44 WHERE old_id = 9;   -- DST-FST grant SR/FST/ET-1/2023/1308 entered twice; 44 is the cleaner entry

INSERT INTO projects (id, title, status, reference_no, funding_agency, funding_amount,
                      duration, year, month, academic_session, principal_investigator,
                      co_principal_investigator, created_at, updated_at)
SELECT p.id, clean_req(p.title), clean_req(p.status), clean_txt(p.referenceNo),
       clean_txt(p.fundingAgency), CAST(clean_txt(p.fundingAmount) AS DECIMAL(14,2)),
       clean_txt(p.duration), p.year, NULLIF(FIELD(LEFT(TRIM(COALESCE(p.month,'')), 3),
                     'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'), 0),
       clean_txt(p.academicSession), clean_txt(p.principalInvestigator),
       clean_txt(p.coprincipalInvestigator), p.createdAt, p.updatedAt
FROM legacy_cse.Projects p
JOIN project_map m ON m.old_id = p.id AND m.new_id = p.id;

-- projects 10-13 had serial numbers ('1'..'4') entered as reference numbers — meaningless refs → NULL
UPDATE projects SET reference_no = NULL, updated_at = updated_at
WHERE id IN (10, 11, 12, 13) AND reference_no IN ('1', '2', '3', '4');

INSERT INTO faculty_projects (project_id, faculty_id)
SELECT DISTINCT m.new_id, l.facultyId
FROM legacy_cse.FacultyProjects l
JOIN project_map m ON m.old_id = l.projectId
JOIN faculty f ON f.id = l.facultyId;

-- ----------------------------------------------------------------------------
-- 9. Consultancies (no duplicates; every legacy ref was blank/'.' → NULL)
-- ----------------------------------------------------------------------------
INSERT INTO consultancies (id, reference_no, title, client_organisation, amount,
                           start_year, academic_session, status, author_text,
                           created_at, updated_at)
SELECT id, clean_txt(referenceNo), clean_req(title), clean_txt(clientOrganisation),
       CAST(clean_txt(amount) AS DECIMAL(14,2)), NULLIF(TRIM(COALESCE(startYear,'')),''),
       clean_txt(academicSession), clean_txt(status), clean_txt(authorName),
       createdAt, updatedAt
FROM legacy_cse.Consultancies;

INSERT INTO faculty_consultancies (consultancy_id, faculty_id)
SELECT DISTINCT l.consultancyId, l.facultyId
FROM legacy_cse.facultyconsultancies l
JOIN consultancies c ON c.id = l.consultancyId
JOIN faculty f ON f.id = l.facultyId;

-- ----------------------------------------------------------------------------
-- 10. Research supervisions (program 1=MTech, 2=PhD matches supervision_types)
-- ----------------------------------------------------------------------------
INSERT INTO research_supervisions (id, supervision_type_id, scholar_name, roll_no,
                                   research_topic, status, year, academic_session,
                                   co_supervisor, created_at, updated_at)
SELECT id, program, clean_req(scholarName), clean_txt(rollNo), clean_txt(researchTopic),
       clean_txt(status), NULLIF(TRIM(COALESCE(year,'')),''), clean_txt(academicSession),
       clean_txt(coSupervisior), createdAt, updatedAt
FROM legacy_cse.researchSupervisions;

INSERT INTO faculty_research_supervisions (research_supervision_id, faculty_id)
SELECT DISTINCT l.researchSupervisionId, l.facultyId
FROM legacy_cse.facultyresearchsupervisions l
JOIN research_supervisions r ON r.id = l.researchSupervisionId
JOIN faculty f ON f.id = l.facultyId;

-- ----------------------------------------------------------------------------
-- 11. Events (courses/faculty_courses stay empty: legacy facultysubjects points
--     at a subjects table that does not exist in the dump — exported for review)
-- ----------------------------------------------------------------------------
INSERT INTO events (id, title, category, event_type, venue, sponsoring_agency,
                    start_date, end_date, academic_session, convenor, coordinator,
                    link_url, created_at, updated_at)
SELECT id, clean_req(title), clean_txt(category), clean_txt(type), clean_txt(venue),
       clean_txt(sponsoringAgency), legacy_date(startDate), legacy_date(endDate),
       clean_txt(academicSession), clean_txt(Convenor), clean_txt(Coordinator),
       clean_txt(Link), createdAt, updatedAt
FROM legacy_cse.Events;

INSERT INTO faculty_events (event_id, faculty_id)
SELECT DISTINCT l.eventId, l.facultyId
FROM legacy_cse.facultyevents l
JOIN events e ON e.id = l.eventId
JOIN faculty f ON f.id = l.facultyId;

-- ----------------------------------------------------------------------------
-- 12. Department content
-- ----------------------------------------------------------------------------
INSERT INTO announcements (id, title, pdf_url, announced_on, is_private, created_at, updated_at)
SELECT id, clean_req(title), clean_req(COALESCE(pdfLink, '')), legacy_date(date), 0, createdAt, updatedAt
FROM legacy_cse.announcements;
-- privateAnnouncements is empty in the dump

INSERT INTO posts (id, category, title, description, photo_url, pdf_url,
                   published_on, created_at, updated_at)
SELECT id, 'achievement', clean_req(title), clean_req(description), clean_txt(photo),
       clean_txt(pdfLink), legacy_date(date), createdAt, updatedAt
FROM legacy_cse.Achievements;
-- AcademicsNews is empty in the dump

INSERT INTO home_slides (id, image_url, created_at, updated_at)
SELECT id, clean_req(photo), createdAt, updatedAt FROM legacy_cse.Homes;

INSERT INTO hod_messages (id, faculty_id, name, message, image_url, created_at, updated_at)
SELECT h.id, f.id, clean_req(h.name), clean_txt(h.message), clean_txt(h.image),
       h.createdAt, h.updatedAt
FROM legacy_cse.hods h
LEFT JOIN faculty f ON f.name = h.name;

INSERT INTO equipment (id, name, quantity, purchase_date, stock, invoice_no,
                       indenter, vendor, address_contact, amount, academic_session,
                       created_at, updated_at)
SELECT id, clean_req(name), quantity, legacy_date(date), stock, clean_txt(invoice),
       clean_txt(indenter), clean_txt(vender), clean_txt(addressAndCon),
       amount, clean_txt(academicSession), createdAt, updatedAt
FROM legacy_cse.equipment;

-- Abouts, ProgramsOffereds, QnAs, Syllabuses, Calendars, labs, placementStats
-- are all empty in the dump — nothing to load.

-- ----------------------------------------------------------------------------
-- Cleanup
-- ----------------------------------------------------------------------------
DROP FUNCTION clean_txt;
DROP FUNCTION clean_req;
DROP FUNCTION legacy_date;
DROP FUNCTION legacy_month;

-- Summary counts for the run log
SELECT t.table_name, t.table_rows
FROM information_schema.tables t
WHERE t.table_schema = 'cse_department' AND t.table_rows > 0
ORDER BY t.table_rows DESC;
