const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection to initialize it
const db = require('./src/db');

const authRoutes = require('./src/routes/auth');
const greetingRoutes = require('./src/routes/greetings');
const messageLogsRoutes = require('./src/routes/messageLogs');
const whatsappRoutes = require('./src/routes/whatsapp');

const app = express();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const allowedOrigins = CORS_ORIGIN === '*'
  ? '*'
  : CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server and health-check requests without an Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/greetings', greetingRoutes);
app.use('/api/message-logs', messageLogsRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'WhatsApp Auto Greeting System API is running',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const startServer = () => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('Database connection failed:', err.message);
      process.exit(1);
      return;
    }

    console.log('Database connected successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
};

startServer();

module.exports = app;