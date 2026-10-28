const express = require('express');
const cors = require('cors');
const path = require('node:path');
const taskRoutes = require('./routes/taskRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', taskRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the frontend and its static assets from the same origin as the API.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;