import React from 'react';
import { QuoteButton } from './QuoteButton';

interface FunctionalAnnotationsSectionProps {
  functionalAnnotations: any[];
  onQuoteClick: (quote: string) => void;
}

export const FunctionalAnnotationsSection: React.FC<FunctionalAnnotationsSectionProps> = ({ functionalAnnotations, onQuoteClick }) => {
  if (!functionalAnnotations || functionalAnnotations.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-primary">Functional Annotations</h3>
      {functionalAnnotations.map((annotation: any, index: number) => (
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
            {annotation.assay_type?.content && (
              <p><span className="font-medium">Assay Type:</span> {annotation.assay_type.content}</p>
            )}
            {annotation.cell_type?.content && annotation.cell_type.content !== "Not specified" && (
              <p><span className="font-medium">Cell Type:</span> {annotation.cell_type.content}</p>
            )}
            {annotation.specialty_populations?.content && annotation.specialty_populations.content !== "Not specified" && (
              <p><span className="font-medium">Specialty Populations:</span> {annotation.specialty_populations.content}</p>
            )}
            {annotation.notes && (
              <p><span className="font-medium">Notes:</span> {annotation.notes}</p>
            )}
          </div>
          {/* Quote buttons with proper sequential numbering */}
          {(annotation.associated_drugs?.quotes || annotation.association_significance?.quotes) && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {/* First show associated_drugs quotes */}
                {annotation.associated_drugs?.quotes?.map((quote: string, quoteIndex: number) => (
                  <QuoteButton
                    key={`drugs-${quoteIndex}`}
                    quote={quote}
                    index={quoteIndex}
                    onClick={onQuoteClick}
                  />
                ))}
                {/* Then show association_significance quotes with continued numbering */}
                {annotation.association_significance?.quotes?.map((quote: string, quoteIndex: number) => (
                  <QuoteButton
                    key={`significance-${quoteIndex}`}
                    quote={quote}
                    index={(annotation.associated_drugs?.quotes?.length || 0) + quoteIndex}
                    onClick={onQuoteClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};