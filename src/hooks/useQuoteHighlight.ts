import { useState } from 'react';

// Helper function to normalize text for comparison
const normalizeText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[,;:""'']/g, '')  // Remove punctuation
    .replace(/\*([^*]+)\*/g, '$1')  // Remove markdown emphasis
    .replace(/\*P\*P/g, 'P')  // Fix duplicate P in p-values
    .replace(/\bp\s*<\s*0?\.(\d+)/gi, 'p < .$1')  // Normalize p-values
    .toLowerCase()
    .trim();
};

// Helper function to calculate similarity between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);
  
  // Exact match gets highest score
  if (norm1 === norm2) return 1.0;
  
  // Substring match gets high score
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const longer = Math.max(norm1.length, norm2.length);
    const shorter = Math.min(norm1.length, norm2.length);
    return shorter / longer * 0.9;
  }
  
  // Word overlap similarity
  const words1 = norm1.split(/\s+/).filter(w => w.length > 2);
  const words2 = norm2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(w => words2.includes(w));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
};

// Helper function to extract sentences from HTML elements
const extractSentences = (container: Element): Array<{text: string, element: Element, offset: number}> => {
  const sentences: Array<{text: string, element: Element, offset: number}> = [];
  
  // Get all text-containing elements
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: Node) => {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Skip script, style, and empty elements
        if (['script', 'style'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Accept elements that contain meaningful text
        const text = element.textContent?.trim() || '';
        if (text.length > 10) {
          return NodeFilter.FILTER_ACCEPT;
        }
        
        return NodeFilter.FILTER_SKIP;
      }
    }
  );
  
  let element: Element | null;
  while ((element = walker.nextNode() as Element)) {
    const text = element.textContent?.trim() || '';
    
    // Split text into sentences for paragraphs and similar elements
    if (['p', 'div', 'li', 'td', 'th', 'blockquote'].includes(element.tagName.toLowerCase())) {
      const sentenceParts = text.split(/[.!?]+\s+/);
      let offset = 0;
      
      sentenceParts.forEach((sentence: string, index: number) => {
        const trimmed = sentence.trim();
        if (trimmed.length > 20) { // Only consider substantial sentences
          sentences.push({
            text: index === sentenceParts.length - 1 ? trimmed : trimmed + '.',
            element,
            offset
          });
        }
        offset += sentence.length + (index < sentenceParts.length - 1 ? 1 : 0);
      });
    } else {
      // For headers, captions, etc., treat the whole text as one unit
      if (text.length > 10) {
        sentences.push({
          text,
          element,
          offset: 0
        });
      }
    }
  }
  
  return sentences;
};

// Helper function to check if quote refers to a figure/table
const isFigureTableReference = (quote: string): boolean => {
  return /\b(?:fig(?:ure)?|table|chart|graph|plot|image)\s*\d*\b/gi.test(quote);
};

// Helper function to find figure/table elements
const findFigureTableElements = (container: Element, quote: string): Element[] => {
  const elements: Element[] = [];
  
  // Look for images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    const alt = img.alt || '';
    const title = img.title || '';
    if (calculateSimilarity(quote, alt) > 0.3 || calculateSimilarity(quote, title) > 0.3) {
      elements.push(img.closest('figure') || img);
    }
  });
  
  // Look for tables
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    const caption = table.querySelector('caption')?.textContent || '';
    if (calculateSimilarity(quote, caption) > 0.3) {
      elements.push(table);
    }
  });
  
  // Look for figure references in text
  const links = container.querySelectorAll('a');
  links.forEach(link => {
    const linkText = link.textContent || '';
    if (calculateSimilarity(quote, linkText) > 0.4) {
      elements.push(link);
    }
  });
  
  return elements;
};

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

        // Check if this is a figure/table reference first
        if (isFigureTableReference(quote)) {
          console.log('Detected figure/table reference, searching for visual elements...');
          const figureElements = findFigureTableElements(markdownContainer, quote);
          
          if (figureElements.length > 0) {
            // Highlight the best matching figure/table
            const bestElement = figureElements[0] as HTMLElement;
            bestElement.style.outline = '3px solid #fbbf24';
            bestElement.style.borderRadius = '8px';
            bestElement.style.padding = '4px';
            bestElement.style.backgroundColor = '#fef3c7';
            bestElement.classList.add('quote-highlight');
            bestElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('Highlighted figure/table element');
            return;
          }
        }

        // Extract all sentences from the document
        const sentences = extractSentences(markdownContainer);
        console.log(`Found ${sentences.length} sentences to compare`);
        
        // Find the best matching sentence
        let bestMatch: { similarity: number; sentence: {text: string, element: Element, offset: number} | null } = { similarity: 0, sentence: null };
        
        sentences.forEach(sentenceObj => {
          const similarity = calculateSimilarity(quote, sentenceObj.text);
          if (similarity > bestMatch.similarity) {
            bestMatch = { similarity, sentence: sentenceObj };
          }
        });
        
        console.log('Best match similarity:', bestMatch.similarity);
        
        if (bestMatch.similarity > 0.2 && bestMatch.sentence) { // Minimum threshold
          const { element } = bestMatch.sentence;
          
          // Highlight the entire element containing the best matching sentence
          const highlightElement = element as HTMLElement;
          highlightElement.style.backgroundColor = '#fef3c7';
          highlightElement.style.padding = '8px';
          highlightElement.style.borderRadius = '6px';
          highlightElement.style.border = '2px solid #fbbf24';
          highlightElement.classList.add('quote-highlight');
          
          // Scroll to the highlighted element
          highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log('Highlighted best matching sentence with similarity:', bestMatch.similarity);
        } else {
          console.log('No sufficiently similar sentence found (threshold: 0.2)');
        }
      }
    }, 200);
  };

  return { highlightedText, handleQuoteClick };
};