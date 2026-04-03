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

const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');
const getHostname = (value) => {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch (_) {
    return '';
  }
};

const parsedAllowedOrigins = CORS_ORIGIN === '*'
  ? '*'
  : CORS_ORIGIN
      .split(',')
      .map((origin) => normalizeOrigin(origin))
      .filter(Boolean);

const isOriginAllowed = (requestOrigin) => {
  if (parsedAllowedOrigins === '*') {
    return true;
  }

  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);
  const requestHostname = getHostname(normalizedRequestOrigin);

  return parsedAllowedOrigins.some((entry) => {
    if (entry === normalizedRequestOrigin) {
      return true;
    }

    if (requestHostname) {
      if (requestHostname === 'localhost' || requestHostname === '127.0.0.1') {
        return entry.includes('localhost') || entry.includes('127.0.0.1');
      }

      // Allow all Vercel preview and production subdomains by default.
      if (requestHostname.endsWith('.vercel.app')) {
        if (entry === '*' || entry.includes('vercel.app')) {
          return true;
        }
      }
    }

    // Support wildcard entries such as https://*.vercel.app
    if (entry.includes('*')) {
      const escaped = entry
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      const wildcardRegex = new RegExp(`^${escaped}$`, 'i');
      return wildcardRegex.test(normalizedRequestOrigin);
    }

    return false;
  });
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server and health-check requests without an Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

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