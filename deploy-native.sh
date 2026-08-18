#!/bin/bash
set -e

# ==============================================================================
# CSE Department Web Platform - Native Deployment (Node.js + PM2)
# ==============================================================================

echo "=================================================="
echo " Starting CSE Web Platform Native Deployment"
echo "=================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# 1. Environment Configuration Check
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "[!] Created .env from .env.example. Please update your DB credentials in .env!"
  else
    echo "Error: .env not found."
    exit 1
  fi
fi

# Load variables from .env
export $(grep -v '^#' .env | xargs -d '\n')

# 2. Check and Install PM2 if needed
if ! command -v pm2 &>/dev/null; then
  echo "=== Installing PM2 globally ==="
  npm install -g pm2
fi

# 3. Setup Backend (userService)
echo "=== 1/3 Installing Backend Dependencies ==="
cd "$ROOT_DIR/userService"
npm install --omit=dev

# Copy .env to userService if not already there
if [ ! -f .env ] && [ -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env" .env
fi

# 4. Setup Frontend
echo "=== 2/3 Building Frontend Application ==="
cd "$ROOT_DIR/frontend"
npm install --legacy-peer-deps
NEXT_PUBLIC_API_URL=/backend npm run build

# 5. Start with PM2
echo "=== 3/3 Starting Applications with PM2 ==="
cd "$ROOT_DIR"
pm2 delete tempcse-backend 2>/dev/null || true
pm2 delete tempcse-frontend 2>/dev/null || true

# Start backend
cd "$ROOT_DIR/userService"
NODE_ENV=production \
BACKEND_PORT=3001 \
DB_HOST=${DB_HOST:-127.0.0.1} \
DB_PORT=${DB_PORT:-3306} \
DB_NAME=${DB_NAME:-cse_department} \
DB_USER=${DB_USER:-${MYSQL_USER:-root}} \
DB_PASSWORD=${DB_PASSWORD:-${MYSQL_PASSWORD}} \
JWT_SECRET_KEY=${JWT_SECRET_KEY} \
ADMIN_EMAIL=${ADMIN_EMAIL} \
ADMIN_EMAIL_PASSWORD=${ADMIN_EMAIL_PASSWORD} \
RESET_LINK_BASE=${RESET_LINK_BASE:-https://tempcse.nith.ac.in/reset-password} \
pm2 start src/index.js --name "tempcse-backend"

# Start frontend
cd "$ROOT_DIR/frontend"
NODE_ENV=production \
PORT=3000 \
pm2 start node_modules/next/dist/bin/next --name "tempcse-frontend" -- start -p 3000

cd "$ROOT_DIR"
pm2 save

echo "=================================================="
echo " Native Deployment Complete!"
echo "=================================================="
pm2 status
echo ""
echo "Backend running on:  http://127.0.0.1:3001"
echo "Frontend running on: http://127.0.0.1:3000"
echo ""
echo "Next step: Configure Nginx using deploy/host-nginx-tempcse.conf"
