const express = require('express');
const router = express.Router();
const offerController = require('../offerController');

// Create offers from Flipkart API response
router.post('/offer', offerController.createOffers);

// Get highest discount
router.get('/highest-discount', offerController.getHighestDiscount);

// Get all offers (for debugging/testing)
router.get('/offers', offerController.getAllOffers);

module.exports = router;