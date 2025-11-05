# 🚀 Quick Postman Reference

## Step 1: Start Server
```bash
cd ~/Desktop/piepay_assignment
npm install
npm start
```

## Step 2: Postman Requests

### 1️⃣ Health Check
```
Method: GET
URL: http://localhost:3000/
```

### 2️⃣ Create Offers (Part 2)
```
Method: POST
URL: http://localhost:3000/offer
Headers: Content-Type: application/json
Body: Copy entire content from test-data.json
```

Expected Response:
```json
{
  "noOfOffersIdentified": 5,
  "noOfNewOffersCreated": 5
}
```

### 3️⃣ View All Offers (Debug)
```
Method: GET
URL: http://localhost:3000/offers
```

### 4️⃣ Calculate Highest Discount - AXIS (Part 3)
```
Method: GET
URL: http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS
```

Expected Response:
```json
{
  "highestDiscountAmount": 500
}
```

### 5️⃣ Calculate Highest Discount - SBI (Part 3)
```
Method: GET
URL: http://localhost:3000/highest-discount?amountToPay=10000&bankName=SBI
```

### 6️⃣ With Payment Instrument (Part 4 - Bonus)
```
Method: GET
URL: http://localhost:3000/highest-discount?amountToPay=10000&bankName=AXIS&paymentInstrument=CREDIT
```

## Test Different Amounts

```
Small amount:  ?amountToPay=1000&bankName=AXIS
→ Response: 50 (5% of 1000)

Medium amount: ?amountToPay=10000&bankName=AXIS
→ Response: 500 (5% of 10000)

Large amount:  ?amountToPay=20000&bankName=AXIS
→ Response: 750 (capped at max discount)
```

## Common Errors

❌ **ECONNREFUSED** → Server not running, run `npm start`
❌ **404 Not Found** → Check URL spelling
❌ **400 Bad Request** → Missing required parameters

---

✅ All endpoints work without `/api/` prefix!