# 🔑 Environment Variable Reference - v1.0.0

This document defines all environment variables used by the Pangsha Blood Donors Association (PBDA) Management System.

---

## 📋 Standard Environment Variables

| Variable Name | Required | Default / Sample | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Runtime environment (`development` or `production`). |
| `PORT` | Optional | `3000` | HTTP port for Express server. |
| `JWT_SECRET` | **CRITICAL** | `pbda_pangsha_blood_donors_secret_key_2026` | Secret key used to sign and verify admin JWT auth tokens. Replace in production! |

---

## 📱 Telegram Integration Variables

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `TELEGRAM_BOT_TOKEN` | Optional | Bot token obtained from [@BotFather](https://t.me/BotFather). Required for automatic urgent request broadcasting. |
| `TELEGRAM_CHAT_ID` | Optional | Target Telegram Group/Channel ID (e.g. `-100123456789`) where broadcasts are published. |

---

## 💬 WhatsApp Service Variables

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `WHATSAPP_API_URL` | Optional | URL of external HTTP WhatsApp gateway if not using internal QR service. |
| `WHATSAPP_API_KEY` | Optional | API secret key for WhatsApp provider authorization. |

---

## 🗄️ Supabase PostgreSQL Variables

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `SUPABASE_URL` | Optional | Supabase Project URL (e.g. `https://xyzcompany.supabase.co`). |
| `SUPABASE_ANON_KEY` | Optional | Public anonymous API key for client/server querying. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | High-privilege service key for backend migrations and administrative bypass. |

---

## 🔒 Security Best Practices
1. **Never commit `.env` files** to version control. Maintain `.env.example` as a safe template.
2. Generate strong, random 256-bit keys for `JWT_SECRET` in production:
   ```bash
   openssl rand -hex 32
   ```
3. Rotate Telegram bot tokens and API keys periodically.
