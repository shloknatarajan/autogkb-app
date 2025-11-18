import { useState, useEffect } from 'react';

interface ViewerData {
  markdown: string;
  json: any;
  benchmarkJson: any | null;
}

export const useViewerData = (pmcid: string | undefined) => {
  const [data, setData] = useState<ViewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!pmcid) {
        setError('No PMCID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load markdown, annotations, and benchmark annotations
        const [markdownResponse, jsonResponse] = await Promise.all([
          fetch(`/data/markdown/${pmcid}.md`),
          fetch(`/data/annotations/${pmcid}.json`)
        ]);

        if (!markdownResponse.ok || !jsonResponse.ok) {
          throw new Error(`Files not found for PMCID: ${pmcid}`);
        }

        const [markdownText, jsonData] = await Promise.all([
          markdownResponse.text(),
          jsonResponse.json()
        ]);

        // Try to load benchmark annotations, but don't fail if they don't exist
        let benchmarkData = null;
        try {
          const benchmarkResponse = await fetch(`/data/benchmark_annotations/${pmcid}.json`);
          if (benchmarkResponse.ok) {
            benchmarkData = await benchmarkResponse.json();
          }
        } catch (e) {
          // Benchmark annotations are optional
          console.log('No benchmark annotations available for', pmcid);
        }

        setData({
          markdown: markdownText,
          json: jsonData,
          benchmarkJson: benchmarkData
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setError(`Failed to load data for PMCID: ${pmcid}. Please ensure both markdown and JSON files exist in the correct directories.`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pmcid]);

  return { data, loading, error };
};