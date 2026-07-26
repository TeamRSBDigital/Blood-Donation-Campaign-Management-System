# ✈️ Telegram Bot Setup Guide - PBDA System

This guide explains how to set up and connect a Telegram Bot for automated urgent blood request broadcasts to PBDA volunteer group chats.

---

## 🛠️ Step-by-Step Setup

### Step 1: Create a Telegram Bot via @BotFather
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Start a chat and send `/newbot`.
3. Follow the prompts:
   * **Bot Name**: `PBDA Blood Request Bot`
   * **Bot Username**: `PBDABloodRequestBot` (must end in `bot`).
4. `@BotFather` will generate an HTTP API Token (e.g. `7123456789:AAFgX_example_token_hash`). **Save this token**.

---

### Step 2: Add Bot to the PBDA Volunteer Group Chat
1. Open your PBDA Volunteer Telegram Group.
2. Go to Group Info -> **Add Members**.
3. Search for your bot username (`@PBDABloodRequestBot`) and add it to the group.
4. Promote the bot to **Administrator** with **Post Messages** permissions.

---

### Step 3: Find Your Telegram Group Chat ID
1. Add the `@myidbot` or `@raw_data_bot` to your group chat temporarily, or send a test message in the group.
2. Access the following URL in your web browser (replace `<YOUR_BOT_TOKEN>`):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. Look for the `"chat"` object in the JSON response:
   ```json
   "chat": {
     "id": -1001234567890,
     "title": "PBDA Volunteers Group",
     "type": "supergroup"
   }
   ```
4. Copy the group Chat ID (including the leading `-` or `-100`).

---

### Step 4: Configure Environment Variables
Add the credentials to your production environment or `.env` file:
```env
TELEGRAM_BOT_TOKEN=7123456789:AAFgX_example_token_hash
TELEGRAM_CHAT_ID=-1001234567890
```

---

### Step 5: Test Telegram Broadcasts
1. Log in to the PBDA Admin Panel.
2. Go to **"কমিউনিকেশন সেটিংস"** (Communication Settings).
3. Click **"টেলিগ্রাম টেস্ট মেসেজ পাঠান"** (Send Telegram Test Message).
4. Verify that the test message arrives instantly in your volunteer Telegram group.

---

## 🔧 Troubleshooting Telegram Bot
- **Message not sending**: Ensure the bot is added as an administrator to the group chat.
- **`401 Unauthorized` error**: Check that `TELEGRAM_BOT_TOKEN` has no leading or trailing spaces.
- **`400 Bad Request: chat not found`**: Ensure `TELEGRAM_CHAT_ID` includes the negative sign (`-100...`).
