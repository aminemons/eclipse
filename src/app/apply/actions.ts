// src/app/apply/actions.ts
'use server';

import connectDB from '@/lib/db'; // Adjust path if needed
import Applicant, { IApplicant } from '@/models/Applicant'; // Adjust path if needed
import mammoth from 'mammoth';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
// Optional: import { revalidatePath } from 'next/cache'; // If you need to refresh other pages

// --- Configuration Constants ---
const ALLOWED_CV_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MIN_CV_SIZE_BYTES = 1024; // 1 KB
const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_TEXT_LENGTH_FOR_SUMMARY = 50; // Min characters needed to attempt Gemini summary
const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"; // Or "gemini-1.5-pro-latest"
const MAX_TEXT_TO_SEND_TO_GEMINI = 15000; // Limit chars sent to Gemini for cost/performance

// --- Gemini API Setup ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("------------------------------------------------------------");
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
    console.warn("CV summarization via Gemini API will be disabled.");
    console.warn("Set GEMINI_API_KEY in your .env.local or environment.");
    console.warn("------------------------------------------------------------");
}

// Initialize Gemini Client conditionally
let geminiModel: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;
if (GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({
            model: GEMINI_MODEL_NAME,
            // Optional safety settings - adjust thresholds as needed
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ]
        });
        console.log(`Gemini client initialized with model: ${GEMINI_MODEL_NAME}`);
    } catch (error) {
        console.error("Error initializing GoogleGenerativeAI:", error);
        geminiModel = null; // Ensure it's null if init fails
    }
}

// --- Helper Function ---
function arrayBufferToBuffer(arrayBuffer: ArrayBuffer): Buffer {
    return Buffer.from(arrayBuffer);
}

/**
 * Server Action to handle applicant form submissions.
 * Validates input, extracts text from .docx CV, optionally calls Gemini API for summary,
 * and saves the applicant data to the database.
 */
export async function uploadApplicantAction(
    formData: FormData
): Promise<{ success: boolean; error?: string; applicantId?: string; summary?: string | null }> {
    let operation = 'Connecting to DB'; // For detailed error tracking
    let applicantInfo = 'N/A'; // Basic info for logging context

    try {
        console.log(`[Apply Action] ${operation}...`);
        await connectDB();
        console.log(`[Apply Action] DB Connected.`);

        operation = 'Retrieving form data';
        console.log(`[Apply Action] ${operation}...`);
        const name = formData.get('name') as string | null;
        const email = formData.get('email') as string | null;
        const cvFile = formData.get('cv') as File | null;
        applicantInfo = `Name: ${name ?? '?'}, Email: ${email ?? '?'}`;
        console.log(`[Apply Action] Retrieved: ${applicantInfo}, CV: ${cvFile?.name ?? 'None'}`);


        // --- Server-Side Validations ---
        operation = 'Validating input fields';
        console.log(`[Apply Action] ${operation}...`);
        if (!name || !email || !cvFile) {
            console.error(`[Apply Action] Validation Failed: Missing required fields. ${applicantInfo}`);
            return { success: false, error: 'Name, Email, and CV file are required.' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            console.error(`[Apply Action] Validation Failed: Invalid email format for ${email}`);
            return { success: false, error: 'Please provide a valid email address.' };
        }

        operation = 'Validating CV file';
        console.log(`[Apply Action] ${operation}... Type: ${cvFile.type}, Size: ${cvFile.size} bytes`);
        if (cvFile.type !== ALLOWED_CV_TYPE) {
            console.error(`[Apply Action] Validation Failed: Invalid CV file type (${cvFile.type}). ${applicantInfo}`);
            return { success: false, error: `Invalid CV file type. Only .docx files are accepted.` };
        }
        if (cvFile.size < MIN_CV_SIZE_BYTES || cvFile.size > MAX_CV_SIZE_BYTES) {
            console.error(`[Apply Action] Validation Failed: CV file size (${cvFile.size} bytes) out of range. ${applicantInfo}`);
            return { success: false, error: `CV file size must be between ${MIN_CV_SIZE_BYTES / 1024}KB and ${MAX_CV_SIZE_BYTES / 1024 / 1024}MB.` };
        }
        console.log(`[Apply Action] Input and File validation passed for ${applicantInfo}.`);
        // --- End Validations ---


        operation = 'Reading CV file buffer';
        console.log(`[Apply Action] ${operation} for ${applicantInfo}...`);
        const cvArrayBuffer = await cvFile.arrayBuffer();
        const cvBuffer = arrayBufferToBuffer(cvArrayBuffer);
        if (!cvBuffer || cvBuffer.length === 0) {
            console.error(`[Apply Action] Error: Uploaded CV file buffer is empty. ${applicantInfo}`);
            return { success: false, error: 'Uploaded CV file is empty or could not be read.' };
        }
        console.log(`[Apply Action] CV Buffer obtained, Size: ${cvBuffer.length} bytes.`);


        // --- Mammoth Text Extraction ---
        operation = 'Extracting text from .docx using Mammoth';
        let cvText = '';
        try {
            console.log(`[Apply Action] ${operation} for ${applicantInfo}...`);
            const result = await mammoth.extractRawText({ buffer: cvBuffer });
            cvText = result.value.trim();
            if (cvText.length < MIN_TEXT_LENGTH_FOR_SUMMARY) {
                console.warn(`[Apply Action] Warning: Extracted text is very short (${cvText.length} chars). Summary might be inaccurate or skipped. ${applicantInfo}`);
            } else {
                console.log(`[Apply Action] Text extracted successfully. Length: ${cvText.length} chars.`);
            }
            // Log mammoth messages if any warnings occurred during parsing
            if (result.messages && result.messages.length > 0) {
                console.warn(`[Apply Action] Mammoth messages during extraction for ${applicantInfo}:`, result.messages);
            }
        } catch (extractError: any) {
            console.error(`[Apply Action] CRITICAL ERROR during Mammoth text extraction for ${applicantInfo}:`, extractError);
            // Consider if the CV is useless without text. Returning error seems safer.
            return { success: false, error: 'Failed to read the content of the .docx file. Please ensure it is valid and not corrupted.' };
        }
        // --- End Mammoth ---


        // --- Gemini 1.5 API Call (Conditional) ---
        operation = 'Processing CV with Gemini API';
        let cvSummary: string | null = null; // Holds the result from Gemini

        if (geminiModel && cvText.length >= MIN_TEXT_LENGTH_FOR_SUMMARY) {
            try {
                console.log(`[Apply Action] ${operation} for ${applicantInfo}...`);

                // ** CRITICAL: Define your prompt carefully! **
                const prompt = `
Analyze the following Curriculum Vitae (CV) text extracted from a .docx file.
Provide a concise summary (3-5 bullet points) highlighting the candidate's key skills, core competencies, years of experience (if mentioned), and most recent relevant roles.
Focus on professional aspects. Do not include contact information (email, phone, address) in the summary.
If the text does not appear to be a valid CV, state that clearly.

CV Text (first ${MAX_TEXT_TO_SEND_TO_GEMINI} characters):
---
${cvText.substring(0, MAX_TEXT_TO_SEND_TO_GEMINI)}
---

Concise Summary:
`;
                const result = await geminiModel.generateContent(prompt);
                // TODO: Consider adding more robust response handling (check finishReason, safetyRatings etc.)
                // See: https://ai.google.dev/gemini-api/docs/safety-settings
                const response = result.response;
                const summaryText = response.text()?.trim();

                if (summaryText) {
                    cvSummary = summaryText;
                    console.log(`[Apply Action] Gemini summary generated successfully for ${applicantInfo}.`);
                } else {
                    console.warn(`[Apply Action] Gemini generated an empty response for ${applicantInfo}.`);
                    cvSummary = "Could not generate summary from CV content."; // Placeholder
                }

            } catch (geminiError: any) {
                console.error(`[Apply Action] ERROR calling Gemini API for ${applicantInfo}:`, geminiError);
                // Decide how to handle: fail, or proceed without summary?
                // Setting summary to an error message allows saving the applicant record anyway.
                cvSummary = `Error generating summary: ${geminiError.message || 'Unknown API error'}`;
            }
        } else {
            if (!geminiModel) {
                console.warn(`[Apply Action] Skipping Gemini processing: API Key/Model not configured.`);
            } else {
                console.warn(`[Apply Action] Skipping Gemini processing for ${applicantInfo}: Extracted text is too short (${cvText.length} chars).`);
            }
            operation = 'Skipping Gemini Processing'; // Update operation status for logging
        }
        // --- End Gemini ---


        // --- Save to Database ---
        operation = 'Saving applicant data to MongoDB';
        console.log(`[Apply Action] ${operation} for ${applicantInfo}...`);
        // @ts-ignore
        const applicantData: Partial<IApplicant> = {
            name: name,
            email: email,
            cvBuffer: cvBuffer, // Original buffer
            cvText: cvText,     // Mammoth's extracted text
            cvSummary: cvSummary // Gemini's summary (or null/error string)
        };

        const newApplicant = new Applicant(applicantData);
        await newApplicant.save(); // This might throw validation or DB errors
        // @ts-ignore
        const applicantId = newApplicant._id.toString();

        console.log(`[Apply Action] Applicant saved successfully! ID: ${applicantId}, ${applicantInfo}`);
        // --- End Save ---

        // Optionally revalidate paths if needed
        // revalidatePath('/hr-dashboard'); // Example

        // --- Success Response ---
        return {
            success: true,
            applicantId: applicantId,
            summary: cvSummary // Return the summary (or null/error) to the client if desired
        };

    } catch (error: any) {
        console.error(`------------------------------------------------------------`);
        console.error(`[Apply Action] FAILURE during operation: "${operation}" for ${applicantInfo}`);
        console.error(`[Apply Action] Error:`, error);
        console.error(`------------------------------------------------------------`);

        // --- Specific Error Handling ---
        if (error.code === 11000 && error.keyPattern?.email) {
            return { success: false, error: 'This email address has already submitted an application.' };
        }
        if (error.name === 'ValidationError') {
            // Extract Mongoose validation messages
            const messages = Object.values(error.errors).map((e: any) => e.message);
            return { success: false, error: `Submission Error: ${messages.join('. ')}` };
        }
        // Catch potential DB connection/operation timeouts
        if (error instanceof Error && (error.message.toLowerCase().includes('timed out') || error.message.toLowerCase().includes('timeout'))) {
            return { success: false, error: 'The database operation timed out. Please try again later.' };
        }

        // Generic fallback for other unexpected errors
        return { success: false, error: `An unexpected server error occurred during "${operation}". Please try again.` };
    }
}