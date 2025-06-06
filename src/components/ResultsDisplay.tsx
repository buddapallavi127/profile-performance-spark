
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Building, Clock, User, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { AnalysisResult, JobDetails } from '@/pages/Index';

interface ResultsDisplayProps {
  result: AnalysisResult;
  jobDetails: JobDetails;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, jobDetails, onReset }) => {
  const renderExtractedFields = () => {
    if (!result.extracted_fields || typeof result.extracted_fields !== 'object') {
      return (
        <Card className="p-6">
          <p className="text-gray-500">No structured data available</p>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(result.extracted_fields).map(([key, value], index) => (
          <Card key={index} className="p-6">
            <h3 className="text-lg font-semibold mb-4 capitalize text-gray-900">
              {key.replace(/_/g, ' ')}
            </h3>
            <div className="space-y-3">
              {Array.isArray(value) ? (
                <div className="grid gap-2">
                  {value.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{typeof item === 'object' ? JSON.stringify(item) : item}</span>
                    </div>
                  ))}
                </div>
              ) : typeof value === 'object' ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{String(value)}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuestionnairePrompt = () => {
    if (!result.questionnaire_prompt) {
      return (
        <Card className="p-6">
          <p className="text-gray-500">No questionnaire prompt available</p>
        </Card>
      );
    }

    // Split the prompt into sections for better readability
    const sections = result.questionnaire_prompt.split('\n\n').filter(section => section.trim());

    return (
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={index} className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {section}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>New Analysis</span>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
        </div>
      </div>

      {/* Job Details Summary */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Job Target Summary</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Target Role</p>
              <p className="font-medium text-gray-900">{jobDetails.targetRole}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Target Company</p>
              <p className="font-medium text-gray-900">{jobDetails.targetCompany}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Experience Level</p>
              <p className="font-medium text-gray-900">{jobDetails.yearsOfExperience}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Resume Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="questionnaire" className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Interview Prep</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Resume Analysis</h2>
            </div>
            {renderExtractedFields()}
          </div>
        </TabsContent>

        <TabsContent value="questionnaire">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Interview Preparation</h2>
            </div>
            {renderQuestionnairePrompt()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsDisplay;
