#!/usr/bin/env bash
#
# Set or rotate the Gmail App Password used to send password-reset mail.
#
# Prompts without echoing, so the secret never lands in shell history or in the
# process list. Rewrites .env, recreates the backend container (a plain
# `docker compose restart` would NOT pick up .env changes), and can send a test
# reset mail.
#
# Usage (from /var/www/html/cseWebsiteNew):
#   bash deploy/set-mail-password.sh
#   bash deploy/set-mail-password.sh --email someone@nith.ac.in
#   bash deploy/set-mail-password.sh --reset-link-base https://tempcse.nith.ac.in/reset-password
#
# The password must be a Google App Password (Google Account -> Security ->
# 2-Step Verification -> App passwords), NOT the account's login password.

set -euo pipefail

cd "$(dirname "$0")/.."

NEW_EMAIL=""
NEW_LINK_BASE=""
while [ $# -gt 0 ]; do
    case "$1" in
        --email)            NEW_EMAIL="${2:-}"; shift 2 ;;
        --reset-link-base)  NEW_LINK_BASE="${2:-}"; shift 2 ;;
        -h|--help)          sed -n '2,20p' "$0"; exit 0 ;;
        *)                  echo "Unknown option: $1" >&2; exit 1 ;;
    esac
done

if [ ! -f .env ]; then
    echo "ERROR: no .env here. Run this from the compose project root." >&2
    exit 1
fi

# Keep a timestamped backup — .env holds the DB passwords and JWT secret too.
BACKUP=".env.bak-$(date +%Y%m%d-%H%M%S)"
cp -p .env "$BACKUP"
chmod 600 "$BACKUP"
echo "Backed up .env -> $BACKUP"

# --- password prompt (silent, entered twice) --------------------------------
prompt_password() {
    local p1 p2
    # Every message here goes to stderr: stdout is captured as the password.
    read -r -s -p "Gmail App Password (16 chars, spaces ok, input hidden): " p1; echo >&2
    read -r -s -p "Repeat it: " p2; echo >&2
    if [ "$p1" != "$p2" ]; then
        echo "ERROR: the two entries differ." >&2
        return 1
    fi
    # Google displays it in groups of four; the spaces are not part of it.
    p1="${p1// /}"
    if [ -z "$p1" ]; then
        echo "ERROR: empty password." >&2
        return 1
    fi
    if [ "${#p1}" -ne 16 ]; then
        echo "WARNING: expected 16 characters, got ${#p1}. Continuing anyway." >&2
    fi
    printf '%s' "$p1"
}

APP_PASSWORD="$(prompt_password)"

# --- rewrite .env in place ---------------------------------------------------
# Written with awk rather than sed so regex-special characters in the value are
# taken literally, and passed through the environment rather than -v so awk does
# not interpret backslash escapes inside it.
set_var() {
    local key="$1"
    SETVAR_VALUE="$2" awk -v key="$key" '
        BEGIN { done = 0; value = ENVIRON["SETVAR_VALUE"] }
        $0 ~ "^" key "=" { print key "=" value; done = 1; next }
        { print }
        END { if (!done) print key "=" value }
    ' .env > .env.tmp
    mv .env.tmp .env
}

set_var ADMIN_EMAIL_PASSWORD "$APP_PASSWORD"
if [ -n "$NEW_EMAIL" ]; then
    set_var ADMIN_EMAIL "$NEW_EMAIL"
fi
if [ -n "$NEW_LINK_BASE" ]; then
    set_var RESET_LINK_BASE "$NEW_LINK_BASE"
fi
chmod 600 .env

echo
echo "New mail settings in .env:"
grep -E '^(ADMIN_EMAIL|RESET_LINK_BASE)=' .env || true   # ADMIN_EMAIL_PASSWORD deliberately not matched
echo "ADMIN_EMAIL_PASSWORD=<set, ${#APP_PASSWORD} chars>"

# --- recreate the backend so it re-reads .env --------------------------------
echo
echo "Recreating the backend container..."
docker compose up -d backend

echo "Waiting for it to come up..."
for _ in $(seq 1 15); do
    if docker compose exec -T backend printenv ADMIN_EMAIL >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

echo
echo "Values now live inside the container:"
docker compose exec -T backend printenv ADMIN_EMAIL RESET_LINK_BASE || true
if docker compose exec -T backend sh -c '[ -n "$ADMIN_EMAIL_PASSWORD" ]'; then
    echo "ADMIN_EMAIL_PASSWORD is set."
else
    echo "WARNING: ADMIN_EMAIL_PASSWORD is EMPTY inside the container." >&2
fi

# --- optional test mail ------------------------------------------------------
echo
read -r -p "Send a test reset mail now? Enter a faculty id (e.g. CS01) or blank to skip: " TEST_ID
if [ -n "$TEST_ID" ]; then
    PORT_VALUE="$(grep -E '^PORT=' .env | cut -d= -f2 || true)"
    PORT_VALUE="${PORT_VALUE:-3000}"
    echo "POSTing /auth/passwordreset for $TEST_ID ..."
    curl -s -X POST "localhost:${PORT_VALUE}/backend/auth/passwordreset" \
        -H 'Content-Type: application/json' \
        -d "{\"uniqueFacultyId\":\"${TEST_ID}\"}" || true
    echo
    echo "Backend log (mail lines):"
    docker compose logs --tail 30 backend | grep -i mail || echo "  (no mail lines — usually a good sign)"
    echo
    echo "The API reports success even if delivery failed (it must not leak which"
    echo "ids exist), so confirm the mail actually arrived in the inbox."
fi

echo
echo "Done. Delete the backup once you are happy:  rm $BACKUP"
