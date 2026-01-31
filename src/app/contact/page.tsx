"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, ArrowLeft } from "lucide-react";

// Slide Components (Placeholder imports for now, will implement next)
import { WelcomeSlide } from "@/components/contact/WelcomeSlide";
import { RulesSlide } from "@/components/contact/RulesSlide";
import { PersonalSlide } from "@/components/contact/PersonalSlide";
import { GreetingSlide } from "@/components/contact/GreetingSlide";
import { MessageSlide } from "@/components/contact/MessageSlide";
import { ContactDetailsSlide } from "@/components/contact/ContactDetailsSlide";
import { ClosingSlide } from "@/components/contact/ClosingSlide";

export type ContactFormData = {
    name: string;
    location: string;
    subject: string;
    message: string;
    file: File | null;
    email: string;
    phone: string;
    feeling: string;
};

const INITIAL_DATA: ContactFormData = {
    name: "",
    location: "",
    subject: "",
    message: "",
    file: null,
    email: "",
    phone: "",
    feeling: "",
};

export default function ContactPage() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<ContactFormData>(INITIAL_DATA);
    const backgroundRef = useRef<HTMLDivElement>(null);

    // GSAP Ambient Background Animation
    useEffect(() => {
        if (!backgroundRef.current) return;

        const particles = Array.from({ length: 20 }).map(() => {
            const el = document.createElement("div");
            el.className = "absolute rounded-full bg-primary/5 blur-xl pointer-events-none";
            backgroundRef.current?.appendChild(el);
            return el;
        });

        particles.forEach((el) => {
            const size = Math.random() * 300 + 50;
            gsap.set(el, {
                width: size,
                height: size,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: Math.random() * 0.3,
            });

            gsap.to(el, {
                x: "random(-200, 200)",
                y: "random(-200, 200)",
                duration: "random(10, 20)",
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });
        });

        return () => {
            // Cleanup if needed, though particles are child elements
        };
    }, []);

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => Math.max(0, prev - 1));

    const updateData = (data: Partial<ContactFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const renderStep = () => {
        switch (step) {
            case 0: return <WelcomeSlide onNext={nextStep} />;
            case 1: return <RulesSlide onNext={nextStep} onPrev={prevStep} />;
            case 2: return <PersonalSlide data={formData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
            case 3: return <GreetingSlide data={formData} onNext={nextStep} />;
            case 4: return <MessageSlide data={formData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
            case 5: return <ContactDetailsSlide data={formData} updateData={updateData} onNext={nextStep} onPrev={prevStep} />;
            case 6: return <ClosingSlide data={formData} updateData={updateData} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden relative flex items-center justify-center">
            {/* Ambient Background */}
            <div ref={backgroundRef} className="absolute inset-0 z-0 overflow-hidden" />

            {/* Content Container */}
            <div className="container mx-auto px-4 relative z-10 max-w-3xl min-h-[600px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Progress Indicator (Optional, keeping it subtle) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${step === i ? "w-8 bg-primary" : "w-2 bg-primary/20"}`}
                    />
                ))}
            </div>
        </div>
    );
}
