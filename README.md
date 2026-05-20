# ATSync AI 🚀

> AI-Powered Resume Analysis, ATS Optimization & Interview Preparation Platform

ATSync AI is a modern full-stack AI-powered career platform that helps users analyze resumes, improve ATS compatibility, identify missing skills, and prepare for interviews using advanced AI-generated insights.

The platform combines resume analysis, ATS scoring, interview preparation, and personalized learning roadmaps into a premium SaaS-style experience.

---

# 🌐 Live Deployment

## Frontend
🔗 https://at-sync.vercel.app

## Backend API
🔗 https://atsync.onrender.com

---

# ✨ Features

## 🧠 AI Resume Analysis
- Upload and analyze resumes using AI
- ATS compatibility scoring
- Resume-job matching insights
- Smart resume evaluation

## 📊 ATS Match Score
- AI-generated ATS score
- Resume compatibility analysis
- Match percentage visualization

## 🎯 Skill Gap Detection
- Detect missing technical skills
- Identify improvement areas
- Personalized recommendations

## 💼 AI Interview Preparation
- Technical interview questions
- Behavioral interview questions
- AI-generated model answers
- Personalized preparation roadmap

## 📄 PDF Resume Support
- Upload PDF resumes
- Automatic text extraction
- Resume parsing with AI

## 🔐 Authentication System
- Secure JWT authentication
- Login & Register functionality
- Protected routes
- Persistent sessions

## 🎨 Modern SaaS UI
- Fully responsive design
- Premium dark theme
- Smooth UI interactions
- Modern dashboard experience

---

# 🛠️ Tech Stack

## Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Vercel Analytics

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer

## AI & Utilities
- Google Gemini AI
- PDF Parse
- Puppeteer
- Zod Validation

---

# 🏗️ Repository Structure

```bash
ATSync/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Local Setup

## 📋 Prerequisites

Make sure you have installed:

- Node.js 18+
- npm 9+
- MongoDB Atlas or Local MongoDB

---

# 📦 Backend Setup

## Navigate to Backend

```bash
cd Backend
```

## Install Dependencies

```bash
npm install
```

## Create `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_GENAI_API_KEY=your_google_genai_api_key

CLIENT_URL=http://localhost:5173

BASE_URL=http://localhost:5000
```

## Start Backend

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 💻 Frontend Setup

## Navigate to Frontend

```bash
cd Frontend
```

## Install Dependencies

```bash
npm install
```

## Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

## Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🚀 Deployment Guide

---

# 🌐 Frontend Deployment (Vercel)

Frontend is deployed on:

🔗 https://at-sync.vercel.app

## Deploy Steps

### 1. Push Project to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push
```

---

### 2. Open Vercel

https://vercel.com

---

### 3. Import GitHub Repository

Select your ATSync repository.

---

### 4. Configure Project

## Framework Preset

```txt
Vite
```

## Root Directory

```txt
Frontend
```

## Build Command

```bash
npm run build
```

## Output Directory

```txt
dist
```

---

### 5. Add Environment Variable

```env
VITE_API_URL=https://atsync.onrender.com
```

---

### 6. Deploy

Click:

```txt
Deploy
```

---

# ⚙️ Backend Deployment (Render)

Backend is deployed on:

🔗 https://atsync.onrender.com

## Deploy Steps

### 1. Open Render

https://render.com

---

### 2. Create Web Service

```txt
New + → Web Service
```

Connect your GitHub repository.

---

### 3. Configure Service

## Root Directory

```txt
Backend
```

## Runtime

```txt
Node
```

## Build Command

```bash
npm install
```

## Start Command

```bash
npm start
```

---

### 4. Add Environment Variables

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_GENAI_API_KEY=your_google_genai_api_key

CLIENT_URL=https://at-sync.vercel.app

BASE_URL=https://atsync.onrender.com
```

---

### 5. Deploy Service

Click:

```txt
Create Web Service
```

---

# 🗄️ Database Setup (MongoDB Atlas)

## Create Free Cluster

https://www.mongodb.com/cloud/atlas

---

## Allow Network Access

```txt
0.0.0.0/0
```

---

## Create Database User

Save username and password.

---

## Get Connection String

```txt
Clusters → Connect → Drivers
```

Copy MongoDB URI into:

```env
MONGO_URI=
```

---

# 📜 Available Scripts

## Backend

### Start Backend with Nodemon

```bash
npm run dev
```

### Start Production Server

```bash
npm start
```

---

## Frontend

### Start Vite Dev Server

```bash
npm run dev
```

### Build Production App

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Codebase

```bash
npm run lint
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Secure API Routes
- CORS Protection
- Protected Sessions

---

# 📸 Core Modules

## 🏠 Dashboard
- Resume upload
- Job description input
- AI analysis generation

## 📈 Match Score
- ATS score visualization
- Resume-job compatibility insights

## 🧠 Interview Preparation
- Technical interview questions
- Behavioral interview questions
- AI-generated answers

## 🛣️ Preparation Roadmap
- Personalized preparation plans
- Skill improvement tracking

---

# 🧠 Future Improvements

- AI Resume Builder
- Real-Time Mock Interviews
- Voice-Based Interview Simulation
- AI Career Recommendations
- LinkedIn Profile Analyzer
- Multi-language Resume Support

---

# 👨‍💻 Author

### Riddhi Jain

AI & Full Stack Developer

---

# ⭐ Support

If you like this project:

⭐ Star the repository  
🍴 Fork the project  
🚀 Contribute improvements

---

# 📜 License

This project is licensed under the ISC License.

---

# 🔥 ATSync AI

> Build Smarter Careers with AI