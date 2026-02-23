"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString } from "@/lib/locales";
import { cn } from "@/lib/utils";
import { HeroThemeNavbar } from "./HeroThemeNavbar";
import { UniversalSidebar } from "@/components/common/universal-sidebar";

type CountdownState = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

interface ElectionCountdownProps {
    showAltNavbar?: boolean;
    showAltSidebar?: boolean;
}

type ZonedDateParts = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
};

const NEPAL_TIME_ZONE = "Asia/Kathmandu";
const ELECTION_TARGET_NP: ZonedDateParts = {
    year: 2026,
    month: 3,
    day: 5,
    hour: 0,
    minute: 0,
    second: 0,
};
const ELECTION_TARGET_NP_FALLBACK_ISO = "2026-03-05T00:00:00+05:45";
const HERO_BG = "/media/hero-election.png";
const NEPALI_DIGITS = "०१२३४५६७८९";

type ParticleNode = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
};

function toLocalizedDigits(value: number, isNepali: boolean) {
    const padded = String(value).padStart(2, "0");
    if (!isNepali) return padded;
    return padded.replace(/\d/g, (digit) => NEPALI_DIGITS[Number(digit)]);
}

const zonedFormatters = new Map<string, Intl.DateTimeFormat>();

function getZonedDateParts(date: Date, timeZone: string): ZonedDateParts {
    let formatter = zonedFormatters.get(timeZone);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
        });
        zonedFormatters.set(timeZone, formatter);
    }

    const parts = formatter.formatToParts(date);
    const partMap = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return {
        year: Number(partMap.year),
        month: Number(partMap.month),
        day: Number(partMap.day),
        hour: Number(partMap.hour),
        minute: Number(partMap.minute),
        second: Number(partMap.second),
    };
}

function zonedDatePartsToUtcTimestamp(parts: ZonedDateParts, timeZone: string): number {
    const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const guessZonedParts = getZonedDateParts(new Date(utcGuess), timeZone);
    const guessAsUtc = Date.UTC(
        guessZonedParts.year,
        guessZonedParts.month - 1,
        guessZonedParts.day,
        guessZonedParts.hour,
        guessZonedParts.minute,
        guessZonedParts.second
    );
    const offset = guessAsUtc - utcGuess;
    return utcGuess - offset;
}

function CountdownParticleField({ reducedMotion }: { reducedMotion: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        let frame = 0;
        let particles: ParticleNode[] = [];

        const makeParticle = (width: number, height: number): ParticleNode => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            size: Math.random() * 1.8 + 0.5,
            alpha: Math.random() * 0.55 + 0.2,
        });

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.max(28, Math.min(80, Math.floor((rect.width * rect.height) / 5500)));
            particles = Array.from({ length: count }, () => makeParticle(rect.width, rect.height));
        };

        const draw = () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            context.clearRect(0, 0, width, height);

            const glow = context.createRadialGradient(
                width * 0.5,
                height * 0.52,
                20,
                width * 0.5,
                height * 0.52,
                Math.max(width, height) * 0.65
            );
            glow.addColorStop(0, "rgba(183, 28, 28, 0.18)");
            glow.addColorStop(1, "rgba(247, 244, 238, 0)");
            context.fillStyle = glow;
            context.fillRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i += 1) {
                const particle = particles[i];

                if (!reducedMotion) {
                    particle.x += particle.vx;
                    particle.y += particle.vy;

                    if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
                    if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;
                }

                context.beginPath();
                context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                context.fillStyle = `rgba(22, 22, 22, ${particle.alpha * 0.66})`;
                context.fill();
            }

            context.lineWidth = 0.55;
            for (let i = 0; i < particles.length; i += 1) {
                for (let j = i + 1; j < particles.length; j += 1) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 68) {
                        const opacity = (1 - distance / 68) * 0.22;
                        context.strokeStyle = `rgba(183, 28, 28, ${opacity})`;
                        context.beginPath();
                        context.moveTo(particles[i].x, particles[i].y);
                        context.lineTo(particles[j].x, particles[j].y);
                        context.stroke();
                    }
                }
            }
        };

        const loop = () => {
            draw();
            frame = window.requestAnimationFrame(loop);
        };

        resize();
        draw();

        if (!reducedMotion) {
            frame = window.requestAnimationFrame(loop);
        }

        window.addEventListener("resize", resize);
        return () => {
            window.removeEventListener("resize", resize);
            window.cancelAnimationFrame(frame);
        };
    }, [reducedMotion]);

    return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

export default function ElectionCountdown({
    showAltNavbar = false,
    showAltSidebar = false,
}: ElectionCountdownProps) {
    const { language } = useLanguage();
    const isNepali = language === "ne";
    const shouldReduceMotion = useReducedMotion();
    const locale = LOCALES.home.countdown;

    const [countdown, setCountdown] = useState<CountdownState>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const content = useMemo(
        () =>
            isNepali
                ? {
                    brand: "The Leaders",
                    nav: ["राजनीति", "निर्वाचन", "नीति", "व्यापार", "विश्व", "विश्लेषण", "इतिहास", "समाज"],
                    sideSections: ["ट्रेन्ड", "अन्तर्राष्ट्रिय", "राष्ट्रिय", "स्थानीय"],
                    quickJump: "अर्को अपडेट",
                    leadTag: "इतिहास, नेतृत्व, जवाफदेहिता",
                    leadTitle: "द लिडर्स नागरिक अभिलेखालय",
                    leadDescription:
                        "नेपालको लोकतान्त्रिक यात्रामा सन्दर्भ, प्रमाण र निरन्तरता खोज्ने गम्भीर पाठकका लागि निर्मित एक स्वतन्त्र राजनीतिक अभिलेखालय।",
                    leadActions: { leaders: "निर्वाचन हब खोल्नुहोस्", read: "प्रोफाइल हेर्नुहोस्" },
                    lowerTitle: "निर्णायक ट्र्याकहरूमा दैनिक संकेत अपडेट",
                    lowerBody:
                        "दलगत चाल, भौगोलिक प्रवृत्ति र सन्देश राजनीतिका सूचकहरूलाई एउटै दृश्यमा ट्र्याक गर्न तयार गरिएको चुनावी कमान्ड प्यानल।",
                    linksLabel: "छिटो पहुँच",
                    links: [
                        { href: "/election-2026", label: "निर्वाचन ड्यासबोर्ड" },
                        { href: "/leaders", label: "नेताहरूको प्रोफाइल" },
                        { href: "/articles", label: "सम्पादकीय विश्लेषण" },
                    ],
                    countTitle: "निर्वाचन उल्टी गणना",
                    countHint: "फागुन २१, २०८२ · ५ मार्च २०२६",
                    countCta: "सम्पूर्ण चुनाव हब",
                }
                : {
                    brand: "The Leaders",
                    nav: ["Politics", "Election", "Policy", "Business", "World", "Analysis", "History", "Society"],
                    sideSections: ["Trend", "International", "National", "Local"],
                    quickJump: "Next update",
                    leadTag: "HISTORY, LEADERSHIP, ACCOUNTABILITY",
                    leadTitle: "The Leaders Nepal's Civic Archive",
                    leadDescription:
                        "An independent archive documenting Nepal's political history, leaders, and democratic evolution — built on verified facts, multiple perspectives, and editorial integrity.",
                    leadActions: { leaders: "Open Election Hub", read: "Browse Candidates Profiles" },
                    lowerTitle: "Daily signal updates across decisive tracks",
                    lowerBody:
                        "Monitor coalition shifts, geography-led momentum, and narrative strategy in one election command flow.",
                    linksLabel: "Quick Access",
                    links: [
                        { href: "/election-2026", label: "Election Dashboard" },
                        { href: "/leaders", label: "Leader Profiles" },
                        { href: "/articles", label: "Editorial Analysis" },
                    ],
                    countTitle: "Nepal General Election Countdown",
                    countHint: "Thursday, March 5, 2026 · Falgun 21, 2082",
                    countCta: "Open Election Hub",
                },
        [isNepali]
    );

    useEffect(() => {
        const targetNepal = zonedDatePartsToUtcTimestamp(ELECTION_TARGET_NP, NEPAL_TIME_ZONE);
        const targetFallback = Date.parse(ELECTION_TARGET_NP_FALLBACK_ISO);
        const target = Number.isFinite(targetNepal) ? targetNepal : targetFallback;

        const updateCountdown = () => {
            const now = Date.now();
            const delta = Math.max(target - now, 0);
            setCountdown({
                days: Math.floor(delta / (1000 * 60 * 60 * 24)),
                hours: Math.floor((delta / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((delta / (1000 * 60)) % 60),
                seconds: Math.floor((delta / 1000) % 60),
            });
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, []);

    const preciseHoursRemaining = countdown.hours + countdown.minutes / 60 + countdown.seconds / 3600;
    const preciseMinutesRemaining = countdown.minutes + countdown.seconds / 60;
    const preciseDaysRemaining = countdown.days + preciseHoursRemaining / 24;
    const daysProgressMax = Math.max(Math.ceil(preciseDaysRemaining) + 45, 120);

    const radarRings = [
        {
            key: "days",
            value: preciseDaysRemaining,
            max: daysProgressMax,
            radius: 132,
            stroke: "rgba(183, 28, 28, 0.92)",
            width: 2.5,
            spinDuration: 46,
        },
        {
            key: "hours",
            value: preciseHoursRemaining,
            max: 24,
            radius: 112,
            stroke: "rgba(24, 24, 24, 0.72)",
            width: 2.1,
            spinDuration: 33,
        },
        {
            key: "minutes",
            value: preciseMinutesRemaining,
            max: 60,
            radius: 92,
            stroke: "rgba(66, 66, 66, 0.58)",
            width: 1.8,
            spinDuration: 24,
        },
        {
            key: "seconds",
            value: countdown.seconds,
            max: 60,
            radius: 72,
            stroke: "rgba(183, 28, 28, 0.58)",
            width: 1.6,
            spinDuration: 16,
        },
    ];

    const metricRows = [
        {
            key: "hours",
            label: tString(locale.hours, language),
            value: countdown.hours,
            progress: Math.min(preciseHoursRemaining / 24, 1),
        },
        {
            key: "minutes",
            label: tString(locale.minutes, language),
            value: countdown.minutes,
            progress: Math.min(preciseMinutesRemaining / 60, 1),
        },
        {
            key: "seconds",
            label: tString(locale.seconds, language),
            value: countdown.seconds,
            progress: Math.min(countdown.seconds / 60, 1),
        },
    ];

    return (
        <section id="home-section-1" className="relative overflow-hidden border-y border-border/80 bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 bg-primary/5" />

            <div className="mx-auto w-full max-w-[1440px] px-0 sm:px-4 lg:px-6">
                <div className="overflow-hidden border-x border-border/80 bg-background/95">
                    {showAltNavbar ? <HeroThemeNavbar items={content.nav} /> : null}

                    <div className={cn("grid", showAltSidebar ? "lg:grid-cols-[220px_minmax(0,1fr)]" : "lg:grid-cols-1")}>
                        {showAltSidebar ? (
                            <UniversalSidebar
                                title={content.brand}
                                dataTags={content.sideSections}
                                primaryActionLabel={content.quickJump}
                                primaryActionHref="/election-2026"
                                mode="embedded"
                            />
                        ) : null}

                        <div>
                            <div className="grid border-b border-border/80 lg:grid-cols-[minmax(0,1fr)_360px]">
                                <article className="relative min-h-[480px] border-b border-border/80 lg:min-h-[560px] lg:border-b-0 lg:border-r lg:border-border/80">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat home-image-base"
                                        style={{ backgroundImage: `url("${HERO_BG}")` }}
                                    />
                                    <div className="pointer-events-none absolute inset-0 home-image-overlay-strong" />
                                    <div className="pointer-events-none absolute inset-0 home-image-overlay-soft" />

                                    <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8 lg:p-12">
                                        <p
                                            className={cn(
                                                "home-kicker mb-4",
                                                isNepali &&
                                                "font-sans text-[0.9rem] font-semibold tracking-[0.14em] text-primary sm:text-[1rem]"
                                            )}
                                        >
                                            {content.leadTag}
                                        </p>
                                        <h1
                                            className={cn(
                                                "max-w-4xl text-balance text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                                                isNepali
                                                    ? "font-sans text-[clamp(2.65rem,6.6vw,5.3rem)] font-semibold leading-[1.08] tracking-[0.002em] [text-wrap:balance]"
                                                    : "home-title-xl"
                                            )}
                                        >
                                            {content.leadTitle}
                                        </h1>
                                        <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-white/82 sm:text-[1.06rem]">
                                            {content.leadDescription}
                                        </p>
                                        <div className="mt-8 flex flex-wrap gap-3">
                                            <Button asChild size="lg" className="px-6 font-sans text-sm">
                                                <Link href="/election-2026">
                                                    {content.leadActions.leaders}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                                className="border-white/45 bg-black/24 px-6 font-sans text-sm text-white hover:border-white/75 hover:bg-black/38 hover:text-white"
                                            >
                                                <Link href="http://localhost:3000/election-2026/profiles">{content.leadActions.read}</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </article>

                                <aside className="relative overflow-hidden border-t border-border/70 p-6 sm:p-8 lg:border-t-0">
                                    <div className="pointer-events-none absolute inset-0 bg-primary/5" />
                                    <p className="home-kicker">{content.countTitle}</p>
                                    <p className="home-meta mt-2">{content.countHint}</p>

                                    <motion.div
                                        initial={shouldReduceMotion ? false : { opacity: 0.7, y: 10, scale: 0.985 }}
                                        animate={shouldReduceMotion ? undefined : { opacity: 1, y: [0, -2, 0], scale: 1 }}
                                        transition={{
                                            opacity: { duration: 0.55, ease: "easeOut" },
                                            y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                                            scale: { duration: 0.55, ease: "easeOut" },
                                        }}
                                        className="relative mx-auto mt-7 w-full max-w-[388px] overflow-hidden rounded-none border border-border/80 bg-card/96 px-4 pb-5 pt-4 shadow-[0_22px_52px_rgba(0,0,0,0.22)] dark:shadow-[0_22px_52px_rgba(0,0,0,0.5)] sm:px-5 sm:pb-6 sm:pt-5"
                                    >
                                        <div className="pointer-events-none absolute inset-0 bg-primary/6" />
                                        <div className="pointer-events-none absolute inset-[1px] rounded-none border border-border/50" />

                                        <div className="relative mx-auto aspect-square w-full max-w-[316px] sm:max-w-[330px]">
                                            <CountdownParticleField reducedMotion={!!shouldReduceMotion} />

                                            <motion.div
                                                className="pointer-events-none absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70"
                                                animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
                                                transition={{
                                                    duration: 52,
                                                    repeat: shouldReduceMotion ? 0 : Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                            <motion.div
                                                className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25 bg-primary/5"
                                                animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
                                                transition={{
                                                    duration: 18,
                                                    repeat: shouldReduceMotion ? 0 : Infinity,
                                                    ease: "linear",
                                                }}
                                            />

                                            <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full">
                                                <line x1="20" y1="160" x2="300" y2="160" stroke="rgba(20,20,20,0.2)" strokeWidth="1" />
                                                <line x1="160" y1="20" x2="160" y2="300" stroke="rgba(20,20,20,0.2)" strokeWidth="1" />

                                                {radarRings.map((ring) => {
                                                    const circumference = 2 * Math.PI * ring.radius;
                                                    const progress = ring.max > 0 ? Math.min(ring.value / ring.max, 1) : 0;
                                                    const dashOffset = circumference * (1 - progress);

                                                    return (
                                                        <g key={ring.key}>
                                                            <circle
                                                                cx="160"
                                                                cy="160"
                                                                r={ring.radius}
                                                                fill="none"
                                                                stroke="rgba(20,20,20,0.16)"
                                                                strokeWidth={ring.width}
                                                                strokeDasharray={ring.key === "days" ? "3 8" : "2 9"}
                                                            />
                                                            <motion.circle
                                                                cx="160"
                                                                cy="160"
                                                                r={ring.radius}
                                                                fill="none"
                                                                stroke={ring.stroke}
                                                                strokeWidth={ring.width}
                                                                strokeLinecap="round"
                                                                transform="rotate(-90 160 160)"
                                                                strokeDasharray={circumference}
                                                                animate={{
                                                                    strokeDashoffset: dashOffset,
                                                                    opacity: shouldReduceMotion ? 0.95 : [0.68, 1, 0.68],
                                                                }}
                                                                transition={{
                                                                    strokeDashoffset: { duration: 0.8, ease: [0.2, 0.75, 0.35, 1] },
                                                                    opacity: {
                                                                        duration: 3.4,
                                                                        repeat: shouldReduceMotion ? 0 : Infinity,
                                                                        ease: "easeInOut",
                                                                    },
                                                                }}
                                                            />
                                                            <motion.g
                                                                style={{ transformOrigin: "160px 160px" }}
                                                                animate={{ rotate: progress * 360 }}
                                                                transition={{ type: "spring", damping: 22, stiffness: 110, mass: 0.8 }}
                                                            >
                                                                <motion.circle
                                                                    cx="160"
                                                                    cy={160 - ring.radius}
                                                                    r={ring.key === "days" ? 3.8 : 3}
                                                                    fill={ring.stroke}
                                                                    animate={shouldReduceMotion ? undefined : { opacity: [0.58, 1, 0.58] }}
                                                                    transition={{
                                                                        duration: ring.spinDuration,
                                                                        repeat: shouldReduceMotion ? 0 : Infinity,
                                                                        ease: "linear",
                                                                    }}
                                                                />
                                                            </motion.g>
                                                        </g>
                                                    );
                                                })}
                                            </svg>

                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                                        {tString(locale.days, language)}
                                                    </p>
                                                    <motion.p
                                                        key={`days-${countdown.days}`}
                                                        initial={shouldReduceMotion ? false : { opacity: 0.45, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ type: "spring", damping: 24, stiffness: 170, mass: 0.6 }}
                                                        className="mt-2 font-mono text-[clamp(2.55rem,11vw,3.45rem)] font-semibold leading-none tabular-nums text-foreground drop-shadow-[0_0_14px_rgba(183,28,28,0.2)]"
                                                    >
                                                        {toLocalizedDigits(countdown.days, isNepali)}
                                                    </motion.p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative mt-4 grid grid-cols-3 gap-3 sm:mt-5 sm:gap-3.5">
                                            {metricRows.map((unit) => {
                                                const progress = unit.progress;
                                                return (
                                                    <div key={unit.key} className="relative border-t border-border/70 pt-2.5">
                                                        <motion.span
                                                            className="absolute left-0 top-0 h-px w-full bg-primary/70"
                                                            animate={{ scaleX: Math.max(progress, 0.03) }}
                                                            transition={{ type: "spring", damping: 26, stiffness: 140, mass: 0.7 }}
                                                            style={{ transformOrigin: "left center" }}
                                                        />
                                                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                                                            {unit.label}
                                                        </p>
                                                        <motion.p
                                                            key={`${unit.key}-${unit.value}`}
                                                            initial={shouldReduceMotion ? false : { opacity: 0.5, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ type: "spring", damping: 24, stiffness: 190, mass: 0.55 }}
                                                            className="mt-1 font-mono text-[1.14rem] font-semibold leading-none tabular-nums text-foreground drop-shadow-[0_0_8px_rgba(183,28,28,0.2)] sm:text-[1.23rem]"
                                                        >
                                                            {toLocalizedDigits(unit.value, isNepali)}
                                                        </motion.p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>

                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="mt-7 w-full border-border/80 bg-card/70 font-sans text-sm text-foreground hover:border-primary/55 hover:bg-primary/10 hover:text-primary"
                                    >
                                        <Link href="/election-2026">
                                            {content.countCta}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </aside>
                            </div>

                            <div className="grid border-b border-border/80 lg:grid-cols-[1.08fr_0.92fr]">
                                <article className="border-b border-border/80 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-border/80">
                                    <h2 className={cn("text-foreground", isNepali ? "home-title-md text-[1.7rem]" : "home-title-lg")}>
                                        {content.lowerTitle}
                                    </h2>
                                    <p className="home-body mt-5 max-w-2xl text-[0.98rem]">{content.lowerBody}</p>
                                    <div className="mt-8 flex flex-wrap gap-2.5">
                                        <p className="home-meta mr-1 self-center">{content.linksLabel}</p>
                                        {content.links.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="inline-flex items-center border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </article>

                                <article className="p-6 sm:p-8">
                                    <p className="home-kicker">{content.linksLabel}</p>
                                    <div className="mt-5 space-y-3">
                                        {content.links.map((item, index) => (
                                            <Link
                                                key={`row-${item.href}`}
                                                href={item.href}
                                                className="group flex items-center justify-between border border-border/70 bg-card/45 px-4 py-3 transition-colors hover:border-primary/60 hover:bg-card/80"
                                            >
                                                <span className="text-sm text-foreground/88">{item.label}</span>
                                                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-primary">
                                                    {index + 1}
                                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
