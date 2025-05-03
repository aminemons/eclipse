"use client";
import {
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Phone,
    Mail,
    CheckCircle,
    BarChart2,
    Users,
    Cpu,
    DollarSign, Clock, UserCheck, BarChart, Star, LogIn, Calendar, X, ChevronDown, ChevronUp
} from "lucide-react";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Mock data for job offers
const jobOffers = [
    {
        id: 1,
        title: "Frontend Developer",
        department: "Engineering",
        location: "Remote",
        salary: "$90,000 - $120,000",
        type: "Full-time",
        posted: "2 days ago",
        description: "We're looking for an experienced Frontend Developer to join our team. You'll work with React, Next.js, and our design system to build beautiful, performant user interfaces.",
        requirements: [
            "3+ years of professional frontend development experience",
            "Expertise in React, TypeScript, and modern CSS",
            "Experience with responsive design and accessibility",
            "Familiarity with Next.js or similar frameworks"
        ],
        status: "Interview Scheduled",
        candidates: [
            {
                id: 101,
                name: "Alex Johnson",
                email: "alex.johnson@example.com",
                status: "Interview Scheduled",
                interviewDate: "2023-11-15T14:00:00",
                resume: "Alex_Johnson_Resume.pdf",
                skills: ["React", "TypeScript", "CSS", "Next.js"],
                experience: "4 years"
            },
            {
                id: 102,
                name: "Sam Wilson",
                email: "sam.wilson@example.com",
                status: "Interview Scheduled",
                interviewDate: "2023-11-16T10:30:00",
                resume: "Sam_Wilson_Resume.pdf",
                skills: ["React", "JavaScript", "Redux", "Jest"],
                experience: "5 years"
            }
        ]
    },
    {
        id: 2,
        title: "UX Designer",
        department: "Design",
        location: "New York, NY",
        salary: "$85,000 - $110,000",
        type: "Full-time",
        posted: "1 week ago",
        description: "Join our design team to create intuitive and beautiful user experiences. You'll work closely with product managers and engineers to bring designs to life.",
        requirements: [
            "Portfolio demonstrating strong UX/UI skills",
            "3+ years of experience in product design",
            "Proficiency in Figma and prototyping tools",
            "Understanding of user research methodologies"
        ],
        status: "Reviewing Applications",
        candidates: [
            {
                id: 201,
                name: "Jordan Lee",
                email: "jordan.lee@example.com",
                status: "Application Received",
                resume: "Jordan_Lee_Resume.pdf",
                skills: ["Figma", "User Research", "Prototyping", "UI Design"],
                experience: "3 years"
            }
        ]
    },
    {
        id: 3,
        title: "DevOps Engineer",
        department: "Engineering",
        location: "San Francisco, CA",
        salary: "$130,000 - $160,000",
        type: "Full-time",
        posted: "3 days ago",
        description: "We need a DevOps engineer to help us scale our infrastructure and improve our deployment processes. You'll work with AWS, Kubernetes, and Terraform.",
        requirements: [
            "5+ years of DevOps experience",
            "Deep knowledge of AWS services",
            "Experience with Kubernetes and containerization",
            "Infrastructure as code (Terraform preferred)"
        ],
        status: "Screening",
        candidates: []
    }
];

// Mock HR schedule
const hrSchedule = [
    {
        id: 1,
        date: "2023-11-15",
        slots: [
            { time: "09:00-10:00", available: false, meeting: "Standup" },
            { time: "10:30-11:30", available: true },
            { time: "14:00-15:00", available: false, meeting: "Interview with Alex Johnson" },
            { time: "15:30-16:30", available: true }
        ]
    },
    {
        id: 2,
        date: "2023-11-16",
        slots: [
            { time: "09:30-10:30", available: false, meeting: "Team Sync" },
            { time: "10:30-11:30", available: false, meeting: "Interview with Sam Wilson" },
            { time: "13:00-14:00", available: true },
            { time: "14:30-15:30", available: true }
        ]
    },
    {
        id: 3,
        date: "2023-11-17",
        slots: [
            { time: "10:00-11:00", available: true },
            { time: "11:30-12:30", available: true },
            { time: "14:00-15:00", available: false, meeting: "Candidate Review" },
            { time: "15:30-16:30", available: true }
        ]
    }
];

export default function HomePage() {
    const section2Ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: section2Ref,
        offset: ["start end", "start 0.3"]
    });

    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

    // Login state
    const [showLogin, setShowLogin] = useState(false);
    const [activeTab, setActiveTab] = useState('department');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // HR Portal state
    const [selectedJob, setSelectedJob] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [notification, setNotification] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (password !== '12345678') {
            setError('Invalid password');
            return;
        }

        switch(email) {
            case 'department@gmail.com':
                window.location.href = '/department';
                break;
            case 'hrportal@gmail.com':
                window.location.href = '/hr';
                break;
            case 'apply@gmail.com':
                window.location.href = '/apply';
                break;
            default:
                setError('Invalid email');
        }
    };

    const scheduleInterview = (candidate) => {
        // Find next available slot in HR schedule
        let scheduled = false;
        const updatedSchedule = hrSchedule.map(day => {
            if (scheduled) return day;

            const availableSlot = day.slots.find(slot => slot.available);
            if (availableSlot) {
                availableSlot.available = false;
                availableSlot.meeting = `Interview with ${candidate.name}`;
                candidate.interviewDate = `${day.date}T${availableSlot.time.split('-')[0]}:00`;
                candidate.status = "Interview Scheduled";
                scheduled = true;

                // Show notification
                setNotification({
                    type: 'success',
                    message: `Interview scheduled for ${candidate.name} on ${day.date} at ${availableSlot.time.split('-')[0]}. Email sent to candidate.`
                });

                setTimeout(() => setNotification(null), 5000);
            }
            return day;
        });

        if (!scheduled) {
            setNotification({
                type: 'error',
                message: 'No available slots in HR schedule. Please check back later or add more availability.'
            });
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-blue-950">
            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Login to HireBerg</h3>
                            <button
                                onClick={() => setShowLogin(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'department' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('department')}
                            >
                                Department
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'hr' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('hr')}
                            >
                                HR Portal
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'apply' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('apply')}
                            >
                                Apply
                            </button>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={
                                        activeTab === 'department' ? 'department@gmail.com' :
                                            activeTab === 'hr' ? 'hrportal@gmail.com' :
                                                'apply@gmail.com'
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="*****"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 mb-4">{error}</p>}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* HR Portal Modal */}
            {activeTab === 'hr' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 relative">
                        <button
                            onClick={() => setActiveTab('department')}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-bold text-gray-800 mb-6">HR Portal Dashboard</h2>

                        {/* Notification */}
                        {notification && (
                            <div className={`mb-6 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {notification.message}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`py-2 px-4 font-medium ${!showSchedule ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                onClick={() => setShowSchedule(false)}
                            >
                                Job Openings
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${showSchedule ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                onClick={() => setShowSchedule(true)}
                            >
                                My Schedule
                            </button>
                        </div>

                        {/* Content */}
                        {showSchedule ? (
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-gray-700">Interview Schedule</h3>
                                <div className="space-y-6">
                                    {hrSchedule.map(day => (
                                        <div key={day.id} className="bg-gray-50 rounded-lg p-6">
                                            <h4 className="text-xl font-semibold mb-4">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                {day.slots.map((slot, index) => (
                                                    <div
                                                        key={index}
                                                        className={`p-4 rounded border ${slot.available ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'} shadow-sm`}
                                                    >
                                                        <div className="font-medium">{slot.time}</div>
                                                        {!slot.available && (
                                                            <div className="mt-2 text-sm text-gray-600">{slot.meeting}</div>
                                                        )}
                                                        {slot.available && (
                                                            <div className="mt-2 text-sm text-green-600">Available</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-gray-700">Current Job Openings</h3>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                                        + Create New Job
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {jobOffers.map(job => (
                                        <div key={job.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div
                                                className="p-6 cursor-pointer hover:bg-gray-50 transition"
                                                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-800">{job.title}</h4>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{job.department}</span>
                                                            <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">{job.location}</span>
                                                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">{job.salary}</span>
                                                            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">{job.type}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">{job.posted}</span>
                                                        <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">{job.status}</span>
                                                        {selectedJob?.id === job.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedJob?.id === job.id && (
                                                <div className="border-t border-gray-200 p-6 bg-gray-50">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="md:col-span-2">
                                                            <h5 className="font-bold text-lg mb-2">Job Description</h5>
                                                            <p className="text-gray-700 mb-4">{job.description}</p>

                                                            <h5 className="font-bold text-lg mb-2">Requirements</h5>
                                                            <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                                                {job.requirements.map((req, i) => (
                                                                    <li key={i}>{req}</li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        <div>
                                                            <h5 className="font-bold text-lg mb-4">Candidates ({job.candidates.length})</h5>

                                                            {job.candidates.length > 0 ? (
                                                                <div className="space-y-4">
                                                                    {job.candidates.map(candidate => (
                                                                        <div key={candidate.id} className="border border-gray-200 rounded p-4 bg-white">
                                                                            <div className="flex justify-between">
                                                                                <div>
                                                                                    <h6 className="font-medium">{candidate.name}</h6>
                                                                                    <p className="text-sm text-gray-600">{candidate.email}</p>
                                                                                </div>
                                                                                <span className={`text-xs px-2 py-1 rounded ${
                                                                                    candidate.status === "Interview Scheduled" ? "bg-blue-100 text-blue-800" :
                                                                                        candidate.status === "Application Received" ? "bg-yellow-100 text-yellow-800" :
                                                                                            "bg-gray-100 text-gray-800"
                                                                                }`}>
                                                                                    {candidate.status}
                                                                                </span>
                                                                            </div>

                                                                            <div className="mt-3 text-sm">
                                                                                <p><span className="font-medium">Experience:</span> {candidate.experience}</p>
                                                                                <p><span className="font-medium">Skills:</span> {candidate.skills.join(", ")}</p>
                                                                                {candidate.interviewDate && (
                                                                                    <p className="mt-2">
                                                                                        <span className="font-medium">Interview:</span> {new Date(candidate.interviewDate).toLocaleString()}
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            {candidate.status !== "Interview Scheduled" && (
                                                                                <button
                                                                                    onClick={() => scheduleInterview(candidate)}
                                                                                    className="mt-3 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition"
                                                                                >
                                                                                    Schedule Interview (Auto-schedule based on HR availability)
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-8 text-gray-500">
                                                                    <p>No candidates have applied yet.</p>
                                                                    <p className="text-sm mt-2">Check back later or promote this job opening.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <nav className="bg-gradient-to-r from-gray-900 to-blue-900 shadow-lg border-b border-blue-700 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group">
                            <div className="relative">
                                <Image
                                    src="/logo.png"
                                    alt="NeoRecruit Logo"
                                    width={256}
                                    height={256}
                                    className="w-32 h-auto md:w-40 transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(30,160,218,0.6)]"
                                />
                                <span className="absolute inset-0 bg-blue-500 rounded-full mix-blend-screen opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500"></span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link
                                href="/department"
                                className="relative px-4 py-2 text-sm font-semibold text-blue-100 hover:text-white transition-all duration-300 group"
                            >
                                <span className="relative z-10">DEPARTMENTS</span>
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            </Link>

                            <Link
                                href="/hr"
                                className="relative px-4 py-2 text-sm font-semibold text-blue-100 hover:text-white transition-all duration-300 group"
                            >
                                <span className="relative z-10">HR PORTAL</span>
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-blue-900/0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            </Link>

                            {/* Login Button */}
                            <button
                                onClick={() => setShowLogin(true)}
                                className="ml-4 relative px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-md
                                transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_15px_rgba(30,160,218,0.5)]
                                border border-blue-400/30 hover:border-blue-300/50 transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <LogIn size={18} />
                                <span>LOGIN</span>
                            </button>

                            {/* Apply Button */}
                            <Link
                                href="/apply"
                                className="ml-4 relative px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-md
                                transition-all duration-300 hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_15px_rgba(30,160,218,0.5)]
                                border border-blue-400/30 hover:border-blue-300/50 transform hover:-translate-y-0.5"
                            >
                                <span className="relative z-10">APPLY NOW</span>
                                <span className="absolute inset-0 rounded-md bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button className="text-blue-100 hover:text-white focus:outline-none p-2 rounded-md bg-blue-900/30 hover:bg-blue-800/50 transition-all duration-300">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Image */}
            <section className="bg-[#80C7EA] w-full relative">
                <Image
                    src="/5.svg"
                    alt="Hero Frame Description"
                    width={1920}
                    height={1080}
                    priority
                    className="w-full h-auto object-cover"
                />
            </section>

            {/* Our Solution and Partner Section */}
            <section ref={section2Ref} className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16 px-4">
                <motion.div
                    style={{ opacity, y }}
                    className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8"
                >
                    <div className="flex-1 pr-0 md:pr-8 pb-8 md:pb-0 md:border-r border-blue-700">
                        <h2 className="text-4xl font-bold mb-6">Streamline Your Hiring Process</h2>
                        <p className="text-blue-100 text-lg mb-6">
                            HireBerg's intelligent platform keeps both recruiters and candidates informed at every stage with real-time updates powered by our proprietary AI and RPA automation.
                        </p>
                        <ul className="space-y-3 text-blue-100">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                                <span>Automated status updates for all applicants</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                                <span>AI-powered candidate matching with 92% accuracy</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                                <span>Seamless integration with existing HR systems</span>
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 pl-0 md:pl-8 flex flex-col items-center justify-center">
                        <h2 className="text-3xl font-bold mb-8 text-center">Trusted by Industry Leaders</h2>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-blue-700">
                            <div className="flex items-center gap-6 mb-4">
                                <img
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/full%20dark%20logo%202-EkfPGVB1a5EK8IqsptzDvHH1Y2nJDM.png"
                                    alt="HireBerg Logo"
                                    className="w-16 h-auto"
                                />
                                <div className="text-3xl text-blue-200">×</div>
                                <div className="text-4xl font-bold">
                                    <span className="text-red-400">P</span>
                                    <span className="text-blue-300">A</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-semibold mb-1">Strategic Partnership</div>
                                <div className="text-blue-200 text-sm">
                                    <span className="font-bold">HireBerg</span> × <span className="text-red-300 font-bold">PRO</span>
                                    <span className="text-blue-300 font-bold">ARCHIVE</span>
                                </div>
                                <div className="text-xs text-blue-300 mt-1">Enterprise Solutions Division</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Hiring Process Section */}
            <section className="bg-blue-950 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center text-blue-400 mb-4">The Hiring Process</h2>
                    <p className="text-center text-blue-200 max-w-3xl mx-auto mb-16">
                        Our streamlined workflow reduces time-to-hire by 40% compared to traditional methods
                    </p>

                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Flowchart */}
                        <div className="flex-1">
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-blue-700 md:left-1/2 md:-translate-x-1/2"></div>

                                {/* Process steps */}
                                <div className="space-y-8 pl-10 md:pl-0">
                                    {[
                                        { title: "Staffing Request", desc: "Department submits hiring needs" },
                                        { title: "Job Definition", desc: "HR creates detailed job profile" },
                                        { title: "Job Posting", desc: "Automated distribution to 50+ boards" },
                                        { title: "ATS Screening", desc: "AI filters 90% of unqualified apps" },
                                        { title: "Candidate Review", desc: "Hiring team evaluates top matches" },
                                        { title: "Status Updates", desc: "Automated notifications sent" },
                                        { title: "Interview Process", desc: "Coordinated through platform" },
                                        { title: "Onboarding", desc: "Paperless digital onboarding" }
                                    ].map((step, index) => (
                                        <div key={index} className="relative md:text-center">
                                            <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-300 md:left-1/2 md:-translate-x-1/2"></div>
                                            <div className="bg-blue-900/50 px-6 py-4 rounded-lg border border-blue-800 shadow-lg backdrop-blur-sm max-w-xs md:max-w-none md:mx-auto">
                                                <h3 className="font-bold text-blue-100 mb-1">{step.title}</h3>
                                                <p className="text-sm text-blue-300">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Features */}
                        <div className="flex-1 md:pl-12">
                            <h3 className="text-2xl font-bold mb-8 text-blue-300">Platform Features</h3>

                            <div className="space-y-8">
                                <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-800">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-700 p-3 rounded-lg">
                                            <BarChart2 size={24} className="text-blue-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">Hiring Dashboard</h4>
                                            <p className="text-blue-200">
                                                Real-time analytics on applicant flow, diversity metrics, and time-to-fill benchmarks across all open positions.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-800">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-700 p-3 rounded-lg">
                                            <Users size={24} className="text-blue-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">HR Dashboard</h4>
                                            <p className="text-blue-200">
                                                Comprehensive workforce planning tools with predictive analytics for future hiring needs and talent gaps.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-800">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-700 p-3 rounded-lg">
                                            <Cpu size={24} className="text-blue-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">RPA Automation</h4>
                                            <p className="text-blue-200">
                                                Our bots handle repetitive tasks like interview scheduling, reference checks, and compliance documentation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-b from-blue-950 to-blue-900 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="md:w-1/2">
                        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
                        <p className="text-xl text-blue-200 mb-8">
                            Join over 1,200 companies who have reduced hiring costs by an average of 35% with our platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/20">
                                Request Demo
                            </button>
                            <button className="bg-transparent hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-all border border-blue-400">
                                Contact Sales
                            </button>
                        </div>
                    </div>

                    <div className="md:w-1/2 bg-white/5 p-8 rounded-xl border border-blue-800 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">Key Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Clock className="text-green-400 mt-1" />
                                <div>
                                    <h4 className="font-bold">68% Faster</h4>
                                    <p className="text-sm text-blue-200">Average reduction in time-to-hire</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DollarSign className="text-green-400 mt-1" />
                                <div>
                                    <h4 className="font-bold">$23k Saved</h4>
                                    <p className="text-sm text-blue-200">Per hire in recruiting costs</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UserCheck className="text-green-400 mt-1" />
                                <div>
                                    <h4 className="font-bold">4.8/5 Rating</h4>
                                    <p className="text-sm text-blue-200">Candidate satisfaction score</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BarChart className="text-green-400 mt-1" />
                                <div>
                                    <h4 className="font-bold">94% Retention</h4>
                                    <p className="text-sm text-blue-200">First-year employee retention</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-blue-950 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-blue-400 mb-4">What Our Clients Say</h2>
                        <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                            Trusted by HR professionals and hiring managers at companies of all sizes
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "HireBerg reduced our time-to-hire from 42 to just 14 days. The automated candidate matching is uncannily accurate.",
                                name: "Sarah Johnson",
                                title: "Director of Talent, TechForward",
                                rating: 5,
                                avatar: "https://randomuser.me/api/portraits/women/44.jpg"
                            },
                            {
                                quote: "The RPA automation saved our team 20+ hours per week on administrative tasks. Game changer for our lean HR team.",
                                name: "