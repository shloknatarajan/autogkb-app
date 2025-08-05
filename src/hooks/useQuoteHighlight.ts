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
const extractSentences = (container: Element): Array<{text: string, element: Element, textNode: Text | null, startOffset: number, endOffset: number}> => {
  const sentences: Array<{text: string, element: Element, textNode: Text | null, startOffset: number, endOffset: number}> = [];
  
  // Get all text nodes
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        const text = node.textContent?.trim() || '';
        // Skip empty or very short text nodes
        if (text.length < 5) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let textNode: Text | null;
  while ((textNode = walker.nextNode() as Text)) {
    const text = textNode.textContent || '';
    const parentElement = textNode.parentElement;
    
    if (!parentElement) continue;
    
    // Skip script, style elements
    const tagName = parentElement.tagName.toLowerCase();
    if (['script', 'style'].includes(tagName)) continue;
    
    // Split text into sentences
    const sentenceRegex = /[.!?]+\s+/g;
    let lastIndex = 0;
    let match;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentenceText = text.substring(lastIndex, match.index + match[0].length - match[0].match(/\s+$/)?.[0].length || 0).trim();
      
      if (sentenceText.length > 20) {
        sentences.push({
          text: sentenceText,
          element: parentElement,
          textNode,
          startOffset: lastIndex,
          endOffset: match.index + match[0].length - (match[0].match(/\s+$/)?.[0].length || 0)
        });
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Handle the last sentence (no punctuation at end)
    const lastSentence = text.substring(lastIndex).trim();
    if (lastSentence.length > 20) {
      sentences.push({
        text: lastSentence,
        element: parentElement,
        textNode,
        startOffset: lastIndex,
        endOffset: text.length
      });
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
            bestElement.style.backgroundColor = '#ffeb3b';
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
        let bestMatch: { similarity: number; sentence: {text: string, element: Element, textNode: Text | null, startOffset: number, endOffset: number} | null } = { similarity: 0, sentence: null };
        
        sentences.forEach(sentenceObj => {
          const similarity = calculateSimilarity(quote, sentenceObj.text);
          if (similarity > bestMatch.similarity) {
            bestMatch = { similarity, sentence: sentenceObj };
          }
        });
        
        console.log('Best match similarity:', bestMatch.similarity);
        
        if (bestMatch.similarity > 0.2 && bestMatch.sentence) { // Minimum threshold
          const { textNode, startOffset, endOffset } = bestMatch.sentence;
          
          if (textNode) {
            // Create a highlight span for just the matching sentence
            const range = document.createRange();
            range.setStart(textNode, startOffset);
            range.setEnd(textNode, endOffset);
            
            // Create highlight span
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'quote-highlight';
            highlightSpan.style.backgroundColor = '#ffeb3b';
            
            try {
              // Surround the range with the highlight span
              range.surroundContents(highlightSpan);
              
              // Scroll to the highlighted sentence
              highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
              console.log('Highlighted best matching sentence with similarity:', bestMatch.similarity);
            } catch (error) {
              console.error('Error highlighting sentence:', error);
              // Fallback: highlight the entire element
              const highlightElement = bestMatch.sentence.element as HTMLElement;
              highlightElement.style.backgroundColor = '#ffeb3b';
              highlightElement.classList.add('quote-highlight');
              highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        } else {
          console.log('No sufficiently similar sentence found (threshold: 0.2)');
        }
      }
    }, 200);
  };

  return { highlightedText, handleQuoteClick };
};