require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const menuRoutes = require('./routes/menuRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, style.css, app.js)
app.use(express.static(__dirname));

// Health check API route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Mess Feedback API is running' });
});

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/feedback', feedbackRoutes);

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
  console.log(`Server running on port ${PORT}`);
});
