import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Add New Article
          </DialogTitle>
          <DialogDescription>
            Enter a PubMed ID (PMID) to fetch and annotate a new article.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
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
      </DialogContent>
    </Dialog>
  );
};

export default AddArticleDialog;
