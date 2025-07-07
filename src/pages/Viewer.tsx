import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';

interface ViewerData {
  markdown: string;
  json: any;
}

const Viewer = () => {
  const { pmcid } = useParams<{ pmcid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ViewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!pmcid) {
        setError('No PMCID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load both markdown and JSON files from the correct paths
        const [markdownResponse, jsonResponse] = await Promise.all([
          fetch(`/data/markdown/${pmcid}.md`),
          fetch(`/data/annotations/${pmcid}.json`)
        ]);

        if (!markdownResponse.ok || !jsonResponse.ok) {
          throw new Error(`Files not found for PMCID: ${pmcid}`);
        }

        const [markdownText, jsonData] = await Promise.all([
          markdownResponse.text(),
          jsonResponse.json()
        ]);

        setData({
          markdown: markdownText,
          json: jsonData
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setError(`Failed to load data for PMCID: ${pmcid}. Please ensure both markdown and JSON files exist in the correct directories.`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pmcid]);

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
      <header className="bg-card shadow-soft border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-accent transition-smooth"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">PMC</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">{pmcid}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Markdown Content */}
        <div className="flex-1 border-r">
          <Card className="h-full rounded-none border-0 shadow-none">
            <CardHeader className="bg-gradient-secondary border-b">
              <CardTitle className="text-lg">Research Paper Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-6 prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-primary prose-p:leading-relaxed">
                  <ReactMarkdown>
                    {data.markdown}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - JSON Data */}
        <div className="w-1/2">
          <Card className="h-full rounded-none border-0 shadow-none">
            <CardHeader className="bg-gradient-secondary border-b">
              <CardTitle className="text-lg">Structured Data</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <Tabs defaultValue="formatted" className="h-full">
                <div className="border-b px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                    <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="formatted" className="mt-0 h-full">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="p-6 space-y-6">
                      {/* Title */}
                      {data.json.title && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-primary">Study Title</h3>
                          <div className="bg-accent/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">{data.json.title}</p>
                          </div>
                        </div>
                      )}

                      {/* Study Parameters */}
                      {data.json.study_parameters && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-primary">Study Parameters</h3>
                          <div className="space-y-3">
                            {data.json.study_parameters.summary && (
                              <div className="bg-accent/50 p-3 rounded-lg">
                                <h4 className="font-medium text-sm text-accent-foreground mb-1">Summary</h4>
                                <p className="text-sm text-muted-foreground">{data.json.study_parameters.summary}</p>
                              </div>
                            )}
                            {data.json.study_parameters.study_type && (
                              <div className="bg-accent/50 p-3 rounded-lg">
                                <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Type</h4>
                                <p className="text-sm text-muted-foreground">{data.json.study_parameters.study_type.content}</p>
                                {data.json.study_parameters.study_type.explanation && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">{data.json.study_parameters.study_type.explanation}</p>
                                )}
                              </div>
                            )}
                            {data.json.study_parameters.participant_info && (
                              <div className="bg-accent/50 p-3 rounded-lg">
                                <h4 className="font-medium text-sm text-accent-foreground mb-1">Participant Information</h4>
                                <p className="text-sm text-muted-foreground">{data.json.study_parameters.participant_info.content}</p>
                              </div>
                            )}
                            {data.json.study_parameters.study_design && (
                              <div className="bg-accent/50 p-3 rounded-lg">
                                <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Design</h4>
                                <p className="text-sm text-muted-foreground">{data.json.study_parameters.study_design.content}</p>
                              </div>
                            )}
                            {data.json.study_parameters.study_results && (
                              <div className="bg-accent/50 p-3 rounded-lg">
                                <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Results</h4>
                                <p className="text-sm text-muted-foreground">{data.json.study_parameters.study_results.content}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Drug Annotations */}
                      {data.json.drug_annotations && data.json.drug_annotations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-primary">Drug Annotations</h3>
                          {data.json.drug_annotations.map((annotation: any, index: number) => (
                            <div key={index} className="bg-accent/50 p-3 rounded-lg mb-3">
                              <h4 className="font-medium text-sm text-accent-foreground mb-2">Annotation {index + 1}</h4>
                              <div className="space-y-1 text-sm">
                                {annotation.sentence_summary && (
                                  <p><span className="font-medium">Summary:</span> {annotation.sentence_summary}</p>
                                )}
                                {annotation.associated_drugs?.contents && (
                                  <p><span className="font-medium">Associated Drugs:</span> {annotation.associated_drugs.contents.join(', ')}</p>
                                )}
                                {annotation.association_significance?.content && (
                                  <p><span className="font-medium">Significance:</span> {annotation.association_significance.content}</p>
                                )}
                                {annotation.notes && (
                                  <p><span className="font-medium">Notes:</span> {annotation.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Phenotype Annotations */}
                      {data.json.phenotype_annotations && data.json.phenotype_annotations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-primary">Phenotype Annotations</h3>
                          {data.json.phenotype_annotations.map((annotation: any, index: number) => (
                            <div key={index} className="bg-accent/50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-muted-foreground">{JSON.stringify(annotation, null, 2)}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Functional Annotations */}
                      {data.json.functional_annotations && data.json.functional_annotations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-primary">Functional Annotations</h3>
                          {data.json.functional_annotations.map((annotation: any, index: number) => (
                            <div key={index} className="bg-accent/50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-muted-foreground">{JSON.stringify(annotation, null, 2)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="raw" className="mt-0 h-full">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="p-6">
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(data.json, null, 2)}
                      </pre>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Viewer;