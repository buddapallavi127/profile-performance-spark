// frontend/backend/server.ts
import 'dotenv/config'; // Loads environment variables from your .env file
import express from 'express';
import cors from 'cors';
import { handler as analyzeResumeHandler } from './analyze-resume'; // Import your specific handler

const app = express();
// The backend server will run on port 3001. Your Vite frontend will run on 8080 (or its default).
const PORT = process.env.PORT || 3001;

// --- Middleware Setup ---

// Enable CORS (Cross-Origin Resource Sharing)
// During development, allow requests from any origin.
// In production, tighten this to only allow your frontend's domain:
// app.use(cors({ origin: 'https://your-frontend-domain.com' }));
app.use(cors());

// Parse JSON request bodies.
// 'limit' is crucial here for large Base64 encoded PDF strings. 50MB is a generous default.
app.use(express.json({ limit: '50mb' }));

// --- API Routes ---

// Define a POST route for your resume analysis endpoint
// When the frontend makes a POST request to /api/analyze-resume, this will be triggered.
app.post('/api/analyze-resume', async (req, res) => {
    console.log("Server: Received POST request for /api/analyze-resume."); // Debug log
    try {
        // Delegate the core logic to your analyzeResumeHandler
        await analyzeResumeHandler(req, res);
    } catch (error) {
        console.error('Server: Error caught in /api/analyze-resume route:', error);
        // Ensure an error response is always sent, even for uncaught errors from the handler.
        if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
            res.status(500).json({ detail: 'An unexpected server error occurred during analysis.' });
        }
    }
});

// Add a simple health check or root route for testing if the server is up
app.get('/', (req, res) => {
    res.status(200).send('Node.js backend server is running and healthy!');
});

// --- Start the Server ---

app.listen(PORT, () => {
    console.log(`Node.js backend server started successfully!`);
    console.log(`Listening on http://localhost:${PORT}`);
    console.log(`(Your frontend dev server at ${process.env.VITE_DEV_PORT || '8080'} will proxy /api requests to this port.)`);
});