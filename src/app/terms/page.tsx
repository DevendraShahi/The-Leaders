"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <motion.section
                className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-border/10"
            >
                {/* Minimal Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="max-w-5xl mx-auto flex flex-col items-center justify-center relative"
                    >
                        {/* Centered "Legal" Label */}
                        <div className="relative mb-6">
                            <div className="border border-[#B71C1C]/30 px-6 py-2 backdrop-blur-sm bg-background/50">
                                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                                    Legal
                                </span>
                            </div>
                            {/* Decorative Line */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-6 bg-[#B71C1C]/20" />
                        </div>

                        <h1 className="mt-4 text-6xl md:text-8xl font-bebas text-foreground uppercase tracking-tighter leading-none text-center">
                            Terms of Service
                        </h1>

                        <p className="mt-6 font-mono text-sm text-muted-foreground tracking-widest uppercase">
                            Last Updated: January 31, 2026
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Content */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-12 text-lg leading-relaxed text-foreground/80"
                    >
                        {/* Section 1 */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using "The Leaders" (hereinafter referred to as "the Platform"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. Description of Service</h2>
                            <p>
                                The Platform serves as a digital archive and information hub dedicated to Nepal's political history, leadership biographies, and election data. We provide this content for educational, informational, and research purposes.
                            </p>
                            <p>
                                We strive for accuracy but acknowledge that historical records can be subject to interpretation. Our content is curated from public records, verified news sources, and official documents.
                            </p>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. User Conduct</h2>
                            <p>
                                You agree to use the Platform only for lawful purposes. You are prohibited from:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[#B71C1C]">
                                <li>Attempting to compromise the security or integrity of our digital systems.</li>
                                <li>Scraping or mass-downloading data without explicit permission.</li>
                                <li>Using our content to spread misinformation or malicious propaganda.</li>
                                <li>Impersonating any person or entity related to the Platform.</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Intellectual Property</h2>
                            <p>
                                The specific compilation of data, original biographies, design elements, and code on this Platform are the intellectual property of "The Leaders".
                            </p>
                            <p>
                                Historical facts and public record data remain in the public domain. However, our presentation, analysis, and visualization of this data are protected by copyright laws. You may quote our content with proper attribution to "The Leaders".
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Disclaimer of Warranties</h2>
                            <p>
                                The Platform is provided on an "as is" and "as available" basis. While we maintain rigorous fact-checking standards, we make no warranties, expressed or implied, regarding the absolute completeness or accuracy of every data point.
                            </p>
                            <p>
                                We are not a government entity and are not affiliated with the Election Commission of Nepal, though we may cite their data.
                            </p>
                        </div>

                        {/* Section 6 */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">6. Limitation of Liability</h2>
                            <p>
                                In no event shall "The Leaders", its creators, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the Platform.
                            </p>
                        </div>

                        {/* Section 7 */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">7. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. Continued use of the Platform after any such changes constitutes your acceptance of the new Terms of Service.
                            </p>
                        </div>

                        <div className="pt-12 border-t border-border/20">
                            <p className="text-sm text-muted-foreground">
                                For any questions regarding these terms, please contact us at <a href="mailto:legal@theleaders.np" className="text-foreground hover:text-[#B71C1C] transition-colors underline decoration-[#B71C1C]/30 underline-offset-4">legal@theleaders.np</a>.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
