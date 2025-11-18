
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HyperlinkedText } from '@/components/ui/hyperlinked-text';
import { StudyParametersSection } from './StudyParametersSection';
import { DrugAnnotationsSection } from './DrugAnnotationsSection';
import { FunctionalAnnotationsSection } from './FunctionalAnnotationsSection';
import { PhenotypeAnnotationsSection } from './PhenotypeAnnotationsSection';
import { QuoteButtons } from './QuoteButton';
import { CollapsibleCitations } from './CollapsibleCitations';

interface AnnotationsPanelProps {
  jsonData: any;
  onQuoteClick: (quote: string) => void;
}

export const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({ jsonData, onQuoteClick }) => {
  const [expandedAssociations, setExpandedAssociations] = useState<Set<number>>(new Set());
  return (
    <Card className="h-full rounded-none border-0 shadow-none flex flex-col">
      <CardHeader className="bg-gradient-secondary border-b flex-shrink-0">
        <CardTitle className="text-lg">Structured Data</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="formatted" className="w-full flex flex-col h-full">
          <div className="border-b px-6 pt-4 flex-shrink-0 bg-background">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formatted">Formatted View</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="formatted" className="mt-0 flex-1 min-h-0">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="p-6 space-y-4">
                {/* Summary Section */}
                {jsonData.summary && (
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-black mb-3">Summary</h3>
                    {typeof jsonData.summary === 'string' ? (
                      <p className="text-sm text-foreground">{jsonData.summary}</p>
                    ) : (
                      <>
                        <p className="text-sm text-foreground">{jsonData.summary.content}</p>
                        {jsonData.summary.citations && (
                          <CollapsibleCitations 
                            citations={jsonData.summary.citations} 
                            onQuoteClick={onQuoteClick} 
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Header with Study Parameters and Found Associations button */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-2xl font-semibold text-black">Study Parameters</h3>
                  {jsonData.annotations?.relationships && (
                    <button
                      onClick={() => {
                        const foundAssociationsElement = document.getElementById('found-associations-section');
                        if (foundAssociationsElement) {
                          foundAssociationsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      Found Associations
                    </button>
                  )}
                </div>
                
                {/* Study Parameters Content */}
                <div>
                  <StudyParametersSection 
                    studyParameters={jsonData.study_parameters} 
                  />
                </div>

                {/* Annotations */}
                {jsonData.annotations?.relationships && (
                  <div id="found-associations-section">
                    <h3 className="text-2xl font-semibold mb-2 text-black">Found Associations</h3>
                    
                    {/* Summary Table */}
                    <div className="mb-6 overflow-x-auto">
                      <table className="w-full border-collapse border border-border rounded-lg">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="border border-border px-3 py-2 text-left text-sm font-medium">Gene</th>
                            <th className="border border-border px-3 py-2 text-left text-sm font-medium">Polymorphism</th>
                            <th className="border border-border px-3 py-2 text-left text-sm font-medium">Drug</th>
                            <th className="border border-border px-3 py-2 text-left text-sm font-medium">Effect</th>
                            <th className="border border-border px-3 py-2 text-left text-sm font-medium">P-value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jsonData.annotations.relationships.map((relationship: any, index: number) => (
                            <tr key={index} className="hover:bg-muted/25">
                              <td className="border border-border px-3 py-2 text-sm font-medium">
                                {relationship.gene}
                              </td>
                              <td className="border border-border px-3 py-2 text-sm">
                                <HyperlinkedText item={relationship.polymorphism} />
                              </td>
                              <td className="border border-border px-3 py-2 text-sm">
                                {relationship.drug ? <HyperlinkedText item={relationship.drug} /> : 'N/A'}
                              </td>
                              <td className="border border-border px-3 py-2 text-sm">
                                {relationship.relationship_effect}
                                {relationship.citations && relationship.citations.length > 0 && (
                                  <CollapsibleCitations 
                                    citations={relationship.citations} 
                                    onQuoteClick={onQuoteClick} 
                                    inline={true}
                                  />
                                )}
                              </td>
                              <td className="border border-border px-3 py-2 text-sm">
                                {relationship.p_value || 'N/A'}
                                {relationship.p_value_citations && relationship.p_value_citations.length > 0 && (
                                  <CollapsibleCitations 
                                    citations={relationship.p_value_citations} 
                                    onQuoteClick={onQuoteClick} 
                                    inline={true}
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-4">
                      {jsonData.annotations.relationships.map((relationship: any, index: number) => {
                        const isExpanded = expandedAssociations.has(index);
                        
                        return (
                          <Collapsible 
                            key={index} 
                            open={isExpanded} 
                            onOpenChange={(open) => {
                              const newExpanded = new Set(expandedAssociations);
                              if (open) {
                                newExpanded.add(index);
                              } else {
                                newExpanded.delete(index);
                              }
                              setExpandedAssociations(newExpanded);
                            }}
                          >
                            <CollapsibleTrigger asChild>
                              <h4 className="font-medium text-base mb-2 border-b pb-1 cursor-pointer hover:text-black transition-colors flex items-center gap-2">
                                <ChevronRight 
                                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                />
                                {relationship.gene} {typeof relationship.polymorphism === 'string' ? relationship.polymorphism : relationship.polymorphism?.value || relationship.polymorphism}
                              </h4>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-sm font-medium">
                                    {relationship.gene}
                                  </span>
                                  <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-sm">
                                    <HyperlinkedText item={relationship.polymorphism} />
                                  </span>
                                  {relationship.drug && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                      <HyperlinkedText item={relationship.drug} />
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-black">
                                  <strong>Effect:</strong> {relationship.relationship_effect}
                                </p>
                                {relationship.p_value && (
                                  <div>
                                    <p className="text-sm text-black">
                                      <strong>P-value:</strong> {relationship.p_value}
                                      {relationship.p_value_citations && relationship.p_value_citations.length > 0 && (
                                        <span className="ml-2">
                                          <CollapsibleCitations 
                                            citations={relationship.p_value_citations} 
                                            onQuoteClick={onQuoteClick} 
                                            inline={true}
                                          />
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                                {relationship.citations && relationship.citations.length > 0 && (
                                  <div>
                                    <CollapsibleCitations 
                                      citations={relationship.citations} 
                                      onQuoteClick={onQuoteClick}
                                    />
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Drug Annotations */}
                {jsonData.var_drug_ann && (
                  <DrugAnnotationsSection 
                    drugAnnotations={jsonData.var_drug_ann} 
                  />
                )}

                {/* Phenotype Annotations */}
                {jsonData.var_pheno_ann && (
                  <PhenotypeAnnotationsSection 
                    phenotypeAnnotations={jsonData.var_pheno_ann} 
                  />
                )}

                {/* Functional Annotations */}
                {jsonData.var_fa_ann && (
                  <FunctionalAnnotationsSection 
                    functionalAnnotations={jsonData.var_fa_ann} 
                  />
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-0 flex-1 min-h-0">
            <ScrollArea className="h-[calc(100vh-8rem)]">
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
  );
};
