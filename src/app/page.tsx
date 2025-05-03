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
    DollarSign, Clock, UserCheck, BarChart, Star, LogIn
} from "lucide-react";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
                {/* SVG Arrow positioned absolutely on the right */}
                <div className="absolute right-60 top-97 z-10 w-120 h-120">
                    <Image
                        src="/kk.svg"
                        alt="Decorative Arrow"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Hero Image */}
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
                                name: "Michael Chen",
                                title: "HR Manager, GlobalSoft",
                                rating: 4,
                                avatar: "https://randomuser.me/api/portraits/men/32.jpg"
                            },
                            {
                                quote: "Our candidate satisfaction scores improved dramatically thanks to the transparent communication features.",
                                name: "David Rodriguez",
                                title: "VP People, NexGen Labs",
                                rating: 5,
                                avatar: "https://randomuser.me/api/portraits/men/65.jpg"
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white/5 p-8 rounded-xl border border-blue-800 hover:border-blue-600 transition-all">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            fill={i < testimonial.rating ? "#60a5fa" : "none"}
                                            stroke="#60a5fa"
                                            size={16}
                                        />
                                    ))}
                                </div>
                                <blockquote className="text-lg italic text-blue-100 mb-6">
                                    "{testimonial.quote}"
                                </blockquote>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-bold">{testimonial.name}</p>
                                        <p className="text-sm text-blue-300">{testimonial.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 py-12 px-4 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        {/* Company Info */}
                        <div className="md:w-1/3 mb-8 md:mb-0">
                            <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Layer_1-GaGeOg7GR50SS265uNDW4gaB1SKQnM.png"
                                alt="HireBerg Logo"
                                className="w-24 h-auto mb-4"
                            />
                            <p className="text-gray-600 mb-4">
                                HireBerg connects top talent with innovative companies worldwide. Our AI-powered platform makes hiring effortless.
                            </p>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Phone size={18} />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 mt-1">
                                <Mail size={18} />
                                <span>info@hireberg.com</span>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3">
                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-gray-800">For Candidates</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li><a href="#" className="hover:text-blue-600 transition">Browse Jobs</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Candidate Profile</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Job Alerts</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Career Advice</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Salary Calculator</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-gray-800">For Employers</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li><a href="#" className="hover:text-blue-600 transition">Post a Job</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Browse Candidates</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Recruiting Solutions</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">HR Resources</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Pricing Plans</a></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-gray-800">Company</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li><a href="#" className="hover:text-blue-600 transition">About Us</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Contact</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Careers</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Blog</a></li>
                                    <li><a href="#" className="hover:text-blue-600 transition">Help Center</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-8"></div>

                    {/* Bottom Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} HireBerg, Inc. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex justify-center gap-6">
                            <a href="#" className="text-gray-500 hover:text-blue-600 transition" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-blue-400 transition" aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-blue-700 transition" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-pink-600 transition" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-red-600 transition" aria-label="YouTube">
                                <Youtube size={20} />
                            </a>
                        </div>

                        {/* Legal Links */}
                        <div className="flex gap-4 text-sm">
                            <a href="#" className="text-gray-500 hover:text-blue-600 transition">Privacy Policy</a>
                            <a href="#" className="text-gray-500 hover:text-blue-600 transition">Terms of Service</a>
                            <a href="#" className="text-gray-500 hover:text-blue-600 transition">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}