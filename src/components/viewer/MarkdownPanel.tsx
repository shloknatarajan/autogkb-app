import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MarkdownPanelProps {
  markdown: string;
}

export const MarkdownPanel: React.FC<MarkdownPanelProps> = ({ markdown }) => {
  return (
    <div className="flex-1 border-r">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader className="bg-gradient-secondary border-b">
          <CardTitle className="text-lg">Research Paper Content</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-6 prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-primary prose-p:leading-relaxed">
              <ReactMarkdown>
                {markdown}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};