"use client";

import { motion } from "framer-motion";
import { MessageSquare, Paperclip, ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactFormData } from "@/app/contact/page";
import { useRef } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";

interface MessageSlideProps {
    data: ContactFormData;
    updateData: (data: Partial<ContactFormData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export function MessageSlide({ data, updateData, onNext, onPrev }: MessageSlideProps) {
    const { language } = useLanguage();
    const locale = LOCALES.contact.message;
    const backLabel = tString(LOCALES.contact.rules.back, language);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            updateData({ file: e.target.files[0] });
        }
    };

    const isValid = data.subject.trim().length > 0 && data.message.trim().length > 0;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bebas text-foreground tracking-wide mb-2">
                    {tString(locale.heading, language)}
                </h2>
                <p className="text-muted-foreground font-serif">
                    {tString(locale.subheading, language)}
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <Input
                        placeholder={tString(locale.subjectPlaceholder, language)}
                        value={data.subject}
                        onChange={(e) => updateData({ subject: e.target.value })}
                        className="h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                    />
                </div>

                <div>
                    <Textarea
                        placeholder={tString(locale.messagePlaceholder, language)}
                        value={data.message}
                        onChange={(e) => updateData({ message: e.target.value })}
                        className="min-h-[200px] bg-background/50 border-border/50 focus:border-primary text-lg resize-none p-6"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                    />

                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground"
                    >
                        <Paperclip className="mr-2 w-4 h-4" />
                        {data.file ? tString(locale.changeFile, language) : tString(locale.attachFile, language)}
                    </Button>

                    {data.file && (
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded text-xs text-primary">
                            <span className="truncate max-w-[200px]">{data.file.name}</span>
                            <button
                                onClick={() => updateData({ file: null })}
                                className="hover:text-red-500 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-12 flex justify-between items-center">
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
                    {tString(locale.nextStep, language)}
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
