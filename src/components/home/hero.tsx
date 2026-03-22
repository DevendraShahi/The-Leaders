"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from "lucide-react";

export function Hero() {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    return (
        <section className="relative flex min-h-[100svh] flex-col justify-center items-center bg-background text-foreground font-sans overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Neuton:wght@400&family=Oswald:wght@700&display=swap');

                .hero-animated-text-container {
                    font-family: "Neuton", serif;
                    font-weight: 400;
                    text-transform: uppercase;
                    letter-spacing: .5em;
                    display: inline-block;
                    border: 4px double var(--border);
                    border-width: 4px 0;
                    padding: 1.5em 0em;
                    width: 100%;
                    max-width: 45em;
                    margin: 0 auto;
                    text-align: center;
                    color: var(--muted-foreground);
                }

                .hero-animated-text-container span {
                    font-family: "Oswald", sans-serif;
                    font-weight: 700;
                    font-size: clamp(3.5rem, 12vw, 6rem);
                    line-height: 1;
                    letter-spacing: 0;
                    padding: .25em 0 .325em;
                    display: block;
                    margin: 0 auto;
                    text-shadow: 0 0 80px var(--primary);
                    background: url(https://i.ibb.co/RDTnNrT/animated-text-fill.png) repeat-y;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    -webkit-animation: aitf 80s linear infinite;
                    -webkit-transform: translate3d(0,0,0);
                    -webkit-backface-visibility: hidden;
                }
                
                /* Light Mode Adjustments */
                :root:not(.dark):not([data-theme="dark"]) .hero-animated-text-container span {
                    background: url(https://i.ibb.co/RDTnNrT/animated-text-fill.png) repeat-y, linear-gradient(#fff, #fff);
                    background-blend-mode: difference;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-stroke: 1.5px var(--foreground);
                    text-shadow: 0 0 30px var(--primary), 0 0 80px var(--primary);
                }

                @-webkit-keyframes aitf {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }

                .hero-noise {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 10;
                    opacity: 0.04;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }

                .hero-grid-bg {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(to right, var(--border) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--border) 1px, transparent 1px);
                    background-size: 60px 60px;
                    opacity: 0.2;
                    z-index: 1;
                    mask-image: radial-gradient(circle at center, black 30%, transparent 80%);
                    -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 80%);
                }

                @media (max-width: 768px) {
                    .hero-grid-bg {
                        background-size: 30px 30px;
                    }
                }

                .hero-orbit {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    pointer-events: none;
                    border-radius: 50%;
                    border: 1px dashed var(--border);
                    opacity: 0.2;
                    transform-origin: top left;
                }
                .hero-orbit-1 {
                    width: 300px;
                    height: 300px;
                    animation: spin-orbit 50s linear infinite;
                }
                .hero-orbit-2 {
                    width: 500px;
                    height: 500px;
                    border-style: solid;
                    opacity: 0.1;
                    animation: spin-orbit-reverse 70s linear infinite;
                }
                .hero-orbit-3 {
                    width: 800px;
                    height: 800px;
                    animation: spin-orbit 90s linear infinite;
                }

                @media (min-width: 768px) {
                    .hero-orbit-1 { width: 500px; height: 500px; }
                    .hero-orbit-2 { width: 800px; height: 800px; }
                    .hero-orbit-3 { width: 1100px; height: 1100px; }
                }

                @keyframes spin-orbit {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes spin-orbit-reverse {
                    0% { transform: translate(-50%, -50%) rotate(360deg); }
                    100% { transform: translate(-50%, -50%) rotate(0deg); }
                }
                
                .glow-pulse {
                    animation: glow-pulse 4s infinite alternate;
                }
                @keyframes glow-pulse {
                    0% { opacity: 0.4; }
                    100% { opacity: 0.8; }
                }
            `}} />

            {/* Creative Geometric Background Elements */}
            <div className="hero-grid-bg pointer-events-none"></div>
            
            <div className="absolute top-1/2 left-1/2 z-0 pointer-events-none">
                <div className="hero-orbit hero-orbit-1"></div>
                <div className="hero-orbit hero-orbit-2"></div>
                <div className="hero-orbit hero-orbit-3"></div>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[70vw] md:w-[70vw] md:h-[50vw] max-w-[900px] max-h-[600px] bg-primary/10 blur-[100px] md:blur-[150px] rounded-[100%] glow-pulse" />
                <div className="absolute bottom-0 left-0 right-0 h-[40vh] md:h-[30vh] bg-gradient-to-t from-background to-transparent z-10" />
            </div>

            <div className="hero-noise"></div>

            {/* Mobile/Tablet Telemetry Header (Visible only on smaller screens) */}
            <div className="absolute top-[120px] sm:top-[140px] left-0 right-0 flex xl:hidden justify-between px-6 z-20 pointer-events-none opacity-70">
                <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-foreground font-mono">
                           {isNepali ? "लाइभ" : "LIVE"}
                        </span>
                    </div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono">
                        {isNepali ? "अद्यावधिक" : "UPDATING"}
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-foreground font-mono">
                         {isNepali ? "इतिहास" : "HISTORY"}
                    </div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono">
                        {isNepali ? "प्रोजेक्ट" : "PROJECT"}
                    </div>
                </div>
            </div>

            {/* Desktop Telemetry Framing */}
            <div className="absolute top-[25%] left-[8%] hidden xl:flex flex-col gap-3 items-start justify-center opacity-80 z-20 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-foreground font-mono">
                        {isNepali ? "लाइभ आर्काइभ" : "Live Archive"}
                    </span>
                </div>
                <div className="h-[60px] w-[1px] bg-primary/40 ml-1"></div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    {isNepali ? "निरन्तर अद्यावधिके" : "Updating continuously"}
                </div>
            </div>

            <div className="absolute bottom-[25%] right-[8%] hidden xl:flex flex-col gap-3 items-end justify-center opacity-80 z-20 hover:opacity-100 transition-opacity">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono text-right">
                    {isNepali ? "इतिहास संकलन सुरु" : "Documenting since start"}
                </div>
                <div className="h-[60px] w-[1px] bg-primary/40 mr-1"></div>
                <div className="text-[11px] uppercase tracking-[0.25em] font-medium text-foreground text-right font-mono max-w-[120px]">
                    <span className="font-bold">{isNepali ? "नेपालको इतिहास" : "NEPAL HISTORY"}</span> <br/>
                    <span className="text-primary italic font-serif">Project</span>
                </div>
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 gap-8 md:gap-12 pt-16 md:pt-10">
                {/* Mobile specific status pill to combat empty space */}
                <div className="xl:hidden flex items-center gap-2 px-3 py-1 md:py-1.5 rounded-none border border-primary/30 bg-primary/5 backdrop-blur-md mb-2 md:mb-0">
                    <Activity className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest uppercase text-foreground/80">
                        {isNepali ? "सक्रिय अनुगमन" : "Active Tracking"}
                    </span>
                </div>

                <p className="hero-animated-text-container text-[10px] md:text-sm lg:text-base backdrop-blur-sm px-2">
                    {isNepali ? "साहसिक निर्णय लिनेहरू" : "The bold decision makers"}
                    <span>
                        {isNepali ? "द लिडर्स" : "THE LEADERS"}
                    </span>
                    &mdash; {isNepali ? "हाम्रो इतिहास, हाम्रो गौरव" : "Shaping a nation's destiny"} &mdash;
                </p>

                <div className="hero-content flex flex-col items-center max-w-2xl px-4 mt-6 md:mt-8 w-full">
                    <p className="text-center text-sm md:text-xl text-muted-foreground font-sans font-medium mb-8 !leading-relaxed drop-shadow-md px-2">
                        {isNepali 
                            ? "नेपालको आजको रुप दिन साहसिक निर्णय गर्ने नेताहरू, विद्रोहीहरू र योजनाकारहरूको यात्रा एकै ठाउँमा।" 
                            : "Discover the visionaries, revolutionaries, and statesmen who shaped the destiny of a nation."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button size="lg" className="h-12 w-full sm:h-14 sm:w-auto px-8 font-bold text-xs sm:text-sm tracking-widest rounded-none bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_24px_rgba(207,58,58,0.3)] duration-300 uppercase">
                            <span>{isNepali ? "जीवन यात्रा पढ्नुहोस्" : "EXPLORE BIOGRAPHIES"}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="group h-12 w-full sm:h-14 sm:w-auto px-8 font-bold text-xs sm:text-sm tracking-widest rounded-none border-border bg-background/50 backdrop-blur-sm text-foreground hover:bg-muted hover:text-primary transition-all duration-300 hover:scale-105 uppercase"
                        >
                            <span className="flex items-center">
                                {isNepali ? "समयरेखा हेर्नुहोस्" : "VIEW TIMELINE"}
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
