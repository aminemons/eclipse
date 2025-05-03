'use client';

import { useState, useTransition } from 'react';
import { createRequestAction } from './actions';
import { motion } from 'framer-motion';

export default function DepartmentPage() {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [activeField, setActiveField] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);

        if (!name || !position || !qualifications) {
            setMessage("Please fill in all fields.");
            return;
        }

        startTransition(async () => {
            const result = await createRequestAction({ name, position, qualifications });
            if (result.success) {
                setMessage("Request submitted successfully!");
                setName('');
                setPosition('');
                setQualifications('');
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
                        Talent Request Portal
                    </motion.h1>

                    {/* Animated SVG Underline */}
                    <motion.svg
                        width="250"
                        height="6"
                        viewBox="0 0 250 6"
                        className="mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.path
                            d="M0 3 L250 3"
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
                            animate={{ x: 250 }}
                            transition={{
                                repeat: Infinity,
                                duration: 2.5,
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
                        onFocus={() => setActiveField('name')}
                        onBlur={() => setActiveField(null)}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-1">
                            Your Name/Department
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-16 py-3 bg-gray-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isPending}
                                placeholder="Marketing Department"
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
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                            {activeField === 'name' && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Position Field */}
                    <motion.div
                        onFocus={() => setActiveField('position')}
                        onBlur={() => setActiveField(null)}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <label htmlFor="position" className="block text-sm font-medium text-blue-200 mb-1">
                            Position Title
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="position"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full px-16 py-3 bg-gray-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isPending}
                                placeholder="Senior Marketing Specialist"
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
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            {activeField === 'position' && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Qualifications Field */}
                    <motion.div
                        onFocus={() => setActiveField('qualifications')}
                        onBlur={() => setActiveField(null)}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <label htmlFor="qualifications" className="block text-sm font-medium text-blue-200 mb-1">
                            Key Qualifications/Requirements
                        </label>
                        <div className="relative">
                            <textarea
                                id="qualifications"
                                rows={4}
                                value={qualifications}
                                onChange={(e) => setQualifications(e.target.value)}
                                className="w-full px-16 py-3 bg-gray-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isPending}
                                placeholder="5+ years experience, digital marketing expertise..."
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
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            {activeField === 'qualifications' && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Status Message */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg flex items-start ${message.startsWith('Error') ? 'bg-red-900 bg-opacity-30 border border-red-500' : 'bg-green-900 bg-opacity-30 border border-green-500'}`}
                        >
                            <motion.svg
                                className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={message.startsWith('Error') ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M5 13l4 4L19 7"}
                                />
                            </motion.svg>
                            <span className="text-sm">{message}</span>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isPending}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center space-x-2 ${isPending ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}`}
                        whileHover={{ scale: isPending ? 1 : 1.02 }}
                        whileTap={{ scale: isPending ? 1 : 0.98 }}
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
                                <span>Processing Request...</span>
                            </>
                        ) : (
                            <>
                                <motion.svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    whileHover={{ rotate: 10 }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </motion.svg>
                                <span>Submit Talent Request</span>
                            </>
                        )}
                    </motion.button>
                </motion.form>

                {/* Animated Background Elements */}
                <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                    {/* Floating tech elements */}
                    {[...Array(8)].map((_, i) => (
                        <motion.svg
                            key={i}
                            className="absolute text-blue-500 opacity-10"
                            width={Math.random() * 100 + 50}
                            height={Math.random() * 100 + 50}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                                rotate: Math.random() * 360,
                            }}
                            animate={{
                                x: [0, Math.random() * 100 - 50],
                                y: [0, Math.random() * 100 - 50],
                                rotate: [0, Math.random() * 360],
                            }}
                            transition={{
                                duration: Math.random() * 15 + 15,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d={[
                                    "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
                                    "M13 10V3L4 14h7v7l9-11h-7z",
                                    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
                                    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                ][i % 4]}
                            />
                        </motion.svg>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}