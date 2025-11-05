const offerParser = require('./offerParser');
const discountCalculator = require('./discountCalculator');
const database = require('./database');

class OfferController {
  /**
   * POST /offer
   * Create offers from Flipkart API response
   */
  async createOffers(req, res) {
    try {
      const { flipkartOfferApiResponse } = req.body;

      if (!flipkartOfferApiResponse) {
        return res.status(400).json({
          error: 'flipkartOfferApiResponse is required'
        });
      }

      // Parse offers from the response
      const parsedOffers = offerParser.parseOffers(flipkartOfferApiResponse);
      
      let noOfOffersIdentified = parsedOffers.length;
      let noOfNewOffersCreated = 0;

      // Insert offers into database (skip duplicates)
      parsedOffers.forEach(offer => {
        if (!database.offerExists(offer.offerId)) {
          database.insertOffer(offer);
          noOfNewOffersCreated++;
        }
      });

      res.status(200).json({
        noOfOffersIdentified,
        noOfNewOffersCreated
      });

    } catch (error) {
      console.error('Error creating offers:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * GET /highest-discount
   * Calculate highest discount for given payment details
   */
  async getHighestDiscount(req, res) {
    try {
      const { amountToPay, bankName, paymentInstrument } = req.query;

      // Validate required parameters
      if (!amountToPay) {
        return res.status(400).json({
          error: 'amountToPay is required'
        });
      }

      if (!bankName) {
        return res.status(400).json({
          error: 'bankName is required'
        });
      }

      const amount = parseFloat(amountToPay);
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          error: 'amountToPay must be a positive number'
        });
      }

      // Get offers based on bank and optionally payment instrument (Part 4)
      let offers;
      if (paymentInstrument) {
        // Part 4: Filter by both bank and payment instrument
        offers = database.getOffersByBankAndInstrument(bankName, paymentInstrument);
      } else {
        // Part 3: Filter by bank only
        offers = database.getOffersByBank(bankName);
      }

      if (offers.length === 0) {
        return res.status(200).json({
          highestDiscountAmount: 0,
          message: 'No offers found for the given criteria'
        });
      }

      // Calculate highest discount
      const result = discountCalculator.findHighestDiscount(offers, amount);

      res.status(200).json({
        highestDiscountAmount: result.highestDiscountAmount
      });

    } catch (error) {
      console.error('Error calculating highest discount:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * GET /offers (Bonus endpoint for debugging)
   * Get all stored offers
   */
  async getAllOffers(req, res) {
    try {
      const offers = database.getAllOffers();
      
      res.status(200).json({
        count: offers.length,
        offers
      });
    } catch (error) {
      console.error('Error getting offers:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

module.exports = new OfferController();