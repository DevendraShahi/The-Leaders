"use client";

import { motion } from "framer-motion";

export default function CookiePolicyPage() {
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
                            Cookie Policy
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
                        {/* What are cookies */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. What Are Cookies?</h2>
                            <p>
                                Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences (such as login, language, font size, and other display preferences) over a period of time, so you don't have to keep re-entering them whenever you come back to the site.
                            </p>
                        </div>

                        {/* How we use cookies */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. How We Use Cookies</h2>
                            <p>
                                We use cookies for the following purposes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[#B71C1C]">
                                <li>
                                    <strong>Essential Cookies:</strong> Necessary for the website to function properly.
                                </li>
                                <li>
                                    <strong>Functionality Cookies:</strong> Allow us to remember choices you make (like your preferred theme).
                                </li>
                                <li>
                                    <strong>Analytics Cookies:</strong> Help us understand how visitors interact with the website by collecting and reporting information anonymously.
                                </li>
                            </ul>
                        </div>

                        {/* Managing Cookies */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. Managing Cookies</h2>
                            <p>
                                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="pt-12 border-t border-border/20">
                            <p className="text-sm text-muted-foreground">
                                For questions about our use of cookies, please contact us at <a href="mailto:privacy@theleaders.np" className="text-foreground hover:text-[#B71C1C] transition-colors underline decoration-[#B71C1C]/30 underline-offset-4">privacy@theleaders.np</a>.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
