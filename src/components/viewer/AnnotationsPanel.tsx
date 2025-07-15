import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StudyParametersSection } from './StudyParametersSection';
import { DrugAnnotationsSection } from './DrugAnnotationsSection';
import { FunctionalAnnotationsSection } from './FunctionalAnnotationsSection';
import { PhenotypeAnnotationsSection } from './PhenotypeAnnotationsSection';

interface AnnotationsPanelProps {
  jsonData: any;
  onQuoteClick: (quote: string) => void;
}

export const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({ jsonData, onQuoteClick }) => {
  return (
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
                  {jsonData.title && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">Study Title</h3>
                      <div className="bg-accent/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">{jsonData.title}</p>
                      </div>
                    </div>
                  )}

                  {/* Study Parameters */}
                  <StudyParametersSection 
                    studyParameters={jsonData.study_parameters} 
                    onQuoteClick={onQuoteClick} 
                  />

                  {/* Drug Annotations */}
                  <DrugAnnotationsSection 
                    drugAnnotations={jsonData.drug_annotations} 
                    onQuoteClick={onQuoteClick} 
                  />

                  {/* Phenotype Annotations */}
                  <PhenotypeAnnotationsSection 
                    phenotypeAnnotations={jsonData.phenotype_annotations} 
                    onQuoteClick={onQuoteClick} 
                  />

                  {/* Functional Annotations */}
                  <FunctionalAnnotationsSection 
                    functionalAnnotations={jsonData.functional_annotations} 
                    onQuoteClick={onQuoteClick} 
                  />
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="raw" className="mt-0 h-full">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="p-6">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(jsonData, null, 2)}
                  </pre>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};