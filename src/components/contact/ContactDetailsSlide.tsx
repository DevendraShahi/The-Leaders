"use client";

import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactFormData } from "@/app/contact/page";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface ContactDetailsSlideProps {
    data: ContactFormData;
    updateData: (data: Partial<ContactFormData>) => void;
    onNext: () => void;
    onPrev: () => void;
    isSubmitting?: boolean;
}

export function ContactDetailsSlide({ data, updateData, onNext, onPrev, isSubmitting }: ContactDetailsSlideProps) {
    const { language } = useLanguage();
    const locale = LOCALES.contact.details;
    const backLabel = tString(LOCALES.contact.rules.back, language);

    const isValid = data.email.includes("@");

    return (
        <div className="max-w-xl mx-auto text-center">
            <div className="mb-12">
                <h2 className="text-3xl font-bebas text-foreground tracking-wide mb-2">
                    {tString(locale.heading, language)}
                </h2>
                <p className="text-muted-foreground font-serif">
                    {tString(locale.subheading, language)}
                </p>
            </div>

            <div className="space-y-8">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="email"
                        placeholder={tString(locale.emailPlaceholder, language)}
                        value={data.email}
                        onChange={(e) => updateData({ email: e.target.value })}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="tel"
                        placeholder={tString(locale.phonePlaceholder, language)}
                        value={data.phone}
                        onChange={(e) => updateData({ phone: e.target.value })}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="pt-16 flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={onPrev}
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> {backLabel}
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? tString(locale.sending, language) : tString(locale.submit, language)}
                    {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
}
