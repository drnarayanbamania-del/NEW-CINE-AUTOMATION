# Deployment Guide

This application is optimized for deployment to both **Render** and **Vercel**. Select the platform that best fits your workflow.

---

## 🚀 Option 1: Deploy to Render (Full Stack)
Render is recommended for a single Web Service that hosts both the API and the static frontend.

### 1. Configure the Service
In the [Render Dashboard](https://dashboard.render.com/), create a **New Web Service**:
*   **Runtime**: `Node`
*   **Build Command**: `npm install && npm run build`
*   **Start Command**: `npm start`

### 2. Environment Variables
Add the following keys in the **Environment** tab:
*   `NODE_ENV`: `production`
*   `OPENAI_API_KEY`: `your_key`
*   `RUNWAYML_API_SECRET`: `your_key`
*   **Optional**: `ELEVENLABS_API_KEY`, `SARVAM_API_KEY`, `POLLINATIONS_API_KEY`

---

## ⚡ Option 2: Deploy to Vercel (Hybrid/Frontend)
Vercel is best for high-performance frontend delivery and can also host the backend as a Serverless Function.

### 1. Automatic Deployment
1.  Push your code to a GitHub/GitLab repository.
2.  Import the repository into the [Vercel Dashboard](https://vercel.com/new).
3.  Vercel will detect the `vercel.json` and `api/server.ts` automatically.

### 2. Configuration
*   **Framework Preset**: Other (it will detect `vite`)
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`

### 3. Environment Variables
Go to **Settings > Environment Variables** and add:
*   `OPENAI_API_KEY`
*   `RUNWAYML_API_SECRET`
*   `ELEVENLABS_API_KEY`
*   `SARVAM_API_KEY`

---

## 🛠 Project Structure for Deployment
*   **`api/server.ts`**: Handles all API requests and serves the static frontend when running as a standalone server (Render).
*   **`dist/`**: Generated during `npm run build`. Contains the production frontend assets.
*   **`vercel.json`**: Routing configuration for Vercel Serverless Functions.
*   **`package.json`**: Updated with a `start` script specifically for Render support.

## Troubleshooting
*   **API Connection**: Ensure your frontend calls use relative paths (e.g., `/api/generate-image`) which is already handled in `App.tsx`.
*   **Port Issues**: The server is configured to dynamically use `process.env.PORT` on Render and `listen` is disabled on Vercel to avoid conflicts.
