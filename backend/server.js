const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import database connection to initialize it
const db = require('./src/db');
const authRoutes = require('./src/routes/auth');
const greetingRoutes = require('./src/routes/greetings');
const messageLogsRoutes = require('./src/routes/messageLogs');
const whatsappRoutes = require('./src/routes/whatsapp');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/greetings', greetingRoutes);
app.use('/api/message-logs', messageLogsRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'WhatsApp Auto Greeting System API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;