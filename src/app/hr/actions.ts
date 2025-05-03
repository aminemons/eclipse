// src/app/hr/actions.ts (or relevant path)
'use server';

import connectDB from '@/lib/db';         // Adjust path if needed
import Request, { IRequest } from '@/models/Request'; // Adjust path if needed
import Applicant, { IApplicant } from '@/models/Applicant'; // Adjust path if needed
import { findTopMatchesBySummary } from '@/utils/match'; // <-- IMPORT THE CORRECT FUNCTION
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

// --- Constants ---
// Adjusted threshold potentially needed for summary-based matching
const MINIMUM_MATCH_SCORE_SUMMARY = 0.65; // <-- ADJUST this based on testing summary matching results
const HR_CONTACT = {
    name: 'HR Team Lead', // Example name
    email: process.env.HR_CONTACT_EMAIL || 'hr-fallback@example.com' // Use environment variable for email
};
const TOP_N_MATCHES_TO_CONSIDER = 15; // Limit how many top matches are processed further

// --- Types ---
interface AvailabilitySlot {
    day: string; // Lowercase day name ('monday', 'tuesday', etc.)
    intervals: { start: string; end: string }[]; // HH:mm format
}

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean; // Use boolean for secure
    user: string;
    pass: string;
    from: string; // Recommended format: "Sender Name" <email@example.com>
}

// --- HR Availability Schedule ---
const HR_SCHEDULE: AvailabilitySlot[] = [
    // Using lowercase day names consistently
    { day: 'monday', intervals: [{ start: '09:00', end: '11:00' }, { start: '14:00', end: '16:00' }] },
    { day: 'tuesday', intervals: [] },
    { day: 'wednesday', intervals: [{ start: '10:00', end: '12:00' }, { start: '15:00', end: '17:00' }] },
    { day: 'thursday', intervals: [{ start: '13:00', end: '15:00' }] },
    { day: 'friday', intervals: [{ start: '09:00', end: '11:00' }, { start: '14:00', end: '16:00' }] },
    { day: 'saturday', intervals: [] },
    { day: 'sunday', intervals: [] }
];

// --- Email Configuration (Use Environment Variables) ---
const emailConfig: EmailConfig | null = process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_SECURE === 'true', // Check env var for secure flag
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || '"Recruitment Team" <no-reply@example.com>'
    } : null;

// --- Nodemailer Transporter Setup ---
let transporter: nodemailer.Transporter | null = null;
if (emailConfig) {
    transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure, // Use secure flag from config
        auth: {
            user: emailConfig.user,
            pass: emailConfig.pass
        },
        // Remove TLS options unless specifically required by your provider and you understand the implications
        // requireTLS: true // Might be needed depending on provider
    });
    console.log("Email transporter configured.");
} else {
    console.warn("------------------------------------------------------------");
    console.warn("WARNING: Email environment variables (EMAIL_HOST, etc.) not fully set.");
    console.warn("Email functionality will be disabled.");
    console.warn("------------------------------------------------------------");
}

// --- Helper Functions ---

// Sends an email using the configured transporter
async function sendEmail(to: string, subject: string, text: string, html: string): Promise<boolean> {
    if (!transporter || !emailConfig) {
        console.warn(`Email not sent to ${to} (Subject: ${subject}): Email service is not configured.`);
        // Return true to not block the flow, but maybe log differently or handle this case?
        // Depending on requirements, you might want to return false or throw an error.
        return false; // Indicate failure if email is crucial
    }

    try {
        console.log(`Attempting to send email to ${to} (Subject: ${subject})`);
        const info = await transporter.sendMail({
            from: emailConfig.from,
            to: to,
            subject: subject,
            text: text, // Plain text version
            html: html // HTML version
        });
        console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${to} (Subject: ${subject}):`, error);
        return false; // Indicate failure
    }
}

// Generates a list of available interview slots based on HR schedule for the next two weeks
function generateInterviewSlots(): { date: string; time: string }[] {
    const slots: { date: string; time: string }[] = [];
    const now = new Date();
    const uniqueSlots = new Set<string>(); // Avoid duplicate time slots if intervals overlap conceptually

    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) { // Check next 14 days
        const potentialDate = new Date(now);
        potentialDate.setDate(now.getDate() + dayOffset);
        potentialDate.setHours(0, 0, 0, 0); // Normalize time part

        // Skip weekends if desired, but schedule array handles it based on empty intervals
        // if (potentialDate.getDay() === 0 || potentialDate.getDay() === 6) continue;

        const dayName = potentialDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const daySchedule = HR_SCHEDULE.find(d => d.day === dayName);

        if (daySchedule && daySchedule.intervals.length > 0) {
            const dateFormatted = potentialDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long' // Add weekday for clarity
            });

            daySchedule.intervals.forEach(interval => {
                // Simple slot generation: Add start time. Could be expanded for interval duration.
                const slotKey = `${dateFormatted} ${interval.start}`;
                if (!uniqueSlots.has(slotKey)) {
                    slots.push({
                        date: dateFormatted,
                        time: `${interval.start}` // Format as HH:mm - HH:mm if needed
                        // time: `${interval.start} - ${interval.end}` // Example interval format
                    });
                    uniqueSlots.add(slotKey);
                }
            });
        }
    }
    console.log(`Generated ${slots.length} potential interview slots.`);
    // Shuffle slots slightly?
    // slots.sort(() => Math.random() - 0.5);
    return slots;
}

// --- Main Server Actions ---

export async function getRequestsAction(): Promise<IRequest[]> {
    console.log("[HR Action] Fetching recruitment requests...");
    try {
        await connectDB();
        const requests = await Request.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean(); // Use lean for performance if not modifying docs
        console.log(`[HR Action] Found ${requests.length} requests.`);
        // Stringify/parse needed to pass plain objects from Server Component/Action
        return JSON.parse(JSON.stringify(requests));
    } catch (error) {
        console.error("[HR Action] Error fetching requests:", error);
        // Decide how to handle DB errors - throw or return empty?
        return [];
    }
}

// Action to process a specific recruitment request
export async function treatRequestAction(requestId: string): Promise<{
    success: boolean;
    error?: string;
    totalApplicants?: number;
    qualifiedCount?: number;
    emailsSentCount?: number;
    matchThreshold?: number;
    matchedApplicants?: { id: string, name: string, email: string, score: number }[]; // Return top qualified info
}> {
    console.log(`[HR Action] Starting treatment for request ID: ${requestId}`);
    let operation = 'Connecting to DB';
    try {
        await connectDB();
        operation = `Fetching request ${requestId}`;
        console.log(`[HR Action] ${operation}...`);
        const request = await Request.findById(requestId);

        if (!request) {
            console.error(`[HR Action] Request not found: ${requestId}`);
            return { success: false, error: 'Request not found' };
        }
        if (request.status !== 'pending') {
            console.warn(`[HR Action] Request ${requestId} already processed (status: ${request.status}).`);
            return { success: false, error: `Request already processed or is ${request.status}` };
        }

        // Optional: Send "Processing Started" notification to HR
        // ... (sendEmail logic if needed) ...

        operation = 'Fetching applicants';
        console.log(`[HR Action] ${operation}...`);
        // Fetch only necessary fields if possible, MUST include _id, name, email, cvSummary
        const applicants = await Applicant.find({}, { name: 1, email: 1, cvSummary: 1 }).lean(); // Ensure cvSummary is fetched!
        const totalApplicants = applicants.length;
        console.log(`[HR Action] Found ${totalApplicants} applicants to evaluate.`);

        if (totalApplicants === 0) {
            console.warn(`[HR Action] No applicants found in the database for request ${requestId}.`);
            request.status = 'done'; // Mark as done, but no candidates found
            // request.processingNotes = "Completed: No applicants found to evaluate."; // Add notes if schema allows
            await request.save();
            revalidatePath('/hr'); // Revalidate HR page
            return { success: true, totalApplicants: 0, qualifiedCount: 0, emailsSentCount: 0, matchThreshold: MINIMUM_MATCH_SCORE_SUMMARY };
        }

        operation = `Running summary matching for "${request.position}"`;
        console.log(`[HR Action] ${operation} (Threshold: ${MINIMUM_MATCH_SCORE_SUMMARY})...`);
        const topMatches = await findTopMatchesBySummary(request, applicants, TOP_N_MATCHES_TO_CONSIDER); // Use the summary-based function
        console.log(`[HR Action] Initial matching returned ${topMatches.length} potential matches (above low threshold if any).`);

        // Filter based on the *actual* minimum score threshold
        const qualifiedApplicants = topMatches.filter(
            match => match.score.total >= MINIMUM_MATCH_SCORE_SUMMARY // Use the correct property `total` from MatchScore
        );
        const qualifiedCount = qualifiedApplicants.length;
        console.log(`[HR Action] Found ${qualifiedCount} qualified applicants meeting score >= ${MINIMUM_MATCH_SCORE_SUMMARY}.`);


        if (qualifiedCount === 0) {
            console.log(`[HR Action] No qualified applicants found meeting the threshold for request ${requestId}.`);
            request.status = 'done';
            // request.processingNotes = `Completed: No applicants met the match threshold (${MINIMUM_MATCH_SCORE_SUMMARY}).`; // Add notes if schema allows
            await request.save();
            revalidatePath('/hr'); // Revalidate HR page
            return { success: true, totalApplicants, qualifiedCount: 0, emailsSentCount: 0, matchThreshold: MINIMUM_MATCH_SCORE_SUMMARY };
        }

        // --- Send Interview Invitations ---
        operation = 'Sending interview invitations';
        console.log(`[HR Action] ${operation} to ${qualifiedCount} candidates...`);
        const availableSlots = generateInterviewSlots();
        let emailsSuccessfullySent = 0;

        if (availableSlots.length === 0) {
            console.error(`[HR Action] CRITICAL: No interview slots generated based on HR schedule. Cannot send invitations.`);
            // Should we fail the request processing here? Or mark done but with errors?
            request.status = 'done'; // Mark done but note the issue
            // request.processingNotes = `Completed: Found ${qualifiedCount} candidates, but FAILED to send invites (no available slots).`;
            await request.save();
            revalidatePath('/hr');
            return {
                success: true, // Technically processed, but with issues
                error: 'No interview slots available to send invitations.',
                totalApplicants,
                qualifiedCount,
                emailsSentCount: 0,
                matchThreshold: MINIMUM_MATCH_SCORE_SUMMARY,
                matchedApplicants: qualifiedApplicants.map(m => ({ id: m.applicant._id.toString(), name: m.applicant.name, email: m.applicant.email, score: m.score.total }))
            };
        }

        for (let i = 0; i < qualifiedApplicants.length; i++) {
            const match = qualifiedApplicants[i];
            // Assign slots cyclically
            const slot = availableSlots[i % availableSlots.length];
            const applicantName = match.applicant.name;
            const applicantEmail = match.applicant.email;
            const positionTitle = request.position;

            const subject = `Interview Invitation: ${positionTitle} Opportunity`;
            const textBody = `Dear ${applicantName},\n\nCongratulations! Following our review process for the ${positionTitle} position, we were impressed with your profile (Score: ${match.score.total.toFixed(2)}) and would like to invite you for an interview.\n\nPlease join us on:\nDate: ${slot.date}\nTime: ${slot.time}\nLocation: [Specify Location/Video Link Here - e.g., Google Meet/Zoom Link or Office Address]\n\nCould you please reply to confirm your availability for this slot? If this time does not work, please let us know your availability over the next two weeks.\n\nBest regards,\n${HR_CONTACT.name}\nRecruitment Team`;
            const htmlBody = `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <p>Dear ${applicantName},</p>
                    <p>Congratulations! Following our review process for the <strong>${positionTitle}</strong> position, we were impressed with your profile (Match Score: ${match.score.total.toFixed(2)}) and would like to invite you for an interview.</p>
                    <p>Please join us on:</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Date:</strong> ${slot.date}</li>
                        <li><strong>Time:</strong> ${slot.time}</li>
                        <li><strong>Location/Link:</strong> [Specify Location/Video Link Here - e.g., <a href="#">Google Meet/Zoom Link</a> or Office Address]</li>
                    </ul>
                    <p>Could you please reply to this email to confirm your availability for this slot? If this specific time does not work for you, please let us know your general availability over the next two weeks.</p>
                    <p>We look forward to speaking with you.</p>
                    <p>Best regards,<br/>
                    ${HR_CONTACT.name}<br/>
                    Recruitment Team<br/>
                    [Your Company Name]</p>
                </div>`;

            const success = await sendEmail(applicantEmail, subject, textBody, htmlBody);
            if (success) {
                emailsSuccessfullySent++;
            } else {
                console.warn(`[HR Action] Failed to send interview invitation to ${applicantEmail} for request ${requestId}.`);
                // Optionally: Track failed emails
            }
        }
        console.log(`[HR Action] ${emailsSuccessfullySent} out of ${qualifiedCount} invitations sent successfully.`);


        operation = 'Updating request status';
        console.log(`[HR Action] ${operation} to 'done' for ${requestId}.`);
        request.status = 'done';
        // request.processingNotes = `Completed: Found ${qualifiedCount} qualified applicants. Sent ${emailsSuccessfullySent} invitations.`;
        await request.save();

        operation = 'Revalidating HR path';
        revalidatePath('/hr'); // Ensure the HR dashboard updates
        console.log(`[HR Action] Process completed successfully for request ${requestId}.`);

        return {
            success: true,
            totalApplicants,
            qualifiedCount,
            emailsSentCount: emailsSuccessfullySent,
            matchThreshold: MINIMUM_MATCH_SCORE_SUMMARY,
            matchedApplicants: qualifiedApplicants.map(m => ({ id: m.applicant._id.toString(), name: m.applicant.name, email: m.applicant.email, score: m.score.total }))
        };

    } catch (error: any) {
        console.error(`------------------------------------------------------------`);
        console.error(`[HR Action] FAILURE during operation: "${operation}" for Request ID: ${requestId}`);
        console.error(`[HR Action] Error:`, error);
        console.error(`------------------------------------------------------------`);

        // Attempt to update request status to 'failed' or similar if possible
        try {
            const reqToUpdate = await Request.findById(requestId);
            if (reqToUpdate && reqToUpdate.status === 'pending') { // Only update if still pending
                reqToUpdate.status = 'refused'; // Or 'error' status
                // reqToUpdate.processingNotes = `Failed during ${operation}: ${error.message}`;
                await reqToUpdate.save();
                revalidatePath('/hr');
            }
        } catch (saveError) {
            console.error(`[HR Action] Additionally failed to update request status to 'refused' for ${requestId}:`, saveError);
        }

        return { success: false, error: `Processing failed during "${operation}". Error: ${error.message || 'Unknown error'}` };
    }
}