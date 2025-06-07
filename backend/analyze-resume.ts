// frontend/backend/analyze-resume.ts

// The dotenv library is loaded in server.ts, so no need to import/configure it here again.
// All environment variables will be available via process.env

import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';
import { Request, Response } from 'express'; // Import Express types for req/res

// Configure Gemini API
// IMPORTANT: process.env.GEMINI_API_KEY will be populated by 'dotenv' in server.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  // Log an error if the API key isn't found. This will show in your backend terminal.
  console.error("ERROR: GEMINI_API_KEY is not set. Please add it to your .env file in the frontend/ directory.");
  // In a production environment, you might want to consider more robust error handling
  // or a mechanism to prevent the server from starting if critical keys are missing.
}

// Initialize Gemini API client. The '|| '' is for TypeScript type safety as GEMINI_API_KEY can be undefined.
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

/**
 * Handles the resume analysis logic, including PDF parsing and Gemini API interaction.
 * This function is designed to be called by an Express.js route handler.
 *
 * @param req The Express Request object, containing the resumeBase64 and form fields in req.body.
 * @param res The Express Response object, used to send the JSON result or error back to the client.
 */
export async function handler(req: Request, res: Response) {
  console.log("Backend: analyze-resume handler started."); // Debug log

  // Ensure it's a POST request (Express handles this at the route level, but good to double-check)
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method Not Allowed. Only POST requests are accepted for this endpoint.' });
  }

  try {
    const { resumeBase64, Target_Role, Target_Company, Years_of_Experience } = req.body;

    // Log received data (for debugging purposes)
    console.log("Backend: Received data for analysis.", {
      Target_Role,
      Target_Company,
      Years_of_Experience,
      resumeBase64Length: resumeBase64?.length ? `${resumeBase64.length} chars` : '0 chars'
    });

    // Basic validation for required fields
    if (!resumeBase64 || !Target_Role || !Years_of_Experience) {
      console.error("Backend: Missing required fields in request body.");
      return res.status(400).json({ detail: 'Missing required form fields: resumeBase64, Target_Role, Years_of_Experience.' });
    }

    // Convert Base64 string back to a Buffer for pdf-parse
    const resumeBuffer = Buffer.from(resumeBase64, 'base64');
    console.log("Backend: PDF buffer created. Size:", resumeBuffer.length, "bytes.");

    // 1. Extract text from PDF using pdf-parse library
    let resumeText: string;
    try {
      const data = await pdf(resumeBuffer);
      resumeText = data.text;
      console.log(`Backend: PDF text extracted. Length: ${resumeText.length} characters.`);

      if (!resumeText.trim()) {
        console.error("Backend: No usable text extracted from PDF.");
        return res.status(400).json({ detail: "Could not extract text from the uploaded PDF. It might be empty, image-based, or corrupted." });
      }
    } catch (pdfError: any) {
      console.error("Backend: Error during PDF text extraction:", pdfError);
      return res.status(400).json({ detail: `Failed to read text from PDF: ${pdfError.message || 'Unknown PDF parsing error'}. Please ensure it's a valid and readable PDF file.` });
    }

    // 2. Prepare the detailed prompt for the Gemini API
    const promptTemplate = `
      You are an expert resume analyzer and career coach. Your task is to analyze a resume based on a target role, target company, and years of experience.
      Provide a structured JSON output with extracted fields and personalized feedback.

      Target Role: ${Target_Role}
      Target Company: ${Target_Company ? Target_Company : "Not specified"}
      Years of Experience sought: ${Years_of_Experience}

      Resume Text for Analysis:
      ---
      ${resumeText}
      ---

      Your response MUST be a single JSON object. This JSON object MUST have exactly two top-level keys:
      1. \`extracted_fields\`: A JSON object containing all clearly identifiable parsed resume data. Include the following sub-fields. If a field is not found or is ambiguous, set its value to \`null\` for single values or an empty array \`[]\` for lists.
         - \`name\` (string, full name of the candidate)
         - \`email\` (string)
         - \`phone\` (string)
         - \`linkedin\` (string, full URL if present)
         - \`skills\` (array of strings, categorize into technical and soft skills if possible, otherwise list all. Focus on industry-relevant keywords.)
         - \`work_experience\` (array of objects. Each object MUST have \`company\` (string), \`role\` (string), \`dates\` (string, e.g., "Jan 2020 - Present"), and \`description\` (string, summarizing responsibilities and quantifiable achievements as bullet points if available in the resume. Keep it concise.).)
         - \`education\` (array of objects. Each object MUST have \`degree\` (string), \`institution\` (string), and \`dates\` (string, e.g., "2018-2022").)
         - \`summary_or_objective\` (string, the candidate's personal summary or career objective if present at the top of the resume.)
         - \`certifications\` (array of strings, formal certifications or licenses.)
         - \`projects\` (array of objects. Each object MUST have \`name\` (string) and \`description\` (string, summarizing the project and its impact/technologies used.) - if present.
         - \`languages\` (array of strings, natural languages known and proficiency levels if specified.)

      2. \`questionnaire_prompt\`: A detailed, multi-paragraph string providing constructive, personalized feedback and a actionable questionnaire to help the user improve their resume for the specified target role and company. This feedback should:
         - **Start with a positive observation** about the resume's strengths relevant to the target role.
         - **Identify 1-3 specific areas for improvement**, e.g., lack of quantifiable achievements, missing keywords for the role, unclear career progression, formatting issues. Provide actionable advice for each.
         - **Suggest tailoring advice** specifically for the given 'Target Company' if enough context is provided, otherwise, provide general best practices for a company of that type/industry.
         - **Conclude with a clear, numbered questionnaire** (3-5 questions) that prompts the user to reflect on their experiences and how to better articulate them on their resume. These questions should help them generate new content or refine existing content.
         - Ensure the string uses markdown formatting like bullet points (\`*\`) and newlines (\`\\n\\n\`) to be easily readable when rendered on the frontend.

      Example Desired JSON Structure (Adhere strictly to this):
      \`\`\`json
      {
          "extracted_fields": {
              "name": "Alex Johnson",
              "email": "alex.j@example.com",
              "phone": "+1 (555) 123-4567",
              "linkedin": "[https://www.linkedin.com/in/alexjohnson](https://www.linkedin.com/in/alexjohnson)",
              "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "TensorFlow", "Pandas", "Scikit-learn", "Communication", "Teamwork"],
              "work_experience": [
                  {"company": "Data Insights Corp", "role": "Data Scientist", "dates": "Jan 2022 - Present", "description": "Developed predictive models for customer churn (15% reduction); Automated data pipelines saving 10 hours/week; Collaborated with cross-functional teams to deploy ML solutions."},
                  {"company": "Tech Solutions Inc.", "role": "Junior Analyst", "dates": "Aug 2019 - Dec 2021", "description": "Analyzed large datasets to identify market trends; Prepared reports for senior management; Assisted in A/B testing campaigns."}
              ],
              "education": [
                  {"degree": "M.Sc. Data Science", "institution": "State University", "dates": "2018-2020"},
                  {"degree": "B.Sc. Computer Science", "institution": "City College", "dates": "2014-2018"}
              ],
              "summary_or_objective": "Results-driven Data Scientist with 4+ years of experience in developing and deploying machine learning models to solve complex business problems. Seeking to leverage analytical skills to drive innovation at a leading tech company.",
              "certifications": ["Google Cloud Certified Professional Data Engineer"],
              "projects": [
                  {"name": "Customer Churn Prediction Model", "description": "Built a machine learning model in Python (TensorFlow) to predict customer churn with 90% accuracy, leading to targeted retention strategies."},
                  {"name": "Sales Forecasting Dashboard", "description": "Developed an interactive dashboard using SQL and Python to visualize sales trends, improving forecasting accuracy by 10%."}
              ],
              "languages": ["English (Native)", "Spanish (Conversational)"]
          },
          "questionnaire_prompt": "Your resume effectively highlights your data science skills and project experience, which are great assets for a Data Scientist role. You have strong technical proficiency and have delivered measurable results, as seen in your churn reduction achievement.\\n\\nTo further enhance your resume for a Senior Data Scientist role, particularly at a large company like Google, consider focusing on:\n\n* **Impact and Scale:** While you quantify some achievements, elaborate more on the *business impact* and the *scale* of the data/systems you've worked with. Google often looks for experience with massive datasets and distributed systems.\\n* **Leadership/Mentorship:** If you have any experience leading projects, mentoring junior colleagues, or driving initiatives, ensure this is clearly articulated.\\n* **Cultural Fit Keywords:** Research Google's core values and common phrases in their job descriptions (e.g., 'impact', 'innovation', 'problem-solving at scale') and naturally weave them into your descriptions where appropriate.\\n\\nHere's a questionnaire to help you refine your resume content:\\n\\n1.  Can you provide more context or details on the scale of the customer data you worked with (e.g., number of customers, data volume)?\\n2.  Describe a time you faced a significant challenge in a data science project. How did you overcome it, and what was the outcome?\\n3.  Have you ever led a data science initiative from conception to deployment? If so, what was your specific role and the team's achievement?\\n4.  Can you give an example of how your work directly influenced a key business decision or product feature at your previous companies?"
          }
      }
      \`\`\`
    `;

    // 3. Call the Gemini API
    console.log("Backend: Calling Gemini API with generated prompt..."); // Debug log
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const geminiOutputText = response.text();
    console.log(`Backend: Received response from Gemini. Text length: ${geminiOutputText.length} characters.`);
    // console.log("Backend: Gemini Raw Output (for debugging):", geminiOutputText); // TEMPORARY: VERY VERBOSE, REMOVE IN PRODUCTION!

    // 4. Parse Gemini API Response
    let jsonOutput: any; // Use 'any' for now, or define a specific type for your expected JSON output
    try {
      jsonOutput = JSON.parse(geminiOutputText);
      console.log("Backend: Successfully parsed Gemini response as JSON."); // Debug log
    } catch (parseError: any) {
      console.error("Backend: Failed to parse Gemini response as pure JSON. Attempting robust parsing...", parseError);
      console.error("Backend: Raw text received:", geminiOutputText); // Log raw output for debugging JSON parsing issues

      // Attempt to extract JSON from markdown code block (common model behavior)
      const jsonMatch = geminiOutputText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonOutput = JSON.parse(jsonMatch[1]);
        console.log("Backend: Successfully parsed JSON from markdown block.");
      } else {
        // Fallback: try to find the first and last curly brace as a last resort
        const firstBrace = geminiOutputText.indexOf('{');
        const lastBrace = geminiOutputText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonOutput = JSON.parse(geminiOutputText.substring(firstBrace, lastBrace + 1));
          console.log("Backend: Successfully parsed JSON using brace fallback.");
        } else {
          console.error("Backend: Final attempt to parse JSON failed. Returning generic error.");
          // If all parsing attempts fail, return an error to the frontend
          return res.status(500).json({ detail: "Failed to parse AI response into expected format. Please try again later." });
        }
      }
    }

    // 5. Send the structured JSON back to the frontend
    res.status(200).json(jsonOutput);
    console.log("Backend: Response successfully sent to frontend."); // Debug log

  } catch (error: any) {
    console.error('Backend: Unhandled error in analyze-resume handler:', error);
    res.status(500).json({ detail: `Internal server error during resume analysis: ${error.message || 'Unknown error'}. Please try again later.` });
  }
}