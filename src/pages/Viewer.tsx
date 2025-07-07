import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';

// Mock data for demonstration
const mockData = {
  'PMC6289290': {
    markdown: `# VX-445–Tezacaftor–Ivacaftor in Patients with Cystic Fibrosis and One or Two

## Abstract

### BACKGROUND
VX-445 is a next-generation cystic fibrosis transmembrane conductance regulator (CFTR) corrector designed to restore Phe508del CFTR protein function in patients with cystic fibrosis when administered with tezacaftor and ivacaftor (VX-445–tezacaftor–ivacaftor).

### METHODS
We evaluated the effects of VX-445–tezacaftor–ivacaftor on Phe508del CFTR protein processing, trafficking, and chloride transport in human bronchial epithelial cells. On the basis of in vitro activity, a randomized, controlled, double-blind, dose-ranging, phase 2 trial was conducted to evaluate tezacaftor–ivacaftor in patients heterozygous for the Phe508del CFTR mutation and a minimal-function mutation (Phe508del–MF) and in patients homozygous for the Phe508del CFTR mutation (Phe508del–Phe508del) after tezacaftor–ivacaftor run-in. Primary end points were safety and absolute change in percentage of predicted forced expiratory volume in 1 second (FEV1) from baseline.

### RESULTS
In vitro, VX-445–tezacaftor–ivacaftor significantly improved Phe508del CFTR protein processing, trafficking, and chloride transport to a greater extent than any two of these agents in dual combination. In patients with cystic fibrosis, VX-445–tezacaftor–ivacaftor had an acceptable safety and side-effect profile. Most adverse events were mild or moderate. The treatment also resulted in an increased percentage of predicted FEV1 of up to 13.8 points in the primary analysis group (P<0.001). In patients in the Phe508del–Phe508del group, who were already receiving tezacaftor–ivacaftor, the addition of VX-445 resulted in an 11.0-point increase in the percentage of predicted FEV1 (P<0.001). In both groups, there was a decrease in sweat chloride concentrations and improvement in the respiratory domain score on the Cystic Fibrosis Questionnaire–Revised.

### CONCLUSIONS
The use of VX-445–tezacaftor–ivacaftor to target Phe508del CFTR protein resulted in increased CFTR function in vitro and translated to improvements in patients with cystic fibrosis with one or two Phe508del alleles. This approach has the potential to treat the underlying cause of cystic fibrosis in approximately 90% of patients.

## Study Details

This study represents a significant advancement in cystic fibrosis treatment, demonstrating the efficacy of triple combination therapy in targeting the underlying protein defect that causes the disease.`,
    json: {
      pmcid: "PMC6289290",
      title: "VX-445–Tezacaftor–Ivacaftor in Patients with Cystic Fibrosis and One or Two",
      study_parameters: {
        summary: "The use of VX-445-tezacaftor-ivacaftor to target Phe508del CFTR protein resulted in increased CFTR function in vitro and translated to improvements in patients with cystic fibrosis with one or two Phe508del alleles.",
        study_type: {
          content: "Randomized Control Trial",
          explanation: "The study is described as a 'randomized, controlled, double-blind, dose-ranging, phase 2 trial'.",
          quotes: [
            "randomized, controlled, double-blind, dose-ranging, phase 2 trial was conducted to evaluate tezacaftor–ivacaftor"
          ]
        }
      },
      participant_info: {
        content: "29 CF patients",
        explanation: "The study included patients with cystic fibrosis with specific genetic mutations.",
        quotes: [
          "patients heterozygous for the Phe508del CFTR mutation and a minimal-function mutation",
          "patients homozygous for the Phe508del CFTR mutation"
        ]
      },
      study_design: {
        content: "Phase 2 randomized controlled trial evaluating VX-445–tezacaftor–ivacaftor combination therapy",
        explanation: "The study design focused on dose-ranging and safety evaluation of the triple combination therapy.",
        quotes: [
          "randomized, controlled, double-blind, dose-ranging, phase 2 trial",
          "Primary end points were safety and absolute change in percentage of predicted FEV1"
        ]
      },
      variant_annotations: {
        rs113993960: {
          annotation_type: "Functional Analysis",
          haplotype: "rs113993960",
          gene: "CFTR",
          drugs: ["elexacaftor", "ivacaftor", "tezacaftor"],
          sentence: "Genotype del/del are associated with increased transport of CFTR when exposed to elexacaftor, ivacaftor and tezacaftor.",
          significance: "Significant"
        }
      }
    }
  },
  'PMC11730665': {
    markdown: `# Comparative efficacy and safety of sitagliptin or gliclazide combined with metformin in treatment-naïve patients with type 2 diabetes mellitus

## Abstract

### Background
Type 2 diabetes mellitus (T2DM) is a progressive metabolic disorder requiring effective glycemic control to prevent complications.

### Methods
This single-center, prospective, randomized, controlled noninferiority trial compared sitagliptin plus metformin versus gliclazide plus metformin in 129 treatment-naïve patients with T2DM.

### Results
Both treatment combinations showed significant improvements in glycemic control with acceptable safety profiles.

### Conclusions
Sitagliptin plus metformin demonstrated noninferiority to gliclazide plus metformin in treatment-naïve T2DM patients.`,
    json: {
      pmcid: "PMC11730665",
      title: "Comparative efficacy and safety of sitagliptin or gliclazide combined with metformin in treatment-naïve patients with type 2 diabetes mellitus",
      study_parameters: {
        summary: "This study evaluates the efficacy and safety of sitagliptin versus gliclazide, combined with metformin, in treatment-naïve patients with T2DM.",
        study_type: {
          content: "Clinical trial, prospective",
          explanation: "The study is described as a 'single-center, prospective, randomized, controlled noninferiority trial'.",
          quotes: [
            "In this single-center, randomized, controlled noninferiority trial, 129 treatment-naïve patients with T2DM with glucotoxicity",
            "This single-center, prospective, randomized, controlled, noninferiority study..."
          ]
        }
      },
      participant_info: {
        content: "129 treatment-naïve patients with type 2 diabetes mellitus (T2DM) and glucotoxicity, aged 18 to 70 years",
        explanation: "The study included 129 treatment-naïve patients with T2DM and glucotoxicity, aged 18 to 70 years, with specific inclusion criteria.",
        quotes: [
          "129 treatment-naïve patients with T2DM with glucotoxicity (fasting plasma glucose [FPG] \\u2265 200 mg/dL and glycated hemoglobin [HbA1c] ≥ 9%)",
          "The age range is between 18 and 70 years, with a body mass index (BMI) ranging from 18 to 30 kg/m\\u00b2..."
        ]
      },
      study_design: {
        content: "The study was conducted at Nanfang Hospital of Southern Medical University, involving 129 participants randomized to receive different treatments.",
        explanation: "The study design is detailed as a randomized controlled trial with two groups, each receiving different treatment combinations.",
        quotes: [
          "In this single-center, randomized, controlled noninferiority trial, 129 treatment-naïve patients with T2DM with glucotoxicity",
          "Participants were recruited from Nanfang Hospital of Southern Medical University between September 1, 2023, and March 31, 2024, and were randomized to receive sitagliptin plus metformin (n = 66) or gliclazide plus metformin (n = 63) for 12 weeks."
        ]
      }
    }
  }
};

const Viewer = () => {
  const { pmcid } = useParams<{ pmcid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      if (pmcid && mockData[pmcid as keyof typeof mockData]) {
        setData(mockData[pmcid as keyof typeof mockData]);
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pmcid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-muted-foreground">Loading study data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Study Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The requested PMCID "{pmcid}" could not be found.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
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

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Markdown Content */}
        <div className="flex-1 border-r">
          <Card className="h-full rounded-none border-0 shadow-none">
            <CardHeader className="bg-gradient-secondary border-b">
              <CardTitle className="text-lg">Research Paper Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-6 prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-primary prose-p:leading-relaxed">
                  <ReactMarkdown>
                    {data.markdown}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - JSON Data */}
        <div className="w-1/2">
          <Card className="h-full rounded-none border-0 shadow-none">
            <CardHeader className="bg-gradient-secondary border-b">
              <CardTitle className="text-lg">Structured Data</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <Tabs defaultValue="formatted" className="h-full">
                <div className="border-b px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                    <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="formatted" className="mt-0 h-full">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="p-6 space-y-6">
                      {/* Study Parameters */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Study Parameters</h3>
                        <div className="space-y-3">
                          <div className="bg-accent/50 p-3 rounded-lg">
                            <h4 className="font-medium text-sm text-accent-foreground mb-1">Summary</h4>
                            <p className="text-sm text-muted-foreground">{data.json.study_parameters?.summary}</p>
                          </div>
                          <div className="bg-accent/50 p-3 rounded-lg">
                            <h4 className="font-medium text-sm text-accent-foreground mb-1">Study Type</h4>
                            <p className="text-sm text-muted-foreground">{data.json.study_parameters?.study_type?.content}</p>
                          </div>
                        </div>
                      </div>

                      {/* Participant Info */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Participant Information</h3>
                        <div className="bg-accent/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">{data.json.participant_info?.content}</p>
                        </div>
                      </div>

                      {/* Variant Annotations */}
                      {data.json.variant_annotations && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-primary">Variant Annotations</h3>
                          {Object.entries(data.json.variant_annotations).map(([key, variant]: [string, any]) => (
                            <div key={key} className="bg-accent/50 p-3 rounded-lg mb-3">
                              <h4 className="font-medium text-sm text-accent-foreground mb-2">{key}</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Gene:</span> {variant.gene}</p>
                                <p><span className="font-medium">Significance:</span> {variant.significance}</p>
                                {variant.drugs && (
                                  <p><span className="font-medium">Drugs:</span> {variant.drugs.join(', ')}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="raw" className="mt-0 h-full">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="p-6">
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(data.json, null, 2)}
                      </pre>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Viewer;