'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { getRequestsAction, treatRequestAction } from './actions';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

type ClientRequestData = {
    _id: string;
    name: string; // Candidate Name in the context of the original code seems wrong, this likely means Request Title/Name
    position: string;
    status: 'pending' | 'done' | 'refused';
    createdAt: string; // Store original date string for potential display/parsing
    createdAtDate: Date; // Store as Date object for easier processing
    qualifications?: string;
};

type ApplicantMatch = {
    id: string;
    name: string;
    email: string;
    matchPercentage: number;
    interviewSlot?: string;
};

type EvaluationResult = {
    requestId: string;
    totalApplicants: number;
    qualifiedApplicants: number;
    emailsSent: number;
    matchThreshold: number;
    processingTime?: number;
    matchedApplicants?: ApplicantMatch[];
    hrSchedule?: {
        day: string;
        slots: string[];
    }[];
};

export default function HrPage() {
    const [requests, setRequests] = useState<ClientRequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [treatingId, setTreatingId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isTreating, startTreatingTransition] = useTransition();
    const [evaluationResults, setEvaluationResults] = useState<Record<string, EvaluationResult>>({});
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'requests' | 'analytics'>('requests');

    // Mock HR availability schedule (kept static for now)
    const hrAvailability = useMemo(() => [
        { day: 'Monday', slots: ['09:00-11:00', '14:00-16:00'] },
        { day: 'Tuesday', slots: [] },
        { day: 'Wednesday', slots: ['10:00-12:00', '15:00-17:00'] },
        { day: 'Thursday', slots: ['13:00-15:00'] },
        { day: 'Friday', slots: ['09:00-11:00', '14:00-16:00'] },
        { day: 'Saturday', slots: [] },
        { day: 'Sunday', slots: [] }
    ], []);

    useEffect(() => {
        async function loadRequests() {
            setLoading(true);
            setError(null);
            try {
                const fetchedRequestsRaw = await getRequestsAction();

                if (!Array.isArray(fetchedRequestsRaw)) {
                    throw new Error("Invalid data format received from server.");
                }

                const serializableRequests = fetchedRequestsRaw
                    .map((req): ClientRequestData | null => {
                        if (!req || !req._id) return null;
                        const createdAtDate = req.createdAt instanceof Date ? req.createdAt : new Date(req.createdAt);
                        return {
                            _id: String(req._id),
                            name: req.name ?? `Request #${String(req._id).slice(-4)}`, // Assuming 'name' might be the request identifier/title
                            position: req.position ?? 'N/A',
                            status: req.status ?? 'pending',
                            createdAt: createdAtDate.toLocaleDateString(),
                            createdAtDate: createdAtDate, // Store the Date object
                            qualifications: req.qualifications
                        };
                    })
                    .filter((req): req is ClientRequestData => req !== null);

                setRequests(serializableRequests);
            } catch (err: any) {
                console.error("Error loading requests:", err);
                setError(err.message || "Failed to load recruitment requests.");
            } finally {
                setLoading(false);
            }
        }

        loadRequests();
    }, []);

    const handleTreatRequest = (requestId: string) => {
        setTreatingId(requestId);
        setMessage(null);
        setExpandedRequest(requestId); // Keep details open during processing

        startTreatingTransition(async () => {
            const startTime = Date.now();
            try {
                setMessage(`Evaluating candidates for request ${requestId}...`);

                // --- SIMULATED API CALL ---
                await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // Simulate network/processing time
                const result = await treatRequestAction(requestId);
                // --- END SIMULATED API CALL ---

                const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

                if (result.success) {
                    // Mock realistic matched applicants data based on emailsSentCount
                    const totalApplicants = result.totalApplicants || Math.floor(Math.random() * 30) + 10; // Example: 10-39
                    const qualifiedCount = result.qualifiedApplicants || Math.floor(totalApplicants * (Math.random() * 0.4 + 0.3)); // 30-70% qualify
                    const emailsSent = result.emailsSentCount ?? Math.min(qualifiedCount, 5 + Math.floor(Math.random() * 5)); // Send to subset or all qualified, max 5-9 emails in mock

                    const mockMatchedApplicants: ApplicantMatch[] = Array.from({ length: emailsSent }, (_, i) => ({
                        id: `${requestId}-applicant-${i+1}`,
                        name: `Applicant ${String.fromCharCode(65 + i)}`, // A, B, C...
                        email: `applicant_${String.fromCharCode(97 + i)}@example.com`, // a, b, c...
                        matchPercentage: 80 + Math.floor(Math.random() * 16), // 80-95%
                        interviewSlot: assignInterviewSlot(i, hrAvailability) // Assign slot based on mock logic
                    }));

                    const evaluationResult: EvaluationResult = {
                        requestId,
                        totalApplicants: totalApplicants,
                        qualifiedApplicants: qualifiedCount,
                        emailsSent: emailsSent,
                        matchThreshold: 80, // Example fixed threshold
                        processingTime: parseFloat(processingTime),
                        matchedApplicants: mockMatchedApplicants,
                        hrSchedule: hrAvailability // Attach the schedule used for context
                    };

                    setEvaluationResults(prev => ({
                        ...prev,
                        [requestId]: evaluationResult
                    }));

                    setMessage(`Evaluation complete for request ${requestId}. ${emailsSent} interview invitations sent.`);
                    setRequests(prevRequests =>
                        prevRequests.map(req =>
                            req._id === requestId ? { ...req, status: 'done' } : req
                        )
                    );
                } else {
                    setMessage(`Error processing request: ${result.error || 'Unknown evaluation error.'}`);
                    setRequests(prevRequests =>
                        prevRequests.map(req =>
                            req._id === requestId ? { ...req, status: 'refused' } : req // Mark as refused on error for demo
                        )
                    );
                }
            } catch (err: any) {
                setMessage(`An unexpected error occurred: ${err.message}`);
                setRequests(prevRequests =>
                    prevRequests.map(req =>
                        req._id === requestId ? { ...req, status: 'refused' } : req // Mark as refused on error
                    )
                );
            } finally {
                setTreatingId(null);
                // Optional: Auto-close message after a few seconds
                // setTimeout(() => setMessage(null), 5000);
            }
        });
    };

    // Helper function to assign mock interview slots somewhat realistically
    const assignInterviewSlot = (index: number, schedule: typeof hrAvailability): string | undefined => {
        let assigned = false;
        let slotIndex = index; // Start trying slots based on applicant index

        for (let i = 0; i < schedule.length && !assigned; i++) {
            const day = schedule[i];
            if (day.slots.length > 0) {
                const availableSlotIndex = slotIndex % day.slots.length;
                // This basic logic doesn't prevent double booking in mock, improve if needed
                return `${day.day} ${day.slots[availableSlotIndex]}`;
            }
            // If a day has no slots, reduce the effective index for the next day
            // slotIndex -= day.slots.length;
        }
        return undefined; // No slot found (shouldn't happen with this mock data)
    }

    const toggleExpandRequest = (requestId: string) => {
        setExpandedRequest(currentId => currentId === requestId ? null : requestId);
    };

    // --- Data processing for charts ---
    const analyticsData = useMemo(() => {
        const statusCounts = requests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
        }, {} as Record<ClientRequestData['status'], number>);

        const positionCounts = requests.reduce((acc, req) => {
            acc[req.position] = (acc[req.position] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const evaluatedReqs = Object.values(evaluationResults);
        const totalApplicants = evaluatedReqs.reduce((sum, res) => sum + res.totalApplicants, 0);
        const totalQualified = evaluatedReqs.reduce((sum, res) => sum + res.qualifiedApplicants, 0);
        const totalEmailsSent = evaluatedReqs.reduce((sum, res) => sum + res.emailsSent, 0);
        const avgProcessingTime = evaluatedReqs.length > 0
            ? (evaluatedReqs.reduce((sum, res) => sum + (res.processingTime || 0), 0) / evaluatedReqs.length).toFixed(2)
            : 0;
        const avgMatchPercentage = evaluatedReqs.length > 0 ?
            (evaluatedReqs.flatMap(r => r.matchedApplicants || []).reduce((sum, app) => sum + app.matchPercentage, 0) /
                evaluatedReqs.flatMap(r => r.matchedApplicants || []).length || 0).toFixed(1) : 0;


        // Chart Data Formats
        const statusChartData = {
            labels: ['Pending', 'Done', 'Refused'],
            datasets: [
                {
                    label: 'Request Status',
                    data: [
                        statusCounts.pending || 0,
                        statusCounts.done || 0,
                        statusCounts.refused || 0,
                    ],
                    backgroundColor: [
                        'rgba(250, 204, 21, 0.7)', // yellow-400
                        'rgba(52, 211, 153, 0.7)', // green-400
                        'rgba(248, 113, 113, 0.7)', // red-400
                    ],
                    borderColor: [
                        'rgba(250, 204, 21, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(248, 113, 113, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const positionChartData = {
            labels: Object.keys(positionCounts),
            datasets: [
                {
                    label: 'Requests per Position',
                    data: Object.values(positionCounts),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue-500
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                },
            ],
        };

        return {
            stats: {
                totalRequests: requests.length,
                pending: statusCounts.pending || 0,
                done: statusCounts.done || 0,
                refused: statusCounts.refused || 0,
                totalApplicants,
                totalQualified,
                totalEmailsSent,
                avgProcessingTime,
                avgMatchPercentage: parseFloat(avgMatchPercentage),
                evaluatedCount: evaluatedReqs.length,
            },
            charts: {
                status: statusChartData,
                position: positionChartData,
            }
        };
    }, [requests, evaluationResults]);

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#D1D5DB' } // gray-300
            },
            title: {
                display: true,
                color: '#E5E7EB', // gray-200
                font: { size: 16 }
            },
            tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-800
                titleColor: '#F9FAFB', // gray-50
                bodyColor: '#D1D5DB', // gray-300
            }
        },
        scales: { // Optional: For Bar/Line charts if needed
            x: {
                ticks: { color: '#9CA3AF' }, // gray-400
                grid: { color: 'rgba(75, 85, 99, 0.3)' } // gray-600/30%
            },
            y: {
                ticks: { color: '#9CA3AF' }, // gray-400
                grid: { color: 'rgba(75, 85, 99, 0.3)' } // gray-600/30%
            }
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8 flex-wrap gap-4"
                >
                    <div>
                        <motion.h1
                            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 pb-1"
                            initial={{ backgroundPosition: '0% 50%' }}
                            animate={{ backgroundPosition: '100% 50%' }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'linear'
                            }}
                        >
                            Talent Acquisition Portal
                        </motion.h1>
                        <p className="text-gray-400 mt-1 text-sm">AI-Powered Recruitment Processing</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <motion.div
                            className="h-3 w-3 rounded-full bg-green-400"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.8, 1, 0.8]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                        />
                        <span className="text-sm text-gray-400">Live System</span>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'requests' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300 transition-colors'}`}
                    >
                        Talent Requests ({analyticsData.stats.totalRequests})
                        {activeTab === 'requests' && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                layoutId="tabUnderline"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'analytics' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300 transition-colors'}`}
                    >
                        Analytics Dashboard
                        {activeTab === 'analytics' && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                layoutId="tabUnderline"
                            />
                        )}
                    </button>
                </div>

                {/* Top Stats (Always visible) */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
                        <h3 className="text-gray-400 text-sm">Total Requests</h3>
                        <p className="text-2xl font-medium">{analyticsData.stats.totalRequests}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm hover:border-yellow-500/30 transition-colors">
                        <h3 className="text-gray-400 text-sm">Pending Evaluation</h3>
                        <p className="text-2xl font-medium text-yellow-400">{analyticsData.stats.pending}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm hover:border-green-500/30 transition-colors">
                        <h3 className="text-gray-400 text-sm">Processed (Done)</h3>
                        <p className="text-2xl font-medium text-green-400">{analyticsData.stats.done}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 backdrop-blur-sm hover:border-red-500/30 transition-colors">
                        <h3 className="text-gray-400 text-sm">Processing Failed</h3>
                        <p className="text-2xl font-medium text-red-400">{analyticsData.stats.refused}</p>
                    </motion.div>
                </motion.div>


                {/* System Messages */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-6 p-4 rounded-lg border text-sm ${
                                message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')
                                    ? 'bg-red-900/20 border-red-700 text-red-300'
                                    : message.startsWith('Evaluating')
                                        ? 'bg-blue-900/20 border-blue-700 text-blue-300'
                                        : 'bg-green-900/20 border-green-700 text-green-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 mr-3">
                                    {/* Icons removed for brevity, but could be re-added */}
                                    {isTreating && treatingId ? (
                                        <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : null /* Add other icons if desired */ }
                                </div>
                                <p>{message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Conditional Content: Requests or Analytics */}
                <AnimatePresence mode="wait">
                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Loading/Error/No Data States */}
                            {loading && <LoadingSpinner message="Loading talent requests..." />}
                            {!loading && error && <ErrorDisplay message={error} />}
                            {!loading && !error && requests.length === 0 && <EmptyState message="No Talent Requests Found" description="The recruitment pipeline is currently empty." />}

                            {/* Requests Table */}
                            {!loading && !error && requests.length > 0 && (
                                <motion.div
                                    className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden backdrop-blur-sm shadow-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead className="bg-gray-800/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Request/Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Position</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                            {requests.map((req) => (
                                                <motion.tr
                                                    key={req._id}
                                                    layout // Animate layout changes smoothly
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className={`${expandedRequest === req._id ? 'bg-gray-800/60' : 'hover:bg-gray-800/40'} transition-colors duration-150 cursor-pointer`}
                                                    onClick={() => toggleExpandRequest(req._id)}
                                                >
                                                    {/* Table Cells - Minified for brevity, content is the same as original */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center ring-1 ring-gray-600">
                                                                    <span className="text-xs text-gray-300 font-medium">
                                                                        {req.position.substring(0,1)}{req.name.substring(req.name.length - 2)}
                                                                    </span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-100">{req.name}</div>
                                                                <div className="text-xs text-gray-400">{req.createdAt}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-200">{req.position}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <motion.span
                                                            layout
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                req.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400 ring-1 ring-inset ring-yellow-400/30' :
                                                                    req.status === 'done' ? 'bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-400/30' :
                                                                        'bg-red-400/10 text-red-400 ring-1 ring-inset ring-red-400/30'
                                                            }`}
                                                        >
                                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                        </motion.span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {req.status === 'pending' && (
                                                            <motion.button
                                                                layout
                                                                onClick={(e) => { e.stopPropagation(); handleTreatRequest(req._id); }}
                                                                disabled={isTreating}
                                                                className={`relative inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                                                                    treatingId === req._id
                                                                        ? 'bg-blue-700 text-white cursor-wait opacity-80'
                                                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 focus:ring-blue-500'
                                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                                                                whileHover={treatingId === req._id ? {} : { scale: 1.03 }}
                                                                whileTap={treatingId === req._id ? {} : { scale: 0.97 }}
                                                            >
                                                                {treatingId === req._id ? (
                                                                    <>
                                                                        <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        Processing
                                                                    </>
                                                                ) : (
                                                                    'Evaluate'
                                                                )}
                                                            </motion.button>
                                                        )}
                                                        {req.status === 'done' && <span className="text-green-400 text-xs italic">Processed</span>}
                                                        {req.status === 'refused' && <span className="text-red-400 text-xs italic">Failed</span>}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedRequest && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden border-t border-gray-700" // Add border when expanded
                                            >
                                                {/* Render Expanded Content - Same structure as original */}
                                                {requests.filter(req => req._id === expandedRequest).map(req => (
                                                    <ExpandedRequestDetails
                                                        key={req._id}
                                                        request={req}
                                                        evaluation={evaluationResults[req._id]}
                                                        hrAvailability={hrAvailability}
                                                        isProcessing={treatingId === req._id}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {loading && <LoadingSpinner message="Loading analytics data..." />}
                            {!loading && error && <ErrorDisplay message={`Failed to load data for analytics: ${error}`} />}
                            {!loading && !error && (
                                <>
                                    {/* Evaluation Summary Stats */}
                                    <motion.div
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                        variants={containerVariants} initial="hidden" animate="show"
                                    >
                                        <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                            <h3 className="text-gray-400 text-sm">Total Applicants (Evaluated Req.)</h3>
                                            <p className="text-2xl font-medium">{analyticsData.stats.totalApplicants}</p>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                            <h3 className="text-gray-400 text-sm">Qualified (≥{evaluationResults[Object.keys(evaluationResults)[0]]?.matchThreshold || 80}%)</h3>
                                            <p className="text-2xl font-medium text-green-400">{analyticsData.stats.totalQualified}</p>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                            <h3 className="text-gray-400 text-sm">Interview Invitations Sent</h3>
                                            <p className="text-2xl font-medium text-blue-400">{analyticsData.stats.totalEmailsSent}</p>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                            <h3 className="text-gray-400 text-sm">Avg. Processing Time</h3>
                                            <p className="text-2xl font-medium">
                                                {analyticsData.stats.evaluatedCount > 0 ? `${analyticsData.stats.avgProcessingTime}s` : 'N/A'}
                                            </p>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                            <h3 className="text-gray-400 text-sm">Avg. Match Score (Invited)</h3>
                                            <p className="text-2xl font-medium text-purple-400">
                                                {analyticsData.stats.avgMatchPercentage > 0 ? `${analyticsData.stats.avgMatchPercentage}%` : 'N/A'}
                                            </p>
                                        </motion.div>
                                        <motion.div variants={itemVariants} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                            <h3 className="text-gray-400 text-sm">Requests Evaluated</h3>
                                            <p className="text-2xl font-medium">
                                                {analyticsData.stats.evaluatedCount} / {analyticsData.stats.totalRequests}
                                            </p>
                                        </motion.div>
                                    </motion.div>

                                    {/* Charts Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Status Distribution Chart */}
                                        <motion.div
                                            variants={itemVariants}
                                            className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 backdrop-blur-sm shadow-lg h-80"
                                        >
                                            <Doughnut
                                                data={analyticsData.charts.status}
                                                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Request Status Distribution'} } }}
                                            />
                                        </motion.div>

                                        {/* Positions Chart */}
                                        <motion.div
                                            variants={itemVariants}
                                            className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 backdrop-blur-sm shadow-lg h-80"
                                        >
                                            <Bar
                                                data={analyticsData.charts.position}
                                                options={{ ...chartOptions, indexAxis: 'y', plugins: { ...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Requests per Position'} } }}
                                            />
                                        </motion.div>

                                        {/* Add more charts here if needed (e.g., processing time trends, applicant funnel) */}

                                    </div>
                                </>
                            )}
                            {/* Message if no evaluated data for detailed stats */}
                            {!loading && !error && analyticsData.stats.evaluatedCount === 0 && (
                                <motion.div variants={itemVariants} className="text-center text-gray-400 italic py-6">
                                    Evaluate some pending requests to see detailed applicant and performance analytics.
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Floating animated background elements */}
                <BackgroundBubbles />
            </div>
        </div>
    );
}

// --- Helper Components ---

function LoadingSpinner({ message }: { message: string }) {
    return (
        <motion.div
            className="flex flex-col justify-center items-center h-64 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="h-12 w-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-400">{message}</p>
        </motion.div>
    );
}

function ErrorDisplay({ message }: { message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-900/20 border border-red-700 rounded-xl p-6 text-center my-8"
        >
            {/* Simple Error Icon */}
            <div className="mx-auto h-10 w-10 text-red-500 bg-red-500/10 rounded-full flex items-center justify-center mb-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-red-300">Data Load Error</h3>
            <p className="mt-1 text-sm text-red-200">{message}</p>
        </motion.div>
    );
}

function EmptyState({ message, description }: { message: string, description: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-800/30 border border-dashed border-gray-700 rounded-xl p-8 text-center my-8"
        >
            {/* Simple Info Icon */}
            <div className="mx-auto h-10 w-10 text-gray-500 bg-gray-500/10 rounded-full flex items-center justify-center mb-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300">{message}</h3>
            <p className="mt-1 text-sm text-gray-400">{description}</p>
        </motion.div>
    );
}


// Extracted Expanded Request Details component for clarity
function ExpandedRequestDetails({
                                    request,
                                    evaluation,
                                    hrAvailability,
                                    isProcessing
                                }: {
    request: ClientRequestData;
    evaluation: EvaluationResult | undefined;
    hrAvailability: typeof hrAvailability;
    isProcessing: boolean;
}) {
    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    return (
        <div className="px-6 py-6 bg-gradient-to-br from-gray-800/40 to-gray-900/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column: Request Info */}
                <motion.div variants={itemVariants} initial="hidden" animate="show">
                    <h4 className="text-sm font-semibold text-cyan-300 mb-2 uppercase tracking-wider">Position Requirements</h4>
                    <div className="bg-gray-900/60 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap shadow-inner h-40 overflow-y-auto custom-scrollbar">
                        {request.qualifications || "No specific requirements noted."}
                    </div>
                </motion.div>

                {/* Right Column: Evaluation Results */}
                <motion.div variants={itemVariants} initial="hidden" animate="show" style={{transitionDelay: '0.1s'}}>
                    <h4 className="text-sm font-semibold text-cyan-300 mb-2 uppercase tracking-wider">Evaluation Status & Results</h4>
                    <div className="bg-gray-900/60 p-4 rounded-lg shadow-inner min-h-[160px] flex flex-col justify-center"> {/* Matched height & content alignment */}
                        {isProcessing && (
                            <div className="flex items-center justify-center space-x-2 text-blue-300">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Evaluating...</span>
                            </div>
                        )}
                        {!isProcessing && evaluation && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-400">Total Pool</p>
                                        <p className="text-base font-medium">{evaluation.totalApplicants}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Qualified (≥{evaluation.matchThreshold}%)</p>
                                        <p className="text-base font-medium text-green-400">{evaluation.qualifiedApplicants}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Invited</p>
                                        <p className="text-base font-medium text-blue-400">{evaluation.emailsSent}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">AI Time</p>
                                        <p className="text-base font-medium">{evaluation.processingTime}s</p>
                                    </div>
                                </div>
                                {/* Maybe link to show more details */}
                            </>
                        )}
                        {!isProcessing && !evaluation && request.status === 'pending' && (
                            <p className="text-gray-400 italic text-center text-sm">Awaiting evaluation.</p>
                        )}
                        {!isProcessing && !evaluation && request.status === 'done' && (
                            <p className="text-gray-400 italic text-center text-sm">Processed, but detailed results not loaded/available for this view.</p>
                        )}
                        {!isProcessing && !evaluation && request.status === 'refused' && (
                            <p className="text-red-400 italic text-center text-sm">Evaluation process failed or was refused.</p>
                        )}
                    </div>
                </motion.div>

                {/* If evaluated, show HR Schedule and Matched Candidates */}
                {!isProcessing && evaluation && (
                    <>
                        {/* HR Availability */}
                        <motion.div variants={itemVariants} initial="hidden" animate="show" style={{transitionDelay: '0.2s'}}>
                            <h4 className="text-sm font-semibold text-cyan-300 mb-2 uppercase tracking-wider">Interview Availability Used</h4>
                            <div className="bg-gray-900/60 p-4 rounded-lg shadow-inner">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {hrAvailability.map((day) => (
                                        <motion.div
                                            key={day.day}
                                            className="bg-gray-800/70 p-2 rounded border border-gray-700/50"
                                            whileHover={{ scale: 1.03, backgroundColor: 'rgba(55, 65, 81, 0.8)' }} // gray-700
                                        >
                                            <p className="text-xs font-medium text-gray-300 mb-1">{day.day}</p>
                                            {day.slots.length > 0 ? (
                                                <ul className="space-y-0.5">
                                                    {day.slots.map((slot) => (
                                                        <li key={slot} className="text-xs text-green-400/90">{slot}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-500 mt-1">Unavailable</p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Matched Candidates Table */}
                        <motion.div variants={itemVariants} initial="hidden" animate="show" style={{transitionDelay: '0.3s'}}>
                            <h4 className="text-sm font-semibold text-cyan-300 mb-2 uppercase tracking-wider">Top Matched & Invited Candidates ({evaluation.matchedApplicants?.length || 0})</h4>
                            {evaluation.matchedApplicants && evaluation.matchedApplicants.length > 0 ? (
                                <div className="bg-gray-900/60 rounded-lg shadow-inner overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                                    <table className="min-w-full divide-y divide-gray-700/50 text-sm">
                                        <thead className="sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Name</th>
                                            {/* <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 hidden md:table-cell">Email</th> */}
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-400">Match</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Interview Slot</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/50">
                                        {evaluation.matchedApplicants.map((applicant) => (
                                            <motion.tr key={applicant.id} whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.3)' }}>
                                                <td className="px-3 py-2 text-gray-200 whitespace-nowrap">{applicant.name}</td>
                                                {/* <td className="px-3 py-2 text-gray-400 hidden md:table-cell">{applicant.email}</td> */}
                                                <td className="px-3 py-2 text-center">
                                                    <motion.span
                                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[0.7rem] font-medium ${
                                                            applicant.matchPercentage >= 90 ? 'bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-500/20' :
                                                                applicant.matchPercentage >= 85 ? 'bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20' :
                                                                    'bg-yellow-500/10 text-yellow-300 ring-1 ring-inset ring-yellow-500/20'
                                                        }`}
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        {applicant.matchPercentage}%
                                                    </motion.span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-300 text-xs">{applicant.interviewSlot || 'Pending Assignment'}</td>
                                            </motion.tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-gray-900/60 p-4 rounded-lg text-center text-gray-400 italic text-sm">
                                    No candidates met the threshold for an interview invitation based on this evaluation run.
                                </div>
                            )}
                        </motion.div>

                        {/* Optional: Sample Email Preview could go here */}
                    </>
                )}

            </div>
        </div>
    );
}

// Simple Background Animation Component
function BackgroundBubbles() {
    return (
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-blue-600/5 blur-xl"
                    initial={{
                        x: `${Math.random() * 100}vw`,
                        y: `${Math.random() * 100}vh`,
                        scale: Math.random() * 1.5 + 0.5,
                        opacity: 0,
                    }}
                    animate={{
                        x: `clamp(10vw, ${Math.random() * 80 + 10}vw, 90vw)`, // Keep within bounds
                        y: `clamp(10vh, ${Math.random() * 80 + 10}vh, 90vh)`,
                        opacity: [0, 0.1, 0.15, 0.1, 0], // Fade in and out
                        scale: [0.5, Math.random() * 1.5 + 1, 0.5], // Pulse size
                    }}
                    transition={{
                        duration: Math.random() * 30 + 20, // 20-50 seconds
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: Math.random() * 5, // Stagger start times
                    }}
                    style={{
                        width: Math.random() * 300 + 150, // 150-450px
                        height: Math.random() * 300 + 150,
                    }}
                />
            ))}
        </div>
    );
}


// Add CSS for custom scrollbar if needed
/* In your global CSS file (e.g., globals.css): */
/*
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.3); // gray-800/30%
    border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5); // gray-600/50%
    border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.6); // gray-500/60%
}
.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(75, 85, 99, 0.5) rgba(31, 41, 55, 0.3);
}
*/