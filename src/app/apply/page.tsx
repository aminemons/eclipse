'use client';

import { useState, useTransition } from 'react';
import { uploadApplicantAction } from './actions';
import { motion } from 'framer-motion';

export default function ApplyPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isHovered, setIsHovered] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) {
                setCvFile(file);
                setMessage(null);
            } else {
                setMessage("Invalid file type. Please upload a .docx Word document.");
                setCvFile(null);
                event.target.value = '';
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);

        if (!name || !email || !cvFile) {
            setMessage('Please provide your name, email, and upload your CV.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage('Please enter a valid email address.');
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('cv', cvFile);

            const result = await uploadApplicantAction(formData);

            if (result.success) {
                setMessage('Application submitted successfully!');
                setName('');
                setEmail('');
                setCvFile(null);
                const fileInput = document.getElementById('cv') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                setMessage(`Error: ${result.error}`);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                {/* Animated Header */}
                <div className="flex flex-col items-center mb-10">
                    <motion.h1
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="text-4xl font-bold text-white mb-4 text-center"
                    >
                        Join Our Team
                    </motion.h1>

                    {/* Animated SVG Underline */}
                    <motion.svg
                        width="200"
                        height="6"
                        viewBox="0 0 200 6"
                        className="mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.path
                            d="M0 3 L200 3"
                            stroke="#3B82F6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx="0"
                            cy="3"
                            r="4"
                            fill="#3B82F6"
                            initial={{ x: 0 }}
                            animate={{ x: 200 }}
                            transition={{
                                repeat: Infinity,
                                duration: 2,
                                ease: "linear"
                            }}
                        />
                    </motion.svg>
                </div>

                {/* Futuristic Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6 max-w-lg mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-lg p-8 rounded-xl border border-blue-400 border-opacity-30 shadow-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {/* Name Field */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-15 py-3 bg-gray-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isPending}
                                placeholder="John Doe"
                            />
                            <svg
                                className="absolute left-3 top-3.5 h-5 w-5 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-15 py-3 bg-gray-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isPending}
                                placeholder="john@example.com"
                            />
                            <svg
                                className="absolute left-3 top-3.5 h-5 w-5 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </motion.div>

                    {/* File Upload */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <label htmlFor="cv" className="block text-sm font-medium text-blue-200 mb-1">
                            Upload CV (.docx only)
                        </label>
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${cvFile ? 'border-green-500 bg-green-900 bg-opacity-10' : 'border-blue-400 border-opacity-30 hover:border-blue-500'}`}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <input
                                type="file"
                                id="cv"
                                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                                disabled={isPending}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <motion.svg
                                    className="h-12 w-12 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    animate={{
                                        y: isHovered ? [-2, 2, -2] : 0,
                                    }}
                                    transition={{
                                        y: {
                                            repeat: isHovered ? Infinity : 0,
                                            duration: 1,
                                            ease: "easeInOut"
                                        }
                                    }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </motion.svg>
                                <p className="text-sm text-blue-200">
                                    {cvFile ? (
                                        <span className="text-green-400">{cvFile.name}</span>
                                    ) : (
                                        <span>Drag & drop your CV here or click to browse</span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-400">Only .docx files accepted</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Message */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg ${message.startsWith('Error') || message.includes('Invalid') ? 'bg-red-900 bg-opacity-30 border border-red-500' : 'bg-green-900 bg-opacity-30 border border-green-500'}`}
                        >
                            <div className="flex items-center">
                                <svg
                                    className={`h-5 w-5 mr-2 ${message.startsWith('Error') || message.includes('Invalid') ? 'text-red-400' : 'text-green-400'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={message.startsWith('Error') || message.includes('Invalid') ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M5 13l4 4L19 7"}
                                    />
                                </svg>
                                <span className="text-sm">{message}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isPending || !cvFile}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center space-x-2 ${isPending ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}`}
                        whileHover={{ scale: isPending || !cvFile ? 1 : 1.02 }}
                        whileTap={{ scale: isPending || !cvFile ? 1 : 0.98 }}
                    >
                        {isPending ? (
                            <>
                                <motion.svg
                                    className="h-5 w-5 animate-spin"
                                    viewBox="0 0 24 24"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray="80"
                                        strokeDashoffset="60"
                                    />
                                </motion.svg>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                <span>Launch Application</span>
                            </>
                        )}
                    </motion.button>
                </motion.form>

                {/* Animated Background Elements */}
                <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                    {/* Floating circles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-blue-500 bg-opacity-10"
                            initial={{
                                x: Math.random() * 100,
                                y: Math.random() * 100,
                                width: Math.random() * 300 + 100,
                                height: Math.random() * 300 + 100,
                            }}
                            animate={{
                                x: [0, Math.random() * 100 - 50],
                                y: [0, Math.random() * 100 - 50],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}