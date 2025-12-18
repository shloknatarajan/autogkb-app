# Add New Article Feature - Implementation Summary

## What Was Built

A complete system for adding new PubMed articles to the AutoGKB application with automatic annotation generation.

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vercel    │ ──────> │   Railway    │ ──────> │   OpenAI    │
│  Frontend   │  HTTP   │    Backend   │   API   │     API     │
│  (React)    │         │   (FastAPI)  │         │  (GPT-5.2)  │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       │                        │
       └────────────────────────┘
         Polls for job status
```

## Files Created/Modified

### Backend Files (New)
- **`api/main.py`** - FastAPI backend server
  - Handles article fetching and annotation generation
  - Provides REST API endpoints
  - Manages background job processing

### Configuration Files (New)
- **`requirements.txt`** - Python dependencies for Railway
- **`Procfile`** - Railway start command
- **`runtime.txt`** - Python version specification
- **`railway.toml`** - Railway deployment config
- **`.env.example`** - Environment variable template

### Frontend Files (New)
- **`src/services/api.ts`** - API client for backend communication
  - `submitArticle()` - Submit new PMID
  - `getJobStatus()` - Check processing status
  - `pollJobUntilComplete()` - Auto-polling helper

- **`src/components/AddArticleDialog.tsx`** - UI modal for adding articles
  - PMID input form
  - Progress bar and status updates
  - Error handling

### Frontend Files (Modified)
- **`src/pages/Dashboard.tsx`** - Added "Add New Article" button and dialog integration

### Documentation (New)
- **`DEPLOYMENT.md`** - Complete Railway deployment guide
- **`TESTING.md`** - Testing procedures and test cases
- **`README_NEW_FEATURE.md`** - This file
- **`start-backend.sh`** - Helper script to run backend locally

## How It Works

### User Flow
1. User clicks "Add New Article" button on Dashboard
2. Enters a PubMed ID (PMID)
3. Frontend calls Railway backend API
4. Backend:
   - Fetches article from PubMed
   - Saves markdown to `public/data/markdown/`
   - Generates annotations using LLM
   - Saves annotation to `public/data/annotations/`
5. Frontend polls for status updates
6. When complete, page reloads to show new article

### API Endpoints

#### `POST /api/articles`
Submit a new article for processing.

**Request:**
```json
{
  "pmid": "27528039",
  "model": "gpt-5.2"  // optional
}
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Job created successfully..."
}
```

#### `GET /api/articles/{job_id}`
Get job status and progress.

**Response:**
```json
{
  "job_id": "550e8400-...",
  "pmid": "27528039",
  "status": "annotating",
  "progress": "Generating annotations...",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:35:00",
  "pmcid": "PMC5074472"
}
```

## Quick Start

### 1. Local Testing

```bash
# Set up environment
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start backend
./start-backend.sh

# In another terminal, start frontend
npm run dev
```

Visit http://localhost:5173 and click "Add New Article"

### 2. Deploy to Railway

See `DEPLOYMENT.md` for complete instructions:

```bash
# Quick deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
OPENAI_API_KEY=sk-...
```

### 3. Configure Vercel

Add environment variable in Vercel:
```
VITE_API_URL=https://your-app.railway.app
```

## Key Features

### ✅ Implemented
- RESTful API for article processing
- Background job processing with status updates
- Real-time progress tracking via polling
- Error handling and validation
- CORS configuration for Vercel
- Beautiful UI with progress indicators
- Toast notifications on success

### ⚠️ Limitations
- Files stored on Railway are ephemeral (lost on redeploy)
- In-memory job queue (lost on restart)
- No authentication (anyone can submit jobs)
- No rate limiting

### 🔄 Recommended Improvements
1. **Persistent Storage**: Commit files back to GitHub or use S3
2. **Job Queue**: Use Redis or a proper queue system
3. **Authentication**: Add API keys or OAuth
4. **Rate Limiting**: Prevent abuse
5. **Webhooks**: Push notifications instead of polling
6. **Admin Dashboard**: View all jobs and manage system

## Cost Estimates

- **Railway**: Free tier (500 hours/month)
- **OpenAI API**: ~$0.20-0.50 per article (GPT-5.2)
- **Processing Time**: ~5-10 minutes per article

## Troubleshooting

### Backend not starting
```bash
# Check dependencies
pip install -r requirements.txt

# Check imports
python -c "from api.main import app"
```

### Frontend can't reach backend
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration in `api/main.py`
- Check Railway deployment logs

### Annotation fails
- Verify OpenAI API key is valid
- Check API quota/credits
- Review backend logs for errors

## Next Steps

1. **Deploy to Railway** - Follow `DEPLOYMENT.md`
2. **Test End-to-End** - Follow `TESTING.md`
3. **Set Up Git Auto-Commit** - Save files persistently
4. **Add Monitoring** - Track costs and usage
5. **Implement Auth** - Secure the API

## Support

For issues or questions:
1. Check `DEPLOYMENT.md` for deployment help
2. Check `TESTING.md` for testing procedures
3. Review Railway logs for backend errors
4. Review browser console for frontend errors

---

Built with FastAPI, React, Railway, and Vercel.
