# Passwords, logins and resets

Everything about who can log in, how they recover, and how the reset mail is
configured. All commands assume you are on the server in
`/var/www/html/cseWebsiteNew` (the compose project root).

## 1. The account model

There are **19 accounts** in `user_accounts` — no more are created automatically.

| Who | How many | Logs in with | Recovery mail goes to |
|---|---|---|---|
| Faculty | 18 | their `uniqueFacultyId` (= `faculty_code`, e.g. `CS01`) | the address on their `faculty` row |
| Admin | 1 | username `admin` | `webmaster.cse@nith.ac.in` (stored on the account row) |

Nine newer faculty (ids 42–51, codes `TF042`–`TF051`) have **no account** — they
create one themselves through sign-up.

Public visitors need no account: every read-only page is open.

> Note: `REQUIRE_AUTH_WRITES=false` in `.env` means the write API endpoints do
> not require a token yet (this mirrors the old site). Logins gate the
> dashboards, not the raw API. Flip it to `true` once the frontend sends
> `Authorization` headers.

## 2. Current password state

The cut-over originally invalidated all 19 passwords
(`schema-design/force-password-reset.sql`), then that was **deliberately
reversed** — see `schema-design/restore-legacy-passwords.sh`. Everyone's
original password from the old site works again.

Because the legacy database was internet-exposed (root/`csebdb` on
`0.0.0.0:3306`) those hashes should be assumed leaked. Ask faculty to change
their password after logging in — section 4.

Check the current state at any time:

```sh
docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" cse_department -e "SELECT id, COALESCE(username, faculty_id) AS who, role, first_login, LEFT(password_hash,7) AS algo, updated_at FROM user_accounts ORDER BY id;"'
```

## 3. The API endpoints

Served at the service root, so through nginx they are `/backend/auth/...`.

| Endpoint | Purpose | Auth |
|---|---|---|
| `POST /auth/signIn` | faculty login — `{uniqueFacultyId, password}` | none |
| `POST /auth/admin/signIn` | admin login — `{username, password}` | none |
| `POST /auth/signUp` | new faculty account — `{uniqueFacultyId, password}` | none |
| `POST /auth/passwordreset` | mail a 15-minute reset link — `{uniqueFacultyId}` | none |
| `POST /auth/passwordreset/admin` | same, pass `{"uniqueFacultyId":"admin"}` | none |
| `PATCH /auth/update` | set a new password — `{newPassword}` | Bearer token |
| `PATCH /auth/updatePass` | change with old — `{oldPassword, newPassword}` | Bearer token |

Both reset routes are the same handler; `admin` resolves by username, faculty
codes by `faculty_code`.

## 4. How a user resets their own password

1. "Forgot password" → the backend mails a link valid for **15 minutes**.
2. The link opens `RESET_LINK_BASE/<token>`; setting a new password there also
   clears `first_login`.

By hand, to test it end to end:

```sh
curl -s -X POST localhost:3000/backend/auth/passwordreset \
  -H 'Content-Type: application/json' -d '{"uniqueFacultyId":"CS01"}'
```

**`RESET_LINK_BASE` must match the domain the site is actually served on**, or
the emailed links 404. While on the temp domain it should be
`https://tempcse.nith.ac.in/reset-password`; switch it when `cse.nith.ac.in`
cuts over. Change it the same way as the mail password (section 5).

## 5. The mail sender (Gmail app password)

Reset mail is sent through Gmail SMTP using two `.env` values:

```
ADMIN_EMAIL=24bcs042@nith.ac.in
ADMIN_EMAIL_PASSWORD=<16-character Google App Password>
```

`ADMIN_EMAIL_PASSWORD` is **not** the account's login password — it must be an
App Password generated for that exact address (Google Account → Security →
2-Step Verification → App passwords). 2-Step Verification must be on first. On
a NITH Workspace address the option only appears if the Workspace admin allows
app passwords; if it is missing, use a personal Gmail as the sender instead.

To set or rotate it, use the helper script — it prompts without echoing, so the
password never lands in your shell history:

```sh
bash deploy/set-mail-password.sh
```

Or to change the sender address at the same time:

```sh
bash deploy/set-mail-password.sh --email someone@nith.ac.in
```

The script rewrites `.env`, recreates the backend container, and offers to send
a test reset mail. Mail is loaded lazily, so a wrong password breaks only the
reset routes — the rest of the site keeps working.

Doing it manually is three steps (note `up -d`, **not** `restart` — restart does
not re-read `.env`):

```sh
sed -i 's|^ADMIN_EMAIL_PASSWORD=.*|ADMIN_EMAIL_PASSWORD=abcdefghijklmnop|' .env
docker compose up -d backend
docker compose exec backend printenv ADMIN_EMAIL ADMIN_EMAIL_PASSWORD
```

### If mail fails

```sh
docker compose logs --tail 50 backend | grep -i mail
```

- `Mail is not configured` → one of the two values is empty in the container;
  you edited `.env` but did not recreate the container.
- `Invalid login: 535` → wrong app password, spaces left in, or app passwords
  are disabled for that account.
- The API returns success even when delivery fails (deliberate — it must not
  leak which IDs exist), so always confirm against the logs and the inbox.

## 6. Admin: resetting one user by hand

When someone cannot receive mail. Generate a hash with the same cost factor the
app uses (bcrypt, cost 8), then write it in:

```sh
docker compose exec backend node -e "console.log(require('bcrypt').hashSync(process.argv[1],8))" 'ChosenPassword123'
```

```sh
docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" cse_department -e "UPDATE user_accounts SET password_hash = '"'"'<paste hash>'"'"', first_login = 1 WHERE id = <id>;"'
```

Use `WHERE username = '\''admin'\''` for the admin account. Leaving
`first_login = 1` flags it as a credential the user still needs to change.
Send the password over a channel other than the one you just reset.

## 7. Bulk operations

**Invalidate every password again** (forces everyone through mail recovery —
this is what cut-over originally did):

```sh
docker compose exec -T mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" cse_department' < schema-design/force-password-reset.sql
```

Expect `accounts_invalidated = 19`. Do not run this unless mail is confirmed
working — it locks out every account including admin.

**Restore the original legacy passwords** (reverses the above):

```sh
bash schema-design/restore-legacy-passwords.sh
```

Expect `restored = 19, invalidated = 0`. Both are idempotent.

## 8. Secrets hygiene

- Rotating `JWT_SECRET_KEY` invalidates every issued token and logs everyone
  out; it does not touch passwords.
- The legacy JWT secret was the literal `karan` and was printed to stdout —
  never reuse any legacy secret.
- `.env` is gitignored and must stay that way. Check it is not world-readable:
  `chmod 600 .env`.
- The old site's `.env` at `/var/www/html/cseWebsite/.env` was world-readable
  with live credentials — delete or lock it down.
