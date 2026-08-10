# Legacy → clean schema migration: review log

Generated 2026-08-05 by `transform.sql` from the production dump (`legacy_dump.sql`,
MySQL 5.7 database `cseBackend`). Everything listed here was **deliberately not
migrated** (or altered) and may deserve a human look. Nothing else was dropped.

## 1. Test rows deleted (publications)

| legacy id | title | venue | year |
|---|---|---|---|
| 1515 | gdfs | testing data | 2017 |
| 1526 | dfg | himannshu | 2017 |
| 1528 | fdg | fdg | 2017 |
| 1530 | test | test | 2019 |
| 1533 | wqw | ewee | 2026 |

## 2. Duplicate rows merged (links repointed to the keeper)

- **Publications** (kept ← removed): 1524 ← 1518, 1519, 1522, 1523 (Brain Tumor Volume Estimation, entered 5×);
  1480 ← 1479; 1096 ← 781; 1424 ← 1422; 1046 ← 688; 668 ← 665; 1511 ← 1510; 1495 ← 1471; 1443 ← 1395, 1442.
- **Patents**: 40 ← 41, 42, 43 (cobweb-cleaning-broom patent entered 4×, same reference 201721003190).
- **Projects**: 6 ← 47; 41 ← 42 (ISEA project, both phases each entered twice);
  44 ← 9 (DST-FST grant SR/FST/ET-1/2023/1308 entered twice — kept the cleaner 2024 entry; note the
  two entries disagreed on the amount: ₹2,23,000 vs ₹2,23,00,000 — **worth confirming the real figure**).
- **Duplicate join-table links** collapsed by the new composite PKs:
  faculty_publications 963→815, faculty_events 122→67, faculty_research_supervisions 315→246,
  faculty_patents 18→16, faculty_projects 34→29, faculty_consultancies 12→8
  (consultancies 30–33 were each linked to faculty 4 twice).

## 3. Publications that lost their DOI (another paper kept the same DOI)

One DOI can only belong to one paper under the new UNIQUE constraint. Where several
*different* papers shared one (mis-entered) DOI, the lowest id kept it. Ten of these
were one author's list all pasted with `10.1016/j.procs.2019.05.012`. The department
may want to fill in the real DOIs later:

| id | title (kept doi = no) |
|---|---|
| 713 | A range based node localization scheme with hybrid optimization for underwater w |
| 717 | Energy-aware scientific workflow scheduling in cloud environment |
| 735 | Probabilistic Check pointing and Recovery for Mobile Distributed Systems |
| 740 | A Non-Intrusive Minimum Process Synchronous Checkpointing Protocol for Mobile Di |
| 746 | Data Replication in Mobile Ad hoc Networks |
| 754 | Parch: A Peer-to-Peer Based Email Archival Application |
| 759 | Data Aggregation in Object Tracking Sensor Network with Node-to-Node Activation  |
| 762 | Maximize the Lifetime of Object Tracking Sensor Network with Node-to-Node Activa |
| 780 | Joint Channel Coding and Cryptography for SMS |
| 785 | Cooperative Caching and Replacement in MANETs |
| 788 | A Log Based Recovery Protocol for Mobile Distributed Computing Systems |
| 794 | Checkpointing based Rollback Recovery Techniques in Wireless Ad-hoc Networks |
| 797 | Cluster-based coordinated checkpointing protocol in wireless ad-hoc networks |
| 940 | Semi-automatic Annotation for Mentions in Hindi Text |
| 998 | Towards Framework for Edge Computing Assisted Covid-19 Detection using CT-scan I |
| 1000 | �Secrecy Analysis of Underlay Cognitive Radio with Delayed Channel Information", |
| 1202 | Text summarization using modified generative adversarial network & vol. 46, no.  |
| 1262 | Review article On the IEEE 802.11i security: A denial-of-service perspective |
| 1301 | Analysis and Simulation of Second-Order Statistics with Modified Characteristic |
| 1364 | Flood Early Detection System Using Internet of Things and Artificial Neural |
| 1375 | Analytical Modelling of Back-off Process of IEEE 802.11p using Continuous Markov |
| 1378 | Effect of Imperfect Sensing on the Protection of Primary User and Performance of |
| 1379 | Performance Analysis of IEEE 802.11 in the Presence of Hidden Terminal for Wirel |
| 1380 | Performance Analysis of IEEE 802.11P with retry limits using CTMC |
| 1381 | Skin cancer detection using Deep Learning Approach |
| 1382 | Bell-pepper leaf bacterial spot detection using AlexNet and VGG-16 |
| 1383 | Augmentation of Medical Image Dataset using GAN |
| 1384 | A Review on Security Challenges: Cryptography and Blockchain for Internet of Thi |
| 1385 | Basic Principles of an Operating System |
| 1394 | Identification, Analysis, and Recommendation of the Sitting Posture of School Ki |

## 4. Orphan rows of deleted faculty id 19 (CS019, Dr. Preeti Soni)

The faculty row was deleted from the legacy DB but these survived; dropped along
with her sign-up account (she can be re-created via the admin UI if she returns):

- qualification: B.E., Chhattisgarh Swami Vivekanand Technica University Bhilai, 2012
- qualification: M.Tech, IIT ISM Dhanbad, 2017
- qualification: Ph.D, IIT ISM Dhanbad, 2023
- teaching experience: Assistant Professor  @ Computer Science & Engineering (2023-08-30 → Present)
- teaching experience: Adjunct Assistant Professor @ Computer Science & Engineering (2022-08-23 → 2023-07-22)

## 5. FacultyInfos free-text CV columns (no home in the new schema)

The structured equivalents migrated separately; these blobs were not loaded.
Hand-enter anything valuable via the admin UI:

### Faculty 1 (Prof. Lalit Kumar Awasthi)
- honorsRecognitions: Best Teacher Award 2020, Research Excellence Award 2018

### Faculty 21 (Dr. Ram Prakash Sharma)
- educationalQualification: PhD
- teachingExperience: 5 Years

### Faculty 3 (Dr. T P Sharma)
- educationalQualification: PhD
- teachingExperience: 27.5 years
- administrativeExperience: 30.1 years 

### Faculty 14 (Dr. Jyoti Srivastava)
- educationalQualification: Ph.D.
- teachingExperience: 9 years
- administrativeExperience: 5 years
- honorsRecognitions: Mahindra All India Talent Scholarship; TCS Research Fellowship	

### Faculty 5 (Dr. Naveen Chauhan)
- educationalQualification: Ph.D.
- teachingExperience: Dr. Naveen Chauhan joined NIT Hamirpur as Associate Professor on 06.05.2019, prior to this he has served as Assistant Professor since 02.01.2006 till 05.05.2019. He has also served REC/NIT Hamirpur since 16.02.2001 as Lecturer.
- administrativeExperience: 2 years as Head of Department, Associate Dean (Research Projects, Collaborations & Startup), Faculty In-Charge (Outsourced Multitasking Services), Associate Dean (Examination & Evaluation), Faculty In-Charge Computer Centre (August 2018 - September 2020)

### Faculty 17 (Dr. Mohammad Khalid Pandit)
- educationalQualification: Ph.D. (PostDoc)
- teachingExperience: 12

### Faculty 4 (Dr. Siddhartha Chauhan)
- educationalQualification: Ph.D in Computer Networks
- teachingExperience: 28 Years
- administrativeExperience: Head of Department

### Faculty 20 (Dr. Robin Singh Bhadoria)
- educationalQualification: Ph.D, M.Tech., B.Eng.
- teachingExperience: 3.5 years
- administrativeExperience: 1 year as OIC
- honorsRecognitions: Gold Medal Award at M.Tech. State Level (Computer Science & Engineering) Distinction

### Faculty 11 (Dr. Dharmendra Prasad Mahato)
- educationalQualification: AMIETE (CSE), M.Tech (CSE) and PhD (CSE)
- teachingExperience: 8 Years

### Faculty 10 (Dr. Nitin Gupta)
- teachingExperience: 18 Years


## 6. Other fixes and non-migrations

- **faculty 15 date_of_birth** was `2025-03-31` in the legacy data (impossible) → set to NULL.
- **Lowercase `students` table** (339 rows): a stray import the app never read
  (Sequelize used `Students`). 219 roll numbers also exist in `Students`; the other
  120 did not migrate. If they matter, they can be CSV-imported via the bulk endpoint.
- **`facultysubjects`** (32 rows) references a `subjects` table that does not exist
  in the dump — the course data was lost before this backup. `courses` starts empty;
  re-import via the subjects CSV upload.
- **`SignUps.name`** had display names; the new schema takes names from `faculty`.
  Dropped values were identical to the faculty names except formatting.
- **publications.month**: legacy stored full ISO timestamps whose *year* part was
  data-entry noise; only the month number (IST-adjusted) was kept, the `year`
  column is authoritative.
- **indexing**: values outside the ENUM (IEEE 38, Springer 24+, WoS/ACM/UGC/… ~100 rows
  total) were mapped to `Other`, per the agreed frontend-compatible mapping.
  9 blank/junk values also became `Other`.
- **ORCID**: stored as the bare 16-digit iD (the DB column is an identifier, not a URL);
  the API layer re-expands it to `https://orcid.org/<id>` so the legacy response
  contract (full URL, rendered verbatim as a link by the shipped UI) is preserved.
- **Junk placeholders** (`NIL`, `None`, `_`, `0`, serial numbers entered as project
  reference numbers, NBSP-padded DOIs, a 0x02 control byte in one venue name) are
  normalized to NULL / cleaned by `clean_txt` — found by the post-migration
  data-fidelity audit and folded back into transform.sql.
- **projects 10–13**: reference numbers were the serial numbers '1'–'4' → NULL.

## 7. Security follow-ups (unchanged from MIGRATION_NOTES.md, now urgent)

- This dump contains **live bcrypt hashes** for all 19 faculty accounts + admin and
  circulated as a file — recommend forcing password resets after cut-over
  (`first_login` is already 1 for everyone who never changed it).
- Rotate the old committed Gmail app password and JWT secret before deploying.
