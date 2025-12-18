# Testing Guide

## Local Testing (Before Railway Deployment)

### 1. Test Backend Locally

#### Start the backend server:

```bash
# Make sure you have dependencies installed
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_key_here

# Start the server
uvicorn api.main:app --reload --port 8000
```

#### Test health endpoint:

```bash
curl http://localhost:8000/
```

Expected output:
```json
{
  "service": "AutoGKB Article Processor API",
  "status": "running",
  "version": "1.0.0"
}
```

#### Test article submission:

```bash
# Submit an article (use a PMID you know works)
curl -X POST http://localhost:8000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"pmid": "27528039"}'
```

Expected output:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Job created successfully. Poll /api/articles/550e8400-e29b-41d4-a716-446655440000 for status."
}
```

#### Check job status:

```bash
# Replace {job_id} with the actual job ID from above
curl http://localhost:8000/api/articles/{job_id}
```

Expected output (in progress):
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "pmid": "27528039",
  "status": "annotating",
  "progress": "Generating annotations (this may take 5-10 minutes)...",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:35:00",
  "pmcid": "PMC5074472"
}
```

### 2. Test Frontend Integration Locally

#### Set up environment:

Create `.env.local` in the root:
```bash
VITE_API_URL=http://localhost:8000
```

#### Start the frontend:

```bash
npm run dev
```

#### Test in browser:

1. Open http://localhost:5173
2. Click "Add New Article"
3. Enter PMID: `27528039`
4. Click "Start Processing"
5. Watch progress updates
6. Wait for completion

## Testing After Railway Deployment

### 1. Update environment variable:

```bash
# .env.local or Vercel env vars
VITE_API_URL=https://your-app.railway.app
```

### 2. Test Railway API directly:

```bash
# Health check
curl https://your-app.railway.app/

# Submit article
curl -X POST https://your-app.railway.app/api/articles \
  -H "Content-Type: application/json" \
  -d '{"pmid": "27528039"}'

# Check status
curl https://your-app.railway.app/api/articles/{job_id}
```

### 3. Test from Vercel frontend:

1. Deploy frontend to Vercel with `VITE_API_URL` set
2. Open your Vercel app
3. Test "Add New Article" feature

## Test Cases

### Test Case 1: Valid PMID
- **Input**: PMID `27528039`
- **Expected**: Successful annotation generation
- **Files created**:
  - `public/data/markdown/PMC5074472.md`
  - `public/data/annotations/PMC5074472.json`

### Test Case 2: Invalid PMID
- **Input**: PMID `99999999999`
- **Expected**: Error message "Failed to fetch article"

### Test Case 3: Non-numeric PMID
- **Input**: `abc123`
- **Expected**: Validation error "Please enter a valid PubMed ID"

### Test Case 4: Empty PMID
- **Input**: (empty)
- **Expected**: Submit button disabled

### Test Case 5: Job Status Polling
- **Action**: Submit article and check status every 3 seconds
- **Expected**: Status progresses through:
  1. `pending`
  2. `fetching`
  3. `annotating`
  4. `completed`

### Test Case 6: CORS
- **Action**: Call API from different origin
- **Expected**: Requests allowed from configured origins

## Performance Benchmarks

- Article fetch: ~5-10 seconds
- Annotation generation: ~5-10 minutes
- Total process: ~5-10 minutes

## Common Issues

### Issue: "Network error"
- **Cause**: Backend not running or wrong URL
- **Fix**: Check `VITE_API_URL` and backend status

### Issue: "Job not found"
- **Cause**: Backend restarted (in-memory jobs lost)
- **Fix**: Implement persistent storage

### Issue: "Failed to generate annotation"
- **Cause**: API key invalid or quota exceeded
- **Fix**: Check API keys and credits

### Issue: Progress stuck at "annotating"
- **Cause**: LLM API timeout or error
- **Fix**: Check backend logs

## Monitoring

### Backend Logs (Railway):
```
Railway Dashboard > Deployments > View Logs
```

### Frontend Console (Browser):
```
F12 > Console > Network tab
```

## Load Testing

Test concurrent requests:

```bash
# Submit 5 articles at once
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/articles \
    -H "Content-Type: application/json" \
    -d '{"pmid": "27528039"}' &
done
```

Expected: All jobs queued and processed sequentially
