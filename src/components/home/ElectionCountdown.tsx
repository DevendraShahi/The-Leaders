"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Calendar, Users, MapPin, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Election headlines for the ticker (simplified, no emojis)
// Election headlines for the ticker (Real Daily Briefs)
const HEADLINES = [
    "Digital integrity push: Election Commission partners with TikTok and enlists the Advertising Board to curb misinformation and defamatory ads, signalling tighter oversight.",
    "Representation gaps exposed: Final PR lists show women are a majority among 3,135 list candidates, yet overall only about 11% of roughly 3,484 total candidates are women.",
    "Rules, security and key races: Integrated Security Plan deploys over 300,000 personnel and stricter code-of-conduct rules on manifestos, money and appointments take effect.",
    "Election 2026: High-profile contests pit ex–prime ministers against newcomers like Balen Shah.",
    "March 5 Polls: 56 Political Parties Registered for 2026 General Election.",
    "Voter turnout projected to reach record highs in localized regions.",
];

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

// Helper to convert to Nepali digits
const toNepaliDigits = (num: number) => {
    const nepaliMap = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => nepaliMap[parseInt(d)] || d).join('');
};

export default function ElectionCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [mounted, setMounted] = useState(false);
    const [lang, setLang] = useState<"en" | "np">("en"); // Lifted state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Language toggle interval
    useEffect(() => {
        const timer = setInterval(() => {
            setLang(prev => prev === "en" ? "np" : "en");
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // Particle animation on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Create particle grid
        const particles: Particle[] = [];
        const particleCount = 80;
        const connectionDistance = 150;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
            });
        }

        let animationFrame: number;
        const animate = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach((particle, i) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw particle
                ctx.fillStyle = "rgba(183, 28, 28, 0.6)"; // #B71C1C with opacity
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x;
                    const dy = particles[j].y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const alpha = (1 - distance / connectionDistance) * 0.5;
                        ctx.strokeStyle = `rgba(183, 28, 28, ${alpha})`; // #B71C1C
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            });

            animationFrame = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    useEffect(() => {
        setMounted(true);
        const electionDate = new Date("2026-03-05T07:00:00+05:45");

        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = electionDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    const [headlines, setHeadlines] = useState<string[]>([]);

    // Fetch headlines
    useEffect(() => {
        const fetchHeadlines = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.data?.tickerHeadlines?.length > 0) {
                    setHeadlines(data.data.tickerHeadlines);
                } else {
                    // Fallback if no headlines in DB
                    setHeadlines([
                        "Election 2026: March 5th Polls Confirmed",
                        "EC Nepal announces strict code of conduct for upcoming elections",
                        "Voter registration closes with record 18M+ eligible voters",
                        "Daily briefings available now in The Leaders dashboard"
                    ]);
                }
            } catch (err) {
                console.error("Failed to fetch ticker:", err);
            }
        };
        fetchHeadlines();
    }, []);

    // ... (rest of effects)

    if (!mounted) return null;

    // Use fetched headlines or fallback/hardcoded if desired
    const tickerContent = headlines.length > 0 ? headlines : HEADLINES;

    return (
        <motion.section
            style={{ opacity }}
            className="relative min-h-screen mt-6 md:m-0 w-full overflow-hidden bg-black flex items-center justify-center"
        >
            {/* Particle Canvas Background */}
            <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />

            {/* Minimal Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(183,28,28,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,28,28,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

            {/* Scrolling News Ticker */}
            <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-[#B71C1C]/20 py-2 overflow-hidden z-10">
                <motion.div
                    className="flex gap-16 whitespace-nowrap"
                    animate={{ x: [0, -2400] }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                >
                    {[...tickerContent, ...tickerContent, ...tickerContent].map((headline, i) => (
                        <span key={i} className="text-white/60 font-mono text-xs tracking-widest uppercase">
                            {headline}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-24 relative z-10">
                <div className="max-w-6xl mx-auto space-y-20">

                    {/* Header with Bilingual Animation */}
                    <AnimatedHeader lang={lang} />

                    {/* Countdown Timer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
                    >
                        {[
                            { value: timeLeft.days, label: lang === 'en' ? "Days" : "दिन" },
                            { value: timeLeft.hours, label: lang === 'en' ? "Hours" : "घण्टा" },
                            { value: timeLeft.minutes, label: lang === 'en' ? "Minutes" : "मिनेट" },
                            { value: timeLeft.seconds, label: lang === 'en' ? "Seconds" : "सेकेन्ड" },
                        ].map((item, index) => (
                            <div key={index} className="relative group">
                                {/* Minimal border frame */}
                                <div className="absolute inset-0 border border-white/10 group-hover:border-[#B71C1C]/30 transition-colors duration-500" />
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#B71C1C] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#B71C1C] opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Content */}
                                <div className="relative p-8 md:p-10 flex flex-col items-center justify-center bg-black/40">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`${item.value}-${lang}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-6xl md:text-7xl font-mono font-bold text-white tabular-nums"
                                        >
                                            {lang === 'en'
                                                ? String(item.value).padStart(2, "0")
                                                : toNepaliDigits(item.value).padStart(2, "०")}
                                        </motion.div>
                                    </AnimatePresence>
                                    <div className="mt-3 text-white/40 font-mono text-xs tracking-[0.2em] uppercase">
                                        {item.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Stats - Minimal Line Design */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5"
                    >
                        {[
                            { icon: Users, label: "Registered Voters", value: "18M+" },
                            { icon: Vote, label: "Political Parties", value: "56" },
                            { icon: MapPin, label: "Polling Stations", value: "10,000+" },
                            { icon: Calendar, label: "Total Seats", value: "275" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-black p-6 hover:bg-[#B71C1C]/5 transition-colors group">
                                <stat.icon className="w-6 h-6 text-[#B71C1C]/60 mb-4 group-hover:text-[#B71C1C] transition-colors" strokeWidth={1.5} />
                                <div className="text-3xl md:text-4xl font-mono text-white mb-1 tabular-nums">
                                    {stat.value}
                                </div>
                                <div className="text-white/40 text-xs font-mono tracking-wider uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                    >
                        <Link href="/election-2026">
                            <Button size="lg">
                                Explore Election Data
                            </Button>
                        </Link>
                        <Link href="/leaders">
                            <Button size="lg" variant="outline">
                                View Leaders
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="flex justify-center pt-12"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                            <div className="text-white/30 font-mono text-xs tracking-widest uppercase">Scroll</div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}

function AnimatedHeader({ lang }: { lang: "en" | "np" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center space-y-6"
        >
            <div className="inline-block border border-[#B71C1C]/30 px-6 py-2">
                <span className="text-[#B71C1C] font-mono text-sm tracking-[0.3em] uppercase">
                    Nepal General Election
                </span>
            </div>

            <div className="h-[180px] sm:h-[220px] flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {lang === "en" ? (
                        <motion.h1
                            key="en"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-7xl md:text-8xl lg:text-9xl font-bebas text-white uppercase tracking-tighter leading-[0.9]"
                        >
                            March 5
                            <br />
                            <span className="text-[#B71C1C]">2026</span>
                        </motion.h1>
                    ) : (
                        <motion.h1
                            key="np"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-7xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.9]"
                        >
                            फागुन २१
                            <br />
                            <span className="text-[#B71C1C]">२०८२</span>
                        </motion.h1>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
