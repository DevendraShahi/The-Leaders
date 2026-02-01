"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormData } from "@/app/contact/page";

interface GreetingSlideProps {
    data: ContactFormData;
    onNext: () => void;
}

export function GreetingSlide({ data, onNext }: GreetingSlideProps) {
    const nameRef = useRef<HTMLDivElement>(null);
    const locationRef = useRef<HTMLParagraphElement>(null);
    const timeRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good Morning";
            if (hour < 18) return "Good Afternoon";
            return "Good Evening";
        };

        const firstName = data.name.split(" ")[0];
        const greeting = getGreeting();

        // Animate the greeting text first
        if (timeRef.current) {
            const chars = timeRef.current.textContent?.split("") || [];
            timeRef.current.innerHTML = chars.map(char =>
                `<span class="inline-block opacity-0">${char === " " ? "&nbsp;" : char}</span>`
            ).join("");

            gsap.fromTo(
                timeRef.current.querySelectorAll("span"),
                { opacity: 0, y: 30, rotationX: -90 },
                {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.6,
                    stagger: 0.03,
                    ease: "back.out(1.5)",
                    delay: 0.3
                }
            );
        }

        // Animate the user's name with special effects
        if (nameRef.current) {
            const chars = firstName.split("");
            nameRef.current.innerHTML = chars.map((char, i) =>
                `<span class="inline-block char-${i}" style="display:inline-block;">${char}</span>`
            ).join("");

            const charElements = nameRef.current.querySelectorAll("span");

            // Initial dramatic entrance
            gsap.fromTo(
                charElements,
                {
                    opacity: 0,
                    scale: 0,
                    y: 100,
                    rotationY: 180,
                    filter: "blur(20px)"
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotationY: 0,
                    filter: "blur(0px)",
                    duration: 1,
                    stagger: {
                        each: 0.08,
                        from: "center"
                    },
                    ease: "elastic.out(1, 0.6)",
                    delay: 0.8
                }
            );

            // Continuous subtle floating per character
            charElements.forEach((char, i) => {
                gsap.to(char, {
                    y: "random(-8, 8)",
                    duration: "random(2, 3)",
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: i * 0.1
                });

                // Subtle color pulse
                gsap.to(char, {
                    color: "hsl(0, 100%, 65%)",
                    duration: "random(1.5, 2.5)",
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: i * 0.15
                });
            });
        }

        // Animate location text
        if (locationRef.current && data.location) {
            gsap.fromTo(
                locationRef.current,
                { opacity: 0, y: 20, filter: "blur(10px)" },
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 1,
                    ease: "power2.out",
                    delay: 1.8
                }
            );
        }

        // Cleanup
        return () => {
            gsap.killTweensOf([nameRef.current, timeRef.current, locationRef.current]);
        };
    }, [data.name, data.location]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="max-w-2xl mx-auto text-center min-h-[60vh] flex flex-col justify-center">
            {/* Greeting Message */}
            <motion.p
                ref={timeRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg md:text-xl font-serif text-muted-foreground mb-6"
                style={{ perspective: "1000px" }}
            >
                {getGreeting()},
            </motion.p>

            {/* User's Name - The Star of the Show */}
            <div
                ref={nameRef}
                className="text-6xl md:text-8xl font-bebas text-foreground mb-8 uppercase tracking-wider leading-none"
                style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d"
                }}
            >
                {data.name.split(" ")[0]}
            </div>

            {/* Location */}
            {data.location && (
                <p
                    ref={locationRef}
                    className="text-xl md:text-2xl font-serif text-muted-foreground italic opacity-0 mb-12"
                >
                    We hope {data.location} is treating you well today.
                </p>
            )}

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                className="text-base text-muted-foreground/70 font-sans mb-16 max-w-lg mx-auto"
            >
                Thank you for being here. Your voice matters to us, and we're ready to listen.
            </motion.p>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.6 }}
            >
                <Button
                    onClick={onNext}
                    size="lg"
                    className="group"
                >
                    Let's Continue
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </motion.div>
        </div>
    );
}
