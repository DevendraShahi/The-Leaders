"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
    const cursorOuterRef = useRef<HTMLDivElement>(null);
    const cursorInnerRef = useRef<HTMLDivElement>(null);

    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        // Only run logic on large screens
        if (window.innerWidth < 1024) return;

        const cursorOuter = cursorOuterRef.current;
        const cursorInner = cursorInnerRef.current;

        if (!cursorOuter || !cursorInner) return;

        // GSAP quickTo for ultra-smooth cursor movement
        // Separate quickTo for x and y for optimal performance
        const xOuterTo = gsap.quickTo(cursorOuter, "x", { duration: 0.5, ease: "power3" });
        const yOuterTo = gsap.quickTo(cursorOuter, "y", { duration: 0.5, ease: "power3" });
        const xInnerTo = gsap.quickTo(cursorInner, "x", { duration: 0.15, ease: "power3" });
        const yInnerTo = gsap.quickTo(cursorInner, "y", { duration: 0.15, ease: "power3" });

        // Set initial visibility
        gsap.set([cursorOuter, cursorInner], { xPercent: -50, yPercent: -50 });

        const handleMouseMove = (e: MouseEvent) => {
            // Update cursor positions using quickTo
            xOuterTo(e.clientX);
            yOuterTo(e.clientY);
            xInnerTo(e.clientX);
            yInnerTo(e.clientY);

            // Check what element we're hovering over
            const target = e.target as HTMLElement;

            // Check for interactive elements
            const isLink = target.tagName === "A" || target.closest("a");
            const isButton =
                target.tagName === "BUTTON" ||
                target.closest("button") ||
                target.getAttribute("role") === "button" ||
                target.classList.contains("cursor-pointer");

            setIsHovering(!!(isLink || isButton));
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        // Add event listeners
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        // Cleanup
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    // Hide default cursor with aggressive CSS only on large screens
    useEffect(() => {
        // Only inject styles on large screens
        if (window.innerWidth < 1024) return;

        const style = document.createElement('style');
        style.id = 'custom-cursor-style';
        style.innerHTML = `
            @media (min-width: 1024px) {
                body:not(.is-loading),
                body:not(.is-loading) *,
                html:not(.is-loading),
                html:not(.is-loading) * {
                    cursor: none !important;
                }
                
                body.is-loading,
                body.is-loading * {
                    cursor: auto !important;
                }

                /* Hide custom cursor when loading */
                body.is-loading .custom-cursor-element {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);

        // Only set direct style if not loading (though class check handles it better)
        if (!document.body.classList.contains('is-loading')) {
            document.documentElement.style.cursor = 'none';
            document.body.style.cursor = 'none';
        }

        return () => {
            const existingStyle = document.getElementById('custom-cursor-style');
            if (existingStyle) {
                document.head.removeChild(existingStyle);
            }
            document.documentElement.style.cursor = '';
            document.body.style.cursor = '';
        };
    }, []);

    // Animate cursor size changes
    useEffect(() => {
        // Only run animations on large screens
        if (typeof window !== 'undefined' && window.innerWidth < 1024) return;

        const cursorOuter = cursorOuterRef.current;
        if (!cursorOuter) return;

        const scale = isHovering ? 1.5 : isClicking ? 0.8 : 1;

        gsap.to(cursorOuter, {
            scale,
            duration: 0.3,
            ease: "power2.out"
        });
    }, [isHovering, isClicking]);

    // Animate inner dot
    useEffect(() => {
        // Only run animations on large screens
        if (typeof window !== 'undefined' && window.innerWidth < 1024) return;

        const cursorInner = cursorInnerRef.current;
        if (!cursorInner) return;

        const scale = isHovering ? 0 : isClicking ? 2 : 1;

        gsap.to(cursorInner, {
            scale,
            duration: 0.3,
            ease: "power2.out"
        });
    }, [isHovering, isClicking]);

    return (
        <>
            {/* Outer cursor ring - Hidden on mobile/tablet */}
            <div
                ref={cursorOuterRef}
                className="custom-cursor-element hidden lg:block fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
                style={{ willChange: "transform" }}
            >
                <div className="relative w-10 h-10">
                    {/* Main ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-white opacity-80" />

                    {/* Gradient glow on hover */}
                    {isHovering && (
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: "radial-gradient(circle, rgba(183, 28, 28, 0.4) 0%, rgba(183, 28, 28, 0.1) 50%, transparent 100%)",
                                filter: "blur(10px)",
                            }}
                        />
                    )}

                    {/* Pulsing ring for interactive elements */}
                    {isHovering && (
                        <div
                            className="absolute inset-0 rounded-full border-2 border-[#B71C1C] animate-ping"
                            style={{ animationDuration: "1.5s" }}
                        />
                    )}
                </div>
            </div>

            {/* Inner cursor dot - Hidden on mobile/tablet */}
            <div
                ref={cursorInnerRef}
                className="custom-cursor-element hidden lg:block fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{ willChange: "transform" }}
            >
                <div className="w-2 h-2 rounded-full bg-[#B71C1C]" />
            </div>
        </>
    );
}
