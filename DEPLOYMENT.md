# Deployment Guide: Backend API on Railway

This guide walks through deploying the article processing backend API to Railway.

## Overview

The AutoGKB application consists of:
1. **Frontend**: React/Vite app hosted on Vercel (static)
2. **Backend API**: FastAPI service hosted on Railway (handles article processing)

## Prerequisites

- Railway account (free tier available)
- GitHub account
- OpenAI API key (and optionally Anthropic/Gemini keys)

## Step 1: Prepare Your Repository

Ensure the following files are committed to your repo:

```
api/main.py              # FastAPI backend
requirements.txt         # Python dependencies
Procfile                 # Railway start command
runtime.txt              # Python version
railway.toml            # Railway configuration
.env.example            # Environment variable template
```

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `autogkb-app` repository
5. Railway will auto-detect the configuration from `railway.toml`

### Option B: Deploy from CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In your Railway project dashboard:

1. Go to **Variables** tab
2. Add the following environment variables:

```bash
OPENAI_API_KEY=sk-...          # Required
ANTHROPIC_API_KEY=sk-...       # Optional
GEMINI_API_KEY=...             # Optional
PORT=8000                      # Railway auto-sets this
```

## Step 4: Get Your Railway URL

After deployment:
1. Go to **Settings** > **Domains**
2. Railway provides a URL like: `https://your-app.railway.app`
3. Copy this URL - you'll need it for the frontend

## Step 5: Configure Frontend (Vercel)

In your Vercel project:

1. Go to **Settings** > **Environment Variables**
2. Add:
   ```bash
   VITE_API_URL=https://your-app.railway.app
   ```
3. Redeploy your Vercel app

Alternatively, for local development, create `.env.local`:
```bash
VITE_API_URL=https://your-app.railway.app
```

## Step 6: Update CORS Settings

Edit `api/main.py` to add your production domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://your-actual-domain.vercel.app",  # Add your domain
    ],
    # ...
)
```

Commit and push - Railway will auto-deploy.

## Step 7: Verify Deployment

### Test the API health endpoint:

```bash
curl https://your-app.railway.app/
```

Expected response:
```json
{
  "service": "AutoGKB Article Processor API",
  "status": "running",
  "version": "1.0.0"
}
```

### Test article submission:

```bash
curl -X POST https://your-app.railway.app/api/articles \
  -H "Content-Type: application/json" \
  -d '{"pmid": "27528039"}'
```

Expected response:
```json
{
  "job_id": "...",
  "status": "pending",
  "message": "Job created successfully..."
}
```

## Step 8: Monitor and Logs

- View logs in Railway dashboard: **Deployments** > **View Logs**
- Monitor API usage in Railway: **Metrics** tab

## Testing the Full Integration

1. Open your Vercel app
2. Click **"Add New Article"**
3. Enter a PMID (e.g., `27528039`)
4. Click **"Start Processing"**
5. Watch the progress bar
6. Wait 5-10 minutes for completion
7. The page should reload with the new article

## Important Notes

### Cost Considerations

- **Railway**: Free tier includes 500 hours/month ($5 credit)
- **OpenAI API**: GPT-5.2 costs vary (expect $0.20-0.50 per article)
- Each article annotation takes ~5-10 minutes

### File Storage

⚠️ **Current Limitation**: The API saves files to `public/data/`, but Railway's filesystem is **ephemeral** (resets on redeploy).

**Solutions:**

1. **Option 1**: After processing, have the backend commit files to GitHub
   ```python
   # Add to api/main.py after annotation completes
   import subprocess
   subprocess.run(["git", "add", f"public/data/annotations/{pmcid}.json"])
   subprocess.run(["git", "commit", "-m", f"Add annotation for {pmcid}"])
   subprocess.run(["git", "push"])
   ```

2. **Option 2**: Upload to cloud storage (S3, GCS, etc.)
3. **Option 3**: Return annotation JSON in API response and save via separate process

### Scaling

For production use:
- Use Redis for job queue (instead of in-memory)
- Set up proper database for job persistence
- Implement webhook notifications
- Add authentication/rate limiting

## Troubleshooting

### "Network error: Unable to reach backend"
- Check Railway deployment status
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration

### "Job not found"
- Railway may have restarted (jobs are in-memory)
- Implement persistent storage (Redis/PostgreSQL)

### "Failed to fetch article"
- Check PMID is valid and article exists
- Verify PubMed API is accessible

### Import errors in Railway
- Check `requirements.txt` includes all dependencies
- Verify Python version in `runtime.txt`

## Next Steps

1. Set up GitHub Actions to commit annotations back to repo
2. Add authentication for the API
3. Implement rate limiting
4. Set up monitoring/alerts
5. Add admin dashboard to view all jobs
