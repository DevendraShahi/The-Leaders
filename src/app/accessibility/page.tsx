"use client";

import { motion } from "framer-motion";

export default function AccessibilityPage() {
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
                        {/* Centered "Statement" Label */}
                        <div className="relative mb-6">
                            <div className="border border-[#B71C1C]/30 px-6 py-2 backdrop-blur-sm bg-background/50">
                                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                                    Statement
                                </span>
                            </div>
                            {/* Decorative Line */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-6 bg-[#B71C1C]/20" />
                        </div>

                        <h1 className="mt-4 text-6xl md:text-8xl font-bebas text-foreground uppercase tracking-tighter leading-none text-center">
                            Accessibility
                        </h1>

                        <p className="mt-6 font-mono text-sm text-muted-foreground tracking-widest uppercase">
                            Commitment to Digital Inclusion
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
                        {/* General Statement */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">Our Commitment</h2>
                            <p>
                                "The Leaders" is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                            </p>
                        </div>

                        {/* Conformance Status */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">Conformance Status</h2>
                            <p>
                                The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
                            </p>
                            <p>
                                "The Leaders" is partially conformant with WCAG 2.1 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, though we are actively working to address these gaps.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">Accessibility Features</h2>
                            <p>
                                We have implemented the following features to improve accessibility:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[#B71C1C]">
                                <li>
                                    <strong>Theme Support:</strong> High contrast dark mode and clear light mode options.
                                </li>
                                <li>
                                    <strong>Keyboard Navigation:</strong> Standardized focus states and keyboard-accessible menus.
                                </li>
                                <li>
                                    <strong>Text Scaling:</strong> Layouts that adapt to user-preferred font sizes.
                                </li>
                                <li>
                                    <strong>Alt Text:</strong> Descriptive text for historical images and portraits.
                                </li>
                            </ul>
                        </div>

                        {/* Feedback */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">Feedback & Contact</h2>
                            <p>
                                We welcome your feedback on the accessibility of "The Leaders". Please let us know if you encounter accessibility barriers on our platform:
                            </p>
                            <div className="bg-accent/30 p-6 rounded-lg border border-border mt-4">
                                <p className="font-medium text-foreground">E-mail: <a href="mailto:accessibility@theleaders.np" className="text-primary hover:underline">accessibility@theleaders.np</a></p>
                                <p className="text-sm text-muted-foreground mt-2">We try to respond to feedback within 2 business days.</p>
                            </div>
                        </div>

                        {/* Technical Specifications */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">Technical Specifications</h2>
                            <p>
                                Accessibility of "The Leaders" relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-[#B71C1C]">
                                <li>HTML</li>
                                <li>WAI-ARIA</li>
                                <li>CSS</li>
                                <li>JavaScript</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
