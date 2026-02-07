"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
    const cursorOuterRef = useRef<HTMLDivElement>(null);
    const cursorInnerRef = useRef<HTMLDivElement>(null);
    const cursorLabelRef = useRef<HTMLDivElement>(null);
    const cursorTraceRef = useRef<HTMLDivElement>(null);
    const lastPos = useRef({ x: 0, y: 0 });

    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [hoverLabel, setHoverLabel] = useState("");

    useEffect(() => {
        // Only run logic on large screens
        if (window.innerWidth < 1024) return;

        const cursorOuter = cursorOuterRef.current;
        const cursorInner = cursorInnerRef.current;
        const cursorLabel = cursorLabelRef.current;
        const cursorTrace = cursorTraceRef.current;

        if (!cursorOuter || !cursorInner || !cursorLabel || !cursorTrace) return;

        // GSAP quickTo for ultra-smooth cursor movement
        // Separate quickTo for x and y for optimal performance
        const xOuterTo = gsap.quickTo(cursorOuter, "x", { duration: 0.5, ease: "power3" });
        const yOuterTo = gsap.quickTo(cursorOuter, "y", { duration: 0.5, ease: "power3" });
        const xInnerTo = gsap.quickTo(cursorInner, "x", { duration: 0.15, ease: "power3" });
        const yInnerTo = gsap.quickTo(cursorInner, "y", { duration: 0.15, ease: "power3" });
        const xLabelTo = gsap.quickTo(cursorLabel, "x", { duration: 0.2, ease: "power3" });
        const yLabelTo = gsap.quickTo(cursorLabel, "y", { duration: 0.2, ease: "power3" });
        const xTraceTo = gsap.quickTo(cursorTrace, "x", { duration: 0.35, ease: "power3" });
        const yTraceTo = gsap.quickTo(cursorTrace, "y", { duration: 0.35, ease: "power3" });
        const rotateTo = gsap.quickTo(cursorOuter, "rotation", { duration: 0.3, ease: "power2.out" });

        // Set initial visibility
        gsap.set([cursorOuter, cursorInner, cursorLabel, cursorTrace], { xPercent: -50, yPercent: -50 });

        const handleMouseMove = (e: MouseEvent) => {
            // Update cursor positions using quickTo
            const { x: lastX, y: lastY } = lastPos.current;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastPos.current = { x: e.clientX, y: e.clientY };

            const velocity = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 24);

            xOuterTo(e.clientX);
            yOuterTo(e.clientY);
            xInnerTo(e.clientX);
            yInnerTo(e.clientY);
            xLabelTo(e.clientX + 20);
            yLabelTo(e.clientY + 20);
            xTraceTo(e.clientX - 18);
            yTraceTo(e.clientY + 18);
            rotateTo(dx * 0.6);

            gsap.to(cursorOuter, {
                scale: 1 + velocity * 0.2,
                duration: 0.2,
                ease: "power2.out",
            });

            // Check what element we're hovering over
            const target = e.target as HTMLElement;

            // Check for interactive elements
            const isLink = target.tagName === "A" || target.closest("a");
            const isButton =
                target.tagName === "BUTTON" ||
                target.closest("button") ||
                target.getAttribute("role") === "button" ||
                target.classList.contains("cursor-pointer");

            const hovering = !!(isLink || isButton);
            setIsHovering(hovering);

            const label =
                (target.closest("[data-cursor-label]") as HTMLElement | null)?.dataset?.cursorLabel ||
                (isLink ? "Open" : isButton ? "Action" : "");
            setHoverLabel(label);
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

        const scale = isHovering ? 1.25 : isClicking ? 0.92 : 1;

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

        const scale = isHovering ? 0.7 : isClicking ? 1.2 : 1;

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
                className="custom-cursor-element hidden lg:block fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{ willChange: "transform" }}
            >
                <div className="relative w-10 h-10 rotate-45">
                    <div className="absolute inset-0 border border-foreground/60 bg-transparent" />
                    {isHovering && (
                        <>
                            <div className="absolute inset-[-4px] border border-[#B71C1C]/60" />
                            <div className="absolute inset-[6px] border border-[#B71C1C]/60" />
                        </>
                    )}
                </div>
            </div>

            {/* Inner cursor dot - Hidden on mobile/tablet */}
            <div
                ref={cursorInnerRef}
                className="custom-cursor-element hidden lg:block fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{ willChange: "transform" }}
            >
                <div className="w-2 h-2 bg-[#B71C1C]" />
            </div>

            {/* Cursor label */}
            <div
                ref={cursorLabelRef}
                className="custom-cursor-element hidden lg:block fixed top-0 left-0 pointer-events-none z-[9999]"
                style={{ willChange: "transform" }}
            >
                <div className="px-2.5 py-1 border border-border bg-background/95 text-[10px] font-mono uppercase tracking-widest text-foreground transition-opacity duration-200"
                    style={{ opacity: isHovering && hoverLabel ? 1 : 0 }}
                >
                    {hoverLabel || ""}
                </div>
            </div>

            {/* Cursor trace */}
            <div
                ref={cursorTraceRef}
                className="custom-cursor-element hidden lg:block fixed top-0 left-0 pointer-events-none z-[9998]"
                style={{ willChange: "transform" }}
            >
                <div className="h-px w-10 bg-gradient-to-r from-[#B71C1C]/70 to-transparent" style={{ opacity: isHovering ? 0.9 : 0.4 }} />
            </div>
        </>
    );
}
