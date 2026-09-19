# KisanOS AI — API Specification
**FastAPI REST Endpoints & Data Contracts**

---

## 1. Authentication & User Management (`/api/auth`, `/api/users`)

### `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "रामेश पटेल (Ramesh Patel)",
    "phone": "9876543210",
    "password": "Password123!",
    "language": "hi",
    "location": "सीहोर, मध्य प्रदेश (Sehore, MP)"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "usr_101",
      "name": "रामेश पटेल (Ramesh Patel)",
      "phone": "9876543210",
      "language": "hi",
      "location": "सीहोर, मध्य प्रदेश (Sehore, MP)",
      "created_at": "2026-09-19T06:00:00Z"
    }
  }
  ```

### `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "phone": "9876543210",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**: Returns JWT access token and user profile.

### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: Current user details.

---

## 2. Farm Management & Memory (`/api/farms`)

### `GET /api/farms`
- **Response `200 OK`**: List of farms owned by the logged-in user.

### `POST /api/farms`
- **Request Body**:
  ```json
  {
    "name": "उत्तर खेत (North Field A)",
    "location": "सीहोर, MP",
    "latitude": 23.2033,
    "longitude": 77.0844,
    "area_acres": 2.5,
    "soil_type": "Black Loamy (काली दोमट)",
    "soil_ph": 6.8,
    "irrigation_type": "Drip (ड्रिप सिंचाई)",
    "current_crop": "Wheat (गेहूं)",
    "current_stage": "Vegetative (वानस्पतिक वृद्धि)"
  }
  ```

### `GET /api/farms/{farm_id}`
- Returns farm details, current status, and attached telemetry.

### `PUT /api/farms/{farm_id}`
- Updates farm metadata, crop cycle, and soil parameters.

### `GET /api/farms/{farm_id}/history`
- Returns historical crop yields, seasons, inputs used, and revenues.

### `POST /api/farms/{farm_id}/history`
- **Request Body**:
  ```json
  {
    "crop_name": "Wheat (गेहूं - Sharbati)",
    "season": "Rabi 2025",
    "area": 2.0,
    "yield_quintal": 18.0,
    "selling_price": 41400.0,
    "inputs_used": "DAP 50kg, Urea 45kg, Bio-fertilizer",
    "notes": "Excellent harvest, good grain weight"
  }
  ```

---

## 3. Crop Monitoring & Observations (`/api/observations`)

### `GET /api/observations?farm_id={farm_id}`
- Lists all health observations, diagnostic history, and severity trends.

### `POST /api/observations`
- Records manual or camera-assisted observation with symptoms and images.

---

## 4. AI Farming Advisor & Vision Diagnostics (`/api/advisor`)

### `POST /api/advisor/chat`
- **Request Body**:
  ```json
  {
    "farm_id": "farm_01",
    "crop": "Wheat",
    "crop_stage": "Tillering",
    "question": "पत्तियों पर पीले धब्बे दिख रहे हैं और बढ़त धीमी है। क्या उपाय करें?",
    "image_url": null
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "summary": "गेहूं में पीला रतुआ (Yellow Rust) अथवा नाइट्रोजन की कमी के शुरुआती लक्षण।",
    "possible_issue": "Yellow Rust (Puccinia striiformis)",
    "confidence": 0.88,
    "severity": "medium",
    "general_guidance": [
      "खेत में अत्यधिक नमी न रहने दें।",
      "संक्रमित पत्तियों को एकत्र कर नष्ट करें।",
      "प्रोपीकोनाज़ोल (Propiconazole 25% EC) का छिड़काव 1ml प्रति लीटर पानी में करें।"
    ],
    "recommended_products": [
      { "name": "Tilt Propiconazole 25% EC", "dosage": "200 ml/acre", "purpose": "Fungicide" },
      { "name": "Nano Urea", "dosage": "4 ml/liter", "purpose": "Nitrogen Supplement" }
    ],
    "nearby_stores": [
      { "store_id": "st_01", "name": "किसान सेवा केंद्र सीहोर", "distance_km": 2.4, "in_stock": true }
    ],
    "warnings": [
      "अगले 48 घंटों में बारिश की संभावना पर छिड़काव रोक दें।"
    ],
    "sources": ["ICAR Wheat Advisory 2025", "Farm Memory Rabi 2024"]
  }
  ```

### `POST /api/advisor/analyze-image`
- **Form-Data**: `file: Binary Image (jpg/png)`, `farm_id: string`, `crop: string`
- Analyzes leaf symptoms using vision model / deterministic classifier and returns structured diagnosis + nearby store inventory matching.

---

## 5. Stores & Agriculture Inventory (`/api/stores`)

### `GET /api/stores/nearby?lat=23.20&lon=77.08&radius_km=15`
- Returns verified input retailers, seeds/fertilizers stock, distance, and contact.

### `GET /api/stores/{store_id}`
- Store details, directions, contact info.

### `GET /api/stores/{store_id}/inventory`
- Itemized inventory: product name, category (Seed, Fertilizer, Pesticide, Tool), quantity, unit, price (INR), and availability status.

---

## 6. Harvest Lots & Mandi Market Discovery (`/api/harvest`, `/api/markets`)

### `POST /api/harvest`
- **Request Body**:
  ```json
  {
    "farm_id": "farm_01",
    "crop": "Wheat (Sharbati)",
    "quantity_quintal": 22.5,
    "quality_grade": "Grade A (Sharbati Gold)",
    "location": "Sehore Mandi Yard",
    "moisture_percentage": 11.2
  }
  ```

### `GET /api/harvest` / `GET /api/harvest/{id}`
- Retrieve harvest lot status and linked buyer bids.

### `GET /api/markets?crop=Wheat&lat=23.20&lon=77.08`
- Returns verified Mandi rates, APMC trading benchmarks, active buyer listings, and distance.

---

## 7. Weather & Advisory Alerts (`/api/weather`, `/api/notifications`)

### `GET /api/weather?lat=23.20&lon=77.08`
- Current temperature, humidity, precipitation probability, wind speed, and 5-day farming advisory.

### `GET /api/notifications`
- Farmer alerts (Irrigation postponement, disease risk escalation, Mandi price surge).

### `PATCH /api/notifications/{id}/read`
- Mark alert as read.
