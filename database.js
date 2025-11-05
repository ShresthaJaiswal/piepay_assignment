const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'offers.json');
    this.initDatabase();
  }

  initDatabase() {
    if (!fs.existsSync(this.dbPath)) {
      const initialData = {
        offers: []
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(initialData, null, 2));
    }
  }

  readData() {
    const data = fs.readFileSync(this.dbPath, 'utf8');
    return JSON.parse(data);
  }

  writeData(data) {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  // Get all offers
  getAllOffers() {
    const data = this.readData();
    return data.offers;
  }

  // Find offer by ID
  findOfferById(offerId) {
    const data = this.readData();
    return data.offers.find(offer => offer.offerId === offerId);
  }

  // Insert new offer
  insertOffer(offer) {
    const data = this.readData();
    data.offers.push(offer);
    this.writeData(data);
    return offer;
  }

  // Check if offer exists
  offerExists(offerId) {
    return this.findOfferById(offerId) !== undefined;
  }

  // Get offers by bank
  getOffersByBank(bankName) {
    const data = this.readData();
    return data.offers.filter(offer => {
      // Check if the offer's providers include the bank
      if (!offer.providers || offer.providers.length === 0) {
        // Generic offers (no specific bank)
        return false;
      }
      return offer.providers.some(provider => 
        provider.toUpperCase().includes(bankName.toUpperCase())
      );
    });
  }

  // Get offers by bank and payment instrument (Part 4)
  getOffersByBankAndInstrument(bankName, paymentInstrument) {
    const data = this.readData();
    return data.offers.filter(offer => {
      // Check bank match
      const bankMatch = offer.providers && offer.providers.some(provider => 
        provider.toUpperCase().includes(bankName.toUpperCase())
      );

      // Check payment instrument match
      const instrumentMatch = offer.paymentInstruments && 
        offer.paymentInstruments.includes(paymentInstrument);

      return bankMatch && instrumentMatch;
    });
  }

  // Clear all offers (useful for testing)
  clearAllOffers() {
    const data = { offers: [] };
    this.writeData(data);
  }
}

module.exports = new Database();