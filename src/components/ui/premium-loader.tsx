"use client";

import { useRef, useState, useEffect } from "react";
import { setCookieConsent } from "@/app/actions/cookie-consent";
import gsap from "gsap";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const STATUS_SEQUENCE = [
    "Initializing Platform",
    "Loading Resources",
    "Preparing Experience",
    "Almost Ready",
];

interface PremiumLoaderProps {
    onComplete?: () => void;
}

export function PremiumLoader({ onComplete }: PremiumLoaderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const linesRef = useRef<HTMLDivElement>(null);
    const [statusText, setStatusText] = useState(STATUS_SEQUENCE[0]);
    const [progress, setProgress] = useState(0);
    const [showConsent, setShowConsent] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);

    useEffect(() => {
        // Check if user has already given consent
        const hasConsented = localStorage.getItem("cookie-consent");
        if (!hasConsented) {
            // Delay state update to avoid cascading render warning
            setTimeout(() => setShowConsent(true), 0);
        }
    }, []);

    const handleConsent = (accepted: boolean) => {
        localStorage.setItem("cookie-consent", accepted ? "accepted" : "declined");
        setCookieConsent(accepted ? "accepted" : "declined");
        setShowConsent(false);
        setShowPolicy(false);

        // Complete the loading animation
        setStatusText("Finalizing");

        // Animate progress to 100%
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Call onComplete after animation finishes
                    if (onComplete) {
                        setTimeout(onComplete, 300);
                    }
                    return 100;
                }
                return prev + 5;
            });
        }, 30);
    };

    useEffect(() => {
        if (!containerRef.current || !logoRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Logo entrance - fade in and subtle scale
            tl.fromTo(
                logoRef.current,
                {
                    opacity: 0,
                    scale: 0.95,
                    y: 20,
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out",
                }
            );

            // Breathing effect on logo
            tl.to(logoRef.current, {
                scale: 1.02,
                duration: 2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            // Glow pulse
            tl.to(
                glowRef.current,
                {
                    opacity: 0.4,
                    scale: 1.2,
                    duration: 2,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                },
                "<"
            );

            // Ambient lines animation
            const lines = linesRef.current?.querySelectorAll(".line");
            if (lines) {
                lines.forEach((line, index) => {
                    gsap.to(line, {
                        scaleX: 1,
                        duration: 1.5,
                        ease: "power2.inOut",
                        repeat: -1,
                        yoyo: true,
                        delay: index * 0.15,
                    });
                });
            }
        }, containerRef);

        // Status text progression - only if consent is not needed
        let statusInterval: NodeJS.Timeout | null = null;
        let progressInterval: NodeJS.Timeout | null = null;

        if (!showConsent) {
            let currentIndex = 0;
            statusInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % STATUS_SEQUENCE.length;
                setStatusText(STATUS_SEQUENCE[currentIndex]);
            }, 250); // Speed up text cycle (was 400ms)

            // Progress bar animation
            progressInterval = setInterval(() => {
                setProgress((prev) => {
                    // If we need consent, stop at 90%
                    if (showConsent && prev >= 90) {
                        return 90;
                    }

                    if (prev >= 100) {
                        if (progressInterval) clearInterval(progressInterval);
                        if (!showConsent && onComplete) {
                            setTimeout(onComplete, 200); // Reduce completion delay (was 500ms)
                        }
                        return 100;
                    }
                    return prev + 4; // Double speed (was +2)
                });
            }, 20); // Faster tick (was 30ms)
        } else {
            // If consent is needed, pause at "Waiting for your consent"
            setStatusText("Waiting for your consent");
        }

        return () => {
            ctx.revert();
            if (statusInterval) clearInterval(statusInterval);
            if (progressInterval) clearInterval(progressInterval);
        };
    }, [showConsent]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-background/95 backdrop-blur-md py-8 md:py-12"
        >
            {/* Ambient animated lines */}
            <div ref={linesRef} className="absolute inset-0 overflow-hidden opacity-10">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="line absolute h-px bg-gradient-to-r from-transparent via-primary to-transparent origin-left"
                        style={{
                            top: `${20 + i * 15}%`,
                            width: "100%",
                            transform: "scaleX(0)",
                        }}
                    />
                ))}
            </div>

            {/* Top spacer */}
            <div className="flex-1" />

            {/* Main loader container */}
            <div className={`relative flex flex-col items-center gap-16 max-w-2xl px-4 z-10 transition-opacity duration-500 ${showPolicy ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
                {/* Glow effect behind logo */}
                <div
                    ref={glowRef}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 blur-3xl opacity-0"
                    style={{
                        background: "radial-gradient(circle, rgba(170, 0, 0, 0.3) 0%, transparent 70%)",
                    }}
                />

                {/* Logo Section */}
                <div
                    ref={logoRef}
                    className="relative z-10 flex flex-col items-center"
                >
                    <div className="relative w-72 h-36 md:w-96 md:h-48">
                        <Image
                            src="/logo.svg"
                            alt="The Leaders"
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                {/* Status Section */}
                <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                    <p className="text-sm font-medium text-muted-foreground tracking-[0.2em] uppercase h-6">
                        {statusText}
                    </p>

                    <div className="w-64 md:w-80 h-1 bg-border/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 transition-all duration-300 ease-out shadow-lg shadow-primary/20"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex gap-2 mt-2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-primary/40"
                                style={{
                                    animation: `loader-pulse 1.5s ease-in-out infinite ${i * 0.15}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Version info - Moved up closer to status */}
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground/50 mt-4">
                    <div className="flex items-center gap-4">
                        <span className="font-mono tracking-wider">v1.0.0</span>
                        <span className="w-px h-4 bg-border/50" />
                        <span className="tracking-wide">© 2026 The Leaders</span>
                    </div>
                    <p className="text-[11px] tracking-[0.15em] uppercase opacity-60">
                        Political Insights • Democratic Legacy
                    </p>
                </div>
            </div>

            {/* Bottom spacer */}
            <div className="flex-1" />

            {/* Policy Modal Overlay */}
            {showPolicy && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 space-y-4">
                            <h3 className="font-bebas text-2xl text-foreground tracking-wide border-b border-border pb-2">
                                Cookie Policy
                            </h3>
                            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                                <p>
                                    At <span className="text-foreground font-medium">The Leaders</span>, we prioritize your privacy.
                                </p>
                                <ul className="space-y-2 list-disc pl-4 marker:text-primary">
                                    <li>
                                        <span className="text-foreground font-medium">Essential Cookies:</span> Required for the site to function securely.
                                    </li>
                                    <li>
                                        <span className="text-foreground font-medium">Analytics:</span> Help us understand how you use our platform to improve content.
                                    </li>
                                    <li>
                                        <span className="text-foreground font-medium">Experience:</span> Save your preferences for a personalized journey.
                                    </li>
                                </ul>
                                <p className="text-xs opacity-70 mt-4">
                                    We do not sell your personal data. Your browsing integrity is our commitment.
                                </p>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPolicy(false)}
                                    className="min-w-[100px]"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                    </div>
                </div>
            )}

            {/* Cookie Consent - Integrated at bottom */}
            {showConsent && !showPolicy && (
                <div className="relative z-10 w-full max-w-3xl px-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-2xl overflow-hidden">
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {/* Text section */}
                                <div className="flex-1 space-y-2">
                                    <h3 className="font-bebas text-xl md:text-2xl text-foreground tracking-wide">
                                        Your Privacy Matters
                                    </h3>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                                        We use cookies to enhance your experience. By continuing, you accept our{" "}
                                        <button
                                            onClick={() => setShowPolicy(true)}
                                            className="text-primary hover:underline font-medium focus:outline-none"
                                        >
                                            cookie policy
                                        </button>
                                        .
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-row gap-3 md:flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleConsent(false)}
                                        className="flex-1 md:flex-none min-w-[100px] h-10 text-sm"
                                    >
                                        Decline
                                    </Button>
                                    <Button
                                        onClick={() => handleConsent(true)}
                                        className="flex-1 md:flex-none min-w-[100px] h-10 text-sm bg-primary hover:bg-primary/90"
                                    >
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                    </div>
                </div>
            )}
        </div>
    );
}
