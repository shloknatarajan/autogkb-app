import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  markdown: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ markdown }) => {
  const [sections, setSections] = useState<TocItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    // Extract only H1 headings from markdown
    const headingRegex = /^#\s+(.+)$/gm;
    const matches = Array.from(markdown.matchAll(headingRegex));
    
    const tocItems: TocItem[] = matches
      .map((match, index) => ({
        id: `section-${index}`,
        text: match[1].replace(/\*/g, '').trim(),
        level: 1,
      }))
      .filter(item => item.text.toLowerCase() !== 'metadata'); // Exclude Metadata section

    setSections(tocItems);
  }, [markdown]);

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1');
      let current = '';
      let filteredIndex = 0;
      
      headings.forEach((heading) => {
        const headingText = heading.textContent?.trim().toLowerCase();
        if (headingText === 'metadata') return; // Skip metadata
        
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          current = `section-${filteredIndex}`;
        }
        filteredIndex++;
      });
      
      setActiveSection(current);
    };

    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    scrollArea?.addEventListener('scroll', handleScroll);
    
    return () => scrollArea?.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const headings = document.querySelectorAll('h1');
    const filteredHeadings = Array.from(headings).filter(
      h => h.textContent?.trim().toLowerCase() !== 'metadata'
    );
    const heading = filteredHeadings[index];
    
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed right-4 top-32 w-56 bg-card border border-border rounded-lg shadow-soft z-40 max-h-[60vh]">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">PAGE NAVIGATION</h3>
      </div>
      <ScrollArea className="max-h-[calc(60vh-3rem)]">
        <nav className="p-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(index)}
              className={`
                w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2
                ${activeSection === section.id 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'hover:bg-muted/50 text-foreground'
                }
              `}
            >
              {activeSection === section.id && (
                <ChevronLeft className="h-3 w-3 flex-shrink-0" />
              )}
              <span className="truncate">{section.text}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};
