import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fetch article from PubMed and convert to markdown
async function fetchPubMedArticle(pmid: string): Promise<{ markdown: string; pmcid: string; title: string } | null> {
  console.log(`Fetching article for PMID: ${pmid}`);
  
  // First, get the PMCID from the PMID using NCBI E-utilities
  const idConverterUrl = `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?ids=${pmid}&format=json`;
  const idResponse = await fetch(idConverterUrl);
  const idData = await idResponse.json();
  
  if (!idData.records || idData.records.length === 0 || !idData.records[0].pmcid) {
    console.error('Could not find PMC ID for PMID:', pmid);
    return null;
  }
  
  const pmcid = idData.records[0].pmcid;
  console.log(`Found PMCID: ${pmcid}`);
  
  // Fetch the full text from PMC
  const pmcUrl = `https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/${pmcid}/unicode`;
  const pmcResponse = await fetch(pmcUrl);
  
  if (!pmcResponse.ok) {
    console.error('Failed to fetch article from PMC');
    return null;
  }
  
  const pmcData = await pmcResponse.json();
  
  // Extract text content and convert to markdown
  let markdown = '';
  let title = '';
  
  if (pmcData.documents && pmcData.documents.length > 0) {
    const doc = pmcData.documents[0];
    
    for (const passage of doc.passages || []) {
      const text = passage.text || '';
      const infons = passage.infons || {};
      const sectionType = infons.section_type || infons.type || '';
      
      if (sectionType === 'TITLE' || infons.type === 'front') {
        title = text;
        markdown += `# ${text}\n\n`;
      } else if (sectionType === 'ABSTRACT') {
        markdown += `## Abstract\n\n${text}\n\n`;
      } else if (sectionType.includes('INTRO')) {
        markdown += `## Introduction\n\n${text}\n\n`;
      } else if (sectionType.includes('METHODS')) {
        markdown += `## Methods\n\n${text}\n\n`;
      } else if (sectionType.includes('RESULTS')) {
        markdown += `## Results\n\n${text}\n\n`;
      } else if (sectionType.includes('DISCUSS')) {
        markdown += `## Discussion\n\n${text}\n\n`;
      } else if (sectionType.includes('CONCL')) {
        markdown += `## Conclusions\n\n${text}\n\n`;
      } else if (sectionType.includes('REF')) {
        // Skip references
      } else if (text.length > 50) {
        markdown += `${text}\n\n`;
      }
    }
  }
  
  if (!markdown) {
    console.error('No content extracted from article');
    return null;
  }
  
  return { markdown, pmcid, title };
}

// Generate annotations using Lovable AI
async function generateAnnotations(markdown: string, pmid: string, pmcid: string): Promise<any> {
  console.log('Generating annotations with Lovable AI...');
  
  const systemPrompt = `You are a pharmacogenomics expert analyzing scientific literature. Extract structured annotations from the article provided.

Your task is to extract:
1. A summary of the article
2. Study parameters (study type, population, sample size, etc.)
3. Variant-Drug associations (genetic variants associated with drug response)
4. Variant-Phenotype associations (genetic variants associated with phenotypes)
5. Functional annotations (laboratory measurements of protein function)

Return a JSON object with the following structure:
{
  "summary": "Brief summary of the article",
  "pmid": "${pmid}",
  "pmcid": "${pmcid}",
  "study_parameters": {
    "study_type": "string or null",
    "population": "string or null", 
    "sample_size": "number or null",
    "ethnicity": "string or null"
  },
  "var_drug_ann": [
    {
      "Variant/Haplotypes": "rsID or star allele",
      "Gene": "gene name",
      "Drug(s)": "drug name(s)",
      "Phenotype Category": "Efficacy|Metabolism/PK|Dosage|Toxicity|Other",
      "Significance": "yes|no|not stated",
      "Alleles": "genotype or null",
      "Is/Is Not associated": "Associated with|Not associated with",
      "Direction of effect": "increased|decreased|null",
      "PD/PK terms": "response to|metabolism of|dose of|concentrations of",
      "Population types": "in people with|null",
      "Population Phenotypes or diseases": "string or null",
      "Sentence": "supporting sentence from article"
    }
  ],
  "var_pheno_ann": [
    {
      "Variant/Haplotypes": "rsID or star allele",
      "Gene": "gene name",
      "Phenotype": "phenotype description",
      "Phenotype Category": "Side Effect|Efficacy|Other",
      "Significance": "yes|no|not stated",
      "Is/Is Not associated": "Associated with|Not associated with",
      "Sentence": "supporting sentence from article"
    }
  ],
  "var_fa_ann": [
    {
      "Variant/Haplotypes": "rsID or star allele",
      "Gene": "gene name",
      "Functional Effect": "description of functional effect",
      "Assay Type": "enzyme kinetics|cell-based|in vivo|other",
      "Sentence": "supporting sentence from article"
    }
  ]
}

If no associations are found for a category, return an empty array.
Only include associations that are explicitly stated in the article with supporting evidence.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please analyze this pharmacogenomics article and extract structured annotations:\n\n${markdown}` }
      ],
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in AI response');
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI response as JSON');
  }
}

// Update job status in database
async function updateJobStatus(jobId: string, updates: any) {
  const { error } = await supabase
    .from('article_jobs')
    .update(updates)
    .eq('id', jobId);
  
  if (error) {
    console.error('Failed to update job status:', error);
  }
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pmid, job_id } = await req.json();

    if (!pmid) {
      return new Response(
        JSON.stringify({ success: false, error: 'PMID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no job_id provided, create a new job
    let jobId = job_id;
    if (!jobId) {
      const { data: job, error: jobError } = await supabase
        .from('article_jobs')
        .insert({ pmid, status: 'pending', progress: 'Job created' })
        .select()
        .single();
      
      if (jobError || !job) {
        console.error('Failed to create job:', jobError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create job' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      jobId = job.id;
    }

    // Return job ID immediately, process in background
    EdgeRuntime.waitUntil((async () => {
      try {
        // Update status: fetching
        await updateJobStatus(jobId, { 
          status: 'fetching', 
          progress: 'Fetching article from PubMed...' 
        });

        // Fetch article
        const article = await fetchPubMedArticle(pmid);
        
        if (!article) {
          await updateJobStatus(jobId, { 
            status: 'failed', 
            error: 'Failed to fetch article. Make sure the PMID has a corresponding PMC full-text article.',
            progress: 'Failed'
          });
          return;
        }

        // Update with article info
        await updateJobStatus(jobId, { 
          pmcid: article.pmcid,
          title: article.title,
          markdown_content: article.markdown,
          status: 'annotating',
          progress: 'Generating annotations with AI...'
        });

        // Generate annotations
        const annotations = await generateAnnotations(article.markdown, pmid, article.pmcid);

        // Update with completed status
        await updateJobStatus(jobId, { 
          status: 'completed',
          annotation_data: annotations,
          progress: 'Completed successfully'
        });

        console.log(`Job ${jobId} completed successfully`);
      } catch (error) {
        console.error('Background processing error:', error);
        await updateJobStatus(jobId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          progress: 'Failed'
        });
      }
    })());

    return new Response(
      JSON.stringify({ 
        success: true, 
        job_id: jobId,
        message: 'Processing started'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-article:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
