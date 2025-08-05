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
          <div className="mb-6">
            <h4 className="font-medium text-base mb-3 text-primary border-b pb-1">Summary</h4>
            {typeof studyParameters.summary === 'string' ? (
              <div className="text-sm text-foreground prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.summary}</ReactMarkdown>
              </div>
            ) : Array.isArray(studyParameters.summary.content) ? (
              <div className="text-sm text-foreground space-y-3">
                {studyParameters.summary.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-foreground prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.summary.content}</ReactMarkdown>
              </div>
            )}
            {studyParameters.summary.citations && (
              <QuoteButtons quotes={studyParameters.summary.citations} onQuoteClick={onQuoteClick} />
            )}
          </div>
        )}
        {studyParameters.study_type && (
          <div className="mb-6">
            <h4 className="font-medium text-base mb-3 text-primary border-b pb-1">Study Type</h4>
            {Array.isArray(studyParameters.study_type.content) ? (
              <div className="text-sm text-foreground space-y-3">
                {studyParameters.study_type.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-foreground prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.study_type.content}</ReactMarkdown>
              </div>
            )}
            {studyParameters.study_type.explanation && (
              <p className="text-xs text-foreground mt-1 italic">{studyParameters.study_type.explanation}</p>
            )}
            <QuoteButtons quotes={studyParameters.study_type.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.participant_info && (
          <div className="mb-6">
            <h4 className="font-medium text-base mb-3 text-primary border-b pb-1">Participant Information</h4>
            {Array.isArray(studyParameters.participant_info.content) ? (
              <div className="text-sm text-foreground space-y-3">
                {studyParameters.participant_info.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-foreground prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.participant_info.content}</ReactMarkdown>
              </div>
            )}
            <QuoteButtons quotes={studyParameters.participant_info.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_design && (
          <div className="mb-6">
            <h4 className="font-medium text-base mb-3 text-primary border-b pb-1">Study Design</h4>
            {Array.isArray(studyParameters.study_design.content) ? (
              <div className="text-sm text-foreground space-y-3">
                {studyParameters.study_design.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item.replace(/\*\*([^*]+):/g, "**$1**:")}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-foreground prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.study_design.content.replace(/\*\*([^*]+):/g, "**$1**:")}</ReactMarkdown>
              </div>
            )}
            <QuoteButtons quotes={studyParameters.study_design.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_results && (
          <div className="mb-6">
            <h4 className="font-medium text-base mb-3 text-primary border-b pb-1">Study Results</h4>
            {Array.isArray(studyParameters.study_results.content) ? (
              <div className="text-sm text-foreground space-y-3">
                {studyParameters.study_results.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-foreground prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{studyParameters.study_results.content}</ReactMarkdown>
              </div>
            )}
            <QuoteButtons quotes={studyParameters.study_results.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.allele_frequency && (
          <div className="mb-6">
            <h4 className="font-medium text-base mb-3 text-primary border-b pb-1">Allele Frequency</h4>
            {Array.isArray(studyParameters.allele_frequency.content) ? (
              <div className="text-sm text-foreground space-y-3">
                {studyParameters.allele_frequency.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-foreground prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground">
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