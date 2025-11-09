// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const returnsRoutes = require('./routes/returns');
const uploadRoutes = require('./routes/upload');
const capitalGainsRoutes = require('./routes/capitalGains');
const assetsRoutes = require('./routes/assets');
const itrSelectionRoutes = require('./routes/itrSelection');
const UploadedDocument = require('./models/UploadedDocument');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleartax', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✓ MongoDB connected successfully');
})
.catch(err => {
  console.log('✗ MongoDB connection error:', err.message);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/capital-gains', capitalGainsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/itr-selection', itrSelectionRoutes);


// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ClearTax Clone API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      returns: '/api/returns',
      upload: '/api/upload',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API Documentation: http://localhost:${PORT}/api/health`);
});