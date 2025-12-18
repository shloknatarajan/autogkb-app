""""
This script will fetch a new article from the NCBI PMC and save it to the public/data/articles directory.
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime

from loguru import logger

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from .markdown_fetcher.pubmed_downloader import PubMedDownloader
from llm import generate_response, normalize_model
from utils.prompt_manager import PromptManager
from utils.citation_generator import generate_citations, CITATION_PROMPT_TEMPLATE
from utils.normalization import normalize_output_file
from utils.cost import CostTracker


def fetch_new_article(pmid: str) -> Optional[str]:
    """
    Fetch a new article from the NCBI PMC and save it to the public/data/articles directory.
    """
    pubmed_downloader = PubMedDownloader()
    markdown, pmcid = pubmed_downloader.single_pmid_to_markdown(pmid)
    if markdown is None:
        logger.error(f"Failed to fetch article for PMID {pmid}")
        return None
    return markdown, pmcid


def save_markdown_to_file(markdown: str, pmcid: str) -> None:
    """
    Save the markdown to a file.
    """
    with open(f"public/data/markdown/{pmcid}.md", "w") as f:
        f.write(markdown)


async def get_annotation_from_markdown(
    markdown_file_path: str,
    model: str = "gpt-5.2"
) -> Optional[Dict]:
    """
    Get the annotation from the markdown file by running all annotation tasks.

    Args:
        markdown_file_path: Path to the markdown file to process
        model: LLM model to use for annotation (default: gpt-5.2)

    Returns:
        Dictionary containing the complete annotation with all tasks
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
                    parsed_output = json.loads(output)
                    return (task, parsed_output, None, usage_info)
                except json.JSONDecodeError:
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
        citation_model = "openai/gpt-4o-mini"  # Use fast, cost-effective OpenAI model for citations

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

        # Extract PMCID from annotation results or filename
        pmcid = annotation_results.get("pmcid")
        if not pmcid:
            # Try to extract from filename (e.g., "PMC123456.md" -> "PMC123456")
            pmcid = Path(markdown_file_path).stem

        # Create output directory
        output_dir = Path("public/data/annotations")
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save to temporary file for normalization
        temp_file = output_dir / f"{pmcid}.json.tmp"
        final_file = output_dir / f"{pmcid}.json"

        try:
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
        logger.error(f"Failed to get annotation from markdown: {e}")
        return None

def main(pmid: Optional[str] = None, markdown_file: Optional[str] = None, model: str = "gpt-5.2") -> None:
    """
    Main function to fetch article and generate annotations.

    Args:
        pmid: PubMed ID to fetch
        markdown_file: Path to existing markdown file to annotate
        model: Model to use for annotation (default: gpt-5.2)
    """
    if markdown_file:
        # Process existing markdown file
        logger.info(f"Processing existing markdown file: {markdown_file}")
        annotation = asyncio.run(get_annotation_from_markdown(markdown_file, model=model))
        if annotation:
            logger.success("Annotation generated successfully!")
        else:
            logger.error("Failed to generate annotation")
    elif pmid:
        # Fetch new article and annotate
        markdown, pmcid = fetch_new_article(pmid)
        if markdown is not None and pmcid is not None:
            save_markdown_to_file(markdown, pmcid)
            logger.success(f"Successfully fetched and saved article for PMID {pmid}")

            # Generate annotation
            markdown_file_path = f"public/data/markdown/{pmcid}.md"
            logger.info(f"Generating annotation for {markdown_file_path}...")
            annotation = asyncio.run(get_annotation_from_markdown(markdown_file_path, model=model))
            if annotation:
                logger.success("Annotation generated successfully!")
            else:
                logger.error("Failed to generate annotation")
        else:
            logger.error(f"Failed to fetch or save article for PMID {pmid}")
    else:
        logger.error("Please provide either --pmid or --markdown-file")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Fetch article and generate annotations")
    parser.add_argument("--pmid", type=str, help="PubMed ID to fetch")
    parser.add_argument("--markdown-file", type=str, help="Path to existing markdown file to annotate")
    parser.add_argument("--model", type=str, default="gpt-5.2", help="Model to use for annotation (default: gpt-5.2)")
    args = parser.parse_args()

    main(pmid=args.pmid, markdown_file=args.markdown_file, model=args.model)