class DiscountCalculator {
  calculateDiscount(offer, amountToPay) {
    // Check if minimum amount requirement is met
    if (offer.minAmount && amountToPay < offer.minAmount) {
      return 0;
    }

    let discount = 0;

    switch (offer.discountType) {
      case 'PERCENTAGE':
        discount = (amountToPay * offer.discountValue) / 100;
        break;
      
      case 'FLAT':
      case 'CASHBACK':
        discount = offer.discountValue;
        break;
      
      default:
        // Try to calculate based on available info
        if (offer.discountValue > 0 && offer.discountValue < 100) {
          discount = (amountToPay * offer.discountValue) / 100;
        } else {
          discount = offer.discountValue;
        }
    }

    // Apply maximum discount cap if specified
    if (offer.maxDiscount && discount > offer.maxDiscount) {
      discount = offer.maxDiscount;
    }

    return Math.round(discount * 100) / 100; // Round to 2 decimal places
  }

  // Find the highest discount from a list of offers
  findHighestDiscount(offers, amountToPay) {
    let highestDiscount = 0;
    let bestOffer = null;

    offers.forEach(offer => {
      const discount = this.calculateDiscount(offer, amountToPay);
      
      if (discount > highestDiscount) {
        highestDiscount = discount;
        bestOffer = offer;
      }
    });

    return {
      highestDiscountAmount: highestDiscount,
      bestOffer: bestOffer
    };
  }
}

module.exports = new DiscountCalculator();