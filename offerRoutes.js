const express = require('express');
const router = express.Router();
const offerController = require('../offerController');

// Part 2: Create offers from Flipkart API response
router.post('/offer', offerController.createOffers);

// Part 3 & 4: Get highest discount
router.get('/highest-discount', offerController.getHighestDiscount);

// Bonus: Get all offers (for debugging/testing)
router.get('/offers', offerController.getAllOffers);

module.exports = router;