/**
 * API service for communicating with the article processor.
 */

// Lazy load supabase to avoid initialization errors when env vars aren't ready
const getSupabase = () => import('@/integrations/supabase/client').then(m => m.supabase);

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
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke('process-article', {
      body: { pmid: request.pmid }
    });

    if (error) {
      throw new APIError(error.message || 'Failed to submit article');
    }

    if (!data.success) {
      throw new APIError(data.error || 'Failed to submit article');
    }

    return {
      job_id: data.job_id,
      success: true,
      message: data.message
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
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('article_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError('Job not found', 404);
      }
      throw new APIError(error.message || 'Failed to get job status');
    }

    return {
      job_id: data.id,
      pmid: data.pmid,
      status: data.status as JobStatus,
      progress: data.progress || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      pmcid: data.pmcid,
      title: data.title,
      error: data.error,
      result: data.status === 'completed' ? {
        pmcid: data.pmcid,
        annotation_data: data.annotation_data,
        markdown_content: data.markdown_content
      } : undefined
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
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('article_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new APIError('Failed to list jobs');
    }

    return data.map(job => ({
      job_id: job.id,
      pmid: job.pmid,
      status: job.status as JobStatus,
      progress: job.progress || '',
      created_at: job.created_at,
      updated_at: job.updated_at,
      pmcid: job.pmcid,
      title: job.title,
      error: job.error,
      result: job.status === 'completed' ? {
        pmcid: job.pmcid,
        annotation_data: job.annotation_data,
        markdown_content: job.markdown_content
      } : undefined
    }));
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
    const supabase = await getSupabase();
    const { error } = await supabase.from('article_jobs').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
