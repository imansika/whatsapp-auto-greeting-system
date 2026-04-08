# Setup Guide (Windows)


## 1. Prerequisites

Install the following first:

- Git (for cloning from GitHub)
- Node.js 20.x (required by project engines)
- npm (comes with Node.js)
- MySQL 8.x (or compatible MySQL server)
- Google Chrome (recommended for WhatsApp Web QR flow)

Optional (for forgot-password email tests):

- SMTP credentials (Gmail app password or any SMTP server)

## 2. Clone and open project

1. Open PowerShell.
2. Run the commands below 

```powershell
git clone https://github.com/imansika/whatsapp-auto-greeting-system
cd whatsapp-auto-greeting-system
```

3. Confirm you are at the project root (folder containing `package.json`).

## 3. Install dependencies

Install backend/root dependencies:

```powershell
npm install
```

Install frontend dependencies:

```powershell
cd frontend
npm install
cd ..
```

## 4. Configure backend environment

1. Go to backend folder.
2. Create `.env` from `.env.example`.
3. Update values for your machine.

```powershell
cd backend
Copy-Item .env.example .env
```

Required variables:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `CORS_ORIGIN`

Optional variables:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (needed only for forgot-password email testing)


## 5. Create database and tables

In MySQL, run the script below:

```sql
CREATE DATABASE IF NOT EXISTS whatsapp_greeting
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE whatsapp_greeting;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS greeting_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Greeting Message',
  trigger_keyword VARCHAR(255) NOT NULL,
  reply_message TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_trigger_keyword (user_id, trigger_keyword)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS message_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  sender_number VARCHAR(20) DEFAULT NULL,
  sender_name VARCHAR(255) DEFAULT NULL,
  message_text TEXT,
  direction ENUM('incoming', 'outgoing') DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  whatsapp_number VARCHAR(20) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'disconnected',
  session_data TEXT,
  last_connected TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_session (user_id),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY uk_token_hash (token_hash),
  INDEX idx_reset_user (user_id),
  INDEX idx_reset_expiry (expires_at)
) ENGINE=InnoDB;
```

If you changed DB name in `.env`, adjust `CREATE DATABASE`/`USE` accordingly.

## 6. Start backend and frontend

Open two terminals:

Terminal A (project root):

```powershell
npm run dev
```

Backend expected URL:

- `http://localhost:5000/health` returns `{ "status": "healthy" }`

Terminal B:

```powershell
cd frontend
npm start
```

Frontend expected URL:

- `http://localhost:3000`


## 7. Common issues

### Backend exits on startup with DB error

- Confirm MySQL is running.
- Confirm `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`.
- Confirm schema/tables are created.

### CORS error in browser

- Ensure `CORS_ORIGIN` includes frontend URL (`http://localhost:3000`).
- Restart backend after changing `.env`.


### Forgot password fails

- SMTP must be configured correctly.
- For Gmail, use an App Password (not normal account password).
