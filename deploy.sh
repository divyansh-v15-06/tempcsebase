#!/bin/bash
set -e

# CSE Department Web Platform - Deployment Script

echo "=================================================="
echo " Starting CSE Department Web Stack Deployment"
echo "=================================================="

# Discover absolute path of docker and docker-compose
DOCKER_BIN=$(which docker 2>/dev/null || for p in /usr/bin/docker /usr/local/bin/docker /snap/bin/docker /usr/bin/podman; do [ -x "$p" ] && echo "$p" && break; done)
DOCKER_COMPOSE_BIN=$(which docker-compose 2>/dev/null || for p in /usr/bin/docker-compose /usr/local/bin/docker-compose /snap/bin/docker-compose; do [ -x "$p" ] && echo "$p" && break; done)

if [ -z "$DOCKER_BIN" ] && [ -z "$DOCKER_COMPOSE_BIN" ]; then
  echo "Error: Neither 'docker' nor 'docker-compose' binary could be found on the system."
  echo "Search PATH: $PATH"
  exit 1
fi

# Detect working invocation (user level vs sudo with preserved PATH)
if [ -n "$DOCKER_BIN" ] && "$DOCKER_BIN" compose version &>/dev/null; then
  DOCKER_CMD="$DOCKER_BIN compose"
elif [ -n "$DOCKER_COMPOSE_BIN" ] && "$DOCKER_COMPOSE_BIN" version &>/dev/null; then
  DOCKER_CMD="$DOCKER_COMPOSE_BIN"
elif [ -n "$DOCKER_BIN" ] && sudo env "PATH=$PATH:/usr/local/bin:/snap/bin:/usr/bin" "$DOCKER_BIN" compose version &>/dev/null; then
  DOCKER_CMD="sudo env PATH=$PATH:/usr/local/bin:/snap/bin:/usr/bin $DOCKER_BIN compose"
elif [ -n "$DOCKER_COMPOSE_BIN" ] && sudo env "PATH=$PATH:/usr/local/bin:/snap/bin:/usr/bin" "$DOCKER_COMPOSE_BIN" version &>/dev/null; then
  DOCKER_CMD="sudo env PATH=$PATH:/usr/local/bin:/snap/bin:/usr/bin $DOCKER_COMPOSE_BIN"
elif [ -n "$DOCKER_BIN" ]; then
  DOCKER_CMD="$DOCKER_BIN compose"
else
  DOCKER_CMD="$DOCKER_COMPOSE_BIN"
fi

echo "Using Docker command: $DOCKER_CMD"



# 1. Check for .env file
echo "=== 1. Checking environment configuration (.env) ==="
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "[!] Created .env from .env.example."
    echo "[!] Please configure .env with real production secrets before running again!"
    exit 1
  else
    echo "Error: .env file not found and no .env.example available."
    exit 1
  fi
fi

# 2. Port Validation (Strictly prevent collision with 8080, 5173, 8000, 8001)
PORT_VAL=$(grep -E '^PORT=' .env | cut -d '=' -f2 | tr -d ' "\r\n')
PORT_VAL=${PORT_VAL:-3000}

FORBIDDEN_PORTS=("8080" "5173" "8000" "8001")
for FP in "${FORBIDDEN_PORTS[@]}"; do
  if [ "$PORT_VAL" == "$FP" ]; then
    echo "================================================================="
    echo " [ERROR] PORT=$PORT_VAL is in the forbidden list: (8080, 5173, 8000, 8001)!"
    echo " These ports are reserved for other services running on the server."
    echo " Please change PORT in .env (e.g., PORT=3000 or PORT=3050) and re-run."
    echo "================================================================="
    exit 1
  fi
done

echo "Configured host publishing port: $PORT_VAL (Passed port validation)"

# 3. Stop existing containers safely
echo "=== 2. Stopping existing containers ==="
$DOCKER_CMD down --remove-orphans || true

# 4. Build and start services
echo "=== 3. Building and starting Docker services ==="
$DOCKER_CMD up -d --build

# 5. Wait for MySQL to become healthy
echo "=== 4. Waiting for MySQL container to become healthy ==="
RETRIES=30
until [ $RETRIES -le 0 ] || $DOCKER_CMD ps mysql | grep -q "healthy"; do
  sleep 3
  echo -n "."
  RETRIES=$((RETRIES-1))
done
echo ""

if [ $RETRIES -le 0 ]; then
  echo "[WARNING] MySQL took longer than expected to report healthy. Checking logs:"
  $DOCKER_CMD logs --tail=30 mysql
fi

# 6. Check/Restore database export if present
echo "=== 5. Database check ==="
if [ -f schema-design/live_export.sql ]; then
  MYSQL_ROOT_PW=$(grep -E '^MYSQL_ROOT_PASSWORD=' .env | cut -d '=' -f2 | tr -d ' "\r\n')
  if [ -n "$MYSQL_ROOT_PW" ]; then
    echo "Importing live database dump from schema-design/live_export.sql..."
    $DOCKER_CMD exec -T mysql mysql -u root -p"$MYSQL_ROOT_PW" cse_department < schema-design/live_export.sql || echo "Note: SQL import encountered non-fatal notices or was already populated."
    echo "Database import step finished."
  fi
else
  echo "Default schema & seeds initialized automatically via docker-entrypoint-initdb.d"
fi

echo "=================================================="
echo " Deployment Successfully Finished!"
echo "=================================================="
echo "Container Status:"
$DOCKER_CMD ps
echo ""
echo "Smoke Check Commands:"
echo "  curl -s http://127.0.0.1:${PORT_VAL}/ | head -n 10"
echo "  curl -s http://127.0.0.1:${PORT_VAL}/backend/faculty/get | head -c 200"
echo ""
echo "Host Nginx Setup Reminder:"
echo "  Make sure /etc/nginx/sites-available/tempcse proxies to http://127.0.0.1:${PORT_VAL}"
echo "  (See deploy/host-nginx-tempcse.conf for the template)"