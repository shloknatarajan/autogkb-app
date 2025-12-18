import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { submitArticle, pollJobUntilComplete, Job, JobStatus } from '@/services/api';

interface AddArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (pmcid: string) => void;
}

const AddArticleDialog: React.FC<AddArticleDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [pmid, setPmid] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const resetState = () => {
    setPmid('');
    setIsProcessing(false);
    setProgress('');
    setError('');
    setCurrentJob(null);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetState();
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      // Validate PMID
      const trimmedPmid = pmid.trim();
      if (!trimmedPmid || !/^\d+$/.test(trimmedPmid)) {
        throw new Error('Please enter a valid PubMed ID (numbers only)');
      }

      setProgress('Submitting request...');

      // Submit the article
      const response = await submitArticle({ pmid: trimmedPmid });
      setProgress('Processing started. This may take 5-10 minutes...');

      // Poll for completion
      const completedJob = await pollJobUntilComplete(
        response.job_id,
        (job) => {
          setCurrentJob(job);
          setProgress(job.progress);
        },
        3000 // Poll every 3 seconds
      );

      if (completedJob.status === JobStatus.COMPLETED) {
        setProgress('Annotation completed successfully!');
        setTimeout(() => {
          if (onSuccess && completedJob.pmcid) {
            onSuccess(completedJob.pmcid);
          }
          handleClose();
        }, 2000);
      } else if (completedJob.status === JobStatus.FAILED) {
        throw new Error(completedJob.error || 'Processing failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (!currentJob) return 0;
    switch (currentJob.status) {
      case JobStatus.PENDING:
        return 10;
      case JobStatus.FETCHING:
        return 30;
      case JobStatus.ANNOTATING:
        return 50;
      case JobStatus.COMPLETED:
        return 100;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Article</DialogTitle>
          <DialogDescription>
            Enter a PubMed ID (PMID) to fetch and annotate a new article.
            This process typically takes 5-10 minutes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pmid">PubMed ID (PMID)</Label>
              <Input
                id="pmid"
                placeholder="e.g., 27528039"
                value={pmid}
                onChange={(e) => setPmid(e.target.value)}
                disabled={isProcessing}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Enter the numeric PubMed ID only (without "PMID:" prefix)
              </p>
            </div>

            {isProcessing && (
              <div className="space-y-3">
                <Progress value={getProgressPercentage()} className="w-full" />
                <p className="text-sm text-muted-foreground">{progress}</p>
                {currentJob && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Status: {currentJob.status}</p>
                    {currentJob.pmcid && <p>PMC ID: {currentJob.pmcid}</p>}
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isProcessing && !error && (
              <Alert>
                <AlertDescription>
                  <strong>Note:</strong> The annotation process uses AI models
                  and may incur costs. Processing time varies but typically
                  takes 5-10 minutes per article.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isProcessing || !pmid.trim()}>
              {isProcessing ? 'Processing...' : 'Start Processing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleDialog;
