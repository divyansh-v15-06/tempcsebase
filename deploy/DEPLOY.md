# CSE Department Website - Server Deployment Guide

This guide details the deployment of the CSE department website container stack to the server (NITH campus server / deployment box).

---

## ⚠️ Critical Server Constraints & Port Rules

1. **Reserved Ports (DO NOT USE)**:
   The server hosts multiple services (such as CMS, EO, development services, etc.). The following host ports **MUST NOT** be used by our stack:
   - ❌ `8080`
   - ❌ `5173`
   - ❌ `8000`
   - ❌ `8001`

2. **Published Host Port**:
   Our Docker Compose stack publishes on host port **`3000`** by default (or any non-colliding port configured via `PORT` in `.env`, e.g., `PORT=3050`).

3. **Preserve Existing Site Configurations**:
   Do **NOT** alter the Nginx configs for other sites (`eo`, `cms`, etc.). Only create/update the dedicated configuration block for `tempcse`.

---

## Architecture Overview

```
                        Client Browser
                              │
                    (HTTP 80 / HTTPS 443)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Host Nginx Server                      │
│   (/etc/nginx/sites-available/tempcse -> http://127.0.0.1:3000)│
└─────────────────────────────┬───────────────────────────────┘
                              │
                    (Host Port 3000 / $PORT)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Docker Compose Stack                        │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ Stack Nginx (Internal Reverse Proxy)                 │  │
│   │   ├── /         ──► Frontend Container (Next.js :3000)│  │
│   │   └── /backend/ ──► Backend Container (Node.js :3001) │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ MySQL 8 Database (Internal network only, port 3306) │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Deployment Instructions

### 1. Configure Host Nginx Reverse Proxy

On the server, add the site mapping for `tempcse.nith.ac.in` (and `tempcse`) without touching other sites' configs:

```bash
# 1. Copy the host Nginx configuration template into sites-available
sudo cp deploy/host-nginx-tempcse.conf /etc/nginx/sites-available/tempcse

# 2. Enable the site configuration
sudo ln -s /etc/nginx/sites-available/tempcse /etc/nginx/sites-enabled/tempcse

# 3. Verify Nginx configuration syntax (ensures no errors for any site)
sudo nginx -t

# 4. Reload Nginx gracefully
sudo systemctl reload nginx
```

> **Note**: If your server uses `/etc/nginx/conf.d/` instead of `sites-available/`, copy `deploy/host-nginx-tempcse.conf` directly into `/etc/nginx/conf.d/tempcse.conf` and reload Nginx.

---

### 2. Prepare Application Repository on Server

```bash
# Navigate to the web deployment directory
cd /var/www/html

# Create deployment directory if not already created
sudo mkdir -p cseWebsiteNew && sudo chown -R $USER:$USER cseWebsiteNew && cd cseWebsiteNew

# Clone the backend repository
git clone -b main https://github.com/divyansh-v15-06/tempcsebase.git .

# Clone the frontend repository into the frontend/ subfolder
git clone -b main https://github.com/divyansh-v15-06/cseFrontend.git frontend
```

---

### 3. Configure Production Secrets (`.env`)

Create your `.env` file from `.env.example`:

```bash
cp .env.example .env
nano .env
```

Ensure the following variables are filled in:
- `PORT=3000` *(Ensure it is NOT 8080, 5173, 8000, or 8001)*
- `MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)`
- `MYSQL_PASSWORD=$(openssl rand -hex 16)`
- `JWT_SECRET_KEY=$(openssl rand -hex 32)`
- `ADMIN_EMAIL=webmaster.cse@nith.ac.in`
- `ADMIN_EMAIL_PASSWORD=<Gmail App Password>`
- `RESET_LINK_BASE=https://tempcse.nith.ac.in/reset-password`

---

### 4. Deploy and Launch Docker Stack

Run the automated deployment script:

```bash
./deploy.sh
```

Or run manually via Docker Compose:

```bash
# Build and start all services in detached mode
docker compose up -d --build

# Monitor startup logs
docker compose logs -f mysql
```

---

### 5. Verification & Smoke Testing

Run quick smoke checks directly on the server:

```bash
# 1. Check container health status
docker compose ps

# 2. Check frontend response
curl -I http://127.0.0.1:3000/

# 3. Check backend API response
curl -s http://127.0.0.1:3000/backend/faculty/get | head -c 200

# 4. Check domain routing via host Nginx
curl -I http://tempcse.nith.ac.in/
```

Open `http://tempcse.nith.ac.in` in your browser. The new CSE Department platform should load seamlessly.

---

## Troubleshooting & Maintenance

- **Database Shell Access**:
  ```bash
  docker compose exec mysql mysql -u root -p cse_department
  ```

- **View Live Application Logs**:
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f nginx
  ```

- **Restarting Stack**:
  ```bash
  docker compose restart
  ```

- **Rebuilding after code updates**:
  ```bash
  git pull
  cd frontend && git pull && cd ..
  docker compose up -d --build
  ```
