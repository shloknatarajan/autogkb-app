import React from 'react';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';

interface QuoteButtonProps {
  quote: string;
  index: number;
  onClick: (quote: string) => void;
}

export const QuoteButton: React.FC<QuoteButtonProps> = ({ quote, index, onClick }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClick(quote)}
      className="h-6 px-2 text-xs hover:bg-primary/10"
    >
      <Quote className="w-3 h-3 mr-1" />
      Quote {index + 1}
    </Button>
  );
};

interface QuoteButtonsProps {
  quotes?: string[];
  onQuoteClick: (quote: string) => void;
}

export const QuoteButtons: React.FC<QuoteButtonsProps> = ({ quotes, onQuoteClick }) => {
  if (!quotes || quotes.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {quotes.map((quote, index) => (
        <QuoteButton
          key={index}
          quote={quote}
          index={index}
          onClick={onQuoteClick}
        />
      ))}
    </div>
  );
};