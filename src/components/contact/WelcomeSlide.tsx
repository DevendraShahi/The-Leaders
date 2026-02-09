"use client";

import { motion } from "framer-motion";
import { MessageSquareText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface WelcomeSlideProps {
    onNext: () => void;
}

export function WelcomeSlide({ onNext }: WelcomeSlideProps) {
    const { language } = useLanguage();
    const locale = LOCALES.contact.welcome;

    return (
        <div className="text-center space-y-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full mb-8"
            >
                <MessageSquareText className="w-8 h-8 text-primary opacity-80" strokeWidth={1} />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bebas text-foreground uppercase tracking-wide leading-none">
                {tString(locale.heading, language)}
            </h1>

            <p className="text-xl font-serif text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {tString(locale.body, language)}
            </p>

            <div className="pt-8">
                <Button
                    onClick={onNext}
                    size="lg"
                    className="group"
                >
                    {tString(locale.button, language)}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
