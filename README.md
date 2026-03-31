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
4. Verify deployment health with `GET /health`.
