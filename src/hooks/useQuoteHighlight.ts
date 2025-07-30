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
          if (el.tagName.toLowerCase() === 'span') {
            // Text highlight - replace with text content
            const parent = el.parentNode;
            if (parent) {
              parent.replaceChild(document.createTextNode(el.textContent || ''), el);
              parent.normalize();
            }
          } else {
            // Image or other element highlight - remove styles
            const htmlEl = el as HTMLElement;
            htmlEl.style.outline = '';
            htmlEl.style.borderRadius = '';
            htmlEl.style.padding = '';
            htmlEl.style.backgroundColor = '';
            htmlEl.classList.remove('quote-highlight');
          }
        });

        // Get all text content including image alt text and figure captions
        let allText = '';
        
        // Strategy: Collect text from multiple sources
        const textSources = [
          markdownContainer.textContent || '', // Regular text content
          // Image alt texts
          ...Array.from(markdownContainer.querySelectorAll('img')).map(img => img.alt || ''),
          // Figure captions
          ...Array.from(markdownContainer.querySelectorAll('figcaption')).map(cap => cap.textContent || ''),
          // Link texts (for figure references)
          ...Array.from(markdownContainer.querySelectorAll('a')).map(link => link.textContent || ''),
          // Any elements with data-figure or similar attributes
          ...Array.from(markdownContainer.querySelectorAll('[data-figure], [title]')).map(el => 
            (el.getAttribute('data-figure') || el.getAttribute('title') || ''))
        ];
        
        allText = textSources.join(' ');
        
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
        
        // Strategy 2: Handle ellipsis within quotes
        if (foundIndex === -1 && quote.includes('...')) {
          // Split on ellipsis and search for the parts
          const parts = quote.split(/\.{3,}/);
          if (parts.length >= 2) {
            const firstPart = parts[0].trim();
            const lastPart = parts[parts.length - 1].trim();
            
            // Search for the first substantial part (at least 20 characters)
            if (firstPart.length >= 20) {
              foundIndex = allText.toLowerCase().indexOf(firstPart.toLowerCase());
              console.log('First part search result:', foundIndex);
              if (foundIndex !== -1) {
                searchQuote = firstPart;
              }
            }
            
            // If first part not found, try the last part
            if (foundIndex === -1 && lastPart.length >= 20) {
              foundIndex = allText.toLowerCase().indexOf(lastPart.toLowerCase());
              console.log('Last part search result:', foundIndex);
              if (foundIndex !== -1) {
                searchQuote = lastPart;
              }
            }
          }
        }
        
        // Strategy 3: Remove ellipsis at the end and try again
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
        
        // Strategy 4: Normalize P-values and statistical notation
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
        
        // Strategy 5: Try with normalized whitespace
        if (foundIndex === -1) {
          const normalizedQuote = quote.replace(/\s+/g, ' ').trim();
          const normalizedText = allText.replace(/\s+/g, ' ');
          foundIndex = normalizedText.toLowerCase().indexOf(normalizedQuote.toLowerCase());
          console.log('Normalized whitespace search result:', foundIndex);
          if (foundIndex !== -1) {
            searchQuote = normalizedQuote;
          }
        }
        
        // Strategy 6: Try with selective punctuation normalization (preserve important scientific notation)
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
        
        // Strategy 7: Medical term and genetic marker search
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
        
        // Strategy 8: Progressive word reduction for long quotes (improved)
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
        
        // Strategy 9: Key phrase extraction with medical context
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
        
        // Strategy 10: Fuzzy matching for drug names and short quotes
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
        
        // Strategy 11: Figure and Image reference search
        if (foundIndex === -1) {
          // Look for figure/image references like "Fig 1", "Figure 1", "Manhattan plot", etc.
          const figurePatterns = [
            /fig(?:ure)?\s*\d+/gi,
            /manhattan\s+plot/gi,
            /scatter\s+plot/gi,
            /bar\s+chart/gi,
            /graph/gi,
            /image\s*\d*/gi,
            /table\s*\d+/gi
          ];
          
          for (const pattern of figurePatterns) {
            const matches = quote.match(pattern);
            if (matches) {
              for (const match of matches) {
                foundIndex = allText.toLowerCase().indexOf(match.toLowerCase());
                console.log(`Searching for figure reference: "${match}"`);
                if (foundIndex !== -1) {
                  searchQuote = match;
                  break;
                }
              }
              if (foundIndex !== -1) break;
            }
          }
        }
        
        console.log('Final search result - Quote found at index:', foundIndex);
        
        if (foundIndex !== -1) {
          // Check if we're looking for a figure/image reference first
          const isFigureReference = /fig(?:ure)?\s*\d+|manhattan\s+plot|scatter\s+plot|bar\s+chart|graph|image|table\s*\d+/gi.test(searchQuote);
          
          if (isFigureReference) {
            // Special handling for figures and images
            console.log('Detected figure/image reference, searching for visual elements...');
            
            // Look for images with matching alt text or nearby text
            const images = markdownContainer.querySelectorAll('img');
            let highlightedElement = null;
            
            for (const img of images) {
              const imgAlt = (img.alt || '').toLowerCase();
              const imgTitle = (img.title || '').toLowerCase();
              const searchLower = searchQuote.toLowerCase();
              
              // Check if image alt/title matches our search
              if (imgAlt.includes(searchLower) || imgTitle.includes(searchLower) || 
                  searchLower.includes(imgAlt) || searchLower.includes(imgTitle)) {
                
                // Create a highlight wrapper around the image
                const imageWrapper = img.parentElement;
                if (imageWrapper) {
                  imageWrapper.style.outline = '3px solid #fbbf24'; // yellow outline
                  imageWrapper.style.borderRadius = '8px';
                  imageWrapper.style.padding = '4px';
                  imageWrapper.style.backgroundColor = '#fef3c7'; // soft yellow background
                  imageWrapper.classList.add('quote-highlight');
                  
                  // Scroll to the image
                  imageWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  highlightedElement = imageWrapper;
                  console.log('Highlighted image element');
                  break;
                }
              }
            }
            
            // If no image found, look for figure references in text
            if (!highlightedElement) {
              // Look for figure references like "Fig. 6" in the text
              const figureLinks = markdownContainer.querySelectorAll('a');
              for (const link of figureLinks) {
                const linkText = (link.textContent || '').toLowerCase();
                if (linkText.includes(searchQuote.toLowerCase()) || 
                    searchQuote.toLowerCase().includes(linkText)) {
                  
                  // Highlight the link
                  link.style.backgroundColor = '#fef3c7';
                  link.style.padding = '2px 4px';
                  link.style.borderRadius = '3px';
                  link.classList.add('quote-highlight');
                  
                  // Scroll to the link
                  link.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  highlightedElement = link;
                  console.log('Highlighted figure reference link');
                  break;
                }
              }
            }
            
            if (highlightedElement) {
              console.log('Successfully highlighted figure/image reference');
              return; // Exit early since we found and highlighted the element
            }
          }
          
          // Fallback to text-based highlighting
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
            
            // Create highlight span
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'quote-highlight';
            highlightSpan.style.backgroundColor = '#fef3c7'; // soft yellow
            highlightSpan.style.padding = '2px 4px';
            highlightSpan.style.borderRadius = '3px';
            
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