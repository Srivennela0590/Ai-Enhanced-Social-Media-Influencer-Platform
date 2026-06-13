# InfluenceAI — AI-Enhanced Social Media Influencer Marketing Platform

## Quick Start

### Flask Backend
```bash
cd Backend
pip install -r requirements.txt
python app.py
# Server runs at http://127.0.0.1:5000
```

### React Frontend
```bash
npm install
npm run dev
# App runs at http://localhost:5173
```

### ML Model Training (optional — auto-trains on first API call)
```bash
cd ML
pip install pandas scikit-learn joblib numpy
python train_model.py
# Generates: knn_model.pkl, scaler.pkl, encoders.pkl, evaluation_results.txt
```

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Brand | brand@demo.com | Demo1234! |
| Influencer | influencer@demo.com | Demo1234! |

---

## API Test Examples

### 1. Register a New User
```bash
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newbrand@test.com",
    "password": "Test1234!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "brand",
    "companyName": "TestCorp",
    "industry": "Technology"
  }'
```
Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "newbrand@test.com", "role": "brand", "firstName": "John", "lastName": "Doe" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 2. Login
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "brand@demo.com", "password": "Demo1234!"}'
```
Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "brand@demo.com", "role": "brand" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 3. List Brands
```bash
curl http://127.0.0.1:5000/api/brands
```
Response:
```json
{
  "success": true,
  "data": [
    { "id": "...", "companyName": "TechVibe Inc.", "industry": "Technology" }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1 }
}
```

### 4. Create Campaign (requires Brand JWT)
```bash
curl -X POST http://127.0.0.1:5000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Summer Launch 2025",
    "description": "Looking for tech influencers",
    "category": "Technology",
    "budget": 15000,
    "targetAudience": "18-34 tech enthusiasts",
    "requirements": "Min 10K followers",
    "startDate": "2025-06-01",
    "endDate": "2025-08-31",
    "status": "active",
    "platforms": ["Instagram", "YouTube"]
  }'
```
Response:
```json
{
  "success": true,
  "data": { "id": "...", "title": "Summer Launch 2025", "status": "active", "budget": 15000 }
}
```

### 5. ML Prediction
```bash
curl -X POST http://127.0.0.1:5000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{
    "influencer_category": "Fitness",
    "followers_count": 50000,
    "engagement_rate": 6.5,
    "campaign_category": "Fitness",
    "audience_match_score": 85,
    "previous_performance": 90
  }'
```
Response:
```json
{
  "success": true,
  "data": {
    "prediction": "Strong Match",
    "confidence": "92%",
    "matchScore": 87,
    "probabilities": { "Low Match": "1.2%", "Moderate Match": "6.5%", "Strong Match": "92.3%" }
  }
}
```

### 6. AI Caption Generation
```bash
curl -X POST http://127.0.0.1:5000/api/ai/caption \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "Instagram",
    "niche": "Technology",
    "topic": "AI Marketing Tools",
    "tone": "professional",
    "includeHashtags": true,
    "includeEmojis": true
  }'
```
Response:
```json
{
  "success": true,
  "data": {
    "caption": "Here's what most people get wrong about AI Marketing Tools...",
    "hashtags": ["#Technology", "#AIMarketingTools"],
    "characterCount": 285,
    "source": "template"
  }
}
```

### 7. AI Proposal Generation
```bash
curl -X POST http://127.0.0.1:5000/api/ai/proposal \
  -H "Content-Type: application/json" \
  -d '{
    "influencerName": "Alex Rivera",
    "influencerNiche": "Technology",
    "influencerFollowers": 125000,
    "campaignTitle": "Summer Product Launch",
    "campaignCategory": "Technology",
    "campaignDescription": "Showcase new AI gadget line",
    "proposedRate": 500
  }'
```
Response:
```json
{
  "success": true,
  "data": {
    "proposal": "I'm excited about \"Summer Product Launch\"...",
    "wordCount": 142,
    "source": "template"
  }
}
```

### 8. AI Outreach Generation
```bash
curl -X POST http://127.0.0.1:5000/api/ai/outreach \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "TechVibe Inc.",
    "influencerName": "Emma Wilson",
    "influencerNiche": "Fashion & Beauty",
    "influencerFollowers": 245000,
    "campaignTitle": "Summer Launch",
    "campaignGoal": "Increase brand awareness",
    "messageType": "initial"
  }'
```
Response:
```json
{
  "success": true,
  "data": {
    "subject": "Collaboration Opportunity: Summer Launch x Emma Wilson",
    "message": "Hi Emma Wilson, I'm reaching out from TechVibe Inc....",
    "wordCount": 98,
    "source": "template"
  }
}
```

---

## Environment Variables

Create `Backend/.env`:
```
SECRET_KEY=your-secret-key
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/influenceai
JWT_SECRET_KEY=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
```

## Database Setup
```bash
# Option 1: Auto-create (Flask-SQLAlchemy creates tables on startup)
cd Backend && python app.py

# Option 2: Manual SQL
mysql -u root -p < Backend/schema.sql
```

## ML Artifacts
| File | Description |
|------|-------------|
| `knn_model.pkl` | Trained KNN classifier |
| `scaler.pkl` | Fitted StandardScaler |
| `encoders.pkl` | Dict of fitted LabelEncoders |
| `evaluation_results.txt` | Accuracy, Precision, Recall, F1, Confusion Matrix |

## Project Structure
```
├── Backend/
│   ├── app.py                 # Flask entry point
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   ├── schema.sql             # MySQL schema (7 tables)
│   ├── models/                # SQLAlchemy models
│   │   ├── user.py, brand.py, influencer.py
│   │   ├── campaign.py, application.py
│   │   ├── invitation.py, collaboration.py
│   ├── routes/                # API blueprints
│   │   ├── auth.py            # /api/auth
│   │   ├── brands.py          # /api/brands (CRUD)
│   │   ├── campaigns.py       # /api/campaigns (CRUD)
│   │   ├── influencers.py     # /api/influencers (search, profile, upload)
│   │   ├── applications.py    # /api/applications
│   │   ├── invitations.py     # /api/invitations
│   │   ├── collaborations.py  # /api/collaborations
│   │   ├── ml.py              # /api/ml (predict, model-info)
│   │   └── ai.py              # /api/ai (caption, proposal, outreach)
│   ├── services/
│   │   ├── ml_service.py      # KNN prediction engine
│   │   └── ai_service.py      # Gemini AI + template fallback
│   ├── utils/seed.py          # Database seeder
│   ├── uploads/               # File uploads
│   └── ML/                    # Training pipeline + artifacts
├── Frontend/                  # Bootstrap HTML pages (9 pages)
├── src/                       # React SPA (18 pages)
├── ML/                        # Root ML pipeline
│   ├── influencer_campaign_dataset.csv (1000 rows)
│   ├── train_model.py
│   ├── train_knn_model.ipynb
│   ├── knn_model.pkl, scaler.pkl, encoders.pkl
│   └── evaluation_results.txt
└── README.md
```

## Tech Stack
- **Backend**: Flask, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-CORS
- **Database**: MySQL (7 tables, full schema with FKs, indexes, cascades)
- **ML**: scikit-learn KNN (93.5% accuracy), joblib serialization
- **AI**: Google Gemini 2.0 Flash + intelligent template fallback
- **Frontend**: React 19 + TypeScript + Tailwind / Bootstrap 5 HTML pages
