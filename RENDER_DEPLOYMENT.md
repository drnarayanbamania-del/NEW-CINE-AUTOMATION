# Deploying to Render

This guide provides step-by-step instructions for deploying the **Cinematic Video Studio** (Frontend + Backend) to Render.

## 1. Prepare your Repository
Ensure your latest changes are pushed to GitHub or GitLab. Render will connect to this repository.

## 2. Create a New Web Service
1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub/GitLab repository.

## 3. Configure the Service
Set the following settings in the Render creation screen:

*   **Name**: `cinematic-video-studio` (or your preferred name)
*   **Region**: Select the one closest to you.
*   **Branch**: `main` (or your default branch)
*   **Root Directory**: Leave blank (root of the repo)
*   **Runtime**: `Node`
*   **Build Command**: `npm install && npm run build`
*   **Start Command**: `npm start`

## 4. Set Environment Variables
Go to the **Environment** tab in your Render service and add the following keys:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `your_openai_key` |
| `RUNWAYML_API_SECRET` | `your_runway_key` |
| `ELEVENLABS_API_KEY` | `your_elevenlabs_key` |
| `SARVAM_API_KEY` | `your_sarvam_key` |
| `POLLINATIONS_API_KEY` | `optional_pollinations_key` |

## 5. Deploy
Click **Create Web Service**. Render will now:
1.  Install dependencies.
2.  Build the Vite frontend into the `dist` folder.
3.  Start the Express server using `tsx api/server.ts`.
4.  The server will detect it's in production and serve the `dist` folder on the assigned port.

## Note on Port
The server is configured to automatically listen on the port provided by Render (`process.env.PORT`).

## Troubleshooting
*   **Build Fails**: Ensure you have pushed the updated `package.json` with `tsx` in `dependencies`.
*   **404 Errors**: If you refresh a sub-page and get a 404, the server is already configured to handle SPA routing by serving `index.html` for all non-API routes.
