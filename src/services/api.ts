/**
 * API service for communicating with the backend article processor.
 *
 * This service handles requests to fetch and annotate new articles.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export enum JobStatus {
  PENDING = 'pending',
  FETCHING = 'fetching',
  ANNOTATING = 'annotating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Job {
  job_id: string;
  pmid: string;
  status: JobStatus;
  progress: string;
  created_at: string;
  updated_at: string;
  pmcid?: string;
  error?: string;
  result?: {
    pmcid: string;
    annotation_file: string;
    markdown_file: string;
    cost_usd: number;
  };
}

export interface SubmitArticleRequest {
  pmid: string;
  model?: string;
}

export interface SubmitArticleResponse {
  job_id: string;
  status: JobStatus;
  message: string;
}

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Submit a new article for processing.
 */
export async function submitArticle(
  request: SubmitArticleRequest
): Promise<SubmitArticleResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.detail || 'Failed to submit article',
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      'Network error: Unable to reach the backend server',
      undefined,
      error
    );
  }
}

/**
 * Get the status of a processing job.
 */
export async function getJobStatus(jobId: string): Promise<Job> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/${jobId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError('Job not found', 404);
      }
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.detail || 'Failed to get job status',
        response.status,
        error
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      'Network error: Unable to reach the backend server',
      undefined,
      error
    );
  }
}

/**
 * Poll a job until it completes or fails.
 *
 * @param jobId - The job ID to poll
 * @param onProgress - Callback for progress updates
 * @param pollInterval - Interval between polls in milliseconds (default: 2000)
 * @returns The completed job
 */
export async function pollJobUntilComplete(
  jobId: string,
  onProgress?: (job: Job) => void,
  pollInterval: number = 2000
): Promise<Job> {
  while (true) {
    const job = await getJobStatus(jobId);

    if (onProgress) {
      onProgress(job);
    }

    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
      return job;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}

/**
 * List recent jobs.
 */
export async function listJobs(limit: number = 50): Promise<Job[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/articles?limit=${limit}`
    );

    if (!response.ok) {
      throw new APIError('Failed to list jobs', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      'Network error: Unable to reach the backend server',
      undefined,
      error
    );
  }
}

/**
 * Check if the backend API is healthy.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}
