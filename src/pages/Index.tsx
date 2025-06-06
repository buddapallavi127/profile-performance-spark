
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import ResumeUpload from '@/components/ResumeUpload';
import JobDetailsForm from '@/components/JobDetailsForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { FileText, Target, Building, Clock } from 'lucide-react';

export interface JobDetails {
  targetRole: string;
  targetCompany: string;
  yearsOfExperience: string;
}

export interface AnalysisResult {
  extracted_fields: any;
  questionnaire_prompt: string;
}

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    targetRole: '',
    targetCompany: '',
    yearsOfExperience: ''
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDetails.targetRole || !jobDetails.targetCompany || !jobDetails.yearsOfExperience) {
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('Target_Role', jobDetails.targetRole);
      formData.append('Target_Company', jobDetails.targetCompany);
      formData.append('Years_of_Experience', jobDetails.yearsOfExperience);

      const response = await fetch('/v1/analyze_resume/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing resume:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResumeFile(null);
    setJobDetails({
      targetRole: '',
      targetCompany: '',
      yearsOfExperience: ''
    });
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-blue-600 rounded-full mr-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Resume Analyzer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized insights and interview preparation based on your resume and target role
          </p>
        </div>

        {!analysisResult ? (
          <div className="max-w-4xl mx-auto">
            {/* Process Steps */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Resume</h3>
                <p className="text-gray-600 text-sm">Upload your PDF resume for analysis</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
                <p className="text-gray-600 text-sm">Specify your target role and company</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Insights</h3>
                <p className="text-gray-600 text-sm">Receive personalized analysis and tips</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Resume Upload Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <FileText className="mr-3 h-6 w-6 text-blue-600" />
                  Upload Resume
                </h2>
                <ResumeUpload 
                  onFileSelect={setResumeFile}
                  selectedFile={resumeFile}
                />
              </Card>

              {/* Job Details Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Target className="mr-3 h-6 w-6 text-purple-600" />
                  Job Details
                </h2>
                <JobDetailsForm 
                  jobDetails={jobDetails}
                  onJobDetailsChange={setJobDetails}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  canAnalyze={!!(resumeFile && jobDetails.targetRole && jobDetails.targetCompany && jobDetails.yearsOfExperience)}
                />
              </Card>
            </div>
          </div>
        ) : (
          <ResultsDisplay 
            result={analysisResult}
            jobDetails={jobDetails}
            onReset={resetAnalysis}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
