const express = require('express');
const offerController = require('./offerController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes (no /api prefix, directly on root)
app.post('/offer', offerController.createOffers);
app.get('/highest-discount', offerController.getHighestDiscount);
app.get('/offers', offerController.getAllOffers);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Flipkart Offers API',
    version: '1.0.0',
    endpoints: {
      'POST /offer': 'Create offers from Flipkart API response',
      'GET /highest-discount': 'Get highest discount amount',
      'GET /offers': 'Get all stored offers (debug)'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Endpoints:`);
  console.log(`  POST http://localhost:${PORT}/offer`);
  console.log(`  GET  http://localhost:${PORT}/highest-discount`);
  console.log(`  GET  http://localhost:${PORT}/offers`);
});

module.exports = app;