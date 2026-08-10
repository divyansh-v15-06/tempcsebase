#!/usr/bin/env bash
#
# Restore the ORIGINAL legacy passwords — reverses force-password-reset.sql.
#
# Every migrated account goes back to the exact bcrypt hash it carried on the
# legacy site, so each faculty member's old password works again and nobody has
# to go through the mail reset to get in.
#
# It does NOT retype any hash: it replays the `user_accounts` INSERT straight
# out of the migration dump (the same dump that seeded the database), so the
# restored state is byte-identical to the pre-invalidation state — password
# hashes, first_login flags and timestamps alike.
#
# SECURITY NOTE (read once, then decide):
#   These hashes come from the legacy MySQL that listened on 0.0.0.0:3306 with
#   root/csebdb, and they are also committed in legacy_dump.sql. Treat them as
#   already leaked. Restoring them carries that exposure into the new site.
#   The mail-based reset flow still works — tell faculty to change their
#   password after their first login.
#
# Idempotent: safe to run more than once.
#
# Usage (from /var/www/html/cseWebsiteNew):
#   bash schema-design/restore-legacy-passwords.sh

set -euo pipefail

cd "$(dirname "$0")/.."

DUMP=$(ls -1 schema-design/cse_department-data-*.sql 2>/dev/null | head -1)
if [ -z "$DUMP" ]; then
    echo "ERROR: migration dump not found in schema-design/ — scp it over first." >&2
    exit 1
fi
echo "Using dump: $DUMP"

# Pull just the user_accounts INSERT out of the dump and turn it into a REPLACE
# so existing rows are overwritten in place (nothing has a FK to this table).
SQL=$(sed -n '/INSERT INTO `user_accounts`/,/;$/p' "$DUMP" | sed '1s/INSERT INTO/REPLACE INTO/')

ROWS=$(printf '%s\n' "$SQL" | grep -c '^(' || true)
ROWS=$((ROWS + 1))   # the first row shares the line with REPLACE INTO ... VALUES
if [ "$ROWS" -ne 19 ]; then
    echo "ERROR: expected 19 accounts in the dump, found $ROWS — aborting." >&2
    exit 1
fi
echo "Extracted $ROWS accounts from the dump."

# shellcheck disable=SC1091
set -a; . ./.env; set +a

echo "Restoring…"
printf '%s\n' "$SQL" | docker compose exec -T mysql \
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" cse_department

echo
echo "Verifying (expect restored = 19, invalidated = 0):"
docker compose exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" cse_department -e "
SELECT
  SUM(password_hash <> '\$2b\$08\$1mWxiEM7XiXwbPbKbTfkJeQnwWJh7eh7ejEETC7gkx5cox.xXmzqK') AS restored,
  SUM(password_hash =  '\$2b\$08\$1mWxiEM7XiXwbPbKbTfkJeQnwWJh7eh7ejEETC7gkx5cox.xXmzqK') AS invalidated
FROM user_accounts;"

echo
echo "Done. Old passwords work again. The reset-password flow is unaffected."
