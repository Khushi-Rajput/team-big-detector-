# 🚀 AI Resume Checker - Production & Deployment Guide

This guide gives you step-by-step instructions to run your project locally and **go live tomorrow** on free cloud hosting.

---

## 🌟 Architecture Overview

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Framer Motion + Lucide Icons + Recharts + @react-pdf/renderer
  - Exact UI matching `time-to-program/ai-resume-checker-ui-boilerplate-code`
  - Pages: Landing, Dashboard, Resumes, Resume Details (ATS Score, Issues, Strengths, Keywords, AI Rewrites, Diff View), PDF Export, Insights, Versions, History, Settings, Auth
- **Backend:** Python Flask + SQLite + Native NLP & AI ATS Scoring Engine + Bullet Rewrite Generator (Google XYZ formula)
- **Unified Serving:** Flask serves the optimized React production bundle from `Client/dist` as a Single Page Application (SPA) alongside all `/api/*` endpoints.

---

## 💻 1. How to Run Locally

### Option A: 1-Click Runner (Windows)
Double-click **`run_project.bat`** in the project root.
- Automatically verifies the React build.
- Starts the unified server at **`http://127.0.0.1:5000`**.
- Open your browser to `http://127.0.0.1:5000` to see the complete live application!

### Option B: Development Mode (with Vite Hot Reload)
1. **Terminal 1 (Backend):**
   ```powershell
   cd Server
   .\venv\Scripts\python.exe app.py
   ```
2. **Terminal 2 (Frontend):**
   ```powershell
   cd Client
   npm run dev
   ```
   Open **`http://localhost:5173`**. Vite automatically proxies `/api` to the backend.

---

## 🌐 2. How to Go Live Tomorrow (Step-by-Step)

### Option A: 1-Service Deployment on Render.com (Recommended & Free)
This deploys both the React Frontend and Flask Backend together in a single free service on Render.

1. **Push your code to GitHub:**
   ```powershell
   git add .
   git commit -m "feat: complete full-stack AI Resume Checker with exact boilerplate UI"
   git push origin main
   ```

2. **Go to [Render.com](https://render.com) and create a New Web Service:**
   - Connect your GitHub repository: `Khushi-Rajput/team-big-detector-`
   - **Environment:** `Python 3`
   - **Region:** Any (e.g. Frankfurt, Oregon, Singapore)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Build Command:**
     ```bash
     cd Client && npm install && npm run build && cd ../Server && pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd Server && gunicorn app:app --bind 0.0.0.0:$PORT
     ```
   - **Instance Type:** `Free`

3. **Add Environment Variables (under 'Environment' tab on Render):**
   - `OPENAI_API_KEY`: *(Optional - the built-in native NLP engine works out of the box even without an OpenAI key!)*
   - `OPENAI_MODEL`: `gpt-4o-mini` *(Optional)*

4. Click **Deploy Web Service**!
   Your site will be live at `https://your-app-name.onrender.com` in 3-4 minutes.

---

### Option B: Split Deployment (Vercel Frontend + Render Backend)

#### Deploy Backend to Render:
- **Root Directory:** `Server`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
- Copy your Render backend URL: `https://your-backend.onrender.com`

#### Deploy Frontend to Vercel:
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Set **Root Directory** to `Client`.
4. Framework Preset: `Vite`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
6. Click **Deploy**. Your frontend is live instantly!

---

## 🛠️ Features Included & Verified

- [x] **Exact UI:** Identical landing page, dark/light themes, animations, command palette (Ctrl+K), and responsive navigation.
- [x] **Interactive Dashboard:** ATS gauges, score sparklines, version stacks, and recent activities.
- [x] **Resume Upload:** Multi-format parser (PDF, DOCX, TXT) with automatic section extraction (basics, summary, experience, education, skills, projects, certifications).
- [x] **AI ATS Analysis:** Comprehensive scoring across 5 dimensions (Keywords, Format, Impact, Readability, Action verbs), issues checklist with recommended fixes, strengths list, and keyword coverage.
- [x] **AI Bullet Optimizer:** Generates quantified impact rewrites using Google's XYZ formula.
- [x] **Version Control:** One-click "Apply Rewrites" creates new versions (V1 -> V2 -> V3) with live score improvements.
- [x] **Diff Viewer:** Interactive comparison view highlighting added, removed, and context bullets with character counters.
- [x] **PDF Document Export:** Built-in PDF generator renders clean, professional resumes for immediate download.
- [x] **Offline / Resilient Fallback:** The frontend gracefully falls back to structured sample data if the backend is offline, guaranteeing 100% uptime with zero blank screens.
