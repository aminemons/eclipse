// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import './globals.css'
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NeoRecruit | Next-Gen Hiring Platform",
    description: "AI-powered recruitment system for modern enterprises",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const currentYear = new Date().getFullYear();

    return (
        <html lang="en">
        <body className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100`}>
        {/* Enhanced Navbar */}

        {/* Main Content */}
        <main className="flex-1">
            {children}
        </main>


        </body>
        </html>
    );
}