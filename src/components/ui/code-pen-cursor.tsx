"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CodePenCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !cursorRef.current) return;
        if (!gsap) return;
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const cursor = cursorRef.current;
        setEnabled(true);
        document.body.classList.add("has-custom-cursor");

        // Physics state
        const mouse = { x: -100, y: -100 }; // Start off-screen
        const pos = { x: -100, y: -100 };
        const speed = 0.35; // Faster tracking for click accuracy

        // Rotation state
        let angle = 0;
        let previousAngle = 0;
        let angleDisplace = 0;
        const degrees = 57.296;

        // Interactive state
        let isHovering = false;
        let isClicking = false;
        let hasMoved = false;

        // Initial Styles
        gsap.set(cursor, {
            xPercent: -50,
            yPercent: -50,
            x: -100,
            y: -100,
            scale: 1,
            opacity: 1,
            display: "block" // Ensure it's not hidden
        });

        // Rotation Logic (Ported from CodePen)
        const updateRotation = (dx: number, dy: number) => {
            // CodePen expected "distanceX = prev - curr" (Drag direction).
            // We calculated dx as "curr - prev" (Velocity).
            // So we feed -dx, -dy to match the "distance" logic of CodePen.
            const distanceX = -dx;
            const distanceY = -dy;

            const unsortedAngle = Math.atan(Math.abs(distanceY) / Math.abs(distanceX)) * degrees;
            previousAngle = angle;

            if (distanceX <= 0 && distanceY >= 0) {
                angle = 90 - unsortedAngle + 0;
            } else if (distanceX < 0 && distanceY < 0) {
                angle = unsortedAngle + 90;
            } else if (distanceX >= 0 && distanceY <= 0) {
                angle = 90 - unsortedAngle + 180;
            } else if (distanceX > 0 && distanceY > 0) {
                angle = unsortedAngle + 270;
            }

            if (isNaN(angle)) {
                angle = previousAngle;
            } else {
                if (angle - previousAngle <= -270) {
                    angleDisplace += 360 + angle - previousAngle;
                } else if (angle - previousAngle >= 270) {
                    angleDisplace += angle - previousAngle - 360;
                } else {
                    angleDisplace += angle - previousAngle;
                }
            }
        };

        const setHoverState = (target: Element | null) => {
            const interactive = target instanceof Element
                ? target.closest('a, button, input, textarea, select, label, [role="button"], [role="link"], [data-cursor="interactive"]')
                : null;

            if (interactive && !isHovering) {
                isHovering = true;
                gsap.to(cursor, { scale: 1.35, duration: 0.16, ease: "power2.out" });
            } else if (!interactive && isHovering) {
                isHovering = false;
                gsap.to(cursor, { scale: isClicking ? 0.85 : 1, duration: 0.16, ease: "power2.out" });
            }
        };

        const onPointerMove = (e: PointerEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            hasMoved = true;
            const target = document.elementFromPoint(e.clientX, e.clientY);
            setHoverState(target);
        };

        const onPointerLeave = () => {
            hasMoved = false;
            gsap.to(cursor, { opacity: 0, duration: 0.12, ease: "power2.out" });
        };

        const onPointerEnter = () => {
            if (!hasMoved) {
                mouse.x = pos.x;
                mouse.y = pos.y;
            }
            gsap.to(cursor, { opacity: 1, duration: 0.12, ease: "power2.out" });
        };

        const onPointerDown = () => {
            isClicking = true;
            gsap.to(cursor, { scale: 0.85, duration: 0.08, ease: "power2.out" });
        };

        const onPointerUp = () => {
            isClicking = false;
            gsap.to(cursor, { scale: isHovering ? 1.35 : 1, duration: 0.16, ease: "power2.out" });
        };

        // Animation Loop
        const loop = () => {
            // Lerp Position
            const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
            const dx = (mouse.x - pos.x) * dt;
            const dy = (mouse.y - pos.y) * dt;

            pos.x += dx;
            pos.y += dy;

            // Calculate Rotation only if significant movement
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0.5) {
                updateRotation(dx, dy);
            }

            // Apply Transforms
            // Use GSAP 'set' to handle matrix composition with active tweens (scale)
            gsap.set(cursor, {
                x: pos.x,
                y: pos.y,
                rotation: angleDisplace
            });
        };

        gsap.ticker.add(loop);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("pointerdown", onPointerDown, { passive: true });
        window.addEventListener("pointerup", onPointerUp, { passive: true });
        window.addEventListener("mouseleave", onPointerLeave);
        window.addEventListener("mouseenter", onPointerEnter);

        return () => {
            gsap.ticker.remove(loop);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("mouseleave", onPointerLeave);
            window.removeEventListener("mouseenter", onPointerEnter);
            document.body.classList.remove("has-custom-cursor");
            setEnabled(false);
        };
    }, []);

    // Ensure initial render is visible block
    if (!enabled) return null;

    return (
        <div
            ref={cursorRef}
            className="curzr-arrow-pointer"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '20px',
                height: '20px',
                zIndex: 2147483647,
                pointerEvents: 'none',
                userSelect: 'none',
                // Keep style simple, GSAP handles transforms
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                <path
                    className="inner"
                    d="M25,30a5.82,5.82,0,0,1-1.09-.17l-.2-.07-7.36-3.48a.72.72,0,0,0-.35-.08.78.78,0,0,0-.33.07L8.24,29.54a.66.66,0,0,1-.2.06,5.17,5.17,0,0,1-1,.15,3.6,3.6,0,0,1-3.29-5L12.68,4.2a3.59,3.59,0,0,1,6.58,0l9,20.74A3.6,3.6,0,0,1,25,30Z"
                    fill="#F2F5F8"
                />
                <path
                    className="outer"
                    d="M16,3A2.59,2.59,0,0,1,18.34,4.6l9,20.74A2.59,2.59,0,0,1,25,29a5.42,5.42,0,0,1-.86-.15l-7.37-3.48a1.84,1.84,0,0,0-.77-.17,1.69,1.69,0,0,0-.73.16l-7.4,3.31a5.89,5.89,0,0,1-.79.12,2.59,2.59,0,0,1-2.37-3.62L13.6,4.6A2.58,2.58,0,0,1,16,3m0-2h0A4.58,4.58,0,0,0,11.76,3.8L2.84,24.33A4.58,4.58,0,0,0,7,30.75a6.08,6.08,0,0,0,1.21-.17,1.87,1.87,0,0,0,.4-.13L16,27.18l7.29,3.44a1.64,1.64,0,0,0,.39.14A6.37,6.37,0,0,0,25,31a4.59,4.59,0,0,0,4.21-6.41l-9-20.75A4.62,4.62,0,0,0,16,1Z"
                    fill="#111920"
                />
            </svg>
        </div>
    );
}
