const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import database connection to initialize it
const db = require('./src/db');
const authRoutes = require('./src/routes/auth');
const whatsappRoutes = require('./src/routes/whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
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