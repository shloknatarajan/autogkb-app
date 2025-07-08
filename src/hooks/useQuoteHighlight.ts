import { useState } from 'react';

export const useQuoteHighlight = () => {
  const [highlightedText, setHighlightedText] = useState<string | null>(null);

  const handleQuoteClick = (quote: string) => {
    console.log('Searching for quote:', quote);
    setHighlightedText(quote);
    
    // Find and highlight the quote in the markdown content
    setTimeout(() => {
      const markdownContainer = document.querySelector('.prose');
      console.log('Markdown container found:', !!markdownContainer);
      
      if (markdownContainer) {
        // Remove previous highlights
        const previousHighlights = markdownContainer.querySelectorAll('.quote-highlight');
        previousHighlights.forEach(el => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
            parent.normalize();
          }
        });

        // Get all text content and search for the quote
        const allText = markdownContainer.textContent || '';
        console.log('Total text length:', allText.length);
        
        // Try multiple search strategies
        let foundIndex = -1;
        let searchQuote = quote;
        
        // Strategy 1: Try exact match (case insensitive)
        foundIndex = allText.toLowerCase().indexOf(quote.toLowerCase());
        console.log('Exact match search result:', foundIndex);
        
        // Strategy 2: Try with normalized whitespace
        if (foundIndex === -1) {
          const normalizedQuote = quote.replace(/\s+/g, ' ').trim();
          const normalizedText = allText.replace(/\s+/g, ' ');
          foundIndex = normalizedText.toLowerCase().indexOf(normalizedQuote.toLowerCase());
          console.log('Normalized whitespace search result:', foundIndex);
          if (foundIndex !== -1) {
            searchQuote = normalizedQuote;
          }
        }
        
        // Strategy 3: Try with punctuation normalization
        if (foundIndex === -1) {
          const cleanQuote = quote.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').toLowerCase().trim();
          const cleanText = allText.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').toLowerCase();
          foundIndex = cleanText.indexOf(cleanQuote);
          console.log('Punctuation normalized search result:', foundIndex);
          if (foundIndex !== -1) {
            searchQuote = cleanQuote;
          }
        }
        
        // Strategy 4: Progressive word reduction for long quotes
        if (foundIndex === -1 && quote.length > 50) {
          const words = quote.split(/\s+/);
          // Try different starting and ending points
          for (let start = 0; start < Math.min(3, words.length - 5); start++) {
            for (let len = Math.max(5, Math.floor(words.length * 0.7)); len >= 5; len--) {
              const partialQuote = words.slice(start, start + len).join(' ');
              foundIndex = allText.toLowerCase().indexOf(partialQuote.toLowerCase());
              console.log(`Searching for partial quote (${len} words from ${start}):`, partialQuote.substring(0, 50) + '...');
              if (foundIndex !== -1) {
                searchQuote = partialQuote;
                break;
              }
            }
            if (foundIndex !== -1) break;
          }
        }
        
        // Strategy 5: Key phrase extraction for very long quotes
        if (foundIndex === -1 && quote.length > 100) {
          // Look for distinctive phrases or medical terms
          const distinctivePhrases = quote.match(/\b[A-Z][a-z]*(?:\s+[a-z]+)*(?:\s+[A-Z][a-z]*)*\b/g) || [];
          for (const phrase of distinctivePhrases) {
            if (phrase.length > 10) {
              foundIndex = allText.toLowerCase().indexOf(phrase.toLowerCase());
              console.log(`Searching for distinctive phrase: "${phrase}"`);
              if (foundIndex !== -1) {
                searchQuote = phrase;
                break;
              }
            }
          }
        }
        
        // Strategy 6: Single word fallback for drug names
        if (foundIndex === -1 && quote.length < 30) {
          const singleWords = quote.split(/\s+/).filter(word => word.length > 3);
          for (const word of singleWords) {
            foundIndex = allText.toLowerCase().indexOf(word.toLowerCase());
            console.log(`Searching for single word: "${word}"`);
            if (foundIndex !== -1) {
              searchQuote = word;
              break;
            }
          }
        }
        
        console.log('Final search result - Quote found at index:', foundIndex);
        
        if (foundIndex !== -1) {
          // Create a simple highlight by wrapping the text
          const range = document.createRange();
          const selection = window.getSelection();
          
          // Find text nodes that contain our quote
          const walker = document.createTreeWalker(
            markdownContainer,
            NodeFilter.SHOW_TEXT,
            null
          );

          let currentIndex = 0;
          let node;
          let foundNode = null;
          let nodeStartIndex = 0;

          while (node = walker.nextNode()) {
            const nodeText = node.textContent || '';
            const nodeLength = nodeText.length;
            
            if (currentIndex <= foundIndex && currentIndex + nodeLength > foundIndex) {
              foundNode = node;
              nodeStartIndex = foundIndex - currentIndex;
              break;
            }
            currentIndex += nodeLength;
          }

          if (foundNode) {
            console.log('Found text node, highlighting...');
            
            // Create underline span
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'quote-highlight';
            highlightSpan.style.textDecoration = 'underline';
            highlightSpan.style.textDecorationColor = '#ef4444'; // red-500
            highlightSpan.style.textDecorationThickness = '2px';
            highlightSpan.style.textUnderlineOffset = '2px';
            
            // Find word boundaries for proper highlighting
            const originalText = foundNode.textContent || '';
            let startIndex = Math.max(0, nodeStartIndex);
            let endIndex = Math.min(originalText.length, nodeStartIndex + searchQuote.length);
            
            // Adjust start to word boundary
            while (startIndex > 0 && /\w/.test(originalText[startIndex - 1])) {
              startIndex--;
            }
            
            // Adjust end to word boundary
            while (endIndex < originalText.length && /\w/.test(originalText[endIndex])) {
              endIndex++;
            }
            
            const beforeText = originalText.substring(0, startIndex);
            const highlightText = originalText.substring(startIndex, endIndex);
            const afterText = originalText.substring(endIndex);
            
            highlightSpan.textContent = highlightText;
            
            const parentNode = foundNode.parentNode;
            if (parentNode) {
              if (beforeText) {
                parentNode.insertBefore(document.createTextNode(beforeText), foundNode);
              }
              parentNode.insertBefore(highlightSpan, foundNode);
              if (afterText) {
                parentNode.insertBefore(document.createTextNode(afterText), foundNode);
              }
              parentNode.removeChild(foundNode);
              
              // Scroll to the highlighted text
              highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
              console.log('Scrolled to highlighted text');
            }
          } else {
            console.log('Could not find text node containing the quote');
          }
        } else {
          console.log('Quote not found in text content');
          // Show a toast notification that the quote wasn't found
          console.warn('Quote not found in the document');
        }
      }
    }, 200);
  };

  return { highlightedText, handleQuoteClick };
};