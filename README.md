# whatsapp-auto-greeting-system
The WhatsApp Automated Greeting System is a full-stack web application designed to automate initial greeting responses to incoming WhatsApp messages. The system reduces manual effort and improves response efficiency by automatically detecting new messages and sending predefined greetings.

## Backend deployment on Railway

1. Deploy this repository to Railway as a Node.js service.
2. Ensure Railway uses the root start command: `npm start`.
3. Add backend environment variables in Railway from `backend/.env.example`:
	- `PORT` (Railway injects this automatically)
	- `DB_HOST`
	- `DB_PORT`
	- `DB_USER`
	- `DB_PASSWORD`
	- `DB_NAME`
	- `JWT_SECRET`
	- `CORS_ORIGIN` (your frontend URL)
	- `DB_CONNECTION_LIMIT` (optional)
4. For WhatsApp QR on Railway, keep `nixpacks.toml` in the Railway service root. If your Railway service root is `backend/`, use `backend/nixpacks.toml`; if your service root is repository root, use `/nixpacks.toml`. It installs required Chromium shared libraries (for Puppeteer) to avoid startup errors like `libglib-2.0.so.0` missing.
5. Optional: set `PUPPETEER_EXECUTABLE_PATH` if you want to force a custom Chromium binary path.
6. Verify deployment health with `GET /health`.
