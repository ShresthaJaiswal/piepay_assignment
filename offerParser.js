class OfferParser {
  /**
   * Extract offers from Flipkart API response
   * @param {Object} flipkartResponse - The complete Flipkart API response
   * @returns {Array} Array of parsed offers
   */
  parseOffers(flipkartResponse) {
    const offers = [];
    
    try {
      // Navigate to the offers section
      const paymentOptions = flipkartResponse.paymentOptions;
      
      if (!paymentOptions || !paymentOptions.items) {
        return offers;
      }

      // Find the OFFER_LIST item
      const offerListItem = paymentOptions.items.find(
        item => item.type === 'OFFER_LIST'
      );

      if (!offerListItem || !offerListItem.data || !offerListItem.data.offers) {
        return offers;
      }

      const offerList = offerListItem.data.offers.offerList;

      if (!Array.isArray(offerList)) {
        return offers;
      }

      // Parse each offer
      offerList.forEach(offer => {
        const parsedOffer = this.parseIndividualOffer(offer);
        if (parsedOffer) {
          offers.push(parsedOffer);
        }
      });

      // Also extract payment instruments information for Part 4
      const paymentInstruments = this.extractPaymentInstruments(paymentOptions.items);
      
      // Map offers to their applicable payment instruments
      offers.forEach(offer => {
        offer.paymentInstruments = this.determinePaymentInstruments(offer, paymentInstruments);
      });

    } catch (error) {
      console.error('Error parsing offers:', error);
    }

    return offers;
  }

  /**
   * Parse individual offer
   * @param {Object} offer - Single offer object from Flipkart response
   * @returns {Object} Parsed offer
   */
  parseIndividualOffer(offer) {
    try {
      const offerId = offer.offerDescription?.id;
      
      if (!offerId) {
        return null;
      }

      return {
        offerId: offerId,
        providers: offer.provider || [],
        logo: offer.logo || '',
        offerText: offer.offerText?.text || '',
        offerDescription: offer.offerDescription?.text || '',
        offerTerms: offer.offerDescription?.tncText || '',
        discountType: this.determineDiscountType(offer.offerText?.text),
        discountValue: this.extractDiscountValue(offer.offerText?.text, offer.offerDescription?.text),
        minAmount: this.extractMinAmount(offer.offerDescription?.text),
        maxDiscount: this.extractMaxDiscount(offer.offerDescription?.text),
        paymentInstruments: [] // Will be populated later
      };
    } catch (error) {
      console.error('Error parsing individual offer:', error);
      return null;
    }
  }

  /**
   * Determine discount type (PERCENTAGE, FLAT, CASHBACK)
   */
  determineDiscountType(offerText) {
    if (!offerText) return 'UNKNOWN';
    
    const text = offerText.toLowerCase();
    
    if (text.includes('%')) {
      return 'PERCENTAGE';
    } else if (text.includes('cashback')) {
      return 'CASHBACK';
    } else if (text.includes('₹')) {
      return 'FLAT';
    }
    
    return 'UNKNOWN';
  }

  /**
   * Extract discount value from offer text
   */
  extractDiscountValue(offerText, offerDescription) {
    const text = (offerText + ' ' + offerDescription).toLowerCase();
    
    // Try to extract percentage
    const percentageMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentageMatch) {
      return parseFloat(percentageMatch[1]);
    }
    
    // Try to extract rupee amount
    const rupeeMatch = text.match(/₹\s*(\d+(?:,\d+)?)/);
    if (rupeeMatch) {
      return parseFloat(rupeeMatch[1].replace(',', ''));
    }
    
    return 0;
  }

  /**
   * Extract minimum amount from offer description
   */
  extractMinAmount(description) {
    if (!description) return 0;
    
    const minMatch = description.match(/min(?:imum)?\s*(?:order)?\s*(?:value)?\s*₹?\s*(\d+(?:,\d+)?)/i);
    if (minMatch) {
      return parseFloat(minMatch[1].replace(',', ''));
    }
    
    return 0;
  }

  /**
   * Extract maximum discount from offer description
   */
  extractMaxDiscount(description) {
    if (!description) return null;
    
    const maxMatch = description.match(/(?:up\s*to|upto|max(?:imum)?)\s*₹\s*(\d+(?:,\d+)?)/i);
    if (maxMatch) {
      return parseFloat(maxMatch[1].replace(',', ''));
    }
    
    return null;
  }

  /**
   * Extract payment instruments from payment options (Part 4)
   */
  extractPaymentInstruments(items) {
    const instruments = [];
    
    items.forEach(item => {
      if (item.type === 'PAYMENT_OPTION' && item.data) {
        const instrumentType = item.data.instrumentType;
        if (instrumentType) {
          instruments.push({
            type: instrumentType,
            applicable: item.data.applicable,
            bankCodes: this.extractBankCodes(item.data)
          });
        }
      }
    });
    
    return instruments;
  }

  /**
   * Extract bank codes from payment option data
   */
  extractBankCodes(paymentData) {
    const bankCodes = [];
    
    if (paymentData.content && paymentData.content.options) {
      paymentData.content.options.forEach(option => {
        if (option.bankCode) {
          bankCodes.push(option.bankCode);
        }
      });
    }
    
    return bankCodes;
  }

  /**
   * Determine which payment instruments an offer is applicable for
   */
  determinePaymentInstruments(offer, paymentInstruments) {
    const applicableInstruments = [];
    
    // If offer has no providers (generic offer), it might apply to UPI
    if (!offer.providers || offer.providers.length === 0) {
      applicableInstruments.push('UPI_COLLECT');
      return applicableInstruments;
    }
    
    // Check if offer applies to credit/debit cards
    if (offer.providers.some(p => p.includes('BANK') || p.includes('CARD'))) {
      applicableInstruments.push('CREDIT');
    }
    
    // Check if EMI is available for this offer
    // (This is a simplified logic - in reality, it's more complex)
    const hasEMI = paymentInstruments.some(
      inst => inst.type === 'EMI_OPTIONS' && inst.applicable
    );
    if (hasEMI && offer.providers.some(p => p.includes('BANK'))) {
      applicableInstruments.push('EMI_OPTIONS');
    }
    
    return applicableInstruments;
  }
}

module.exports = new OfferParser();