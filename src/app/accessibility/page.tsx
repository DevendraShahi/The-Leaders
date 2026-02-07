"use client";

import { motion } from "framer-motion";
import {
    Eye,
    Keyboard,
    Smartphone,
    Layers,
    CheckCircle2,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
    {
        icon: Eye,
        title: "Visual Clarity",
        description: "High contrast modes, scalable text, and clear typography ensure readability for all users."
    },
    {
        icon: Keyboard,
        title: "Keyboard Navigation",
        description: "Full keyboard support for all interactive elements, ensuring a mouse-free experience."
    },
    {
        icon: Smartphone,
        title: "Responsive Design",
        description: "Seamless experience across all devices, screens, and orientations."
    },
    {
        icon: Layers,
        title: "Semantic Structure",
        description: "Proper HTML5 landmarks and heading hierarchy for screen reader efficiency."
    }
];

export default function AccessibilityPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section - Restored "Statement" Aesthetic */}
            <motion.section
                className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-border/10"
            >
                {/* Minimal Grid Background (Restored) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="max-w-5xl mx-auto flex flex-col items-center justify-center relative"
                    >
                        {/* Restored "Statement" Label & Decorative Line */}
                        <div className="relative mb-6">
                            <div className="border border-[#B71C1C]/30 px-6 py-2 backdrop-blur-sm bg-background/50">
                                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                                    Statement
                                </span>
                            </div>
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
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-20"
                    >
                        {/* General Statement (Restored & Styled) */}
                        <div className="flex flex-col md:flex-row gap-8 items-start border-l-2 border-primary/20 pl-6 md:pl-10">
                            <div className="space-y-4 max-w-2xl">
                                <h2 className="text-3xl font-bebas tracking-wide text-foreground">Our Commitment</h2>
                                <p className="text-lg leading-relaxed text-muted-foreground font-manrope">
                                    &ldquo;The Leaders&rdquo; is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                                </p>
                            </div>
                        </div>

                        {/* Feature Grid (Integrated with Editorial Style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-16 py-12 border-y border-border/10">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group"
                                >
                                    <div className="h-10 w-10 text-primary mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <feature.icon strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bebas text-xl tracking-wide mb-2 text-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed font-manrope">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Conformance Status (Restored Layout) */}
                        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
                            <div>
                                <h2 className="text-3xl font-bebas tracking-wide text-foreground mb-4">Conformance Status</h2>
                                <div className="inline-flex items-center gap-2 text-green-600 bg-green-500/5 px-3 py-1 rounded-full text-sm font-bold border border-green-500/10">
                                    <CheckCircle2 className="h-4 w-4" />
                                    WCAG 2.1 Level AA
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground font-manrope leading-relaxed">
                                <p>
                                    The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
                                </p>
                                <p>
                                    &ldquo;The Leaders&rdquo; is <strong>partially conformant</strong> with WCAG 2.1 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, though we are actively working to address these gaps.
                                </p>
                            </div>
                        </div>

                        {/* Technical Specs & Feedback (Restored) */}
                        <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-border/10">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bebas tracking-wide text-foreground">Technical Specifications</h2>
                                <p className="text-muted-foreground font-manrope">
                                    Accessibility of &ldquo;The Leaders&rdquo; relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:
                                </p>
                                <ul className="flex flex-wrap gap-2">
                                    {["HTML", "WAI-ARIA", "CSS", "JavaScript"].map((tech) => (
                                        <li key={tech} className="px-3 py-1 bg-secondary/30 text-secondary-foreground text-sm font-mono border border-border rounded">
                                            {tech}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-6 bg-secondary/5 p-8 rounded-lg border border-border/50">
                                <h2 className="text-2xl font-bebas tracking-wide text-foreground">Feedback & Contact</h2>
                                <p className="text-muted-foreground font-manrope">
                                    We welcome your feedback on the accessibility of &ldquo;The Leaders&rdquo;. Please let us know if you encounter accessibility barriers on our platform.
                                </p>

                                <Button className="w-full sm:w-auto font-bebas tracking-wider" asChild>
                                    <a href="mailto:theleadersnp@gmail.com" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        theleadersnp@gmail.com
                                    </a>
                                </Button>
                                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-4">
                                    Response time: 2 business days
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
