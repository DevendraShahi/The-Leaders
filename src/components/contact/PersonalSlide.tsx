"use client";

import { motion } from "framer-motion";
import { MapPin, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactFormData } from "@/app/contact/page";
import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface PersonalSlideProps {
    data: ContactFormData;
    updateData: (data: Partial<ContactFormData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export function PersonalSlide({ data, updateData, onNext, onPrev }: PersonalSlideProps) {
    const { language } = useLanguage();
    const locale = LOCALES.contact.personal;
    // Reusing 'Back' from rules section as it's common navigation
    const backLabel = tString(LOCALES.contact.rules.back, language);

    const [currentTime] = useState(() =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    const isValid = data.name.trim().length > 0;

    return (
        <div className="max-w-xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <span className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
                    {currentTime} — {tString(locale.connectionPhase, language)}
                </span>

                <h2 className="text-4xl md:text-5xl font-bebas text-foreground mt-4 mb-2">
                    {tString(locale.heading, language)}
                </h2>

                <p className="text-muted-foreground font-serif">
                    {tString(locale.subheading, language)}
                </p>
            </motion.div>

            <div className="space-y-8">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={tString(locale.namePlaceholder, language)}
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value })}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                    />
                </div>

                <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={tString(locale.locationPlaceholder, language)}
                        value={data.location}
                        onChange={(e) => updateData({ location: e.target.value })}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                    />
                </div>
            </div>

            <div className="pt-16 flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={onPrev}
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> {backLabel}
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                >
                    {tString(locale.continue, language)}
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
