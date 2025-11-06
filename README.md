# Flipkart Offers API - Backend Assignment

A Node.js backend service that detects offers from Flipkart's payment page and calculates the best discount for given payment details.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Testing Guide](#testing-guide)
- [Assumptions](#assumptions)
- [Design Choices](#design-choices)
- [Scaling Strategy](#scaling-strategy)
- [Future Improvements](#future-improvements)

---

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Navigate to project directory**
```bash
cd ~/Desktop/piepay_assignment
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

You should see:
```
Server is running on port 3000
Health check: http://localhost:3000/
Endpoints:
  POST http://localhost:3000/offer
  GET  http://localhost:3000/highest-discount
  GET  http://localhost:3000/offers
```

4. **Verify installation**

Open a new terminal and test:
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "message": "Flipkart Offers API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Project Structure
```
piepay_assignment/
├── server.js              # Express server setup
├── offerController.js     # Request handlers for all endpoints
├── offerParser.js         # Parses Flipkart API responses
├── discountCalculator.js  # Calculates discount amounts
├── database.js            # JSON file-based database operations
├── offers.json            # Auto-generated data storage
├── test-data.json         # Sample Flipkart API response
├── package.json           # Project configuration
└── node_modules/          # Dependencies
```

---

## API Endpoints

### 1. POST /offer (Part 2)
Create and store offers from Flipkart API response.

**Request:**
```bash
POST http://localhost:3000/offer
Content-Type: application/json

{
  "flipkartOfferApiResponse": {
    "paymentOptions": {
      "items": [...]
    }
  }
}
```

**Response:**
```json
{
  "noOfOffersIdentified": 5,
  "noOfNewOffersCreated": 3
}
```

### 2. GET /highest-discount (Part 3 & 4)
Calculate the highest discount for given payment details.

**Request:**
```bash
GET http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS

# With payment instrument (Part 4 - Bonus):
GET http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS&paymentInstrument=CREDIT
```

**Query Parameters:**
- `amountToPay` (required): Number - Amount to be paid
- `bankName` (required): String - Bank name (e.g., AXIS, SBI, HDFC)
- `paymentInstrument` (optional): String - Payment instrument (CREDIT, EMI_OPTIONS)

**Response:**
```json
{
  "highestDiscountAmount": 500
}
```

### 3. GET /offers (Debug endpoint)
Get all stored offers.

**Request:**
```bash
GET http://localhost:3000/offers
```

**Response:**
```json
{
  "count": 5,
  "offers": [...]
}
```

---

## Testing Guide

### Method 1: Using curl

**Step 1: Load test data**
```bash
curl -X POST http://localhost:3000/offer \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

**Step 2: Calculate discount**
```bash
# AXIS Bank
curl "http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS"
# Expected: {"highestDiscountAmount": 500}

# SBI Bank
curl "http://localhost:3000/highest-discount?amountToPay=10000&bankName=SBI"
# Expected: {"highestDiscountAmount": 500}

# With payment instrument
curl "http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS&paymentInstrument=CREDIT"
```

**Step 3: View all offers**
```bash
curl http://localhost:3000/offers
```

### Method 2: Using Postman

1. **Health Check**: GET `http://localhost:3000/`
2. **Create Offers**: POST `http://localhost:3000/offer` with body from `test-data.json`
3. **Test Discounts**: GET `http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS`

### Test Scenarios with Different amounts

```bash
# Small amount
curl "http://localhost:3000/highest-discount?amountToPay=1000&bankName=AXIS"
# Response: {"highestDiscountAmount": 50}

# Large amount (hits max cap)
curl "http://localhost:3000/highest-discount?amountToPay=20000&bankName=AXIS"
# Response: {"highestDiscountAmount": 1000}
```

---

## Assumptions

### 1. Offer Identification
- **Offer uniqueness**: Offers are uniquely identified by their `id` field from Flipkart's response (`offerDescription.id`)
- **Duplicate handling**: If an offer with the same ID already exists, it won't be inserted again

### 2. Bank Name Matching
- **Case-insensitive matching**: "AXIS", "axis", "Axis" all match the same bank
- **Partial matching**: "AXIS" matches "FLIPKARTAXISBANK" provider code
- **Generic offers**: Offers with empty `provider` array are treated as generic UPI offers

### 3. Discount Calculation Logic

- **Unknown Discount Type**: Best-effort calculation based on value range
  - If value < 100, treat as percentage
  - If value ≥ 100, treat as flat amount

**Constraints:**
- **Minimum amount**: If `amountToPay < minAmount`, discount = 0
- **Maximum discount**: If calculated discount > maxDiscount, cap at maxDiscount
- **Example**: 5% of ₹20,000 = ₹1,000, but capped at ₹750

### 4. Payment Instrument Mapping Logic

- Offers with **no providers** (empty array) → `UPI_COLLECT`
- Offers with **bank providers** (e.g., FLIPKARTAXISBANK) → `CREDIT`
- If EMI available in payment options and offer has bank → `EMI_OPTIONS`

### 5. API Response Structure
- **Consistency**: Flipkart's offer API response structure remains consistent with the provided sample
- **Field availability**: All required fields (`provider`, `offerText`, `offerDescription`) are present

### 6. Regex extraction
- Discount values, min/max amounts are extracted using regex patterns

---

## Design Choices

### 1. Technology Stack

**Framework: Express.js**
- **Why**: Lightweight, minimal boilerplate, perfect for RESTful APIs

**Database: JSON File Storage**
- **Why**: 
  - Zero setup time (no database installation)
  - Easy to inspect and debug
  - Sufficient for assignment/demo purposes
  - Simple read/write operations

**Language: JavaScript (Node.js)**
- **Why**: Async I/O, npm ecosystem, widely used for APIs

### 2. Architecture Pattern

**Layers:**
```
Request → Server → Controller → Services → Database → Response
```
1. **Server Layer** (`server.js`) - Express setup, middleware, route registration, error handling
2. **Controller Layer** (`offerController.js`) - HTTP request/response handling, input validation
3. **Service Layer** (`offerParser.js`, `discountCalculator.js`) - Business logic, data transformation
4. **Database Layer** (`database.js`) - Data persistence, CRUD operations, query methods

**Benefits:**
- **Separation of concerns**: Each layer has one responsibility
- **Testability**: Can test each layer independently
- **Maintainability**: Easy to modify one layer without affecting others
- **Scalability**: Can replace database without touching business logic

### 3. Offer Parsing Strategy

Extract structured data from Flipkart's nested JSON and text descriptions with regex patterns

```javascript
// Extract percentage: "Get 5% cashback" → 5
const percentageMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);

// Extract rupee amounts: "up to ₹750" → 750
const rupeeMatch = text.match(/₹\s*(\d+(?:,\d+)?)/);

// Extract min amount: "Min Order Value ₹199" → 199
const minMatch = description.match(/min(?:imum)?\s*(?:order)?\s*(?:value)?\s*₹?\s*(\d+)/i);
```

**Why regex?**
- ✅ Fast and efficient
- ✅ Handles variations ("up to", "upto", "max", "maximum")
- ✅ Case-insensitive
- ❌ May need updates if Flipkart changes text format

**Fallback logic:** If parsing fails, store raw data and use heuristics (value < 100 = percentage, else flat)

### 4. Database Schema Design

**Offer Object Structure:**
```javascript
{
  offerId: "FPO251103124654ZOVCB",     // Primary key
  providers: ["FLIPKARTAXISBANK"],      // Bank codes (array)
  logo: "/path/to/logo.svg",
  offerText: "Get 5% cashback",
  offerDescription: "Full terms...",
  offerTerms: "Terms and conditions",
  
  // Extracted/calculated fields
  discountType: "PERCENTAGE",           // PERCENTAGE | FLAT | CASHBACK
  discountValue: 5,                     // Numeric value
  minAmount: 0,                         // Minimum order value
  maxDiscount: 750,                     // Cap on discount
  paymentInstruments: ["CREDIT"]        // Applicable instruments
}
```

**Design decisions:**

**1. Denormalization (arrays instead of separate tables)**
```javascript
// We store:
"providers": ["FLIPKARTAXISBANK", "AXISBANK"]

// Instead of normalized SQL with separate tables
```

**2. Pre-calculated fields** for much faster discount calculations, no regex on every request
```javascript
// We extract and store:
"discountValue": 5,
"maxDiscount": 750

// Instead of parsing on every query
```

**3. Type classification** for direct conditional logic
```javascript
"discountType": "PERCENTAGE"  // Pre-determined
```

### 5. Discount Calculation Algorithm

**Flow:**
```
1. Check minimum amount requirement
   ├─ If amountToPay < minAmount → return 0
   └─ Else continue

2. Calculate base discount
   ├─ PERCENTAGE → (amountToPay × value) / 100
   ├─ FLAT/CASHBACK → fixed value
   └─ UNKNOWN → heuristic based on value

3. Apply maximum cap
   ├─ If discount > maxDiscount → return maxDiscount
   └─ Else return discount

4. Find highest among all offers
   └─ Loop through filtered offers, track maximum
```

### 6. API Design Decisions

**RESTful endpoints:**
- `POST /offer` - Create resources
- `GET /highest-discount` - Query with parameters
- `GET /offers` - List resources

**Query parameters for GET:**
```
/highest-discount?amountToPay=10000&bankName=AXIS
```

**Error handling:**
```javascript
// 400 Bad Request - Client errors
{ "error": "amountToPay is required" }

// 500 Internal Server Error - Server errors
{ "error": "Internal server error", "message": "..." }
```

### 7. Code Organization

**Flat structure (no src/ folder):**
- ✅ Simpler navigation
- ✅ Fewer import path issues
- ✅ Good for small projects
- ❌ Would reorganize for larger projects

---

## Scaling Strategy

### How to Handle 1,000 Requests Per Second for GET /highest-discount

Currently, a single Node.js instance can handle ~100 requests/second. Here's how to scale to 1,000+ req/s:

### 1. Database Layer Optimization

**Current bottleneck**: Reading JSON file on every request
**Solution**: Migrate to PostgreSQL with proper indexing, and use Connection Pooling

### 2. Caching Layer
Add caching (Redis) to store frequently calculated discounts

### 3. Horizontal Scaling
Deploy multiple Node.js instances using load balancer (Nginx/AWS ALB)

### 4. Use read replicas for DB reads

---

## Future Improvements

If I had more time, here's what I would enhance:

### 1. Comprehensive Testing
- Implement unit tests with Jest, integration tests for API endpoints, etc

### 2. Enhanced Offer Parsing
- Replace regex-based extraction with machine learning models (NLP) to handle complex offer variations and edge cases more accurately

### 3. Advanced Features
- Add user-specific offer eligibility, automated cron jobs, real-time updates via webhooks, and analytics dashboard for offer performance metrics

### 4. Security Enhancements
- Implement rate limiting (100 req/min), API key authentication, etc

### 6. Performance Optimizations
- Add GraphQL support for flexible queries, implement pagination for large datasets, and add circuit breakers for fault tolerance

### 7. UI Admin Dashboard
- Create a dashboard with Admin only access to view stored offers

---

## License

This project was created as part of a take-home assignment for PiePay.