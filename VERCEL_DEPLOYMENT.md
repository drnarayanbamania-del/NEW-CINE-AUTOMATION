# Deploying to Vercel

This guide provides step-by-step instructions for deploying the **Cinematic Video Studio** to Vercel.

## 1. Automatic Setup (Recommended)
Vercel will automatically detect your configuration from the `vercel.json` file.

1.  Connect your GitHub/GitLab repository to [Vercel Dashboard](https://vercel.com/new).
2.  Click **Import**.
3.  Vercel will recognize the project as a **Vite** frontend with an **api** folder.

## 2. Configuration Settings
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Install Command**: `npm install`

## 3. Environment Variables
In the **Project Settings > Environment Variables** tab, add your API keys:

*   `OPENAI_API_KEY`
*   `RUNWAYML_API_SECRET`
*   `SARVAM_API_KEY`
*   `ELEVENLABS_API_KEY`
*   `POLLINATIONS_API_KEY` (Optional)

## 4. How it Works
*   **Frontend**: Built with `vite build` into the `dist` folder and served by Vercel's global edge network.
*   **Backend**: The `api/server.ts` file acts as a single Serverless Function that handles all requests to `/api/*`.
*   **Routing**: The `vercel.json` file redirects all non-API requests to `index.html` to support modern SPA routing.

## 5. Deployment
*   Every push to your `main` branch will trigger an automatic production deployment.
*   Pull requests will create **Preview Deployments** for safe testing.
