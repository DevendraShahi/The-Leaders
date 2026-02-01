"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
                            Privacy Policy
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
                        {/* Introduction */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                            <p>
                                At "The Leaders", we respect your privacy and are committed to protecting the personal data we hold about you. This policy explains how we collect, use, and safeguard your information when you visit our website.
                            </p>
                        </div>

                        {/* Data Collection */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                            <p>
                                We may collect the following types of information:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[#B71C1C]">
                                <li>
                                    <strong>Usage Data:</strong> Information about your device, browser, and how you interact with our site (pages visited, time spent, etc.).
                                </li>
                                <li>
                                    <strong>Communications:</strong> If you contact us via email, we keep a record of that correspondence.
                                </li>
                                <li>
                                    <strong>Cookies:</strong> We use cookies to enhance your browsing experience (see our Cookie Policy).
                                </li>
                            </ul>
                        </div>

                        {/* Use of Information */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Data</h2>
                            <p>
                                We use your data to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[#B71C1C]">
                                <li>Provide and improve the Platform's functionality.</li>
                                <li>Analyze usage trends to enhance user experience.</li>
                                <li>Respond to your inquiries or support requests.</li>
                                <li>Ensure the security of our services.</li>
                            </ul>
                        </div>

                        {/* Data Sharing */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Data Sharing</h2>
                            <p>
                                We do not sell your personal data. We may share data with trusted third-party service providers (e.g., analytics providers, hosting services) who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
                            </p>
                        </div>

                        {/* User Rights */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
                            <p>
                                Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete the data we hold about you. To exercise these rights, please contact us.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="pt-12 border-t border-border/20">
                            <p className="text-sm text-muted-foreground">
                                For any privacy-related questions, please contact us at <a href="mailto:privacy@theleaders.np" className="text-foreground hover:text-[#B71C1C] transition-colors underline decoration-[#B71C1C]/30 underline-offset-4">privacy@theleaders.np</a>.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
