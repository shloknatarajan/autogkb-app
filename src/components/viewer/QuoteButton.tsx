import React from 'react';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';

interface QuoteButtonProps {
  quote: string;
  index: number;
  onClick: (quote: string) => void;
}

export const QuoteButton: React.FC<QuoteButtonProps> = ({ quote, index, onClick }) => {
  const truncatedQuote = quote.length > 60 ? quote.substring(0, 60) + '...' : quote;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onClick(quote)}
      className="h-auto px-2 py-1 text-xs hover:bg-primary/10 justify-start text-left whitespace-normal"
    >
      <div className="flex items-start gap-1">
        <span className="font-medium text-primary">[{index + 1}]</span>
        <span className="italic text-muted-foreground">{truncatedQuote}</span>
      </div>
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
    <div className="space-y-1 mt-2">
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