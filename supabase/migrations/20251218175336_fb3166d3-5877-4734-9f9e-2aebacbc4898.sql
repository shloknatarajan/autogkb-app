-- Create enum for job status
CREATE TYPE public.article_job_status AS ENUM ('pending', 'fetching', 'annotating', 'completed', 'failed');

-- Create table for article processing jobs
CREATE TABLE public.article_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pmid TEXT NOT NULL,
  pmcid TEXT,
  title TEXT,
  status article_job_status NOT NULL DEFAULT 'pending',
  progress TEXT DEFAULT 'Initializing...',
  markdown_content TEXT,
  annotation_data JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read jobs (for polling status)
CREATE POLICY "Anyone can read article jobs"
ON public.article_jobs
FOR SELECT
USING (true);

-- Allow anyone to insert jobs (no auth required for this app)
CREATE POLICY "Anyone can create article jobs"
ON public.article_jobs
FOR INSERT
WITH CHECK (true);

-- Allow updates from service role (edge functions)
CREATE POLICY "Service role can update article jobs"
ON public.article_jobs
FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_article_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_article_jobs_updated_at
BEFORE UPDATE ON public.article_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_article_jobs_updated_at();