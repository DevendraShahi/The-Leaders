"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface AnimatedTextProps {
    text: string;
    className?: string;
}

export function AnimatedLogoText({ text, className = "" }: AnimatedTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef({ x: 0, y: 0 });
    const blobRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const mountTimer = setTimeout(() => setIsMounted(true), 0);

        if (!containerRef.current) return;

        const container = containerRef.current;
        const letters = container.querySelectorAll(".letter-wrapper");
        const blob = blobRef.current;

        // Set up 3D space
        gsap.set(container, {
            perspective: 1000,
            transformStyle: "preserve-3d",
        });

        // Initialize Blob Animation
        const xTo = gsap.quickTo(blob, "x", { duration: 0.6, ease: "power3.out" });
        const yTo = gsap.quickTo(blob, "y", { duration: 0.6, ease: "power3.out" });

        // Setup initial ambient animation on the WRAPPERS (outer)
        // This ensures ambient motion is independent of magnetic motion (inner)
        letters.forEach((wrapper, index) => {
            // Set initial visible state BEFORE animation
            gsap.set(wrapper, {
                opacity: 1,
                scale: 1,
            });

            gsap.to(wrapper, {
                y: "random(-4, 4)",
                duration: 3 + (index % 3),
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: index * 0.1,
                force3D: true,
            });

            // Initial reveal animation using fromTo for guaranteed visibility
            gsap.fromTo(wrapper,
                {
                    opacity: 0,
                    scale: 0,
                    rotationY: -180,
                    z: -200,
                },
                {
                    duration: 1.5,
                    opacity: 1,
                    scale: 1,
                    rotationY: 0,
                    z: 0,
                    delay: index * 0.05,
                    ease: "back.out(1.5)",
                    force3D: true,
                }
            );
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
                    duration: 0.3
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
                    duration: 0.3
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
                const magneticRadius = 250;

                if (distance < magneticRadius) {
                    const strength = (magneticRadius - distance) / magneticRadius;
                    const smoothStrength = strength * strength * strength;

                    const pullStrength = smoothStrength * 60;

                    const angle = Math.atan2(deltaY, deltaX);
                    const pullX = Math.cos(angle) * pullStrength;
                    const pullY = Math.sin(angle) * pullStrength;

                    const rotateY = (deltaX / magneticRadius) * 45 * smoothStrength;
                    const rotateX = -(deltaY / magneticRadius) * 45 * smoothStrength;
                    const scale = 1 + (smoothStrength * 0.35);

                    gsap.to(inner, {
                        x: pullX,
                        y: pullY,
                        rotationY: rotateY,
                        rotationX: rotateX,
                        scale: scale,
                        color: `hsl(0, 100%, ${50 + smoothStrength * 50}%)`,
                        textShadow: `0 0 ${20 + smoothStrength * 30}px rgba(183, 28, 28, ${0.4 + smoothStrength * 0.4})`,
                        duration: 0.1,
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
                        textShadow: "0 0 10px rgba(183, 28, 28, 0.3)",
                        duration: 0.6,
                        ease: "elastic.out(1, 0.6)",
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

        window.addEventListener("mousemove", handleMouseMove);

        // Cleanup
        return () => {
            clearTimeout(mountTimer);
            window.removeEventListener("mousemove", handleMouseMove);
            gsap.killTweensOf(letters);
            gsap.killTweensOf(container);
            gsap.killTweensOf(blob);
        };
    }, []);

    const letters = text.split("");

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
                    width: "300px",
                    height: "300px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(183,28,28,0.4) 0%, rgba(183,28,28,0.1) 40%, transparent 70%)",
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
                            textShadow: "0 0 10px rgba(183, 28, 28, 0.3)",
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
