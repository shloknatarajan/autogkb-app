import React from 'react';
import ReactMarkdown from 'react-markdown';
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
            {typeof studyParameters.summary === 'string' ? (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.summary}</ReactMarkdown>
              </div>
            ) : Array.isArray(studyParameters.summary.content) ? (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {studyParameters.summary.content.map((item: string, index: number) => (
                  <li key={index}>
                    <div className="inline prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.summary.content}</ReactMarkdown>
              </div>
            )}
            {studyParameters.summary.citations && (
              <QuoteButtons quotes={studyParameters.summary.citations} onQuoteClick={onQuoteClick} />
            )}
          </div>
        )}
        {studyParameters.study_type && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Type</h4>
            {Array.isArray(studyParameters.study_type.content) ? (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {studyParameters.study_type.content.map((item: string, index: number) => (
                  <li key={index}>
                    <div className="inline prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.study_type.content}</ReactMarkdown>
              </div>
            )}
            {studyParameters.study_type.explanation && (
              <p className="text-xs text-muted-foreground mt-1 italic">{studyParameters.study_type.explanation}</p>
            )}
            <QuoteButtons quotes={studyParameters.study_type.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.participant_info && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Participant Information</h4>
            {Array.isArray(studyParameters.participant_info.content) ? (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {studyParameters.participant_info.content.map((item: string, index: number) => (
                  <li key={index}>
                    <div className="inline prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.participant_info.content}</ReactMarkdown>
              </div>
            )}
            <QuoteButtons quotes={studyParameters.participant_info.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_design && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Design</h4>
            {Array.isArray(studyParameters.study_design.content) ? (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {studyParameters.study_design.content.map((item: string, index: number) => (
                  <li key={index}>
                    <div className="inline prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item.replace(/\*\*([^*]+):/g, '**$1**:')}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.study_design.content.replace(/\*\*([^*]+):/g, '**$1**:')}</ReactMarkdown>
              </div>
            )}
            <QuoteButtons quotes={studyParameters.study_design.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_results && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Results</h4>
            {Array.isArray(studyParameters.study_results.content) ? (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {studyParameters.study_results.content.map((item: string, index: number) => (
                  <li key={index}>
                    <div className="inline prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.study_results.content}</ReactMarkdown>
              </div>
            )}
            <QuoteButtons quotes={studyParameters.study_results.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.allele_frequency && (
          <div className="bg-accent/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-accent-foreground mb-1">Allele Frequency</h4>
            {Array.isArray(studyParameters.allele_frequency.content) ? (
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {studyParameters.allele_frequency.content.map((item: string, index: number) => (
                  <li key={index}>
                    <div className="inline prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.allele_frequency.content}</ReactMarkdown>
              </div>
            )}
            <QuoteButtons quotes={studyParameters.allele_frequency.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
      </div>
    </div>
  );
};