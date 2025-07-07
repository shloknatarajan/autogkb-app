import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for available PMCIDs
const mockPMCIDs = [
  {
    id: 'PMC6289290',
    title: 'VX-445–Tezacaftor–Ivacaftor in Patients with Cystic Fibrosis and One or Two',
    description: 'A study on triple combination therapy for cystic fibrosis patients',
    studyType: 'Randomized Control Trial',
    participants: 29
  },
  {
    id: 'PMC11730665',
    title: 'Comparative efficacy and safety of sitagliptin or gliclazide combined with metformin',
    description: 'Treatment-naive patients with type 2 diabetes mellitus study',
    studyType: 'Clinical trial, prospective',
    participants: 129
  },
  {
    id: 'PMC8745123',
    title: 'Long-term effects of COVID-19 vaccination in elderly populations',
    description: 'Longitudinal study on vaccine efficacy and safety',
    studyType: 'Observational Study',
    participants: 2547
  },
  {
    id: 'PMC9156789',
    title: 'Machine learning approaches in cancer diagnosis and treatment',
    description: 'Systematic review of AI applications in oncology',
    studyType: 'Systematic Review',
    participants: null
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handlePMCIDClick = (pmcid: string) => {
    navigate(`/viewer/${pmcid}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">PMC</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Medical Research Tool</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground transition-smooth"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Available Studies</h2>
          <p className="text-muted-foreground">
            Click on any study to view the detailed analysis with markdown content and JSON data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPMCIDs.map((study) => (
            <Card 
              key={study.id}
              className="cursor-pointer hover:shadow-medium transition-bounce bg-card border-border hover:border-primary/20"
              onClick={() => handlePMCIDClick(study.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    {study.id}
                  </div>
                  <div className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">
                    {study.studyType}
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {study.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-3">
                  {study.description}
                </CardDescription>
                {study.participants && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium">Participants:</span>
                    <span className="ml-1">{study.participants}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {mockPMCIDs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-muted-foreground text-xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No studies available</h3>
            <p className="text-muted-foreground">
              Add JSON files to the local directory to see available PMCIDs
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;