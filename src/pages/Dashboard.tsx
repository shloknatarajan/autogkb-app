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
            'PMC12035587', 'PMC11430164', 'PMC11971672', 'PMC10275785', 'PMC12038368', 
            'PMC2859392', 'PMC11603346', 'PMC12036300', 'PMC10399933', 'PMC10786722',
            'PMC10880264', 'PMC10946077', 'PMC10993165', 'PMC11062152', 'PMC12260932',
            'PMC12319246', 'PMC12331468', 'PMC3113609', 'PMC3387531', 'PMC3548984',
            'PMC3584248', 'PMC3839910', 'PMC384715', 'PMC4706412', 'PMC4916189',
            'PMC5508045', 'PMC554812', 'PMC5561238', 'PMC6435416', 'PMC6465603',
            'PMC6714829', 'PMC8790808', 'PMC8973308'
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
                // Extract study characteristics from study_parameters array
                const studyParams = jsonData.study_parameters || [];
                const characteristics = studyParams.map((p: any) => p.Characteristics).filter(Boolean).join('; ');
                const studyTypes = [...new Set(studyParams.map((p: any) => p["Study Type"]).filter(Boolean))].join(', ');
                const totalCases = studyParams.reduce((sum: number, p: any) => sum + (p["Study Cases"] || 0), 0);

                studies.push({
                  id: pmcid,
                  title: jsonData.title || `Study ${pmcid}`,
                  description: characteristics || 'No description available',
                  studyType: studyTypes || 'Unknown',
                  participants: totalCases || null
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
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/favicon.ico" alt="PMC Icon" className="w-8 h-8 rounded-lg" />
              </div>
              <h1 className="text-xl font-bold text-foreground"></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-5xl font-bold text-foreground mb-4">AutoGKB</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Search all available studies
          </p>
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search by PMCID or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-lg py-3 px-6"
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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {study.id}
                  </div>
                  <div className="px-3 py-1.5 bg-accent text-accent-foreground text-xs font-medium rounded-full truncate">
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