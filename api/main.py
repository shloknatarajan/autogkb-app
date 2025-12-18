"""
FastAPI backend for processing new article annotations.

This API handles requests to fetch and annotate new articles from PubMed.
It runs as a separate service (e.g., on Railway) and is called by the Vercel frontend.
"""

import asyncio
import sys
import uuid
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from loguru import logger

# Add python_src to path for imports
python_src_path = Path(__file__).parent.parent / "python_src"
sys.path.insert(0, str(python_src_path))

# Import with try-except to handle potential import issues
try:
    from markdown_fetcher.pubmed_downloader import PubMedDownloader
    from llm import generate_response, normalize_model
    from utils.prompt_manager import PromptManager
    from utils.citation_generator import generate_citations, CITATION_PROMPT_TEMPLATE
    from utils.normalization import normalize_output_file
    from utils.cost import CostTracker
except ImportError as e:
    logger.error(f"Import error: {e}")
    raise

# Configure logger
logger.add(
    "logs/api_{time}.log",
    rotation="1 day",
    retention="7 days",
    level="INFO"
)

app = FastAPI(
    title="AutoGKB Article Processor API",
    description="API for fetching and annotating PubMed articles",
    version="1.0.0"
)

# Configure CORS - Update this with your Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "http://localhost:3000",
        "https://*.vercel.app",  # Vercel preview deployments
        # Add your production Vercel domain here:
        # "https://your-app.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JobStatus(str, Enum):
    PENDING = "pending"
    FETCHING = "fetching"
    ANNOTATING = "annotating"
    COMPLETED = "completed"
    FAILED = "failed"


class Job(BaseModel):
    job_id: str
    pmid: str
    status: JobStatus
    progress: str = ""
    created_at: datetime
    updated_at: datetime
    pmcid: Optional[str] = None
    error: Optional[str] = None
    result: Optional[Dict] = None


class SubmitArticleRequest(BaseModel):
    pmid: str = Field(..., description="PubMed ID to fetch and annotate", example="27528039")
    model: str = Field(default="gpt-5.2", description="LLM model to use for annotation")


class SubmitArticleResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str


# In-memory job storage (use Redis or database in production)
jobs: Dict[str, Job] = {}


async def generate_annotation(markdown_file_path: str, model: str = "gpt-5.2") -> Optional[Dict]:
    """
    Generate annotation from markdown file by running all annotation tasks.
    This is adapted from fetch_new_article.py's get_annotation_from_markdown function.
    """
    try:
        # Read the markdown file
        with open(markdown_file_path, "r") as f:
            text = f.read()

        logger.info(f"Processing markdown file: {markdown_file_path}")
        logger.info(f"Using model: {model}")

        # Normalize model name
        normalized_model = normalize_model(model)

        # Load best prompts configuration
        prompt_manager = PromptManager()
        prompt_details_map = prompt_manager.get_best_prompts()

        if not prompt_details_map:
            logger.error("No best prompts found. Check your configuration.")
            return None

        logger.info(f"Loaded {len(prompt_details_map)} prompts")

        # Initialize cost tracker
        cost_tracker = CostTracker()

        # Run all tasks in parallel
        async def run_task(task: str, prompt_data: Dict):
            """Run a single annotation task."""
            try:
                result = await generate_response(
                    prompt=prompt_data["prompt"],
                    text=text,
                    model=normalized_model,
                    response_format=prompt_data.get("response_format"),
                    temperature=prompt_data.get("temperature", 0.0),
                    return_usage=True,
                )
                output, usage_info = result

                try:
                    import json
                    parsed_output = json.loads(output)
                    return (task, parsed_output, None, usage_info)
                except json.JSONDecodeError as e:
                    return (task, {"error": "JSON parse failed"}, str(e), usage_info)
            except Exception as e:
                logger.error(f"Error running task {task}: {e}")
                return (task, {"error": str(e)}, str(e), None)

        logger.info(f"Running {len(prompt_details_map)} tasks in parallel...")
        task_coroutines = [
            run_task(task, prompt_data)
            for task, prompt_data in prompt_details_map.items()
        ]
        task_results_list = await asyncio.gather(*task_coroutines)

        # Combine task results
        annotation_results = {}
        prompts_used = {}

        for task, result, error, usage_info in task_results_list:
            if error:
                annotation_results[task] = result
                logger.error(f"Task {task} failed: {error}")
            else:
                annotation_results.update(result)
                logger.info(f"Task {task} completed successfully")

            prompts_used[task] = prompt_details_map[task].get("name", "unknown")
            if usage_info:
                cost_tracker.add_usage(task, usage_info)

        # Generate citations for all annotations
        logger.info("Generating citations for annotations...")
        citation_model = "openai/gpt-4o-mini"

        async def generate_citation_for_annotation(ann_type: str, index: int, annotation: Dict):
            """Generate citation for a single annotation."""
            try:
                result = await generate_citations(
                    annotation=annotation,
                    full_text=text,
                    model=citation_model,
                    citation_prompt_template=CITATION_PROMPT_TEMPLATE,
                    return_usage=True,
                )
                citations, usage_info = result
                return (ann_type, index, citations, None, usage_info)
            except Exception as e:
                logger.error(f"Error generating citation for {ann_type}[{index}]: {e}")
                return (ann_type, index, [], str(e), None)

        citation_tasks = []
        for ann_type in ["var_pheno_ann", "var_drug_ann", "var_fa_ann"]:
            if ann_type in annotation_results and isinstance(annotation_results[ann_type], list):
                for i, annotation in enumerate(annotation_results[ann_type]):
                    citation_tasks.append(
                        generate_citation_for_annotation(ann_type, i, annotation)
                    )

        if citation_tasks:
            logger.info(f"Generating {len(citation_tasks)} citations in parallel...")
            citation_results = await asyncio.gather(*citation_tasks)

            for ann_type, index, citations, error, usage_info in citation_results:
                annotation_results[ann_type][index]["Citations"] = citations
                if error:
                    annotation_results[ann_type][index]["Citation_Error"] = error
                if usage_info:
                    cost_tracker.add_usage("citations", usage_info)

        # Add metadata
        annotation_results["timestamp"] = datetime.now().isoformat()
        annotation_results["prompts_used"] = prompts_used
        annotation_results["usage"] = cost_tracker.get_summary()
        annotation_results["source_file"] = markdown_file_path
        annotation_results["model"] = normalized_model

        # Extract PMCID from filename
        pmcid = Path(markdown_file_path).stem

        # Create output directory
        output_dir = Path("public/data/annotations")
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save to temporary file for normalization
        temp_file = output_dir / f"{pmcid}.json.tmp"
        final_file = output_dir / f"{pmcid}.json"

        try:
            import json
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(annotation_results, f, indent=2, ensure_ascii=False)

            # Normalize terms
            logger.info("Normalizing terms in annotation...")
            normalization_success = normalize_output_file(str(temp_file), str(final_file), verbose=True)

            if normalization_success and final_file.exists():
                # Load normalized results
                with open(final_file, "r") as f:
                    final_results = json.load(f)
                logger.info("Successfully normalized annotation")
            else:
                # If normalization failed, use the non-normalized version
                logger.warning("Normalization failed, saving non-normalized version")
                import shutil
                shutil.copy2(temp_file, final_file)
                final_results = annotation_results

            logger.success(f"Successfully generated annotation. Cost: ${cost_tracker.total_cost_usd:.4f}")
            logger.success(f"Annotation saved to: {final_file}")

            return final_results

        finally:
            # Always clean up temp file
            if temp_file.exists():
                temp_file.unlink(missing_ok=True)
                logger.debug(f"Cleaned up temp file: {temp_file}")

    except Exception as e:
        logger.error(f"Failed to generate annotation: {e}")
        return None


async def process_article_job(job_id: str, pmid: str, model: str):
    """Background task to process article annotation."""
    try:
        job = jobs[job_id]

        # Step 1: Fetch article
        job.status = JobStatus.FETCHING
        job.progress = "Fetching article from PubMed..."
        job.updated_at = datetime.now()
        logger.info(f"Job {job_id}: Fetching article for PMID {pmid}")

        # Use PubMedDownloader directly
        pubmed_downloader = PubMedDownloader()
        markdown, pmcid = pubmed_downloader.single_pmid_to_markdown(pmid)

        if markdown is None or pmcid is None:
            raise Exception(f"Failed to fetch article for PMID {pmid}")

        job.pmcid = pmcid

        # Step 2: Save markdown
        job.progress = "Saving article markdown..."
        job.updated_at = datetime.now()
        logger.info(f"Job {job_id}: Saving markdown for {pmcid}")

        # Create directory if it doesn't exist
        markdown_dir = Path("public/data/markdown")
        markdown_dir.mkdir(parents=True, exist_ok=True)

        markdown_file_path = markdown_dir / f"{pmcid}.md"
        with open(markdown_file_path, "w") as f:
            f.write(markdown)

        # Step 3: Generate annotations
        job.status = JobStatus.ANNOTATING
        job.progress = "Generating annotations (this may take 5-10 minutes)..."
        job.updated_at = datetime.now()
        logger.info(f"Job {job_id}: Generating annotations for {pmcid}")

        # Run annotation generation
        annotation = await generate_annotation(str(markdown_file_path), model=model)

        if annotation is None:
            raise Exception("Failed to generate annotation")

        # Step 4: Complete
        job.status = JobStatus.COMPLETED
        job.progress = "Annotation completed successfully!"
        job.updated_at = datetime.now()
        job.result = {
            "pmcid": pmcid,
            "annotation_file": f"public/data/annotations/{pmcid}.json",
            "markdown_file": markdown_file_path,
            "cost_usd": annotation.get("usage", {}).get("total_cost_usd", 0),
        }
        logger.success(f"Job {job_id}: Completed successfully for {pmcid}")

    except Exception as e:
        logger.error(f"Job {job_id}: Failed with error: {e}")
        job = jobs[job_id]
        job.status = JobStatus.FAILED
        job.error = str(e)
        job.updated_at = datetime.now()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "AutoGKB Article Processor API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/api/articles", response_model=SubmitArticleResponse)
async def submit_article(
    request: SubmitArticleRequest,
    background_tasks: BackgroundTasks
):
    """
    Submit a new article for processing.

    This endpoint creates a job to fetch and annotate a PubMed article.
    The job runs in the background and can be polled using the returned job_id.
    """
    job_id = str(uuid.uuid4())

    job = Job(
        job_id=job_id,
        pmid=request.pmid,
        status=JobStatus.PENDING,
        progress="Job queued...",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )

    jobs[job_id] = job

    # Start background processing
    background_tasks.add_task(process_article_job, job_id, request.pmid, request.model)

    logger.info(f"Created job {job_id} for PMID {request.pmid}")

    return SubmitArticleResponse(
        job_id=job_id,
        status=JobStatus.PENDING,
        message=f"Job created successfully. Poll /api/articles/{job_id} for status."
    )


@app.get("/api/articles/{job_id}", response_model=Job)
async def get_job_status(job_id: str):
    """
    Get the status of a processing job.

    Poll this endpoint to check the progress of an article annotation job.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    return jobs[job_id]


@app.get("/api/articles", response_model=list[Job])
async def list_jobs(limit: int = 50):
    """List recent jobs (most recent first)."""
    sorted_jobs = sorted(
        jobs.values(),
        key=lambda j: j.created_at,
        reverse=True
    )
    return sorted_jobs[:limit]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
