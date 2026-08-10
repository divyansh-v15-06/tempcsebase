#!/usr/bin/env bash
# Staging database manager for the clean CSE schema.
#
# Runs a self-contained MariaDB/MySQL instance in userspace (no sudo, no system
# service touched) so you can: load the clean schema, import the legacy dump
# side-by-side, run legacy->clean transform SQL, validate, and export a dump
# ready for the production server.
#
#   ./staging-db.sh start            start (initializes datadir on first run)
#   ./staging-db.sh stop             shut the instance down
#   ./staging-db.sh status           is it running?
#   ./staging-db.sh create-schema    (re)create the clean DB from schema.sql + seeds  [DROPS it first]
#   ./staging-db.sh load-legacy F    import the old DB dump file F into `legacy_cse`
#   ./staging-db.sh shell [db]       mysql shell (default db: cse_department)
#   ./staging-db.sh validate [...]   run validate.js against this instance (e.g. --crud)
#   ./staging-db.sh dump-data [out]  data-only dump of cse_department (recommended for the server:
#                                    create the schema there from schema.sql, then load this)
#   ./staging-db.sh dump-full [out]  full dump (schema+data) of cse_department
#
# Overridable via env: CSE_DB_DIR, CSE_DB_PORT (3307), CSE_DB_SOCKET, CSE_DB_NAME, CSE_LEGACY_DB
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="${CSE_DB_DIR:-$HOME/.local/share/cse-staging-db}"
DATA_DIR="$DB_DIR/data"
LOG_FILE="$DB_DIR/server.log"
PID_FILE="$DB_DIR/server.pid"
SOCKET="${CSE_DB_SOCKET:-/tmp/cse-staging.sock}"
PORT="${CSE_DB_PORT:-3307}"
DB_NAME="${CSE_DB_NAME:-cse_department}"
LEGACY_DB="${CSE_LEGACY_DB:-legacy_cse}"
SCHEMA_FILE="$SCRIPT_DIR/schema.sql"

CLIENT="$(command -v mariadb || command -v mysql)"
DUMP="$(command -v mariadb-dump || command -v mysqldump)"
ADMIN="$(command -v mariadb-admin || command -v mysqladmin)"
SERVERD="$(command -v mariadbd || true)"
[ -n "$SERVERD" ] || { [ -x /usr/libexec/mariadbd ] && SERVERD=/usr/libexec/mariadbd; }
[ -n "$SERVERD" ] || SERVERD="$(command -v mysqld || true)"
[ -n "$SERVERD" ] || { echo "no mariadbd/mysqld binary found"; exit 1; }

sql() { "$CLIENT" -h 127.0.0.1 -P "$PORT" -u root "$@"; }
is_running() { "$ADMIN" -h 127.0.0.1 -P "$PORT" -u root ping >/dev/null 2>&1; }
server_is_mariadb() { sql -N -e "SELECT VERSION();" | grep -qi mariadb; }

cmd_start() {
    if is_running; then echo "already running on 127.0.0.1:$PORT"; return; fi
    mkdir -p "$DATA_DIR"
    if [ ! -d "$DATA_DIR/mysql" ]; then
        echo "first run — initializing datadir at $DATA_DIR"
        mariadb-install-db --datadir="$DATA_DIR" --auth-root-authentication-method=normal \
            --skip-test-db >>"$LOG_FILE" 2>&1
    fi
    nohup "$SERVERD" --datadir="$DATA_DIR" --socket="$SOCKET" --port="$PORT" \
        --bind-address=127.0.0.1 --pid-file="$PID_FILE" >>"$LOG_FILE" 2>&1 &
    for _ in $(seq 1 40); do is_running && break; sleep 0.5; done
    if is_running; then
        echo "staging DB up: 127.0.0.1:$PORT (user root, no password)"
        echo "  socket:  $SOCKET"
        echo "  datadir: $DATA_DIR"
    else
        echo "failed to start — see $LOG_FILE"; exit 1
    fi
}

cmd_stop() { "$ADMIN" -h 127.0.0.1 -P "$PORT" -u root shutdown && echo "stopped"; }

cmd_status() {
    if is_running; then
        echo "running on 127.0.0.1:$PORT ($(sql -N -e 'SELECT VERSION();'))"
        sql -N -e "SELECT CONCAT('  ', table_schema, ': ', COUNT(*), ' tables')
                   FROM information_schema.tables
                   WHERE table_schema IN ('$DB_NAME', '$LEGACY_DB') GROUP BY table_schema;"
    else
        echo "not running"
    fi
}

cmd_create_schema() {
    sql -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4;"
    if server_is_mariadb; then
        # utf8mb4_0900_ai_ci is MySQL-8-only; swap for the local MariaDB stage.
        # The canonical schema.sql (used on the real MySQL 8 server) is untouched.
        sed 's/utf8mb4_0900_ai_ci/utf8mb4_unicode_ci/g' "$SCHEMA_FILE" | sql "$DB_NAME"
        echo "schema + lookup seeds loaded (collation auto-swapped for MariaDB)"
    else
        sql "$DB_NAME" < "$SCHEMA_FILE"
        echo "schema + lookup seeds loaded (canonical MySQL 8)"
    fi
    sql "$DB_NAME" -e "SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema='$DB_NAME';"
}

cmd_load_legacy() {
    local file="${1:?usage: staging-db.sh load-legacy <dump.sql>}"
    [ -f "$file" ] || { echo "no such file: $file"; exit 1; }
    sql -e "DROP DATABASE IF EXISTS \`$LEGACY_DB\`; CREATE DATABASE \`$LEGACY_DB\` CHARACTER SET utf8mb4;"
    # Strip any CREATE DATABASE/USE lines so the dump lands in $LEGACY_DB regardless
    # of how it was exported.
    sed -E '/^(CREATE DATABASE|USE )/d' "$file" | sql --force "$LEGACY_DB" || true
    echo "legacy dump imported into \`$LEGACY_DB\` (side by side with \`$DB_NAME\` for INSERT..SELECT transforms):"
    sql -N -e "SELECT CONCAT('  ', table_name) FROM information_schema.tables WHERE table_schema='$LEGACY_DB' ORDER BY table_name;" | head -50
}

cmd_dump_data() {
    local out="${1:-$SCRIPT_DIR/${DB_NAME}-data-$(date +%Y%m%d-%H%M).sql}"
    # programs/research_types/supervision_types are seeded by schema.sql itself;
    # including them here makes the server-side load fail on duplicate PKs.
    "$DUMP" -h 127.0.0.1 -P "$PORT" -u root --single-transaction --no-create-info \
        --complete-insert --skip-triggers \
        --ignore-table="$DB_NAME.programs" \
        --ignore-table="$DB_NAME.research_types" \
        --ignore-table="$DB_NAME.supervision_types" \
        "$DB_NAME" > "$out"
    echo "data-only dump written: $out"
    echo "server hand-off: create the schema on the server from schema.sql, then load this file."
}

cmd_dump_full() {
    local out="${1:-$SCRIPT_DIR/${DB_NAME}-full-$(date +%Y%m%d-%H%M).sql}"
    "$DUMP" -h 127.0.0.1 -P "$PORT" -u root --single-transaction --routines "$DB_NAME" > "$out"
    echo "full dump written: $out"
    echo "note: if this stage runs MariaDB, prefer dump-data + canonical schema.sql on a MySQL 8 server."
}

cmd_shell() { exec "$CLIENT" -h 127.0.0.1 -P "$PORT" -u root "${1:-$DB_NAME}"; }

cmd_validate() {
    cd "$SCRIPT_DIR"
    [ -d node_modules ] || { echo "installing validate.js dependencies..."; npm install --no-audit --no-fund; }
    DB_HOST=127.0.0.1 DB_PORT="$PORT" DB_NAME="$DB_NAME" DB_USER=root DB_PASSWORD= node validate.js "$@"
}

case "${1:-}" in
    start)          cmd_start ;;
    stop)           cmd_stop ;;
    status)         cmd_status ;;
    create-schema)  cmd_create_schema ;;
    load-legacy)    shift; cmd_load_legacy "$@" ;;
    dump-data)      shift; cmd_dump_data "$@" ;;
    dump-full)      shift; cmd_dump_full "$@" ;;
    shell)          shift; cmd_shell "$@" ;;
    validate)       shift; cmd_validate "$@" ;;
    *)              grep '^#   ' "$0" | sed 's/^#   //'; exit 1 ;;
esac
