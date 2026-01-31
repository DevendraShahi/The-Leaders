"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeSlideProps {
    onNext: () => void;
}

export function WelcomeSlide({ onNext }: WelcomeSlideProps) {
    return (
        <div className="text-center space-y-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full mb-8"
            >
                <Sparkles className="w-8 h-8 text-primary opacity-80" strokeWidth={1} />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bebas text-foreground uppercase tracking-wide leading-none">
                We Value Your Voice
            </h1>

            <p className="text-xl font-serif text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Thank you for taking the time to reach out. "The Leaders" is built on the foundation of shared history and open discourse. Your insights help us preserve the truth step by step.
            </p>

            <div className="pt-8">
                <Button
                    onClick={onNext}
                    size="lg"
                    className="group bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-full font-sans text-lg tracking-wide transition-all duration-300 transform hover:scale-105"
                >
                    Begin Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
