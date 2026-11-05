# AgroVision AI — Full-Stack Crop & Growth Monitoring Platform

An intelligent agricultural monitoring platform built for farmers and growers, featuring deep learning plant growth stage detection, foliar disease identification, and weather-driven harvest milestone predictions.

---

## 📁 Project Structure

The project is cleanly split into independent **frontend** and **backend** folders:

```text
agrovision-ai/
├── frontend/                   # 100% Pure JavaScript React Frontend
│   ├── src/
│   │   ├── assets/images/      # Crop photos & visual assets
│   │   ├── components/         # Reusable farmer UI components
│   │   ├── context/            # React AuthContext & PlantContext
│   │   ├── pages/              # Overview, My Plants, Analysis, Disease, etc.
│   │   ├── services/           # Axios API services connected to backend
│   │   ├── App.jsx             # Main router
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind CSS styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                    # Node.js, Express & MongoDB Backend
│   ├── models/
│   │   ├── User.js             # Farmer authentication schema (bcrypt)
│   │   ├── Plant.js            # Monitored crops with 6 growth stages & GDD
│   │   └── DiseaseRecord.js    # Foliar pathology logs & treatment tracking
│   ├── routes/
│   │   ├── auth.js             # Register, login, profile (JWT)
│   │   ├── plants.js           # Full CRUD operations with multi-filter queries
│   │   ├── analysis.js         # AI growth stage detection (with Multer photo upload)
│   │   ├── disease.js          # Disease diagnosis & treatment prescription
│   │   └── weather.js          # Sensor telemetry & 7-day meteorological forecast
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── uploads/                # Local storage for uploaded crop photos
│   ├── server.js               # Express application with automatic MongoDB seeder
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── README.md
│
├── index.html                  # Root HTML entry point
├── vite.config.js              # Vite server & proxy configuration
└── package.json
```

---

## 🍃 MongoDB Configuration & Integration

The backend is pre-configured for MongoDB. You can add your actual MongoDB Atlas or local connection string in `backend/.env`:

```env
PORT=5000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/agrovision"
JWT_SECRET="agrovision_super_secret_jwt_key_2026"
```

### Automatic Seeding:
When your MongoDB database is connected for the first time, `backend/server.js` automatically seeds:
- Default farmer account (`ramesh.farmer@agrovision.in` / `farmer123`)
- Monitored crop records (Tomato, Chilli, Paddy) with growth stage and GDD metrics
- Sample disease records with organic and chemical treatment steps

*Note: If MongoDB is not yet running, the backend API runs gracefully and handles requests without crashing, allowing you to test the system immediately.*

---

## 🚀 Running the Project

### 1. Run the Backend (Node.js + Express + MongoDB)
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`.*

### 2. Run the Frontend (React JavaScript + Vite)
```bash
npm run dev
```
*Frontend runs on `http://localhost:3000` and automatically proxies `/api/*` requests to the backend.*
