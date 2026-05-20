# ATSync AI 🚀

> AI-Powered Resume Analysis, ATS Optimization & Interview Preparation Platform

ATSync AI is a modern full-stack AI-powered career platform designed to help users optimize resumes, improve ATS compatibility, identify missing skills, and prepare for interviews with intelligent AI-driven insights.

The platform combines advanced resume analysis, AI-generated interview questions, ATS scoring, and personalized preparation roadmaps into a premium SaaS-style experience.

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
- Interview preparation roadmap

## 📄 PDF Resume Support
- Upload PDF resumes
- Automatic text extraction
- Resume parsing with AI

## 🔐 Authentication System
- Secure JWT authentication
- Login & Register system
- Protected routes
- Persistent user sessions

## 🎨 Modern SaaS UI
- Fully responsive design
- Premium dark theme
- Smooth UI interactions
- Modern dashboard experience

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

# ⚙️ Getting Started

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

Create a `.env` file inside the `Backend` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_GENAI_API_KEY=your_google_genai_api_key

CLIENT_URL=http://localhost:5173

BASE_URL=http://localhost:5000
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

---

# 🚀 Run Locally

## Start Backend

```bash
cd Backend
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Start Frontend

Open another terminal:

```bash
cd Frontend
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🏗️ Build Frontend

```bash
cd Frontend
npm run build
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
- Protected User Sessions

---

# 📸 Core Modules

## 🏠 Dashboard
- Resume upload
- Job description input
- AI analysis generation

## 📈 Match Score
- ATS score visualization
- Resume-job matching insights

## 🧠 Interview Preparation
- Technical questions
- Behavioral questions
- AI-generated answers

## 🛣️ Preparation Roadmap
- Personalized preparation plan
- Skill improvement guidance

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