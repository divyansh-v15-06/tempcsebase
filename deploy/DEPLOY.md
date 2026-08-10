# Deploying to the department server

Target: the shared NITH deployment box (Ubuntu 18.04, host Apache on :80/:443
fronting per-site Docker stacks). The old site was the `csewebsite` compose
project at `/var/www/html/cseWebsite/`, published on host port 3000 — this
stack takes over that port so **Apache needs no changes**.

Layout mirrors the local dev setup: the backend repo cloned, with the frontend
repo cloned inside it at `frontend/` (it is gitignored here on purpose — it is
its own repository).

## 0. One-time prep (already done if you followed the chat)

- The migrated data dump `schema-design/cse_department-data-20260805-2109.sql`
  is **gitignored** — `scp` it from the dev machine into `schema-design/` on
  the server after cloning.
- Rotate the Gmail app password for `webmaster.cse@nith.ac.in` (the old one is
  burned — it lived in a committed `.env`).

## 1. Final legacy backup (rollback point — do not skip)

The legacy DB lives in the **host** MySQL 5.7 (`root` / the password from
`/var/www/html/cseWebsite/.env`):

```sh
mysqldump -h 127.0.0.1 -u root -p --single-transaction cseBackend \
  > ~/server_backups/cseBackend-final-$(date +%Y%m%d).sql
```

Copy it off the server. This backup is the only place the intentionally
dropped rows (duplicates, 120 lowercase-students, free-text CV blobs) survive.

## 2. Get the code

```sh
cd /var/www/html
sudo mkdir cseWebsiteNew && sudo chown $USER cseWebsiteNew && cd cseWebsiteNew
git clone -b new-optimisedbackend https://github.com/divyansh-v15-06/CseBackend .
git clone -b fix/backend-integration https://github.com/divyansh-v15-06/cseFrontend frontend
# now scp the data dump into schema-design/ (see step 0)
```

## 3. Secrets

```sh
cp .env.example .env && nano .env
```

Every value NEW — generators are noted in the file. Never reuse `csebdb`, the
old JWT secret, or the old Gmail app password.

## 4. Make sure the old stack is down, then start

```sh
cd /var/www/html/cseWebsite && docker compose down   # old site (containers only — volumes stay)
cd /var/www/html/cseWebsiteNew && docker compose up -d --build
docker compose logs -f mysql   # first boot: watch schema + data + password-reset load
```

First boot with an empty `mysql-data` volume auto-runs `schema.sql`, the data
dump, and `force-password-reset.sql` (look for `accounts_invalidated: 19` in
the init output). If the init fails partway, fix the cause, then
`docker compose down -v mysql` is NOT enough — remove the volume
(`docker volume rm cse<project>_mysql-data`) so init re-runs from scratch.

## 5. Smoke checks

```sh
curl -s localhost:3000/backend/faculty/get | head -c 200    # 27 faculty
curl -s localhost:3000/ | head -c 200                       # homepage HTML
```

Then over the real domain: pages render, an image loads, faculty
"forgot password" mail arrives and the reset link works, admin login works
after reset.

## 6. Post-cutover hardening (host MySQL)

The legacy host MySQL 5.7 listens on `0.0.0.0:3306` with root/`csebdb` — that
was reachable from the internet. Once the new site is confirmed good:

```sh
# keep the legacy DB as rollback, but stop exposing it:
sudo mysql -u root -p -e "ALTER USER 'root'@'%' IDENTIFIED BY '<new strong password>';"
# and/or bind-address=127.0.0.1 in /etc/mysql/mysql.conf.d/mysqld.cnf + restart,
# or firewall: sudo ufw deny 3306
```

Also delete/secure the world-readable `/var/www/html/cseWebsite/.env`.

## Rollback

```sh
cd /var/www/html/cseWebsiteNew && docker compose down
cd /var/www/html/cseWebsite && docker compose up -d    # old site returns on :3000
```

The legacy database was never modified, so rollback is instant.

## Notes

- MySQL 8 runs **inside** the stack, unpublished — no host port. Admin shell:
  `docker compose exec mysql mysql -u root -p cse_department`.
- Uploads persist in the `backend-uploads` volume (`/app/public`).
- `REQUIRE_AUTH_WRITES=false` matches legacy behavior; flip to `true` once the
  frontend sends Authorization headers on writes.
- Full data/cutover context: `../schema-design/CUTOVER.md` and
  `../schema-design/MISSING-DATA-REPORT.md`.
