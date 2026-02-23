"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HomeScrollEffectsProps {
    children: ReactNode;
}

export function HomeScrollEffects({ children }: HomeScrollEffectsProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const glowRef = useRef<HTMLDivElement | null>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        let removeGlowHandlers: (() => void) | null = null;

        const ctx = gsap.context(() => {
            const sections = Array.from(root.children).filter((node) => node instanceof HTMLElement) as HTMLElement[];

            sections.forEach((section, index) => {
                const id = section.id || `home-section-${index + 1}`;
                section.id = id;
            });

            if (shouldReduceMotion) {
                gsap.set(sections, { clearProps: "all" });
                const progressNode = progressRef.current;
                if (progressNode) gsap.set(progressNode, { scaleX: 1 });
                return;
            }

            const progressNode = progressRef.current;
            if (progressNode) {
                const setProgress = gsap.quickTo(progressNode, "scaleX", {
                    duration: 0.22,
                    ease: "power1.out",
                });

                gsap.set(progressNode, { transformOrigin: "left center", scaleX: 0 });
                ScrollTrigger.create({
                    trigger: root,
                    start: "top top",
                    end: "bottom bottom",
                    onUpdate: (self) => setProgress(self.progress),
                });
            }

            const glowNode = glowRef.current;
            if (glowNode) {
                gsap.set(glowNode, { opacity: 0, x: -160, y: -160 });
                const setGlowX = gsap.quickTo(glowNode, "x", { duration: 0.75, ease: "power3.out" });
                const setGlowY = gsap.quickTo(glowNode, "y", { duration: 0.75, ease: "power3.out" });
                const setGlowOpacity = gsap.quickTo(glowNode, "opacity", { duration: 0.3, ease: "power2.out" });

                const onPointerMove = (event: MouseEvent) => {
                    setGlowX(event.clientX - 90);
                    setGlowY(event.clientY - 90);
                    setGlowOpacity(0.55);
                };
                const onPointerLeave = (): void => {
                    setGlowOpacity(0);
                };

                window.addEventListener("mousemove", onPointerMove, { passive: true });
                window.addEventListener("mouseleave", onPointerLeave);

                ScrollTrigger.addEventListener("refreshInit", onPointerLeave);
                ScrollTrigger.addEventListener("scrollEnd", onPointerLeave);

                removeGlowHandlers = () => {
                    window.removeEventListener("mousemove", onPointerMove);
                    window.removeEventListener("mouseleave", onPointerLeave);
                    ScrollTrigger.removeEventListener("refreshInit", onPointerLeave);
                    ScrollTrigger.removeEventListener("scrollEnd", onPointerLeave);
                };
            }

            sections.forEach((section, index) => {
                gsap.fromTo(
                    section,
                    { autoAlpha: 0, y: 32, scale: 0.996 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.86,
                        ease: "power2.out",
                        overwrite: "auto",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 88%",
                            end: "top 45%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );

                const innerSection = section.querySelector<HTMLElement>("section");
                if (innerSection) {
                    const startOffset = index % 2 === 0 ? -10 : 10;
                    const endOffset = -startOffset * 0.4;

                    gsap.fromTo(
                        innerSection,
                        { y: startOffset },
                        {
                            y: endOffset,
                            ease: "none",
                            overwrite: "auto",
                            scrollTrigger: {
                                trigger: section,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 1.35,
                            },
                        }
                    );
                }

                const heading = section.querySelector<HTMLElement>("h1, h2");
                if (heading) {
                    gsap.fromTo(
                        heading,
                        { autoAlpha: 0, y: 16 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.62,
                            ease: "power2.out",
                            overwrite: "auto",
                            scrollTrigger: {
                                trigger: heading,
                                start: "top 90%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                }
            });

            const kickers = gsap.utils.toArray<HTMLElement>(".home-kicker", root);
            kickers.forEach((kicker) => {
                gsap.fromTo(
                    kicker,
                    { autoAlpha: 0, x: -10 },
                    {
                        autoAlpha: 1,
                        x: 0,
                        duration: 0.52,
                        ease: "power2.out",
                        overwrite: "auto",
                        scrollTrigger: {
                            trigger: kicker,
                            start: "top 93%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            });
        }, root);

        ScrollTrigger.refresh(true);
        return () => {
            removeGlowHandlers?.();
            ctx.revert();
        };
    }, [shouldReduceMotion]);

    return (
        <div className="homepage-shell election-typography relative min-h-screen bg-background">
            <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px] bg-border/55">
                <div ref={progressRef} className="h-full w-full bg-primary/90" />
            </div>

            {!shouldReduceMotion ? (
                <div
                    ref={glowRef}
                    className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-[180px] w-[180px] rounded-full bg-primary/12 blur-[54px] lg:block"
                    aria-hidden
                />
            ) : null}

            <div ref={rootRef} className="flex min-h-screen min-w-0 flex-1 flex-col">
                {children}
            </div>
        </div>
    );
}
