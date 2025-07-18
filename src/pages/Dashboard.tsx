import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Study {
  id: string;
  title: string;
  description: string;
  studyType: string;
  participants: number | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudies, setAvailableStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const discoverAvailableStudies = async () => {
      setLoading(true);
      const studies: Study[] = [];

      try {
        // Try to fetch a manifest file first (suppress errors)
        let pmcIds: string[] = [];
        
        try {
          const manifestResponse = await fetch('/data/manifest.json').catch(() => null);
          if (manifestResponse?.ok) {
            const manifest = await manifestResponse.json().catch(() => null);
            pmcIds = manifest?.studies || [];
          }
        } catch {
          // Silently continue to fallback approach
        }
        
        // If no manifest or manifest failed, try common PMC patterns
        if (pmcIds.length === 0) {
          const commonPMCs = [
            'PMC11730665', 'PMC5712579', 'PMC5728534', 'PMC5749368', 'PMC4737107',
            'PMC6289290', 'PMC10000000', 'PMC9000000', 'PMC8000000', 'PMC7000000'
          ];
          
          // Test which PMCs actually exist (suppress individual errors)
          const existingPMCs = await Promise.allSettled(
            commonPMCs.map(async (pmcid) => {
              try {
                const [markdownResponse, jsonResponse] = await Promise.allSettled([
                  fetch(`/data/markdown/${pmcid}.md`),
                  fetch(`/data/annotations/${pmcid}.json`)
                ]);
                
                const markdownOk = markdownResponse.status === 'fulfilled' && markdownResponse.value.ok;
                const jsonOk = jsonResponse.status === 'fulfilled' && jsonResponse.value.ok;
                
                return markdownOk && jsonOk ? pmcid : null;
              } catch {
                return null;
              }
            })
          );
          
          pmcIds = existingPMCs
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => (result as PromiseFulfilledResult<string>).value);
        }
        
        // Load data for discovered PMC IDs (suppress individual errors)
        for (const pmcid of pmcIds) {
          try {
            const jsonResponse = await fetch(`/data/annotations/${pmcid}.json`).catch(() => null);

            if (jsonResponse?.ok) {
              const jsonData = await jsonResponse.json().catch(() => null);
              
              if (jsonData) {
                const summary = jsonData.study_parameters?.summary || 
                              jsonData.description || 
                              'No description available';
                
                const studyType = jsonData.study_parameters?.study_type?.content || 
                                jsonData.studyType || 
                                'Unknown';
                
                const participants = jsonData.study_parameters?.participant_info?.content ? 
                                   extractParticipantNumber(jsonData.study_parameters.participant_info.content) :
                                   jsonData.participants || null;

                studies.push({
                  id: pmcid,
                  title: jsonData.title || `Study ${pmcid}`,
                  description: summary,
                  studyType: studyType,
                  participants: participants
                });
              }
            }
          } catch {
            // Silently skip studies that fail to load
          }
        }
      } catch {
        // Silently handle any discovery errors
      }

      setAvailableStudies(studies);
      setLoading(false);
    };

    discoverAvailableStudies();
  }, []);

  const extractParticipantNumber = (participantInfo: string): number | null => {
    // Try to extract number from participant info text
    const match = participantInfo.match(/(\d+)\s+(?:treatment-naive\s+)?patients?/i);
    return match ? parseInt(match[1]) : null;
  };

  const filteredStudies = useMemo(() => {
    if (!searchTerm.trim()) return availableStudies;
    
    const term = searchTerm.toLowerCase();
    return availableStudies.filter(study => 
      study.id.toLowerCase().includes(term) ||
      study.title.toLowerCase().includes(term)
    );
  }, [searchTerm, availableStudies]);

  const handlePMCIDClick = (pmcid: string) => {
    navigate(`/viewer/${pmcid}`);
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
              <h1 className="text-xl font-bold text-foreground">AutoGKB</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Available Studies</h2>
          <p className="text-muted-foreground mb-4">
            Click on any study to view the detailed analysis with markdown content and JSON data
          </p>
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Search by PMCID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies.map((study) => (
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

        {filteredStudies.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-muted-foreground text-xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No studies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <span className="text-muted-foreground text-xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Loading studies...</h3>
            <p className="text-muted-foreground">
              Checking for available markdown and JSON files
            </p>
          </div>
        )}

        {!loading && availableStudies.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-muted-foreground text-xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No studies available</h3>
            <p className="text-muted-foreground">
              Add corresponding .md and .json files to data/markdown/ and data/annotations/ folders
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;