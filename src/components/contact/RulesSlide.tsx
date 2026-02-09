"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, ArrowLeft, Gavel, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface RulesSlideProps {
    onNext: () => void;
    onPrev: () => void;
}

export function RulesSlide({ onNext, onPrev }: RulesSlideProps) {
    const { language } = useLanguage();
    const locale = LOCALES.contact.rules;

    const rules = [
        {
            icon: Scale,
            title: tString(locale.items[0].title, language),
            text: tString(locale.items[0].text, language)
        },
        {
            icon: Gavel,
            title: tString(locale.items[1].title, language),
            text: tString(locale.items[1].text, language)
        },
        {
            icon: Shield,
            title: tString(locale.items[2].title, language),
            text: tString(locale.items[2].text, language)
        }
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bebas text-foreground text-center mb-2 tracking-wide">
                {tString(locale.heading, language)}
            </h2>
            <p className="text-center text-muted-foreground font-serif mb-12">
                {tString(locale.subheading, language)}
            </p>

            <div className="space-y-6">
                {rules.map((rule, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="flex gap-6 p-6 bg-background/50 border border-border/40 backdrop-blur-sm rounded-lg hover:border-primary/30 transition-colors"
                    >
                        <rule.icon className="w-8 h-8 text-primary flex-shrink-0" strokeWidth={1.5} />
                        <div>
                            <h3 className="font-bebas text-xl text-foreground mb-1">{rule.title}</h3>
                            <p className="text-muted-foreground text-sm font-sans leading-relaxed">
                                {rule.text}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="pt-12 flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={onPrev}
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> {tString(locale.back, language)}
                </Button>
                <Button
                    onClick={onNext}
                    size="lg"
                >
                    {tString(locale.agree, language)}
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
