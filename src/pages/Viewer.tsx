import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useViewerData } from '@/hooks/useViewerData';
import { useQuoteHighlight } from '@/hooks/useQuoteHighlight';
import { ViewerHeader } from '@/components/viewer/ViewerHeader';
import { MarkdownPanel } from '@/components/viewer/MarkdownPanel';
import { AnnotationsPanel } from '@/components/viewer/AnnotationsPanel';

const Viewer = () => {
  const { pmcid } = useParams<{ pmcid: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useViewerData(pmcid);
  const { handleQuoteClick } = useQuoteHighlight();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-muted-foreground">Loading study data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Study Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error || `The requested PMCID "${pmcid}" could not be found.`}
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <ViewerHeader pmcid={pmcid || ''} />
      <div className="flex h-[calc(100vh-4rem)]">
        <MarkdownPanel markdown={data.markdown} />
        <AnnotationsPanel jsonData={data.json} onQuoteClick={handleQuoteClick} />
      </div>
    </div>
  );
};

export default Viewer;
