"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground py-24">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 space-y-4"
                >
                    <h1 className="text-5xl md:text-6xl font-bebas text-foreground uppercase tracking-wide">
                        Terms of Service
                    </h1>
                    <div className="w-24 h-[1px] bg-[#B71C1C] mx-auto opacity-50" />
                    <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
                        Last Updated: January 31, 2026
                    </p>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-12 font-serif text-lg leading-relaxed text-foreground/80"
                >
                    {/* Section 1 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-foreground">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using "The Leaders" (hereinafter referred to as "the Platform"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-foreground">2. Description of Service</h2>
                        <p>
                            The Platform serves as a digital archive and information hub dedicated to Nepal's political history, leadership biographies, and election data. We provide this content for educational, informational, and research purposes.
                        </p>
                        <p>
                            We strive for accuracy but acknowledge that historical records can be subject to interpretation. Our content is curated from public records, verified news sources, and official documents.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-foreground">3. User Conduct</h2>
                        <p>
                            You agree to use the Platform only for lawful purposes. You are prohibited from:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-[#B71C1C]">
                            <li>Attempting to compromise the security or integrity of our digital systems.</li>
                            <li>Scraping or mass-downloading data without explicit permission.</li>
                            <li>Using our content to spread misinformation or malicious propaganda.</li>
                            <li>Impersonating any person or entity related to the Platform.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-foreground">4. Intellectual Property</h2>
                        <p>
                            The specific compilation of data, original biographies, design elements, and code on this Platform are the intellectual property of "The Leaders".
                        </p>
                        <p>
                            Historical facts and public record data remain in the public domain. However, our presentation, analysis, and visualization of this data are protected by copyright laws. You may quote our content with proper attribution to "The Leaders".
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-foreground">5. Disclaimer of Warranties</h2>
                        <p>
                            The Platform is provided on an "as is" and "as available" basis. While we maintain rigorous fact-checking standards, we make no warranties, expressed or implied, regarding the absolute completeness or accuracy of every data point.
                        </p>
                        <p>
                            We are not a government entity and are not affiliated with the Election Commission of Nepal, though we may cite their data.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-foreground">6. Limitation of Liability</h2>
                        <p>
                            In no event shall "The Leaders", its creators, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the Platform.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-foreground">7. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Continued use of the Platform after any such changes constitutes your acceptance of the new Terms of Service.
                        </p>
                    </section>

                    <div className="pt-12 border-t border-border/20">
                        <p className="text-sm font-sans text-muted-foreground">
                            For any questions regarding these terms, please contact us at <a href="mailto:legal@theleaders.np" className="text-foreground hover:text-[#B71C1C] transition-colors underline decoration-[#B71C1C]/30 underline-offset-4">legal@theleaders.np</a>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
