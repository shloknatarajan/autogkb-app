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
        let allText = markdownContainer.textContent || '';
        
        // Clean up markdown processing artifacts
        allText = allText.replace(/\*P\*P/g, '*P*'); // Fix duplicate P in p-values
        allText = allText.replace(/\*([^*]+)\*\1/g, '*$1'); // Fix general duplicates
        
        console.log('Total text length:', allText.length);
        
        // Try multiple search strategies
        let foundIndex = -1;
        let searchQuote = quote;
        
        // Strategy 1: Try exact match (case insensitive)
        foundIndex = allText.toLowerCase().indexOf(quote.toLowerCase());
        console.log('Exact match search result:', foundIndex);
        
        // Strategy 2: Remove ellipsis and try again
        if (foundIndex === -1) {
          const quoteTrimmed = quote.replace(/\.{3,}$/, '').trim();
          if (quoteTrimmed !== quote) {
            foundIndex = allText.toLowerCase().indexOf(quoteTrimmed.toLowerCase());
            console.log('Ellipsis removed search result:', foundIndex);
            if (foundIndex !== -1) {
              searchQuote = quoteTrimmed;
            }
          }
        }
        
        // Strategy 3: Normalize P-values and statistical notation
        if (foundIndex === -1) {
          let normalizedQuote = quote.toLowerCase();
          let normalizedText = allText.toLowerCase();
          
          // Handle p-value variations
          normalizedQuote = normalizedQuote.replace(/\bp\s*<\s*0\.(\d+)/g, 'p < .$1');
          normalizedQuote = normalizedQuote.replace(/\bp\s*<\s*\.(\d+)/g, 'p < .$1');
          normalizedText = normalizedText.replace(/\*?p\*?\s*<\s*0\.(\d+)/g, 'p < .$1');
          normalizedText = normalizedText.replace(/\*?p\*?\s*<\s*\.(\d+)/g, 'p < .$1');
          
          foundIndex = normalizedText.indexOf(normalizedQuote);
          console.log('P-value normalized search result:', foundIndex);
          if (foundIndex !== -1) {
            searchQuote = normalizedQuote;
          }
        }
        
        // Strategy 4: Try with normalized whitespace
        if (foundIndex === -1) {
          const normalizedQuote = quote.replace(/\s+/g, ' ').trim();
          const normalizedText = allText.replace(/\s+/g, ' ');
          foundIndex = normalizedText.toLowerCase().indexOf(normalizedQuote.toLowerCase());
          console.log('Normalized whitespace search result:', foundIndex);
          if (foundIndex !== -1) {
            searchQuote = normalizedQuote;
          }
        }
        
        // Strategy 5: Try with selective punctuation normalization (preserve important scientific notation)
        if (foundIndex === -1) {
          // Only remove common punctuation but preserve scientific notation
          const cleanQuote = quote.replace(/[,;:""'']/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
          const cleanText = allText.replace(/[,;:""'']/g, '').replace(/\s+/g, ' ').toLowerCase();
          foundIndex = cleanText.indexOf(cleanQuote);
          console.log('Selective punctuation normalized search result:', foundIndex);
          if (foundIndex !== -1) {
            searchQuote = cleanQuote;
          }
        }
        
        // Strategy 6: Medical term and genetic marker search
        if (foundIndex === -1) {
          // Look for genetic markers, drug names, and medical terms
          const medicalTerms = quote.match(/\b(?:rs\d+|HbA1c|DPP4|T2DM|sitagliptin|gliclazide|genotype|allele|SNP|mg\/dL|mmol\/L)\b/gi) || [];
          for (const term of medicalTerms) {
            foundIndex = allText.toLowerCase().indexOf(term.toLowerCase());
            console.log(`Searching for medical term: "${term}"`);
            if (foundIndex !== -1) {
              searchQuote = term;
              break;
            }
          }
        }
        
        // Strategy 7: Progressive word reduction for long quotes (improved)
        if (foundIndex === -1 && quote.length > 50) {
          const words = quote.replace(/\.{3,}$/, '').split(/\s+/);
          // Try different starting and ending points, prioritizing middle content
          for (let start = 0; start < Math.min(2, words.length - 8); start++) {
            for (let len = Math.max(8, Math.floor(words.length * 0.8)); len >= 8; len--) {
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
        
        // Strategy 8: Key phrase extraction with medical context
        if (foundIndex === -1 && quote.length > 80) {
          // Look for distinctive medical phrases
          const medicalPhrases = quote.match(/\b(?:randomized|controlled|trial|patients|treatment|efficacy|significant|association|genotype|phenotype|clinical|study|analysis|results|conclusion)\s+[a-z]+(?:\s+[a-z]+){1,4}/gi) || [];
          for (const phrase of medicalPhrases) {
            if (phrase.length > 15) {
              foundIndex = allText.toLowerCase().indexOf(phrase.toLowerCase());
              console.log(`Searching for medical phrase: "${phrase}"`);
              if (foundIndex !== -1) {
                searchQuote = phrase;
                break;
              }
            }
          }
        }
        
        // Strategy 9: Fuzzy matching for drug names and short quotes
        if (foundIndex === -1 && quote.length < 50) {
          const importantWords = quote.split(/\s+/).filter(word => 
            word.length > 4 && 
            !/^(the|and|for|with|from|this|that|were|was|are|is|of|to|in|on|at|by|an|a)$/i.test(word)
          );
          for (const word of importantWords) {
            foundIndex = allText.toLowerCase().indexOf(word.toLowerCase());
            console.log(`Searching for important word: "${word}"`);
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
            
            // For medical terms and genetic markers, be more precise with boundaries
            if (searchQuote.match(/\b(?:rs\d+|HbA1c|DPP4|T2DM|sitagliptin|gliclazide|genotype|allele|SNP|mg\/dL|mmol\/L)\b/i)) {
              // Use exact boundaries for medical terms
              const termMatch = originalText.toLowerCase().indexOf(searchQuote.toLowerCase());
              if (termMatch !== -1) {
                startIndex = termMatch;
                endIndex = termMatch + searchQuote.length;
              }
            } else {
              // Adjust start to word boundary for regular text
              while (startIndex > 0 && /\w/.test(originalText[startIndex - 1])) {
                startIndex--;
              }
              
              // Adjust end to word boundary for regular text
              while (endIndex < originalText.length && /\w/.test(originalText[endIndex])) {
                endIndex++;
              }
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