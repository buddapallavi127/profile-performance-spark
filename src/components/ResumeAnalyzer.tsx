import React, { useCallback } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// Adjust path if your validation file is located elsewhere
import { resumeSchema, ResumeFormValues } from "../lib/validation";

const ResumeAnalyzer: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
  });

  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const resumeFile = watch("resume");

  const onFileChange = useCallback(
    (file?: File) => {
      if (file) {
        setValue("resume", file, { shouldValidate: true });
        setError("");
      }
    },
    [setValue]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        onFileChange(file);
        e.dataTransfer.clearData();
      } else {
        setError("Only PDF files are accepted via drag and drop.");
        setValue("resume", undefined);
      }
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onSubmit = async (data: ResumeFormValues) => {
    setIsAnalyzing(true);
    setError("");
    setResult(null);

    if (!(data.resume instanceof File)) {
      setError("Please upload a valid PDF file.");
      setIsAnalyzing(false);
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(data.resume);

    fileReader.onload = async (event) => {
      try {
        const base64Pdf = event.target?.result?.toString().split(',')[1];

        if (!base64Pdf) {
          setError("Failed to read PDF file for analysis.");
          setIsAnalyzing(false);
          return;
        }

        const payload = {
          resumeBase64: base64Pdf,
          Target_Role: data.Target_Role,
          Target_Company: data.Target_Company,
          Years_of_Experience: String(data.Years_of_Experience),
        };

        // This sends the request to your Node.js backend server, proxied by Vite dev server
        const res = await axios.post("/api/analyze-resume", payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setResult(res.data);
      } catch (err) {
        console.error("Analysis error:", err);
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.detail || "Failed to analyze resume. Please try again later.");
        } else {
          setError("Failed to analyze resume. Please try again later.");
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    fileReader.onerror = () => {
      setError("Failed to read PDF file.");
      setIsAnalyzing(false);
    };
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-3xl font-bold text-white">Resume Analyzer</h2>
          <p className="text-blue-100 mt-1">
            Upload your resume and get personalized feedback
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Drag and Drop + Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Resume (PDF)
              </label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer"
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-400 justify-center items-center">
                    <label
                      htmlFor="resume-upload"
                      className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="resume-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === "application/pdf") {
                            onFileChange(file);
                          } else {
                            setError("Please upload a valid PDF file.");
                            setValue("resume", undefined);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  {resumeFile && resumeFile instanceof File && (
                    <p className="mt-2 text-sm text-gray-400">Selected file: {resumeFile.name}</p>
                  )}
                  {errors.resume && (
                    <p className="mt-2 text-sm text-red-400">{errors.resume.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Target Role */}
            <div>
              <label htmlFor="Target_Role" className="block text-sm font-medium text-gray-300 mb-2">
                Target Role
              </label>
              <input
                id="Target_Role"
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                {...register("Target_Role")}
                className="block w-full bg-gray-800 border border-gray-700 text-white rounded-md py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />
              {errors.Target_Role && (
                <p className="mt-2 text-sm text-red-400">{errors.Target_Role.message}</p>
              )}
            </div>

            {/* Target Company */}
            <div>
              <label htmlFor="Target_Company" className="block text-sm font-medium text-gray-300 mb-2">
                Target Company (Optional)
              </label>
              <input
                id="Target_Company"
                type="text"
                placeholder="e.g. Google, Amazon, etc."
                {...register("Target_Company")}
                className="block w-full bg-gray-800 border border-gray-700 text-white rounded-md py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />
              {errors.Target_Company && (
                <p className="mt-2 text-sm text-red-400">{errors.Target_Company.message}</p>
              )}
            </div>

            {/* Years of Experience */}
            <div>
              <label htmlFor="Years_of_Experience" className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                id="Years_of_Experience"
                type="text"
                placeholder="e.g. 5"
                {...register("Years_of_Experience")}
                className="block w-full bg-gray-800 border border-gray-700 text-white rounded-md py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />
              {errors.Years_of_Experience && (
                <p className="mt-2 text-sm text-red-400">{errors.Years_of_Experience.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isAnalyzing}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  <div className="mt-2 text-sm text-red-200">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
         {result && !error && (
  <>
    {/* Success Message */}
    <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-300">Successfully Submitted</h3>
          <div className="mt-2 text-sm text-green-200">
            <p>Your resume was analyzed successfully and saved as a JSON file.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Extracted Information */}
    <div className="mt-8 space-y-6">
      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Extracted Information</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conditional rendering to ensure extracted_fields exists and is an object */}
            {result.extracted_fields && typeof result.extracted_fields === 'object' ? (
                Object.entries(result.extracted_fields).map(([key, value]) => (
                <div key={key} className="bg-gray-900/50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-400 capitalize">
                    {key.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                    </p>
                </div>
                ))
            ) : (
                <p className="text-gray-400 col-span-2">No extracted fields available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Personalized Feedback */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personalized Feedback</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="prose prose-invert max-w-none">
            {/* Conditional rendering for questionnaire_prompt */}
            {result.questionnaire_prompt ? (
                <p className="text-gray-300 whitespace-pre-wrap">{result.questionnaire_prompt}</p>
            ) : (
                <p className="text-gray-400">No personalized feedback available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Raw JSON Response (Debugging) */}
      <div className="mt-8 p-4 bg-gray-800 rounded text-white font-mono text-xs overflow-auto max-h-64">
        <h3 className="mb-2 font-semibold">Raw JSON Response (Debugging)</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  </>
)}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;