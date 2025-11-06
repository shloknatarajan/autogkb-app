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
    // Extract headings from markdown
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = Array.from(markdown.matchAll(headingRegex));
    
    const tocItems: TocItem[] = matches.map((match, index) => ({
      id: `section-${index}`,
      text: match[2].replace(/\*/g, '').trim(),
      level: match[1].length,
    }));

    setSections(tocItems);
  }, [markdown]);

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3');
      let current = '';
      
      headings.forEach((heading, index) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          current = `section-${index}`;
        }
      });
      
      setActiveSection(current);
    };

    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    scrollArea?.addEventListener('scroll', handleScroll);
    
    return () => scrollArea?.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const headings = document.querySelectorAll('h1, h2, h3');
    const heading = headings[index];
    
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed right-4 top-32 w-64 bg-card border border-border rounded-lg shadow-medium z-40">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">PAGE NAVIGATION</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <nav className="p-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(index)}
              className={`
                w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2
                ${section.level === 1 ? 'font-semibold' : ''}
                ${section.level === 2 ? 'pl-6 text-muted-foreground' : ''}
                ${section.level === 3 ? 'pl-9 text-muted-foreground text-xs' : ''}
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
