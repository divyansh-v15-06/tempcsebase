# Missing-data report — legacy `cseBackend` → clean `cse_department`

Date: 2026-08-05. Companion to `migration-review.md` (the row-level log of every
decision) and `CUTOVER.md` (the server runbook). Everything listed here still
exists in `legacy_dump.sql` and in the final server backup taken at cut-over
step 1 — nothing is unrecoverable.

**Bottom line: no crucial data is missing.** The only user-visible losses are a
handful of free-text profile lines (re-enterable by hand in minutes), and the
only open question is one project's grant amount. Profile images are fully
intact — see §5.

## 1. Row counts, legacy vs migrated

| Table | Migrated | Legacy | Why the difference |
|---|---|---|---|
| faculty | 27 | 27 | — |
| publications | 713 | 731 | 13 duplicates merged, 5 test rows deleted |
| students | 592 | 592 | — |
| phd_scholars | 106 | 106 | — |
| projects | 24 | 27 | 3 duplicates merged |
| patents | 15 | 18 | 3 duplicates merged (same patent entered 4×) |
| user accounts | 19 | 20 | CS019 dropped (her faculty row was already deleted in legacy) |
| staff / events / expert talks / consultancies / supervisions / equipment / announcements / slides | equal | equal | — |

## 2. Not real data — nothing of value lost

- **5 test publications** ("gdfs", "test", "wqw", …) deleted.
- **Duplicate entries merged**: one paper entered 5×, a patent 4×, two projects
  2× each. One copy survives; all faculty links repointed to it. Duplicate
  join-table links likewise collapsed (e.g. faculty_publications 963 → 815).
- **Junk placeholders** (`NIL`, `_`, `0`, serial numbers as reference numbers,
  NBSP-padded DOIs, one control byte) normalized to NULL/cleaned.
- **Lowercase `students` table** (339 rows): a stray import the legacy app never
  read. 219 roll numbers duplicate the real `Students` table; the other 120 were
  never displayed anywhere. CSV-importable via the bulk endpoint if ever wanted.
- **`SignUps.name`**: identical to the migrated faculty names bar formatting.
- **Course data** (`facultysubjects`, 32 rows): references a `subjects` table
  that does not exist in the legacy dump — lost *before* this migration, nothing
  to migrate. `courses` starts empty; re-import via the subjects CSV upload.

## 3. Real data, low stakes

- **~30 publications lost their DOI**: one mis-entered DOI was pasted onto ~30
  different papers; the new UNIQUE constraint allows it on only one. The papers
  themselves all migrated — only the (incorrect) DOI text is gone. Full list:
  `migration-review.md` §3. Fill in real DOIs whenever convenient.
- **~160 publications show indexing "Other"** where legacy had free text (IEEE,
  Springer, WoS, ACM, UGC, …) outside the new ENUM('SCI(E)','Scopus','ESCI',
  'Other'). Agreed coarsening; SCI(E)/Scopus/ESCI values kept exactly.
- **Dr. Preeti Soni (CS019)**: 3 qualification and 2 teaching-experience rows
  plus her login dropped — her faculty row was already deleted in the legacy DB,
  so she wasn't displayed on the legacy site either. Re-create via the admin UI
  if she returns; her rows are listed in `migration-review.md` §4.
- **Impossible values nulled**: faculty 15 date_of_birth was `2025-03-31` → NULL.
- **publications.month**: legacy stored a full timestamp whose *year* part was
  entry noise; only the month was kept (`year` column is authoritative).

## 4. Needs action

1. **Confirm the DST-FST grant amount** (project SR/FST/ET-1/2023/1308). The two
   duplicate entries disagreed by 100×: **₹2,23,000 vs ₹2,23,00,000**. The
   migration kept the cleaner 2024 entry; the figure is public on the projects
   page — confirm with the department and correct via the admin UI.
2. **Re-enter the free-text CV lines that have no structured home**
   (`migration-review.md` §5 has the exact text for all 10 faculty). Most are
   redundant one-liners whose structured equivalents migrated (spot-checked:
   Dr. Jyoti Srivastava's fellowships are in the honors table). The ones with
   no structured counterpart, worth hand-entering via the admin UI:
   - Prof. Lalit Kumar Awasthi — "Best Teacher Award 2020, Research Excellence
     Award 2018" (not in the honors table).
   - Dr. Naveen Chauhan — detailed teaching-history and administrative-roles
     paragraphs.
   - Dr. T P Sharma / Dr. Siddhartha Chauhan — administrative-experience
     one-liners ("30.1 years" / "Head of Department").
3. **Optional, whenever convenient**: real DOIs for the ~30 papers in §3;
   subjects/courses CSV re-import; the 120 lowercase-`students` rows if anyone
   ever asks for them.

Server-side cut-over tasks (backup, load, secrets, password invalidation,
proxy) are tracked separately in `CUTOVER.md` — not repeated here.

## 5. Profile images — verified intact, nothing missing

Checked 2026-08-05 against the running stack:

- **Every image URL in the system migrated byte-identical to legacy** (0
  mismatches across faculty, home slides, staff, PhD scholars, HOD message).
- All image references are **external URLs** (portfolios.nith.ac.in for the
  18 senior faculty + HOD message, Cloudinary for the 9 newer faculty, slides,
  staff, posts). **No row anywhere references a server-local image**
  (`/backend/readImage/…`), so the cut-over does not need to copy any image
  files — though the upload/readImage endpoints remain for future uploads.
- Liveness probe: all 27 faculty photo URLs and a 10-of-50 PhD photo sample
  returned HTTP 200.
- Where photos don't appear, legacy had none either: students have no photos at
  all (the legacy column exists but is empty for all 592), and 56 of 106 PhD
  scholars have no photo in either database.
