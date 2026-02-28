"use client";

import { type ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import {
    ArrowRight,
    BookOpenText,
    Radio,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { trackHomeEvent } from "@/lib/home-analytics";

type PillarId = "memory" | "integrity" | "future";

type Localized = {
    en: string;
    ne: string;
};

interface Pillar {
    id: PillarId;
    icon: ComponentType<{ className?: string }>;
    label: Localized;
    title: Localized;
    detail: Localized;
}

const PILLAR_ANCHORS: Record<PillarId, { x: string; y: string }> = {
    memory: { x: "50%", y: "12%" },
    integrity: { x: "17%", y: "68%" },
    future: { x: "83%", y: "68%" },
};

export function Manifesto() {
    const { language } = useLanguage();
    const l = LOCALES.home.manifesto;
    const shouldReduceMotion = useReducedMotion();
    const isNepali = language === "ne";
    const [activePillar, setActivePillar] = useState<PillarId>("memory");

    const stageRef = useRef<HTMLDivElement | null>(null);
    const glowRef = useRef<HTMLDivElement | null>(null);
    const ringOuterRef = useRef<HTMLDivElement | null>(null);
    const ringInnerRef = useRef<HTMLDivElement | null>(null);
    const glyphRingRef = useRef<HTMLDivElement | null>(null);
    const starLayerRef = useRef<HTMLDivElement | null>(null);

    const logoSrc = language === "ne" ? "/media/logo-Rbg-ne.png" : "/media/logo-Rbg.png";

    const pillars = useMemo<Pillar[]>(
        () => [
            {
                id: "memory",
                icon: BookOpenText,
                label: { en: "Memory", ne: "स्मृति" },
                title: {
                    en: "Political memory must stay public.",
                    ne: "राजनीतिक स्मृति सार्वजनिक हुनैपर्छ।",
                },
                detail: {
                    en: "We preserve records so citizens can compare promises with outcomes, year after year.",
                    ne: "नागरिकले वाचा र परिणाम तुलना गर्न सकून् भनेर हामी अभिलेख सुरक्षित राख्छौं।",
                },
            },
            {
                id: "integrity",
                icon: ShieldCheck,
                label: { en: "Integrity", ne: "विश्वसनीयता" },
                title: {
                    en: "Verification before amplification.",
                    ne: "प्रसारणभन्दा अघि प्रमाणीकरण।",
                },
                detail: {
                    en: "Signal is built on evidence, references, and transparent sourcing instead of noise.",
                    ne: "शोर होइन, प्रमाण, सन्दर्भ र पारदर्शी स्रोतका आधारमा सिग्नल बनाइन्छ।",
                },
            },
            {
                id: "future",
                icon: Sparkles,
                label: { en: "Future", ne: "भविष्य" },
                title: {
                    en: "Future citizens are today’s priority.",
                    ne: "भविष्यका नागरिक आजकै प्राथमिकता हुन्।",
                },
                detail: {
                    en: "Policy and election commitments should always be evaluated through long-term public impact.",
                    ne: "नीति र चुनावी प्रतिबद्धताहरूलाई दीर्घकालीन सार्वजनिक प्रभावबाटै मूल्याङ्कन गरिनुपर्छ।",
                },
            },
        ],
        []
    );

    const active = pillars.find((pillar) => pillar.id === activePillar) ?? pillars[0];
    const starSeeds = useMemo(
        () =>
            Array.from({ length: 26 }, (_, index) => {
                const angle = (index * 137.5 * Math.PI) / 180;
                const ring = 24 + (index % 6) * 8;
                return {
                    id: index,
                    x: 50 + Math.cos(angle) * ring,
                    y: 50 + Math.sin(angle) * ring * 0.74,
                    size: index % 5 === 0 ? 3 : index % 2 === 0 ? 2 : 1.5,
                };
            }),
        []
    );

    const handleSelectPillar = (pillarId: PillarId) => {
        setActivePillar(pillarId);
        trackHomeEvent("home_manifesto_pillar_select", { pillar: pillarId });
    };

    useEffect(() => {
        if (!stageRef.current) return;

        const ctx = gsap.context(() => {
            const random = gsap.utils.random;

            if (!shouldReduceMotion) {
                if (ringOuterRef.current) {
                    gsap.to(ringOuterRef.current, {
                        rotate: 360,
                        duration: 34,
                        repeat: -1,
                        ease: "none",
                    });
                }

                if (ringInnerRef.current) {
                    gsap.to(ringInnerRef.current, {
                        rotate: -360,
                        duration: 24,
                        repeat: -1,
                        ease: "none",
                    });
                }

                if (glyphRingRef.current) {
                    gsap.to(glyphRingRef.current, {
                        rotate: 360,
                        duration: 28,
                        repeat: -1,
                        ease: "none",
                    });
                }

                if (starLayerRef.current) {
                    gsap.to(starLayerRef.current, {
                        rotate: -360,
                        duration: 70,
                        repeat: -1,
                        ease: "none",
                    });
                }

                if (glowRef.current) {
                    gsap.to(glowRef.current, {
                        scale: 1.12,
                        opacity: 0.72,
                        duration: 3.1,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                    });
                }

                const stars = starLayerRef.current
                    ? gsap.utils.toArray<HTMLElement>(".manifesto-star", starLayerRef.current)
                    : [];

                stars.forEach((star, index) => {
                    gsap.to(star, {
                        opacity: random(0.24, 0.85),
                        scale: random(0.72, 1.34),
                        duration: random(1.9, 4.1),
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: index * 0.06,
                    });
                });
            }
        }, stageRef);

        return () => ctx.revert();
    }, [shouldReduceMotion]);

    return (
        <section id="home-section-5" className="election-typography relative overflow-hidden border-y border-border/80 bg-background py-20 sm:py-24">
            <div className="pointer-events-none absolute inset-0 bg-primary/6" />
            <div className="pointer-events-none absolute left-[-8rem] top-8 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-8rem] right-[-7rem] h-72 w-72 rounded-full bg-primary/12 blur-3xl" />

            <div className="container relative z-10 mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-8">
                    <article className="relative overflow-hidden p-4 sm:p-6 lg:p-7">
                        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 pb-2">
                            <div className="inline-flex items-center gap-2 bg-primary/12 px-3 py-1.5 shadow-[0_6px_18px_rgba(183,28,28,0.12)]">
                                <Radio className="h-3.5 w-3.5 text-primary" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary">
                                    {language === "en" ? "Manifesto Experience" : "घोषणापत्र अनुभव"}
                                </span>
                            </div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                {language === "en" ? "Side-by-Side Edition" : "साइड-बाइ-साइड संस्करण"}
                            </p>
                        </div>

                        <h2
                            className={`text-foreground ${isNepali
                                ? "text-3xl font-semibold leading-[1.2] tracking-normal sm:text-[2.4rem] lg:text-[2.7rem]"
                                : "font-editorial text-[2.02rem] leading-[1.04] tracking-[-0.018em] sm:text-[2.45rem] lg:text-[2.9rem]"
                                }`}
                        >
                            &ldquo;{tString(l.part1, language)}{" "}
                            <span className="text-primary">{tString(l.highlight1, language)}</span>{" "}
                            {tString(l.part2, language)}&rdquo;
                        </h2>

                        <p
                            className={`mt-5 max-w-2xl text-foreground/78 ${isNepali
                                ? "text-[1rem] font-medium leading-[1.86] sm:text-[1.05rem]"
                                : "text-[1rem] leading-[1.75] sm:text-[1.04rem]"
                                }`}
                        >
                            {tString(l.part3, language)}{" "}
                            <span className="text-primary">{tString(l.highlight2, language)}</span>
                            {tString(l.part4, language)}
                        </p>

                        <div className="mt-6 overflow-x-auto pb-1">
                            <div className="flex min-w-max gap-2.5">
                                {pillars.map((pillar) => {
                                    const PillarIcon = pillar.icon;
                                    const isActive = pillar.id === active.id;
                                    return (
                                        <button
                                            key={pillar.id}
                                            type="button"
                                            onClick={() => handleSelectPillar(pillar.id)}
                                            className={`group relative inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 transition-colors ${isActive
                                                ? "text-primary shadow-[inset_0_0_0_1px_rgba(183,28,28,0.36),0_10px_30px_rgba(183,28,28,0.2)]"
                                                : "bg-background/60 text-muted-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] hover:bg-background/80 hover:text-foreground"
                                                }`}
                                        >
                                            {isActive ? (
                                                <motion.span
                                                    layoutId="manifesto-pillars-active"
                                                    className="pointer-events-none absolute inset-0 rounded-full bg-primary/12"
                                                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                                                />
                                            ) : null}
                                            <PillarIcon className="relative h-4 w-4" />
                                            <span className="relative whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em]">
                                                {pillar.label[language]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active.id}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                                transition={{ duration: 0.24 }}
                                className="mt-4 p-4 sm:p-5"
                            >
                                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                                    {language === "en" ? "Active Manifesto Premise" : "सक्रिय घोषणापत्र आधार"}
                                </p>
                                <h3
                                    className={`mt-2 text-foreground ${isNepali
                                        ? "text-[1.3rem] font-semibold leading-[1.34] sm:text-[1.42rem]"
                                        : "font-editorial text-[1.6rem] leading-[1.1] tracking-tight sm:text-[1.78rem]"
                                        }`}
                                >
                                    {active.title[language]}
                                </h3>
                                <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">{active.detail[language]}</p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                {language === "en" ? "— The Leaders, 2026" : "— द लिडर्स, २०२६"}
                            </p>
                            <Link
                                href="/election-2026/manifesto"
                                onClick={() => trackHomeEvent("home_manifesto_cta_click", { target: "manifesto-archive" })}
                                className="group inline-flex min-h-11 items-center gap-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] transition-colors hover:text-primary"
                            >
                                {language === "en" ? "Open Manifesto Library" : "घोषणापत्र पुस्तकालय खोल्नुहोस्"}
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </article>

                    <article className="relative overflow-hidden p-4 sm:p-6">
                        <div className="mb-4 flex items-center justify-end">
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary/90">
                                {language === "en" ? "Civic Signal Core" : "नागरिक सिग्नल कोर"}
                            </p>
                        </div>

                        <div
                            ref={stageRef}
                            className="relative mx-auto aspect-square w-full max-w-[520px] [perspective:1200px]"
                        >
                            <div className="relative h-full w-full overflow-hidden p-4 sm:p-6 [transform-style:preserve-3d]">
                                <div className="pointer-events-none absolute inset-0 bg-primary/6" />

                                <div ref={starLayerRef} className="pointer-events-none absolute inset-0">
                                    {starSeeds.map((star) => (
                                        <span
                                            key={star.id}
                                            className="manifesto-star absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/85 shadow-[0_0_16px_rgba(183,28,28,0.5)]"
                                            style={{
                                                left: `${star.x}%`,
                                                top: `${star.y}%`,
                                                width: `${star.size}px`,
                                                height: `${star.size}px`,
                                                opacity: 0.35,
                                            }}
                                        />
                                    ))}
                                </div>

                                <div
                                    ref={glowRef}
                                    className="pointer-events-none absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/26 blur-3xl"
                                />

                                <div
                                    ref={ringOuterRef}
                                    className="absolute inset-[9%] rounded-full border border-primary/28"
                                />
                                <div
                                    ref={ringInnerRef}
                                    className="absolute inset-[21%] rounded-full border border-dashed border-primary/24"
                                />

                                <svg
                                    className="pointer-events-none absolute inset-[14%] h-[72%] w-[72%] text-primary/35"
                                    viewBox="0 0 100 100"
                                    fill="none"
                                >
                                    <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 6" />
                                    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 8" />
                                </svg>

                                <div ref={glyphRingRef} className="absolute inset-[12%]">
                                    {pillars.map((pillar) => {
                                        const PillarIcon = pillar.icon;
                                        const isActive = pillar.id === active.id;
                                        const anchor = PILLAR_ANCHORS[pillar.id];
                                        return (
                                            <button
                                                key={pillar.id}
                                                type="button"
                                                onClick={() => handleSelectPillar(pillar.id)}
                                                className={`absolute inline-flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-3 py-2 transition-colors ${isActive
                                                    ? "bg-primary/16 text-primary shadow-[inset_0_0_0_1px_rgba(183,28,28,0.42),0_10px_26px_rgba(183,28,28,0.2)]"
                                                    : "bg-background/75 text-muted-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.22)] hover:bg-background/90 hover:text-foreground"
                                                    }`}
                                                style={{ left: anchor.x, top: anchor.y }}
                                                aria-label={pillar.label[language]}
                                            >
                                                <PillarIcon className="h-4 w-4" />
                                            </button>
                                        );
                                    })}
                                </div>

                                <div
                                    className="absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2"
                                >
                                    <div className="absolute -inset-[3px] rounded-full border border-primary/55 p-[3px]">
                                        <div className="relative h-full w-full overflow-hidden rounded-full bg-background shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
                                            <Image
                                                src={logoSrc}
                                                alt={language === "en" ? "The Leaders logo" : "द लिडर्स लोगो"}
                                                fill
                                                sizes="(max-width: 1024px) 16rem, 17rem"
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
