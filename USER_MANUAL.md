# WhatsApp Auto Greeting System - User Manual

## 1. Introduction

The WhatsApp Auto Greeting System helps you automatically respond to incoming WhatsApp messages using predefined greeting rules.

You can:
- Connect your WhatsApp account by scanning a QR code.
- Create multiple greeting rules with keywords.
- Enable or disable greeting rules anytime.
- View incoming and auto-replied message history.
- Reset WhatsApp session if reconnection is needed.

---

## 2. System Requirements

Before using the system, ensure you have:
- Node.js 20.x
- npm
- MySQL database (local or hosted)
- Internet access on both your computer and phone
- Active WhatsApp account on mobile

Recommended browser:
- Latest Chrome, Edge, or Firefox

---

## 3. Initial Setup (First Time Only)

### 3.1 Clone and install dependencies

From project root:

```bash
npm install
cd frontend
npm install
```

### 3.2 Create database

1. Create a MySQL database.
2. Run SQL setup scripts from:
- `backend/src/config/database.sql`
- `backend/src/config/migrate.sql`

### 3.3 Configure backend environment variables

Create a file named `.env` inside `backend/` and add:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=whatsapp_greeting
JWT_SECRET=replace_with_secure_secret
CORS_ORIGIN=http://localhost:3000
DB_CONNECTION_LIMIT=10
```

Notes:
- Use your deployed frontend URL in `CORS_ORIGIN` for production.
- Keep `JWT_SECRET` private.

### 3.4 Configure frontend API base URL

Create `.env` inside `frontend/` and add:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 3.5 Start application

Option A (start backend from root):

```bash
npm start
```

Option B (development backend with auto-reload):

```bash
npm run dev
```

Start frontend (new terminal):

```bash
cd frontend
npm start
```

Open:
- Frontend: http://localhost:3000
- Backend health check: http://localhost:5000/health

---

## 4. Login and Account Management

### 4.1 Register

On the login screen, switch to sign-up mode and provide:
- Username
- Email
- Phone
- Password

After successful registration, you are signed in automatically.

### 4.2 Login

Enter:
- Email
- Password

On success, you are redirected to Dashboard.

### 4.3 Forgot Password

Use the "Forgot password" action on the login page:
1. Enter your account email.
2. Request reset token.
3. Enter token + new password.
4. Submit to reset password.

Important:
- Reset token expires in about 15 minutes.
- New password must be at least 6 characters.

---

## 5. Dashboard Overview

After login, the sidebar includes:
- Dashboard (WhatsApp connection)
- Messages
- Greeting Messages
- Settings
- Logout

Top bar shows:
- WhatsApp connection status: Connected, Connecting, or Disconnected
- Notifications for newly received messages

---

## 6. Connect WhatsApp (QR)

Go to Dashboard.

### Steps
1. Open WhatsApp on your phone.
2. Open Linked Devices.
3. Tap Link a Device.
4. Scan the QR code shown in the dashboard.

### Status meanings
- Connected: account linked and active.
- Connecting: system is initializing/restoring session.
- Not Connected: waiting for QR scan.

### Reconnect / Reset session
- Use "Logout from WhatsApp" on Dashboard.
- The system clears session and generates a new QR code.

Best practice:
- Keep your phone online so WhatsApp Web remains synced.

---

## 7. Manage Greeting Messages

Go to Greeting Messages page.

### 7.1 Create greeting

Click Add New and fill:
- Title
- Auto-reply message
- Trigger keywords

Keyword entry tips:
- Press Enter or comma to add each keyword.
- Keywords are normalized to lowercase.
- Duplicate keywords under the same user are not allowed.

### 7.2 Enable/Disable greeting

Use the toggle on each greeting card.

### 7.3 Edit greeting

Click Edit, update fields, then save.

### 7.4 Delete greeting

Click Delete to remove a rule permanently.

How matching works:
- Auto-reply triggers when incoming message text exactly matches one active keyword.

---

## 8. Message Logs

Go to Messages page to view conversation activity.

### What is shown
- Sender name/number
- Incoming message
- Auto-reply content
- Relative time
- Status (Auto-Replied or Pending)

### Filters
- All Messages
- Auto-Replied
- Pending
- Online

### Search
Use the search box for:
- Contact name
- Phone number
- Message text

Note:
- Logs are refreshed automatically.
- Only recent records are shown in API responses (up to 500).

---

## 9. Settings Page

The Settings page contains Profile, Password, and General tabs.

Current behavior:
- Fields and controls are available in UI.
- Save actions currently provide local confirmation in the interface.
- They do not persist to backend storage yet.

---

## 10. Logout

Use Logout in the sidebar to end your web session.

What happens:
- Auth token is removed from browser storage.
- You are returned to the login page.

---

## 11. Troubleshooting

### QR code does not appear
- Ensure backend is running.
- Check frontend `REACT_APP_API_BASE_URL`.
- Open backend health URL and confirm status is healthy.
- Try "Refresh" on QR card.

### Cannot connect to WhatsApp
- Confirm phone has internet access.
- Keep WhatsApp app active during scanning.
- Use "Logout from WhatsApp" and scan new QR.

### API/CORS errors in browser
- Verify backend `CORS_ORIGIN` includes your frontend URL.
- Restart backend after environment changes.

### Login fails with token/session issues
- Clear browser session/local storage for this app and login again.

### No auto-reply sent
- Ensure at least one greeting is enabled.
- Verify incoming text exactly matches a keyword.
- Check Messages page for pending entries.

### Database connection errors
- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Ensure MySQL service is running and accessible.

---

## 12. Deployment Notes (Railway)

For backend deployment:
- Use project root start command: `npm start`
- Set required backend environment variables.
- Keep `nixpacks.toml` in correct service root for Puppeteer dependencies.
- Verify deployed health endpoint with `/health`.

---

## 13. Quick Start Checklist

1. Install dependencies.
2. Configure backend and frontend env files.
3. Create and migrate database tables.
4. Start backend and frontend.
5. Register/login.
6. Connect WhatsApp via QR.
7. Create greeting rules.
8. Test by sending matching keyword from another WhatsApp number.

---

## 14. Support Information

When reporting issues, include:
- Screenshot of the page showing error
- Browser console error (if any)
- Backend log snippet
- Time when issue occurred
- Steps to reproduce
