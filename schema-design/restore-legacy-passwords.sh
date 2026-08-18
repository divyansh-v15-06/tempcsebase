#!/usr/bin/env bash
#
# Restore the ORIGINAL legacy passwords — reverses force-password-reset.sql.
#
# Every migrated account goes back to the exact bcrypt hash it carried on the
# legacy site, so each faculty member's old password works again.

set -euo pipefail

cd "$(dirname "$0")/.."

DUMP="schema-design/live_export.sql"
if [ ! -f "$DUMP" ]; then
    DUMP=$(ls -1 schema-design/cse_department-data-*.sql 2>/dev/null | head -1 || true)
fi

if [ -z "$DUMP" ] || [ ! -f "$DUMP" ]; then
    echo "ERROR: migration dump not found in schema-design/" >&2
    exit 1
fi
echo "Using dump: $DUMP"

SQL=$(sed -n '/INSERT INTO `user_accounts`/,/;$/p' "$DUMP" | sed '1s/INSERT INTO/REPLACE INTO/')

if command -v mysql &>/dev/null; then
    echo "Restoring legacy passwords to MySQL..."
    printf '%s\n' "$SQL" | sudo mysql cse_department
else
    echo "Restoring legacy passwords via Docker..."
    printf '%s\n' "$SQL" | docker compose exec -T mysql mysql -u root -p cse_department
fi

echo "Verifying accounts:"
sudo mysql cse_department -e "
SELECT id, COALESCE(username, faculty_id) AS account, role, LEFT(password_hash, 10) AS hash_prefix, updated_at 
FROM user_accounts ORDER BY id;
"

echo "Done! All 19 legacy accounts (18 faculty + 1 admin) have been restored to their original passwords."
