# AgroVision AI — Node.js & Express Backend with MongoDB

This folder contains the complete, production-ready backend service for **AgroVision AI**, built using **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 📁 Architecture Overview

```text
backend/
├── models/
│   ├── User.js            # Farmer authentication & profile schema
│   ├── Plant.js           # Monitored plant schema with growth stages & GDD
│   └── DiseaseRecord.js   # Disease diagnostic logs & treatment tracking
├── routes/
│   ├── auth.js            # Farmer register, login, session validation
│   ├── plants.js          # CRUD operations for monitored crops
│   ├── analysis.js        # AI stage classification (with multer image upload)
│   ├── disease.js         # Plant pathology detection & treatment advice
│   └── weather.js         # Microclimate sensor data & 7-day forecast
├── middleware/
│   └── auth.js            # JWT verification middleware
├── uploads/               # Uploaded crop and leaf photos storage
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── server.js              # Express app entry point & MongoDB connection
└── README.md
```

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Navigate into the `backend/` folder and install dependencies:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrovision
JWT_SECRET=agrovision_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:3000
```
*(You can also use a cloud MongoDB Atlas connection URI: `mongodb+srv://<username>:<password>@cluster.mongodb.net/agrovision`)*

### 3. Start the Backend Server
```bash
npm start
```
Or for auto-reloading during development:
```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new farmer account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current logged-in farmer profile
- `POST /api/auth/forgot-password` — Password recovery

### 🌱 Plant Management (`/api/plants`)
- `GET /api/plants` — Get all monitored crops (supports `?cropType=`, `?stage=`, `?health=`, `?risk=`, `?search=`)
- `GET /api/plants/:id` — Get detailed profile of a single plant
- `POST /api/plants` — Register a new crop/plot
- `PUT /api/plants/:id` — Update growth stage or health score
- `DELETE /api/plants/:id` — Remove a plant record

### 🔍 Plant Growth Analysis (`/api/analyze`)
- `POST /api/analyze` — Upload photo (`multipart/form-data`) + `crop_type` to detect current growth stage among 6 phenological classes, calculate GDD, and estimate next milestones.

### 🔬 Disease Detection (`/api/disease`)
- `POST /api/disease/detect` — Upload leaf photo to diagnose diseases (Early Blight, Leaf Curl, Rice Blast) with severity rating, organic remedies, and chemical treatments.
- `GET /api/disease/history` — Get past pathology detection logs.

### 🌤️ Weather Intelligence (`/api/weather`)
- `GET /api/weather/current` — Current temperature, humidity, soil moisture, and solar radiation.
- `GET /api/weather/forecast` — 7-day meteorological forecast with daily GDD accumulation.

---

## 🤝 Connecting with Frontend

In the root `.env` or Vite environment, set:
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```
The React frontend will immediately route requests to this Node.js Express & MongoDB backend!
