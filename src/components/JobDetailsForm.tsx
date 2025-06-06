
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { JobDetails } from '@/pages/Index';

interface JobDetailsFormProps {
  jobDetails: JobDetails;
  onJobDetailsChange: (details: JobDetails) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
}

const JobDetailsForm: React.FC<JobDetailsFormProps> = ({
  jobDetails,
  onJobDetailsChange,
  onAnalyze,
  isAnalyzing,
  canAnalyze
}) => {
  const handleInputChange = (field: keyof JobDetails, value: string) => {
    onJobDetailsChange({
      ...jobDetails,
      [field]: value
    });
  };

  const experienceOptions = [
    "Entry Level (0-1 years)",
    "Junior (1-3 years)",
    "Mid-Level (3-5 years)",
    "Senior (5-8 years)",
    "Lead (8-12 years)",
    "Principal/Staff (12+ years)"
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="target-role" className="text-sm font-medium text-gray-700">
            Target Role *
          </Label>
          <Input
            id="target-role"
            placeholder="e.g., Senior Software Engineer"
            value={jobDetails.targetRole}
            onChange={(e) => handleInputChange('targetRole', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="target-company" className="text-sm font-medium text-gray-700">
            Target Company *
          </Label>
          <Input
            id="target-company"
            placeholder="e.g., Google, Microsoft, Meta"
            value={jobDetails.targetCompany}
            onChange={(e) => handleInputChange('targetCompany', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
            Years of Experience *
          </Label>
          <Select
            value={jobDetails.yearsOfExperience}
            onValueChange={(value) => handleInputChange('yearsOfExperience', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">AI Analysis Ready</span>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Our AI will analyze your resume against the target role and provide personalized insights
          </p>
          <Button
            onClick={onAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default JobDetailsForm;
