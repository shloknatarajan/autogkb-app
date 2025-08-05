
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StudyParametersSection } from './StudyParametersSection';
import { DrugAnnotationsSection } from './DrugAnnotationsSection';
import { FunctionalAnnotationsSection } from './FunctionalAnnotationsSection';
import { PhenotypeAnnotationsSection } from './PhenotypeAnnotationsSection';
import { QuoteButtons } from './QuoteButton';

interface AnnotationsPanelProps {
  jsonData: any;
  onQuoteClick: (quote: string) => void;
}

export const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({ jsonData, onQuoteClick }) => {
  return (
    <div className="h-full">
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
                  {/* Study Parameters */}
                  <StudyParametersSection 
                    studyParameters={jsonData.study_parameters} 
                    onQuoteClick={onQuoteClick} 
                  />

                  {/* Annotations */}
                  {jsonData.annotations?.relationships && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">Found Associations</h3>
                      
                      {/* Summary Table */}
                      <div className="mb-6 overflow-x-auto">
                        <table className="w-full border-collapse border border-border rounded-lg">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="border border-border px-3 py-2 text-left text-sm font-medium">Gene</th>
                              <th className="border border-border px-3 py-2 text-left text-sm font-medium">Polymorphism</th>
                              <th className="border border-border px-3 py-2 text-left text-sm font-medium">Effect</th>
                              <th className="border border-border px-3 py-2 text-left text-sm font-medium">P-value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jsonData.annotations.relationships.map((relationship: any, index: number) => (
                              <tr key={index} className="hover:bg-muted/25">
                                <td className="border border-border px-3 py-2 text-sm font-medium text-primary">
                                  {relationship.gene}
                                </td>
                                <td className="border border-border px-3 py-2 text-sm">
                                  {relationship.polymorphism}
                                </td>
                                <td className="border border-border px-3 py-2 text-sm">
                                  {relationship.relationship_effect}
                                  {relationship.citations && relationship.citations.length > 0 && (
                                    <span className="ml-1">
                                      {relationship.citations.map((citation: string, citIndex: number) => (
                                        <button
                                          key={citIndex}
                                          onClick={() => onQuoteClick(citation)}
                                          className="text-primary hover:text-primary/80 text-xs font-medium ml-0.5"
                                        >
                                          [{citIndex + 1}]
                                        </button>
                                      ))}
                                    </span>
                                  )}
                                </td>
                                <td className="border border-border px-3 py-2 text-sm">
                                  {relationship.p_value || 'N/A'}
                                  {relationship.p_value_citations && relationship.p_value_citations.length > 0 && (
                                    <span className="ml-1">
                                      {relationship.p_value_citations.map((citation: string, citIndex: number) => (
                                        <button
                                          key={citIndex}
                                          onClick={() => onQuoteClick(citation)}
                                          className="text-primary hover:text-primary/80 text-xs font-medium ml-0.5"
                                        >
                                          [{citIndex + 1}]
                                        </button>
                                      ))}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="space-y-4">
                        {jsonData.annotations.relationships.map((relationship: any, index: number) => (
                          <div key={index} className="bg-accent/50 p-4 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                                  {relationship.gene}
                                </span>
                                <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-sm">
                                  {relationship.polymorphism}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <strong>Effect:</strong> {relationship.relationship_effect}
                              </p>
                              {relationship.p_value && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>P-value:</strong> {relationship.p_value}
                                  </p>
                                  {relationship.p_value_citations && relationship.p_value_citations.length > 0 && (
                                    <div className="mt-1">
                                      <QuoteButtons quotes={relationship.p_value_citations} onQuoteClick={onQuoteClick} />
                                    </div>
                                  )}
                                </div>
                              )}
                              {relationship.citations && relationship.citations.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium mb-1">Citations:</h5>
                                  <QuoteButtons quotes={relationship.citations} onQuoteClick={onQuoteClick} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drug Annotations */}
                  {jsonData.drug_annotations && (
                    <DrugAnnotationsSection 
                      drugAnnotations={jsonData.drug_annotations} 
                      onQuoteClick={onQuoteClick} 
                    />
                  )}

                  {/* Phenotype Annotations */}
                  {jsonData.phenotype_annotations && (
                    <PhenotypeAnnotationsSection 
                      phenotypeAnnotations={jsonData.phenotype_annotations} 
                      onQuoteClick={onQuoteClick} 
                    />
                  )}

                  {/* Functional Annotations */}
                  {jsonData.functional_annotations && (
                    <FunctionalAnnotationsSection 
                      functionalAnnotations={jsonData.functional_annotations} 
                      onQuoteClick={onQuoteClick} 
                    />
                  )}
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
