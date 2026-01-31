"use client";

import { motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormData } from "@/app/contact/page";
import Link from "next/link";
import { useState } from "react";

interface ClosingSlideProps {
    data: ContactFormData;
    updateData: (data: Partial<ContactFormData>) => void;
}

export function ClosingSlide({ data, updateData }: ClosingSlideProps) {
    const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);

    const feelings = [
        "Relieved", "Heard", "Hopeful", "Neutral", "Concerned"
    ];

    const handleSelectFeeling = (feeling: string) => {
        setSelectedFeeling(feeling);
        updateData({ feeling });
    };

    return (
        <div className="max-w-xl mx-auto text-center space-y-10">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500"
            >
                <Check className="w-10 h-10" />
            </motion.div>

            <div>
                <h2 className="text-4xl md:text-5xl font-bebas text-foreground mb-4">
                    Message Archived.
                </h2>
                <p className="text-xl font-serif text-muted-foreground">
                    Thank you, {data.name.split(" ")[0]}. Your voice has been securely recorded in our logs.
                </p>
            </div>

            <div className="py-8 border-t border-b border-border/30">
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-6">
                    How did you feel sharing this today?
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {feelings.map((feeling) => (
                        <button
                            key={feeling}
                            onClick={() => handleSelectFeeling(feeling)}
                            className={`px-6 py-2 rounded-full border transition-all duration-300 ${selectedFeeling === feeling
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:border-primary/50"
                                }`}
                        >
                            {feeling}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <Link href="/">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        Return to Homepage
                    </Button>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-xs text-muted-foreground/40 font-mono pt-12"
            >
                Designed for peace. Built for truth.
            </motion.div>
        </div>
    );
}
