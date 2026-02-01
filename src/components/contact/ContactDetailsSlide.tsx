"use client";

import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactFormData } from "@/app/contact/page";

interface ContactDetailsSlideProps {
    data: ContactFormData;
    updateData: (data: Partial<ContactFormData>) => void;
    onNext: () => void;
    onPrev: () => void;
}

export function ContactDetailsSlide({ data, updateData, onNext, onPrev }: ContactDetailsSlideProps) {
    const isValid = data.email.includes("@");

    return (
        <div className="max-w-xl mx-auto text-center">
            <div className="mb-12">
                <h2 className="text-3xl font-bebas text-foreground tracking-wide mb-2">
                    How Should We Reach You?
                </h2>
                <p className="text-muted-foreground font-serif">
                    We may need to follow up for clarifications or simply to say thank you.
                </p>
            </div>

            <div className="space-y-8">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="email"
                        placeholder="Email Address (Required)"
                        value={data.email}
                        onChange={(e) => updateData({ email: e.target.value })}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                    />
                </div>

                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="tel"
                        placeholder="Phone/WhatsApp (Optional)"
                        value={data.phone}
                        onChange={(e) => updateData({ phone: e.target.value })}
                        className="pl-12 h-14 bg-background/50 border-border/50 focus:border-primary text-lg"
                    />
                </div>
            </div>

            <div className="pt-16 flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={onPrev}
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                >
                    Submit Feedback
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
