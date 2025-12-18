/**
 * API service for communicating with the Railway backend article processor.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  title?: string;
  error?: string;
  result?: {
    pmcid: string;
    annotation_data: any;
    markdown_content: string;
  };
}

export interface SubmitArticleRequest {
  pmid: string;
}

export interface SubmitArticleResponse {
  job_id: string;
  success: boolean;
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
    const response = await fetch(`${API_URL}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pmid: request.pmid }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || 'Failed to submit article',
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return {
      job_id: data.job_id,
      success: true,
      message: data.message || 'Article submitted successfully',
    };
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
    const response = await fetch(`${API_URL}/api/articles/${jobId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new APIError('Job not found', 404);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || 'Failed to get job status',
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return {
      job_id: data.job_id,
      pmid: data.pmid,
      status: data.status as JobStatus,
      progress: data.progress || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      pmcid: data.pmcid,
      title: data.title,
      error: data.error,
      result: data.result,
    };
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

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}

/**
 * List recent jobs.
 */
export async function listJobs(limit: number = 50): Promise<Job[]> {
  try {
    const response = await fetch(`${API_URL}/api/articles?limit=${limit}`);

    if (!response.ok) {
      throw new APIError('Failed to list jobs');
    }

    const data = await response.json();
    return data.jobs || [];
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
    const response = await fetch(`${API_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}
