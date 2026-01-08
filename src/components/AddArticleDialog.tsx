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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Construction } from 'lucide-react';

interface AddArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (pmcid: string) => void;
}

const AddArticleDialog: React.FC<AddArticleDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [pmid, setPmid] = useState('');

  const handleClose = () => {
    setPmid('');
    onOpenChange(false);
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

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pmid">PubMed ID (PMID)</Label>
            <Input
              id="pmid"
              placeholder="e.g., 27528039"
              value={pmid}
              onChange={(e) => setPmid(e.target.value)}
              disabled
            />
            <p className="text-sm text-muted-foreground">
              Enter the numeric PubMed ID only (without "PMID:" prefix)
            </p>
          </div>

          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Construction className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <strong>Work in Progress</strong>
              <p className="mt-1">
                The backend integration for adding new articles is currently under development. 
                Check back soon!
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled>
            Start Processing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleDialog;
