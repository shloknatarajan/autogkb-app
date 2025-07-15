import React from 'react';
import { QuoteButtons } from './QuoteButton';

interface StudyParametersProps {
  studyParameters: any;
  onQuoteClick: (quote: string) => void;
}

export const StudyParametersSection: React.FC<StudyParametersProps> = ({ studyParameters, onQuoteClick }) => {
  if (!studyParameters) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-primary">Study Parameters</h3>
      <div className="space-y-3">
        {studyParameters.summary && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Summary</h4>
            <p className="text-sm text-muted-foreground">{studyParameters.summary}</p>
          </div>
        )}
        {studyParameters.study_type && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Type</h4>
            <p className="text-sm text-muted-foreground">{studyParameters.study_type.content}</p>
            {studyParameters.study_type.explanation && (
              <p className="text-xs text-muted-foreground mt-1 italic">{studyParameters.study_type.explanation}</p>
            )}
            <QuoteButtons quotes={studyParameters.study_type.quotes} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.participant_info && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Participant Information</h4>
            <p className="text-sm text-muted-foreground">{studyParameters.participant_info.content}</p>
            <QuoteButtons quotes={studyParameters.participant_info.quotes} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_design && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Design</h4>
            <p className="text-sm text-muted-foreground">{studyParameters.study_design.content}</p>
            <QuoteButtons quotes={studyParameters.study_design.quotes} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_results && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Results</h4>
            <p className="text-sm text-muted-foreground">{studyParameters.study_results.content}</p>
            <QuoteButtons quotes={studyParameters.study_results.quotes} onQuoteClick={onQuoteClick} />
          </div>
        )}
      </div>
    </div>
  );
};