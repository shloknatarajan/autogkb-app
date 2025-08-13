import React from 'react';
import ReactMarkdown from 'react-markdown';
import { QuoteButtons } from './QuoteButton';
import { CollapsibleCitations } from './CollapsibleCitations';

interface StudyParametersProps {
  studyParameters: any;
  onQuoteClick: (quote: string) => void;
}

export const StudyParametersSection: React.FC<StudyParametersProps> = ({ studyParameters, onQuoteClick }) => {
  if (!studyParameters) return null;

  return (
    <div>
      <div className="space-y-4">
        {studyParameters.summary && (
          <div className="mb-4">
            <h4 className="font-medium text-2xl mb-2 text-black pb-1">Summary</h4>
            {typeof studyParameters.summary === 'string' ? (
              <div className="text-sm text-black prose prose-sm max-w-none prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>{studyParameters.summary}</ReactMarkdown>
              </div>
            ) : Array.isArray(studyParameters.summary.content) ? (
              <div className="text-sm text-black space-y-1">
                {studyParameters.summary.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-black prose-strong:text-black prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-black prose prose-sm max-w-none prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>{studyParameters.summary.content}</ReactMarkdown>
              </div>
            )}
            {studyParameters.summary.citations && (
              <CollapsibleCitations citations={studyParameters.summary.citations} onQuoteClick={onQuoteClick} />
            )}
          </div>
        )}
        {studyParameters.study_type && (
          <div className="mb-4">
            <h4 className="font-medium text-2xl mb-2 text-black pb-1">Study Type</h4>
            {Array.isArray(studyParameters.study_type.content) ? (
              <div className="text-sm text-black">
                {studyParameters.study_type.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-black prose-strong:text-black prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-black prose prose-sm max-w-none prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>{studyParameters.study_type.content}</ReactMarkdown>
              </div>
            )}
            {studyParameters.study_type.explanation && (
              <p className="text-xs text-black mt-1 italic">{studyParameters.study_type.explanation}</p>
            )}
            <CollapsibleCitations citations={studyParameters.study_type.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.participant_info && (
          <div className="mb-4">
            <h4 className="font-medium text-2xl mb-2 text-black pb-1">Participant Information</h4>
            {Array.isArray(studyParameters.participant_info.content) ? (
              <div className="text-sm text-black">
                {studyParameters.participant_info.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-black prose-strong:text-black prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-black prose prose-sm max-w-none prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>{studyParameters.participant_info.content}</ReactMarkdown>
              </div>
            )}
            <CollapsibleCitations citations={studyParameters.participant_info.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_design && (
          <div className="mb-4">
            <h4 className="font-medium font-oracle text-2xl mb-1 text-black pb-1">Study Design</h4>
            {Array.isArray(studyParameters.study_design.content) ? (
              <div className="text-sm text-black">
                {studyParameters.study_design.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-foreground prose-strong:text-foreground prose-p:inline">
                      <ReactMarkdown>{item.replace(/\*\*([^*]+):/g, "**$1**:")}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-black prose prose-sm max-w-none prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>{studyParameters.study_design.content.replace(/\*\*([^*]+):/g, "**$1**:")}</ReactMarkdown>
              </div>
            )}
            <CollapsibleCitations citations={studyParameters.study_design.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.study_results && (
          <div className="mb-4">
            <h4 className="font-medium text-2xl mb-2 text-black pb-1">Study Results</h4>
            {Array.isArray(studyParameters.study_results.content) ? (
              <div className="text-sm text-black space-y-1">
                {studyParameters.study_results.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-black prose-strong:text-black prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-black prose prose-sm max-w-none prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>{studyParameters.study_results.content}</ReactMarkdown>
              </div>
            )}
            <CollapsibleCitations citations={studyParameters.study_results.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
        {studyParameters.allele_frequency && (
          <div className="mb-4">
            <h4 className="font-medium text-2xl mb-2 text-black pb-1">Allele Frequency</h4>
            {Array.isArray(studyParameters.allele_frequency.content) ? (
              <div className="text-sm text-black space-y-1">
                {studyParameters.allele_frequency.content.map((item: string, index: number) => (
                  <div key={index}>
                    <div className="prose prose-sm max-w-none prose-p:text-black prose-strong:text-black prose-p:inline">
                      <ReactMarkdown>{item}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-black prose prose-sm max-w-none prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>{studyParameters.allele_frequency.content}</ReactMarkdown>
              </div>
            )}
            <CollapsibleCitations citations={studyParameters.allele_frequency.citations} onQuoteClick={onQuoteClick} />
          </div>
        )}
      </div>
    </div>
  );
};