# Flipkart Offers API - Simple Flat Structure

## Setup (3 Steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Start server
```bash
npm start
```

You should see:
```
Server is running on port 3000
```

### 3. Test in Postman

**Health Check:**
```
GET http://localhost:3000/
```

**Create Offers:**
```
POST http://localhost:3000/offer
Body: (use content from test-data.json)
```

**Get Highest Discount:**
```
GET http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS
```

**View All Offers:**
```
GET http://localhost:3000/offers
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/offer` | Create offers (Part 2) |
| GET | `/highest-discount` | Calculate highest discount (Part 3 & 4) |
| GET | `/offers` | View all stored offers (debug) |

## File Structure

```
piepay_assignment/
├── server.js              # Main server
├── offerController.js     # Request handlers
├── offerParser.js         # Parse Flipkart data
├── discountCalculator.js  # Calculate discounts
├── database.js            # Database operations
├── offers.json            # Auto-generated data
├── test-data.json         # Sample test data
├── package.json
└── node_modules/
```

## Quick Test

```bash
# Terminal 1 - Start server
npm start

# Terminal 2 - Test
curl http://localhost:3000/

# Create offers
curl -X POST http://localhost:3000/offer \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Calculate discount
curl "http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS"
```

## Postman URLs

- Health: `http://localhost:3000/`
- Create: `http://localhost:3000/offer` (POST)
- Discount: `http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS` (GET)
- View All: `http://localhost:3000/offers` (GET)

---

**Simple and clean - no nested folders!** 🚀