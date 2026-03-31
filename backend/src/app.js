const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const greetingRoutes = require('./routes/greetings');
const messageLogsRoutes = require('./routes/messageLogs');


const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/greetings', greetingRoutes);
app.use('/api/message-logs', messageLogsRoutes);

module.exports = app;