"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

interface AnimatedTextProps {
    text: string;
    className?: string;
    language?: "en" | "ne";
}

function splitGraphemes(value: string, locale: "en" | "ne") {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter(locale === "ne" ? "ne" : "en", { granularity: "grapheme" });
        return Array.from(segmenter.segment(value), (segment) => segment.segment);
    }
    return Array.from(value);
}

export function AnimatedLogoText({ text, className = "", language = "en" }: AnimatedTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef({ x: 0, y: 0 });
    const blobRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const letters = useMemo(() => splitGraphemes(text, language), [text, language]);
    const isNepali = language === "ne";

    useEffect(() => {
        const mountTimer = setTimeout(() => setIsMounted(true), 0);

        if (!containerRef.current) return;

        const container = containerRef.current;
        const letters = container.querySelectorAll(".letter-wrapper");
        const blob = blobRef.current;
        if (!blob) return;

        const magneticRadius = isNepali ? 170 : 220;
        const pullMax = isNepali ? 22 : 34;
        const rotationMax = isNepali ? 10 : 16;
        const scaleBoost = isNepali ? 0.1 : 0.14;

        // Set up 3D space
        gsap.set(container, {
            perspective: 1000,
            transformStyle: "preserve-3d",
        });

        // Initialize Blob Animation
        const xTo = gsap.quickTo(blob, "x", { duration: 0.55, ease: "power3.out" });
        const yTo = gsap.quickTo(blob, "y", { duration: 0.55, ease: "power3.out" });

        const shimmerTl = gsap.timeline({ repeat: -1, yoyo: true });
        shimmerTl.to(container, {
            filter: "drop-shadow(0 10px 18px rgba(183, 28, 28, 0.18))",
            duration: 3.6,
            ease: "sine.inOut",
        });

        // Setup initial ambient animation on the WRAPPERS (outer)
        // This ensures ambient motion is independent of magnetic motion (inner)
        letters.forEach((wrapper, index) => {
            // Set initial visible state BEFORE animation
            gsap.set(wrapper, {
                opacity: 1,
                scale: 1,
            });

            gsap.to(wrapper, {
                y: isNepali ? Math.sin(index) * 1.6 : Math.sin(index) * 2.6,
                rotationZ: isNepali ? 0 : Math.sin(index * 1.3) * 0.7,
                duration: 4.2 + (index % 4) * 0.25,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: index * 0.04,
                force3D: true,
            });

            if (isNepali) {
                gsap.fromTo(
                    wrapper,
                    {
                        opacity: 0,
                        y: 22,
                        scale: 0.96,
                        filter: "blur(6px)",
                    },
                    {
                        duration: 1,
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        delay: index * 0.028,
                        ease: "power3.out",
                        force3D: true,
                    }
                );
            } else {
                gsap.fromTo(
                    wrapper,
                    {
                        opacity: 0,
                        y: 20,
                        scale: 0.9,
                        rotationY: -40,
                        z: -40,
                        filter: "blur(8px)",
                    },
                    {
                        duration: 1.08,
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotationY: 0,
                        z: 0,
                        filter: "blur(0px)",
                        delay: index * 0.03,
                        ease: "power3.out",
                        force3D: true,
                    }
                );
            }
        });

        const updateLetterPositions = () => {
            const rect = container.getBoundingClientRect();

            // Cursor hiding logic
            const isHovering =
                cursorRef.current.x >= rect.left &&
                cursorRef.current.x <= rect.right &&
                cursorRef.current.y >= rect.top &&
                cursorRef.current.y <= rect.bottom;

            if (isHovering) {
                container.style.cursor = "none";
                gsap.to(blob, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.28,
                    ease: "power2.out",
                });
                // Update blob position relative to container
                const relX = cursorRef.current.x - rect.left;
                const relY = cursorRef.current.y - rect.top;
                xTo(relX);
                yTo(relY);
            } else {
                container.style.cursor = "default";
                gsap.to(blob, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.out",
                });
            }

            letters.forEach((wrapper) => {
                const inner = wrapper.querySelector(".letter-inner") as HTMLElement;
                if (!inner) return;

                const wrapperRect = wrapper.getBoundingClientRect();
                const centerX = wrapperRect.left + wrapperRect.width / 2;
                const centerY = wrapperRect.top + wrapperRect.height / 2;

                const deltaX = cursorRef.current.x - centerX;
                const deltaY = cursorRef.current.y - centerY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance < magneticRadius) {
                    const strength = (magneticRadius - distance) / magneticRadius;
                    const smoothStrength = strength * strength * strength;

                    const pullStrength = smoothStrength * pullMax;

                    const angle = Math.atan2(deltaY, deltaX);
                    const pullX = Math.cos(angle) * pullStrength;
                    const pullY = Math.sin(angle) * pullStrength;

                    const rotateY = (deltaX / magneticRadius) * rotationMax * smoothStrength;
                    const rotateX = -(deltaY / magneticRadius) * rotationMax * smoothStrength;
                    const scale = 1 + (smoothStrength * scaleBoost);

                    gsap.to(inner, {
                        x: pullX,
                        y: pullY,
                        rotationY: rotateY,
                        rotationX: rotateX,
                        scale: scale,
                        color: `hsl(0, 80%, ${isNepali ? 28 : 36}%)`,
                        textShadow: `0 0 ${10 + smoothStrength * 16}px rgba(183, 28, 28, ${0.2 + smoothStrength * 0.25})`,
                        duration: 0.18,
                        ease: "power3.out",
                        overwrite: "auto",
                        force3D: true,
                    });
                } else {
                    gsap.to(inner, {
                        x: 0,
                        y: 0,
                        rotationY: 0,
                        rotationX: 0,
                        scale: 1,
                        color: "var(--foreground)",
                        textShadow: "0 0 6px rgba(183, 28, 28, 0.14)",
                        duration: 0.45,
                        ease: "power3.out",
                        overwrite: "auto",
                        force3D: true,
                    });
                }
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            cursorRef.current = { x: e.clientX, y: e.clientY };
            // Simple throttle for RAF
            if (!container.dataset.ticking) {
                container.dataset.ticking = "true";
                requestAnimationFrame(() => {
                    updateLetterPositions();
                    if (container) delete container.dataset.ticking;
                });
            }
        };

        const handleMouseLeave = () => {
            cursorRef.current = { x: -9999, y: -9999 };
            updateLetterPositions();
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        // Cleanup
        return () => {
            clearTimeout(mountTimer);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            gsap.killTweensOf(letters);
            gsap.killTweensOf(container);
            gsap.killTweensOf(blob);
            shimmerTl.kill();
        };
    }, [isNepali]);

    return (
        <div
            ref={containerRef}
            className={`inline-flex justify-center items-center ${className} select-none relative z-20`}
            style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
            }}
        >
            {/* Smooth Blob Follower */}
            <div
                ref={blobRef}
                className="absolute pointer-events-none mix-blend-screen z-0 opacity-0"
                style={{
                    width: isNepali ? "240px" : "300px",
                    height: isNepali ? "240px" : "300px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(183,28,28,0.22) 0%, rgba(183,28,28,0.07) 44%, transparent 72%)",
                    transform: "translate(-50%, -50%) scale(0)",
                    left: 0,
                    top: 0
                }}
            />

            {/* Added Wrapper Structure for independent animations */}
            {letters.map((letter, index) => (
                <span
                    key={index}
                    className="letter-wrapper inline-block will-change-transform backface-hidden relative z-10"
                    style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                        opacity: isMounted ? undefined : 1, // Ensure visible before animation
                        transform: isMounted ? undefined : "scale(1) rotateY(0deg) translateZ(0px)",
                    }}
                >
                    <span
                        className="letter-inner inline-block backface-hidden will-change-transform"
                        style={{
                            transformStyle: "preserve-3d",
                            backfaceVisibility: "hidden",
                            WebkitFontSmoothing: "antialiased",
                            color: "var(--foreground)",
                            transition: "color 0.1s linear",
                            textShadow: "0 0 8px rgba(183, 28, 28, 0.16)",
                            lineHeight: isNepali ? 1.14 : 1,
                        }}
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </span>
                </span>
            ))}
        </div>
    );
}

// ... GsapStaggerText preserved below ...
export function GsapStaggerText({ text, className = "" }: AnimatedTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const words = containerRef.current.querySelectorAll(".word");

        gsap.from(words, {
            duration: 0.8,
            opacity: 0,
            y: 20,
            stagger: 0.12,
            ease: "power2.out",
        });

        return () => {
            gsap.killTweensOf(words);
        };
    }, []);

    const words = text.split(" ");

    return (
        <div ref={containerRef} className={className}>
            {words.map((word, index) => (
                <span key={index} className="word inline-block mr-2">
                    {word}
                </span>
            ))}
        </div>
    );
}
