require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const menuRoutes = require('./routes/menuRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route (useful to confirm deployment worked)
app.get('/', (req, res) => {
  res.json({ message: 'Mess Feedback API is running' });
});

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
