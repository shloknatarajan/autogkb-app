import { useState, useEffect } from 'react';

interface ViewerData {
  markdown: string;
  json: any;
  benchmarkJson: any | null;
  analysisJson: any | null;
  annotationSource: 'annotation_sentences' | 'annotations';
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

        // Load markdown first
        const markdownResponse = await fetch(`/data/markdown/${pmcid}.md`);
        if (!markdownResponse.ok) {
          throw new Error(`Markdown file not found for PMCID: ${pmcid}`);
        }
        const markdownText = await markdownResponse.text();

        // Try to load from annotation_sentences first (preferred), then fallback to annotations
        let jsonData: any = null;
        let annotationSource: 'annotation_sentences' | 'annotations' = 'annotations';

        // Try annotation_sentences first
        try {
          const sentencesResponse = await fetch(`/data/annotation_sentences/${pmcid}.json`);
          if (sentencesResponse.ok) {
            jsonData = await sentencesResponse.json();
            annotationSource = 'annotation_sentences';
          }
        } catch (e) {
          // Silently continue to fallback
        }

        // Fallback to annotations if annotation_sentences not found
        if (!jsonData) {
          const annotationsResponse = await fetch(`/data/annotations/${pmcid}.json`);
          if (!annotationsResponse.ok) {
            throw new Error(`No annotation files found for PMCID: ${pmcid}`);
          }
          jsonData = await annotationsResponse.json();
          annotationSource = 'annotations';
        }

        // Try to load benchmark annotations and analysis, but don't fail if they don't exist
        let benchmarkData = null;
        let analysisData = null;
        
        try {
          const benchmarkResponse = await fetch(`/data/benchmark_annotations/${pmcid}.json`);
          if (benchmarkResponse.ok) {
            benchmarkData = await benchmarkResponse.json();
          }
        } catch (e) {
          console.log('No benchmark annotations available for', pmcid);
        }

        try {
          const analysisResponse = await fetch(`/data/analysis/${pmcid}.json`);
          if (analysisResponse.ok) {
            analysisData = await analysisResponse.json();
          }
        } catch (e) {
          console.log('No analysis available for', pmcid);
        }

        setData({
          markdown: markdownText,
          json: jsonData,
          benchmarkJson: benchmarkData,
          analysisJson: analysisData,
          annotationSource
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