# MG Car Recommendation Engine

## Project Structure

```
mg-recommendation/
├── src/
│   ├── app.js                          # Express entry point
│   ├── config/
│   │   ├── db.js                       # MySQL connection pool
│   │   └── constants.js                # Score columns, priority map, budget bands
│   ├── controllers/
│   │   ├── recommendation.controller.js
│   │   └── variant.controller.js
│   ├── services/
│   │   ├── recommendation.service.js   # Core recommendation logic (Lambda-ready)
│   │   └── variant.service.js          # DB queries for variants
│   ├── routes/
│   │   ├── recommendation.routes.js
│   │   └── variant.routes.js
│   └── middleware/
│       ├── asyncWrap.js
│       └── errorHandler.js
├── sql/
│   ├── 01_schema.sql                   # Table DDL
│   └── 02_seed.sql                     # All variant data (parsed from brochures)
├── lambda.handler.js                   # AWS Lambda drop-in
├── .env.example
└── package.json
```

## Setup

```bash
cp .env.example .env
# Edit .env with your MySQL credentials

npm install

# Create DB and tables
mysql -u root -p < sql/01_schema.sql
mysql -u root -p mg_recommendation < sql/02_seed.sql

npm run dev   # or npm start
```

---

## API Reference

### POST /api/recommend
Returns top N car recommendations based on user preferences.

**Request Body:**
```json
{
  "budget":     1800000,
  "fuel_type":  "EV",
  "min_seater": 5,
  "priorities": ["safety", "tech", "comfort"],
  "top_n":      3
}
```

| Field        | Type     | Required | Notes                                      |
|--------------|----------|----------|--------------------------------------------|
| `budget`     | number   | ✅       | Max price in INR (e.g. 1500000 = ₹15L)   |
| `fuel_type`  | string   | ❌       | `"Petrol"` \| `"EV"` \| `"any"`           |
| `min_seater` | number   | ❌       | Minimum seat count (e.g. 5, 7)            |
| `priorities` | string[] | ❌       | Ordered list — first = highest weight     |
| `top_n`      | number   | ❌       | Results to return (default: 3)            |

**Valid priority keys:**
`city`, `highway`, `family`, `business`, `mileage`, `adas`, `comfort`,
`performance`, `large_screen`, `safety`, `premium`, `offroad`, `tech`, `eco`, `value`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "payload": [
    {
      "rank": 1,
      "match_percent": 96,
      "model_sales_code": "WIN-ESSENCEPRO-529",
      "model_name": "MG Windsor EV",
      "variant_name": "Essence Pro 52.9kWh",
      "fuel_type": "EV",
      "seater": 5,
      "ex_showroom_price": 1859900,
      "price_display": "₹18.60L",
      "tagline": "Flagship Windsor — the complete EV package",
      "car_image_url": null,
      "card_tags": ["ADAS Level 2", "449km Range", "V2L/V2V"],
      "stats": {
        "range":    { "label": "RANGE",    "value": "449 KM" },
        "charging": { "label": "CHARGING", "value": "Fast" },
        "ai":       { "label": "AI",       "value": "Voice+" }
      },
      "score": 9.2
    }
  ]
}
```

---

### PATCH /api/admin/variants/images
Insert or update car image URLs (single or bulk).

**Single:**
```json
{
  "model_sales_code": "WIN-ESSENCEPRO-529",
  "image_url": "https://cdn.mgmotor.co.in/windsor-ev.png"
}
```

**Bulk:**
```json
[
  { "model_sales_code": "WIN-ESSENCEPRO-529", "image_url": "https://..." },
  { "model_sales_code": "HEC-SAVVYPRO-5-CVT", "image_url": "https://..." }
]
```

### GET /api/admin/variants
List all variants (code, name, price, image_url).

### GET /api/admin/variants/:code
Full row for one variant.

---

## Scoring Criteria (1–10)

| Score          | Criteria used                                                             |
|----------------|---------------------------------------------------------------------------|
| `score_city`   | Compact size, EV type (+3), tight turning, low running cost               |
| `score_highway`| Power PS, torque, cruise control, ADAS, tank/range size                  |
| `score_family` | Seater count, boot space, airbags, sunroof, split seats                  |
| `score_business`| Leather interior, large screen, connected car, wireless charger          |
| `score_mileage`| ARAI kmpl for petrol; EV range/kWh ratio for EVs                         |
| `score_adas`   | Number of ADAS features (Level 2 full suite = 9–10)                      |
| `score_comfort`| Ventilated seats, sunroof/glass roof, wireless charger, auto AC          |
| `score_performance`| Power PS + torque Nm indexed; CVT/AT preferred over MT               |
| `score_large_screen`| 10.1"=5, 14"=8, 15.6"=9–10                                         |
| `score_safety` | Airbag count, ESC, ADAS, disc brakes, TPMS, 360 camera                  |
| `score_premium`| Leather seats, ambient lighting, premium audio, powered tailgate         |
| `score_offroad`| Ground clearance >200mm (+2), AWD (+3); all MG cars here are FWD        |
| `score_tech`   | i-SMART, digital key, OTA updates, connected features count              |
| `score_eco`    | EV = 10; Petrol turbo (low displacement) = 5                             |
| `score_value`  | Features per lakh rupee — base/mid variants score higher                 |

## Lambda Usage

```javascript
const { handler } = require('./lambda.handler');

// Direct invocation (no HTTP)
const result = await handler({
  budget:     1500000,
  fuel_type:  'EV',
  priorities: ['eco', 'tech', 'value'],
});
```

## Variant Codes Reference

| Code                  | Model          | Variant              | Price      |
|-----------------------|----------------|----------------------|------------|
| HEC-STYLE-5-MT        | MG Hector      | Style 5S MT          | ₹11.99L    |
| HEC-SELECTPRO-5-MT    | MG Hector      | Select Pro 5S MT     | ₹14.29L    |
| HEC-SMARTPRO-5-MT     | MG Hector      | Smart Pro 5S MT      | ₹15.29L    |
| HEC-SMARTPRO-5-CVT    | MG Hector      | Smart Pro 5S CVT     | ₹16.59L    |
| HEC-SHARPPRO-5-MT     | MG Hector      | Sharp Pro 5S MT      | ₹16.99L    |
| HEC-SHARPPRO-5-CVT    | MG Hector      | Sharp Pro 5S CVT     | ₹18.29L    |
| HEC-SAVVYPRO-5-CVT    | MG Hector      | Savvy Pro 5S CVT     | ₹19.19L    |
| HEC-SHARPPRO-7-MT     | MG Hector      | Sharp Pro 7S MT      | ₹17.49L    |
| HEC-SHARPPRO-7-CVT    | MG Hector      | Sharp Pro 7S CVT     | ₹18.79L    |
| HEC-SAVVYPRO-7-CVT    | MG Hector      | Savvy Pro 7S CVT     | ₹19.69L    |
| WIN-EXCITE-38         | MG Windsor EV  | Excite 38kWh         | ₹14.10L    |
| WIN-EXCLUSIVE-38      | MG Windsor EV  | Exclusive 38kWh      | ₹15.53L    |
| WIN-ESSENCE-38        | MG Windsor EV  | Essence 38kWh        | ₹16.53L    |
| WIN-EXCLUSIVEPRO-529  | MG Windsor EV  | Exclusive Pro 52.9kWh| ₹17.38L    |
| WIN-ESSENCEPRO-529    | MG Windsor EV  | Essence Pro 52.9kWh  | ₹18.60L    |
| COM-EXECUTIVE         | MG Comet EV    | Executive            | ₹7.63L     |
| COM-EXCITE            | MG Comet EV    | Excite               | ₹8.73L     |
| COM-EXCITE-FC         | MG Comet EV    | Excite FC            | ₹9.00L     |
| COM-EXCLUSIVE         | MG Comet EV    | Exclusive            | ₹9.73L     |
| COM-EXCLUSIVE-FC      | MG Comet EV    | Exclusive FC         | ₹10.00L    |
| COM-BLACKSTORM        | MG Comet EV    | Blackstorm Edition   | ₹10.00L    |
