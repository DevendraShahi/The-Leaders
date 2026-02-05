"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormData } from "@/app/contact/page";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface ClosingSlideProps {
    data: ContactFormData;
    updateData: (data: Partial<ContactFormData>) => void;
    onFeelingSelected?: (feeling: string) => void;
}

export function ClosingSlide({ data, updateData, onFeelingSelected }: ClosingSlideProps) {
    const router = useRouter();
    const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    const feelings = [
        "Relieved", "Heard", "Hopeful", "Neutral", "Concerned"
    ];

    const feelingResponses: Record<string, string> = {
        "Relieved": "We are glad we could help unburden you.",
        "Heard": "We hear you. And we are listening.",
        "Hopeful": "Hope is the fuel of democracy.",
        "Neutral": "Thank you for your candidness.",
        "Concerned": "Your concerns are valid and have been noted."
    };

    const handleSelectFeeling = (feeling: string) => {
        setSelectedFeeling(feeling);
        updateData({ feeling });

        if (onFeelingSelected) {
            onFeelingSelected(feeling);
        }

        setResponseMessage(feelingResponses[feeling]);

        // Redirect to About Us after delay
        setTimeout(() => {
            router.push("/about");
        }, 2000);
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

            <div className="py-8 border-t border-b border-border/30 h-[180px] flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                    {!responseMessage ? (
                        <motion.div
                            key="buttons"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-6">
                                How did you feel sharing this today?
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {feelings.map((feeling) => (
                                    <button
                                        key={feeling}
                                        onClick={() => handleSelectFeeling(feeling)}
                                        className={`px-6 py-2 rounded-full border transition-all duration-300 hover:scale-105 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground`}
                                    >
                                        {feeling}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="response"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <p className="text-2xl font-serif italic text-primary">
                                "{responseMessage}"
                            </p>
                            <p className="text-xs text-muted-foreground animate-pulse">
                                Redirecting to About Us...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="pt-4">
                <Link href="/">
                    <Button variant="ghost">
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
