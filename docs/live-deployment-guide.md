# Live Cloud Deployment Guide

This guide walks you through deploying the **Customer Intelligence & Churn Analytics Platform** live on the web for free.

---

## Part 1: Deploy Frontend on Vercel (2 Minutes)

You are already on the Vercel import screen:
👉 **[Open Your Vercel Import Project](https://vercel.com/new/import?framework=other&hasTrialAvailable=1&id=1383715978&import-source=import-suggestions&name=CUSTOMER-CHURN-INTELLIGENCE&owner=Duchalsoham12&project-name=customer-churn-intelligence&provider=github&remainingProjects=1&s=https%3A%2F%2Fgithub.com%2FDuchalsoham12%2FCUSTOMER-CHURN-INTELLIGENCE&teamSlug=soham-c64b&totalProjects=1)**

### Recommended Settings on Vercel:
1. **Project Name**: `customer-churn-intelligence` (or keep default)
2. **Framework Preset**: Select **`Vite`**
3. **Root Directory**:
   - Click **Edit** next to Root Directory
   - Select **`frontend`** (or type `frontend`)
   - Click **Continue**
4. **Build and Output Settings** (Defaults are pre-configured):
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Click "Deploy"**!

Vercel will build the React application and provide you with a live URL (e.g. `https://customer-churn-intelligence.vercel.app`).

---

## Part 2: Deploy Backend on Render (Free FastAPI Hosting)

1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: **`Duchalsoham12/CUSTOMER-CHURN-INTELLIGENCE`**.
4. Configure settings:
   - **Name**: `customer-churn-api`
   - **Runtime**: **Python 3**
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Select **Free**
5. Add Environment Variables:
   - `PYTHONPATH`: `backend`
   - `CORS_ORIGINS`: `*`
   - `APP_ENV`: `production`
6. Click **Create Web Service**.

Render will deploy the FastAPI backend and give you a live URL (e.g., `https://customer-churn-api.onrender.com`).

---

## Part 3: Link Vercel to your Render Backend

Once your Render backend is live:
1. Go to your project on **Vercel** → **Settings** → **Environment Variables**.
2. Add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://<YOUR_RENDER_APP_NAME>.onrender.com/api`
3. Click **Save** and trigger a Redeploy on Vercel.

Your entire full-stack platform will be 100% live on the cloud!
