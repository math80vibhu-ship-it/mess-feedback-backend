require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const connectDB = require('./config/db');

const menuRoutes = require('./routes/menuRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

const INSTANCE_ID = process.env.INSTANCE_ID || os.hostname();

// Middleware
app.use(cors());
app.use(express.json());

// Track serving backend instance & log request distribution
app.use((req, res, next) => {
  res.setHeader('X-Served-By', INSTANCE_ID);
  console.log(`[${INSTANCE_ID}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static frontend files (index.html, style.css, app.js)
app.use(express.static(__dirname));

// Health & Instance Distribution API route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Mess Feedback API is running',
    instanceId: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend [${INSTANCE_ID}] running on port ${PORT}`);
});
