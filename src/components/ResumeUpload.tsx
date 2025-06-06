
import React, { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFileSelect, selectedFile }) => {
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      onFileSelect(file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for analysis.`,
      });
    }
  }, [onFileSelect, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file only.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      onFileSelect(file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for analysis.`,
      });
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    toast({
      title: "File removed",
      description: "Resume file has been removed.",
    });
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors p-8 text-center cursor-pointer bg-gray-50 hover:bg-blue-50"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your resume here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                PDF files only, up to 5MB
              </p>
            </div>
          </div>
          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </Card>
      ) : (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResumeUpload;
