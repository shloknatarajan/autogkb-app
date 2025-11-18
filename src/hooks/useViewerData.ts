import { useState, useEffect } from 'react';

interface ViewerData {
  markdown: string;
  json: any;
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

        // Load both markdown and JSON files from the correct paths
        const [markdownResponse, jsonResponse] = await Promise.all([
          fetch(`/data/markdown/${pmcid}.md`),
          fetch(`/data/benchmark_annotations/${pmcid}.json`)
        ]);

        if (!markdownResponse.ok || !jsonResponse.ok) {
          throw new Error(`Files not found for PMCID: ${pmcid}`);
        }

        const [markdownText, jsonData] = await Promise.all([
          markdownResponse.text(),
          jsonResponse.json()
        ]);

        setData({
          markdown: markdownText,
          json: jsonData
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