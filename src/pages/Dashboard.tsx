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
    const loadRealData = async () => {
      setLoading(true);
      const studies: Study[] = [];

      try {
        // Get list of available annotation files
        const annotationFiles = [
          'PMC11730665.json', 
          'PMC5712579.json', 
          'PMC5728534.json', 
          'PMC5749368.json', 
          'PMC4737107.json'
        ];
        
        for (const filename of annotationFiles) {
          const pmcid = filename.replace('.json', '');
          
          try {
            // Check if both files exist
            const [markdownResponse, jsonResponse] = await Promise.all([
              fetch(`/data/markdown/${pmcid}.md`),
              fetch(`/data/annotations/${pmcid}.json`)
            ]);

            if (markdownResponse.ok && jsonResponse.ok) {
              // Extract metadata from JSON
              const jsonData = await jsonResponse.json();
              
              // Extract summary from study_parameters if available
              const summary = jsonData.study_parameters?.summary || 
                            jsonData.description || 
                            'No description available';
              
              // Extract study type from study_parameters if available
              const studyType = jsonData.study_parameters?.study_type?.content || 
                              jsonData.studyType || 
                              'Unknown';
              
              // Extract participants from study_parameters if available
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
          } catch (error) {
            console.error(`Failed to load data for ${pmcid}:`, error);
          }
        }
      } catch (error) {
        console.error('Failed to load study data:', error);
      }

      setAvailableStudies(studies);
      setLoading(false);
    };

    loadRealData();
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
              <h1 className="text-xl font-bold text-foreground">Medical Research Tool</h1>
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