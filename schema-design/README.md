# schema-design — clean MySQL schema for the CSE backend

Reverse-engineered from the code in `userService/src`; validated against a local staging
database. See `ER_MODEL.md` for the design, `SUMMARY.md` for old→new mapping, flagged
ambiguities and the migration-transform checklist.

## Contents

| Path | What |
|---|---|
| `ER_MODEL.md` | Proposed ER model + cleanup notes |
| `schema.sql` | Canonical **MySQL 8** DDL (InnoDB, utf8mb4, `utf8mb4_0900_ai_ci`) + lookup seeds |
| `models/` | Sequelize 6 models mirroring the DDL 1:1 |
| `SUMMARY.md` | Current-vs-proposed comparison, flagged guesses, migration checklist |
| `staging-db.sh` | Userspace staging DB manager (no sudo, no system service) |
| `validate.js` | Mapping audit + transactional CRUD round-trip (`--crud`), safe on real data |
| `package.json` | Deps for `validate.js` (`npm install` here once) |

## Staging workflow (migration day)

```bash
cd schema-design

./staging-db.sh start            # userspace DB on 127.0.0.1:3307 (root, no password)
./staging-db.sh create-schema    # clean `cse_department` from schema.sql + seeds
./staging-db.sh load-legacy ~/old-dump.sql   # old DB side-by-side as `legacy_cse`

# ...write/run legacy_cse -> cse_department transform SQL
#    (INSERT INTO cse_department.faculty (...) SELECT ... FROM legacy_cse.Faculties; etc.
#     follow the "Migration-day data transforms" checklist in SUMMARY.md)

./staging-db.sh validate --crud  # schema/model mapping + round-trip, rolled back, no residue
./staging-db.sh shell            # poke around

./staging-db.sh dump-data        # data-only INSERTs of cse_department
```

## Putting it on the server

Recommended hand-off (keeps the server exactly on the canonical MySQL 8 DDL, regardless of
what the local stage runs):

```bash
# on the server
mysql -u <user> -p -e "CREATE DATABASE cse_department CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
mysql -u <user> -p cse_department < schema.sql
mysql -u <user> -p cse_department < cse_department-data-<date>.sql   # from dump-data
```

`dump-full` also exists if you want a single file, but data-only + `schema.sql` is safer:
the local stage is MariaDB 11.8 (Fedora), and `create-schema`/`validate` auto-swap the
MySQL-8-only collation to `utf8mb4_unicode_ci` locally — the canonical `schema.sql` stays
untouched for the real server. If the server itself runs MariaDB, load it the same way the
staging script does (swap the collation) — everything else in the DDL is compatible.

## Notes

- Staging instance lives in `~/.local/share/cse-staging-db` (override: `CSE_DB_DIR`),
  port `3307` (`CSE_DB_PORT`). It survives reboots; just `./staging-db.sh start` again.
- `validate.js --crud` writes only `ZZTEST`-prefixed synthetic rows inside a transaction
  that is always rolled back, and finishes by proving the DB holds no residue — safe to run
  after the real data is in.
- The lookup seeds (`programs`, `research_types`, `supervision_types`) ship inside
  `schema.sql` with the exact IDs the application code hardcodes.
