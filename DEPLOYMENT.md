# 🚀 Production Deployment Guide - v1.0.0

This guide details the steps to deploy the **Pangsha Blood Donors Association (PBDA)** Management System to production environments including Vercel, Docker/Cloud Run, and Supabase PostgreSQL.

---

## 🏗️ 1. Deployment Architecture Overview

```
[ Custom Domain: pbdabangladesh.org ]
               │
      ┌────────┴────────┐
      ▼                 ▼
[ HTTPS Edge ]    [ Security Headers ]
(Strict HSTS, CSP, XSS, CSRF, Nosniff)
               │
               ▼
   [ Express + Vite Server ] (Port 3000 / Port 8080)
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
[ In-Memory ] [Supabase] [Telegram]
[  Cache   ] [Postgres] [ Bot API]
```

---

## 📦 2. Production Build Verification

Before deploying, run a full production build test locally:

```bash
# 1. Validate TypeScript and Linting
npm run lint

# 2. Compile Production Bundle
npm run build

# 3. Test Production Server Launch
NODE_ENV=production npm run start
```

This compiles:
* Frontend static assets into `dist/`
* Backend server into `dist/server.cjs` via ESBuild

---

## 🌐 3. Deployment Options

### Option A: Vercel (Recommended for Serverless SPA + Node API)
1. Import repository into Vercel Dashboard.
2. Select **Framework Preset**: `Vite` or `Other`.
3. Set Build & Output Settings:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
4. Configure Environment Variables in Vercel Project Settings (see `ENVIRONMENT_VARIABLES.md`).
5. Deploy.

### Option B: Cloud Run / Docker Container
1. Create `Dockerfile` in root:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```
2. Build & push container image:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pbda-app:v1.0.0
gcloud run deploy pbda-app --image gcr.io/YOUR_PROJECT_ID/pbda-app:v1.0.0 --port 3000 --allow-unauthenticated
```

---

## 🔒 4. Security & Domain Configuration

### Custom Domain & SSL
* Add custom CNAME/A records pointing `pbdabangladesh.org` and `www.pbdabangladesh.org` to your host.
* Ensure automated SSL/TLS Certificate renewal is active.
* Enable 301 Permanent Redirect from `www.pbdabangladesh.org` -> `pbdabangladesh.org` (or vice versa).

### Enforced Security Headers
The built-in middleware enforces:
* `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
* `X-Frame-Options`: `SAMEORIGIN`
* `X-Content-Type-Options`: `nosniff`
* `X-XSS-Protection`: `1; mode=block`
* `Referrer-Policy`: `strict-origin-when-cross-origin`
* `Permissions-Policy`: `camera=(), microphone=(), geolocation=(self)`
* `Content-Security-Policy`: Standard default-src restrictions.

---

## 🗄️ 5. Supabase PostgreSQL Migration

1. Create a Supabase Project at [supabase.com](https://supabase.com).
2. Execute the migration scripts located in `/supabase/migrations/`:
   * `01_initial_schema.sql`
   * `02_indexes_and_rls.sql`
3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in production environment variables.

---

## 🩺 6. Post-Deployment Diagnostics
After deployment, run the health check endpoint:
```bash
curl -i https://your-domain.com/api/health
```
Expected output:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-26T10:00:00.000Z",
  "uptime": 120.45,
  "database": { "status": "operational", "donorCount": 420 },
  "cache": { "keys": 12 }
}
```
