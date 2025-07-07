import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ViewerHeaderProps {
  pmcid: string;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({ pmcid }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-card shadow-soft border-b">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-accent transition-smooth"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">PMC</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{pmcid}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};