// src/utils/match.ts
// Enhanced matching system modified to compare request text against applicant summaries.

import { FeatureExtractionPipeline, pipeline, Pipeline } from '@xenova/transformers';
import mammoth, { extractRawText } from 'mammoth'; // Keep for potential utility, though not main flow
import { IApplicant } from '@/models/Applicant'; // Ensure paths are correct
import { IRequest } from '@/models/Request';   // Ensure paths are correct
import * as natural from 'natural';

// --- Configuration Interface ---
interface MatchingConfig {
    modelName: string;
    // minTextLength/maxTextLength now apply to summaries when analyzing them
    minTextLength: number;
    maxTextLength: number; // Max length of *summary* to process
    minSimilarityThreshold: number;
    embeddingDimensions: number;
    pipelineLoadRetries: number;
    concurrencyLimit: number;
    huggingFaceToken?: string;
}

// --- Default Configuration (Adjusted for Summary Focus) ---
const DEFAULT_CONFIG: MatchingConfig = {
    modelName: 'Xenova/all-MiniLM-L6-v2', // Standard embedding model
    minTextLength: 10,  // Summaries can be short
    maxTextLength: 5000, // Set a reasonable max length for summaries
    minSimilarityThreshold: 0.3, // Overall score threshold
    embeddingDimensions: 384,
    pipelineLoadRetries: 3,
    concurrencyLimit: 5, // Parallel processing limit
};

// --- Custom Error Types ---
class TextProcessingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TextProcessingError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TextProcessingError);
        }
    }
}

class MatchingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MatchingError';
    }
}

// --- Logger Implementation ---
interface Logger {
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}

class ConsoleLogger implements Logger {
    info(message: string, ...args: any[]): void { console.log(`[INFO] ${message}`, ...args); }
    warn(message: string, ...args: any[]): void { console.warn(`[WARN] ${message}`, ...args); }
    error(message: string, ...args: any[]): void { console.error(`[ERROR] ${message}`, ...args); }
    debug(message: string, ...args: any[]): void { console.debug(`[DEBUG] ${message}`, ...args); }
}

// --- CV Parser Implementation (Kept as utility, not primary in this flow) ---
class CVParser {
    constructor(private logger: Logger) {}

    // ... (detectFileType, parseWordDocument, parseHtmlDocument methods remain the same) ...
    // Example parse method if needed elsewhere:
    async parseCV(cvBuffer: Buffer): Promise<string> {
        try {
            if (!cvBuffer || cvBuffer.length === 0) {
                throw new TextProcessingError('Empty or invalid CV buffer provided');
            }
            const fileType = this.detectFileType(cvBuffer); // Assuming detectFileType exists
            this.logger.info(`Detected file type: ${fileType}`);

            let extractedText: string;
            switch (fileType) {
                case 'docx':
                    extractedText = await this.parseWordDocument(cvBuffer); // Assuming this exists
                    break;
                // Add cases for pdf, txt, html if parseHtmlDocument etc. exist
                default:
                    throw new TextProcessingError(`Unsupported file format for direct parsing: ${fileType}`);
            }
            // Return raw text here, processExtractedText might be separate if used
            return extractedText;
        } catch (error) {
            // ... error handling ...
            throw new TextProcessingError(`CV parsing failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Helper placeholder, adapt if needed
    private detectFileType(buffer: Buffer): string { return 'docx'; /* Simplified */}
    private async parseWordDocument(buffer: Buffer): Promise<string> { /* Uses mammoth */
        const { value } = await extractRawText({ buffer });
        return value;
    }
}
// Function to clean text (can be used for request or summary if needed)
function processExtractedText(text: string, logger: Logger): string {
    if (!text) {
        throw new TextProcessingError(`Text content is empty`);
    }
    if (text.trim().length < DEFAULT_CONFIG.minTextLength) {
        logger.warn(`Text is very short (${text?.length || 0} chars)`);
        // Decide if this should be an error based on context
    }

    let cleaned = text
        // Remove control characters etc.
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        .replace(/\s+/g, ' ') // Consolidate whitespace
        .trim();

    if (cleaned.length > DEFAULT_CONFIG.maxTextLength) {
        logger.warn(`Text is large (${cleaned.length} chars), truncating`);
        cleaned = cleaned.substring(0, DEFAULT_CONFIG.maxTextLength);
    }
    return cleaned;
}


// --- Embedding Service Implementation (No changes needed here) ---
class EmbeddingService {
    // ... (code remains exactly the same as before) ...
    private static instance: EmbeddingService | null = null;
    private pipeline: Pipeline | null = null;
    private isLoading: boolean = false;
    private loadingPromise: Promise<Pipeline> | null = null;
    private config: MatchingConfig;
    private logger: Logger;

    private constructor(config: MatchingConfig, logger: Logger) {
        this.config = config;
        this.logger = logger;
    }

    // @ts-ignore
    public static getInstance(config: MatchingConfig, logger: Logger): EmbeddingService { /* ... */ }
    // @ts-ignore
    async getEmbeddingPipeline(): Promise<Pipeline> { /* ... */ }
    // @ts-ignore
    private async loadPipelineWithRetry(): Promise<FeatureExtractionPipeline> { /* ... */ }
    public static clearInstance(): void { EmbeddingService.instance = null; }

}


// --- Text Analysis Implementation ---
interface TextFeatures {
    embedding: number[];
    keywords: Map<string, number>;
    skills: Set<string>;
    // We might still parse these from the *request*, but likely not relevant from *summary*
    education: string[];
    experience: number;
    // Sections might not be applicable to summaries
    // sections: Map<string, string>;
}

class TextAnalyzer {
    // SKILLS_KEYWORDS, EDUCATION_PATTERNS, EXPERIENCE_PATTERNS remain the same
    // ... (Static keywords and patterns definitions as before) ...
    private static readonly SKILLS_KEYWORDS = new Set(['python', /* ... more skills ... */ 'adaptability']);
    private static readonly EDUCATION_PATTERNS = [ /* ... patterns ... */];
    private static readonly EXPERIENCE_PATTERNS = [ /* ... patterns ... */];


    constructor(private logger: Logger) {}

    // Extracts features. Note: Education/Experience/Sections might be empty/zero when run on a summary.
    async extractFeatures(text: string): Promise<TextFeatures> {
        // Use the shared text processing function
        const processedText = processExtractedText(text, this.logger).toLowerCase();

        const [embedding, keywords] = await Promise.all([
            this.generateEmbedding(processedText),
            this.extractKeywords(processedText),
            // Removed section extraction as it's unlikely useful for summaries
        ]);

        const skills = this.extractSkills(processedText); // Simpler skill extraction from overall text
        const education = this.extractEducation(processedText); // Will likely find little in summary
        const experience = this.estimateYearsExperience(processedText); // Will likely find little in summary

        return {
            embedding,
            keywords,
            skills,
            education, // Retain for request analysis, may be empty for summary
            experience, // Retain for request analysis, may be 0 for summary
        };
    }

    // @ts-ignore
    private async generateEmbedding(text: string): Promise<number[]> { /* ... (Same as before) ... */ }

    // @ts-ignore
    private async extractKeywords(text: string): Promise<Map<string, number>> { /* ... (Same as before) ... */ }

    // Simplified: Search for skills in the entire (lowercased) text provided
    private extractSkills(processedText: string): Set<string> {
        const skills = new Set<string>();
        for (const skill of TextAnalyzer.SKILLS_KEYWORDS) {
            // Use word boundary to avoid partial matches (e.g., 'react' in 'reaction')
            const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (skillRegex.test(processedText)) {
                skills.add(skill); // Store lowercase skill
            }
        }
        return skills;
    }

    // These will likely yield poor results on summaries but are kept for analyzing the *request* text
    // @ts-ignore
    private extractEducation(processedText: string): string[] { /* ... (Same as before, operating on processedText) ... */ }
    // @ts-ignore
    private estimateYearsExperience(processedText: string): number { /* ... (Same as before, operating on processedText) ... */ }

    // Section extraction removed as it's less relevant for comparing summaries
}

// --- Matching Engine Implementation (Adjusted Weights) ---
interface MatchScore {
    total: number; // Weighted final score
    embedding: number; // Cosine similarity score
    keywords: number; // Overlapping keywords score
    skills: number; // Overlapping skills score
    // Education/Experience scores are now informational, not heavily weighted
    educationMatch: number;
    experienceMatch: number;
}

class MatchingEngine {
    private textAnalyzer: TextAnalyzer;
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
        this.textAnalyzer = new TextAnalyzer(logger);
    }

    async compareTexts(requestText: string, applicantSummary: string): Promise<MatchScore> {
        // Generate features for both the full request and the applicant summary
        const [requestFeatures, summaryFeatures] = await Promise.all([
            this.textAnalyzer.extractFeatures(requestText),
            this.textAnalyzer.extractFeatures(applicantSummary) // Analyze the summary
        ]);

        // --- Calculate individual component scores ---
        const embeddingScore = this.cosineSimilarity(requestFeatures.embedding, summaryFeatures.embedding);
        const keywordScore = this.calculateKeywordScore(requestFeatures.keywords, summaryFeatures.keywords);
        const skillsScore = this.calculateSkillsScore(requestFeatures.skills, summaryFeatures.skills);

        // Calculate education/experience match minimally - primarily based on request expectations vs summary findings (likely low match)
        const educationMatch = this.calculateEducationMatch(requestFeatures.education, summaryFeatures.education);
        const experienceMatch = this.calculateExperienceMatch(requestFeatures.experience, summaryFeatures.experience);

        // --- Adjusted Weights (Focus on semantic + skills/keywords from summary) ---
        const weights = {
            embedding: 0.50, // Increased semantic matching weight
            keywords: 0.20, // Moderate keyword weight
            skills: 0.30, // Increased skills weight
            // Education/Experience contribute minimally or not at all to the main score
            // education: 0.0,
            // experience: 0.0
        };

        const total =
            (embeddingScore * weights.embedding) +
            (keywordScore * weights.keywords) +
            (skillsScore * weights.skills);
        // Don't add education/experience to total score when comparing summaries,
        // unless specifically designed to work well with summaries.

        return {
            total: Math.max(0, Math.min(1, total)), // Clamp score between 0 and 1
            embedding: embeddingScore,
            keywords: keywordScore,
            skills: skillsScore,
            educationMatch: educationMatch, // Keep for potential display/filtering
            experienceMatch: experienceMatch, // Keep for potential display/filtering
        };
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number { /* ... (Same as before) ... */ }

    private calculateKeywordScore(requestKeywords: Map<string, number>, summaryKeywords: Map<string, number>): number { /* ... (Same as before, using summary keywords) ... */ }

    private calculateSkillsScore(requestSkills: Set<string>, summarySkills: Set<string>): number { /* ... (Same as before, using summary skills) ... */ }

    // Minimal scoring for Ed/Exp based on summary features (likely inaccurate)
    private calculateEducationMatch(requestEdu: string[], summaryEdu: string[]): number {
        // Basic check if request expects education and summary mentions *anything* education-like
        if (requestEdu.length > 0 && summaryEdu.length > 0) return 0.5; // Low confidence match
        if (requestEdu.length == 0) return 1.0; // Request doesn't care
        return 0.0; // Request cares, summary shows nothing
    }

    private calculateExperienceMatch(requestExp: number, summaryExp: number): number {
        // Check if request has exp requirement & summary provides *any* estimation
        if (requestExp > 0 && summaryExp > 0) {
            // Simple ratio, likely inaccurate from summary analysis
            return Math.min(1.0, summaryExp / requestExp);
        }
        if (requestExp <= 0) return 1.0; // Request doesn't care
        return 0.0; // Request cares, summary shows nothing (or analyzer failed)
    }
}

// --- Main Matching Function (Modified) ---
export async function findTopMatchesBySummary( // Renamed for clarity
    request: IRequest,
    applicants: IApplicant[],
    topN: number = 5,
    config: Partial<MatchingConfig> = {}
): Promise<{ applicant: IApplicant; score: MatchScore }[]> {
    const mergedConfig: MatchingConfig = { ...DEFAULT_CONFIG, ...config };
    const logger = new ConsoleLogger();
    // CVParser is not directly needed here, MatchingEngine contains TextAnalyzer
    const matchingEngine = new MatchingEngine(logger);

    if (!request || !request.position) {
        logger.error('Invalid request object provided');
        throw new MatchingError('Request data is missing or invalid.');
    }
    if (!applicants || applicants.length === 0) {
        logger.warn('No applicants provided for matching.');
        return [];
    }

    logger.info(`Starting summary matching for position: "${request.position}" with ${applicants.length} applicants.`);
    const requestText = buildRequestText(request); // Build full request text for analysis
    const matches: { applicant: IApplicant; score: MatchScore }[] = [];
    const errors: string[] = [];

    // Process applicants, potentially in parallel batches
    const batchSize = mergedConfig.concurrencyLimit;
    for (let i = 0; i < applicants.length; i += batchSize) {
        const batch = applicants.slice(i, i + batchSize);
        logger.debug(`Processing batch ${i / batchSize + 1}, size: ${batch.length}`);

        const batchPromises = batch.map(async (applicant) => {
            const applicantId = applicant._id || applicant.email || 'Unknown Applicant';
            try {
                // Get the text to compare: the applicant's SUMMARY
                const applicantSummary = getApplicantSummaryText(applicant); // Use specific function

                logger.debug(`Comparing request to summary for applicant ${applicantId}`);
                const score = await matchingEngine.compareTexts(requestText, applicantSummary);

                // Log score details for debugging if needed
                logger.debug(`Scores for ${applicantId}: Total=${score.total.toFixed(3)}, Embed=${score.embedding.toFixed(3)}, Keywords=${score.keywords.toFixed(3)}, Skills=${score.skills.toFixed(3)}`);

                if (score.total >= mergedConfig.minSimilarityThreshold) {
                    matches.push({ applicant, score });
                } else {
                    logger.debug(`Applicant ${applicantId} below threshold (${score.total.toFixed(3)} < ${mergedConfig.minSimilarityThreshold})`);
                }
            } catch (error) {
                let message = `Error processing applicant ${applicantId}: Unknown error`;
                if (error instanceof Error) {
                    message = `Error processing applicant ${applicantId}: ${error.message}`;
                }
                logger.error(message); // Log the specific error
                errors.push(message); // Collect errors
            }
        });

        // Wait for the current batch to complete
        await Promise.all(batchPromises);
    }

    if (errors.length > 0) {
        logger.warn(`Matching completed with ${errors.length} processing errors (out of ${applicants.length} applicants).`);
        // Optionally throw an error or return partial results based on policy
    } else {
        logger.info(`Matching completed successfully for all applicants.`);
    }

    // Sort by the final total score and return the top N
    return matches
        .sort((a, b) => b.score.total - a.score.total)
        .slice(0, topN);
}

// --- Helper Functions ---

// Builds the text representing the job request
function buildRequestText(request: IRequest): string {
    // Combine relevant fields from the request model
    return [
        `Position Title: ${request.position || ''}`,
        `Qualifications Required: ${request.qualifications || 'Not specified'}`,

    ].filter(Boolean).join('\n\n').trim();
}

// Gets the applicant's summary text, throwing error if unavailable
function getApplicantSummaryText(applicant: IApplicant): string {
    if (applicant.cvSummary && applicant.cvSummary.trim().length > 0) {
        // Optional: Add cleaning/length check here if summaries aren't pre-processed
        return applicant.cvSummary.trim();
    }
    // If summary is required for comparison, throw an error.
    throw new TextProcessingError(`Applicant ${applicant._id || applicant.email} has no valid summary (cvSummary) available for comparison.`);
    // DO NOT fall back to cvText or cvBuffer in this function if summary comparison is the explicit goal.
}

// --- Exports ---
export {
    TextAnalyzer,
    MatchingEngine,
    EmbeddingService,
    CVParser, // Still export if useful elsewhere
    DEFAULT_CONFIG as MatchingConfigDefaults,
     // Export the primary function
};