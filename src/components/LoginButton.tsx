// src/components/LoginButton.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginButton() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Fake login logic
        if (password !== "12345678") {
            setError("Invalid password");
            return;
        }

        switch (email) {
            case "manager@gmail.com":
                window.location.href = "/department";
                break;
            case "candidate@gmail.com":
                window.location.href = "/apply";
                break;
            case "hr@gmail.com":
                window.location.href = "/hr";
                break;
            default:
                setError("Invalid email");
        }
    };

    return (
        <>
            <button
                onClick={() => setIsLoginOpen(true)}
                className="ml-4 relative group"
            >
                <div className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-full shadow-lg transform group-hover:scale-110 transition-all duration-200">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
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
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Login
        </span>
            </button>

            {isLoginOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 opacity-20"></div>
                            <div className="relative p-8">
                                <button
                                    onClick={() => setIsLoginOpen(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                        Welcome Back
                                    </h2>
                                    <p className="text-gray-600">
                                        Sign in to access your dashboard
                                    </p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label
                                                htmlFor="remember-me"
                                                className="ml-2 block text-sm text-gray-700"
                                            >
                                                Remember me
                                            </label>
                                        </div>

                                        <a
                                            href="#"
                                            className="text-sm text-blue-600 hover:text-blue-500"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Sign In
                                    </button>
                                </form>

                                <div className="mt-6 text-center text-sm text-gray-500">
                                    <p>Demo credentials:</p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs bg-gray-100 p-2 rounded">
                                            manager@gmail.com → /department
                                        </p>
                                        <p className="text-xs bg-gray-100 p-2 rounded">
                                            hr@gmail.com → /hr
                                        </p>
                                        <p className="text-xs bg-gray-100 p-2 rounded">
                                            candidate@gmail.com → /apply
                                        </p>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}