"use client";

import { motion } from "framer-motion";
import { MapPin, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactFormData } from "@/app/contact/page";
import { useEffect, useState } from "react";

interface PersonalSlideProps {
    data: ContactFormData;
    updateData: (data: Partial<ContactFormData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export function PersonalSlide({ data, updateData, onNext, onPrev }: PersonalSlideProps) {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        // Time formatting for UI display only
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCurrentTime(timeString);
    }, []);

    const isValid = data.name.trim().length > 0;

    return (
        <div className="max-w-xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <span className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
                    {currentTime} — Connection Phase
                </span>

                <h2 className="text-4xl md:text-5xl font-bebas text-foreground mt-4 mb-2">
                    Let's Get Acquainted
                </h2>

                <p className="text-muted-foreground font-serif">
                    Please share your name and where you're joining us from.
                </p>
            </motion.div>

            <div className="space-y-8">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Your Name"
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value })}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                    />
                </div>

                <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Your Location (e.g. Kathmandu)"
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
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
