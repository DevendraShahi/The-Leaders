"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

type CountdownState = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

const ELECTION_TARGET_NP = "2026-03-03T00:00:00+05:45";

export default function ElectionCountdown() {
    const { language } = useLanguage();

    const rootRef = useRef<HTMLElement | null>(null);
    const webglRef = useRef<HTMLCanvasElement | null>(null);
    const badgeRef = useRef<HTMLParagraphElement | null>(null);
    const titleTopRef = useRef<HTMLHeadingElement | null>(null);
    const titleBottomRef = useRef<HTMLHeadingElement | null>(null);
    const descriptionRef = useRef<HTMLParagraphElement | null>(null);
    const countdownRef = useRef<HTMLDivElement | null>(null);
    const ctasRef = useRef<HTMLDivElement | null>(null);
    const primaryCtaRef = useRef<HTMLButtonElement | null>(null);
    const secondaryCtaRef = useRef<HTMLButtonElement | null>(null);
    const [countdown, setCountdown] = useState<CountdownState>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const content =
        language === "ne"
            ? {
                  badge: "द लिडर्स · नागरिक अभिलेख",
                  titleTop: "द लिडर्स",
                  titleBottom: "सत्ता, इतिहास र उत्तरदायित्व",
                  description:
                      "नेपालको राजनीतिक यात्रालाई सन्दर्भ, प्रमाण र ऐतिहासिक निरन्तरतासहित पढ्न, बुझ्न र तुलना गर्न तयार गरिएको स्वतन्त्र डिजिटल अभिलेख।",
                  subline: "स्वतन्त्र अभिलेख · बहु-दृष्टिकोण · प्रमाणमा आधारित अध्ययन",
                  countdownLabel: "निर्वाचन काउन्टडाउन",
                  electionDate: "३ मार्च २०२६ · फागुन २१, २०८२",
                  days: "दिन",
                  hours: "घण्टा",
                  minutes: "मिनेट",
                  seconds: "सेकेन्ड",
                  primary: "नेताहरू हेर्नुहोस्",
                  secondary: "लेखहरू पढ्नुहोस्",
              }
            : {
                  badge: "The Leaders · Civic Archive",
                  titleTop: "THE LEADERS",
                  titleBottom: "POWER, HISTORY, ACCOUNTABILITY",
                  description:
                      "An independent political archive built for serious readers who want context, evidence, and continuity in Nepal’s democratic story.",
                  subline: "Independent archive · multi-perspective reading · evidence-led context",
                  countdownLabel: "Election Countdown",
                  electionDate: "March 3, 2026 · Falgun 21, 2082",
                  days: "Days",
                  hours: "Hours",
                  minutes: "Minutes",
                  seconds: "Seconds",
                  primary: "Explore Leaders",
                  secondary: "Read Articles",
              };

    useEffect(() => {
        const target = new Date(ELECTION_TARGET_NP).getTime();

        const updateCountdown = () => {
            const now = Date.now();
            const delta = Math.max(target - now, 0);

            const days = Math.floor(delta / (1000 * 60 * 60 * 24));
            const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((delta / (1000 * 60)) % 60);
            const seconds = Math.floor((delta / 1000) % 60);

            setCountdown({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const canvas = webglRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
        if (!gl) return;

        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform float u_intensity;

            float linePattern(vec2 uv, float spacing, float width) {
                vec2 g = abs(fract(uv / spacing - 0.5) - 0.5) / fwidth(uv / spacing);
                float line = min(g.x, g.y);
                return 1.0 - smoothstep(0.0, width, line);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec2 p = uv * vec2(u_resolution.x / u_resolution.y, 1.0);

                float wave = sin((p.x * 8.0) + (u_time * 0.25)) * 0.004;
                vec2 shifted = vec2(p.x, p.y + wave);

                float coarse = linePattern(shifted, 0.12, 1.3);
                float fine = linePattern(shifted + vec2(0.02, 0.01), 0.06, 1.8);

                float vignette = 1.0 - smoothstep(0.25, 1.1, distance(uv, vec2(0.5)));
                float signal = (coarse * 0.22 + fine * 0.08) * (0.45 + vignette * 0.55) * u_intensity;

                vec3 base = vec3(0.7176, 0.1098, 0.1098); // #B71C1C
                vec3 color = base * signal;
                gl_FragColor = vec4(color, signal * 0.45);
            }
        `;

        const compileShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                -1, 1,
                1, -1,
                1, 1,
            ]),
            gl.STATIC_DRAW
        );

        const positionLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
        const timeLoc = gl.getUniformLocation(program, "u_time");
        const intensityLoc = gl.getUniformLocation(program, "u_intensity");

        const getThemeIntensity = () =>
            document.documentElement.classList.contains("dark") ? 1.0 : 0.62;
        let intensity = getThemeIntensity();

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.floor(canvas.clientWidth * dpr);
            const height = Math.floor(canvas.clientHeight * dpr);
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            gl.viewport(0, 0, width, height);
        };

        resize();
        window.addEventListener("resize", resize);

        const observer = new MutationObserver(() => {
            intensity = getThemeIntensity();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        let raf = 0;
        let isVisible = !document.hidden;
        let inViewport = true;
        const start = performance.now();

        const sectionObserver = new IntersectionObserver(
            ([entry]) => {
                inViewport = !!entry?.isIntersecting;
            },
            { threshold: 0.05 }
        );

        if (rootRef.current) {
            sectionObserver.observe(rootRef.current);
        }

        const onVisibility = () => {
            isVisible = !document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibility);

        const render = () => {
            if (isVisible && inViewport) {
                resize();
                const elapsed = (performance.now() - start) / 1000;
                gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
                gl.uniform1f(timeLoc, elapsed);
                gl.uniform1f(intensityLoc, intensity);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
            raf = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener("visibilitychange", onVisibility);
            sectionObserver.disconnect();
            window.removeEventListener("resize", resize);
            observer.disconnect();
            gl.deleteBuffer(positionBuffer);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
        };
    }, []);

    useEffect(() => {
        if (!rootRef.current) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ctx = gsap.context(() => {
            if (reduced) {
                gsap.set(
                    [badgeRef.current, titleTopRef.current, titleBottomRef.current, descriptionRef.current, countdownRef.current, ctasRef.current],
                    { autoAlpha: 1 }
                );
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
            tl.from(badgeRef.current, { y: 24, autoAlpha: 0, duration: 0.45 })
                .from(titleTopRef.current, { y: 44, autoAlpha: 0, duration: 0.62 }, "-=0.22")
                .from(titleBottomRef.current, { y: 38, autoAlpha: 0, duration: 0.56 }, "-=0.36")
                .from(descriptionRef.current, { y: 22, autoAlpha: 0, duration: 0.48 }, "-=0.26")
                .from(countdownRef.current, { y: 18, autoAlpha: 0, duration: 0.44 }, "-=0.2")
                .from(ctasRef.current, { y: 18, autoAlpha: 0, duration: 0.42 }, "-=0.22");

            const ctas = [primaryCtaRef.current, secondaryCtaRef.current].filter(
                Boolean
            ) as HTMLButtonElement[];

            const ctaCleanups: Array<() => void> = [];
            ctas.forEach((button) => {
                const shift = gsap.quickTo(button, "x", { duration: 0.22, ease: "power2.out" });
                const onEnter = () => shift(4);
                const onLeave = () => shift(0);
                button.addEventListener("mouseenter", onEnter);
                button.addEventListener("mouseleave", onLeave);
                ctaCleanups.push(() => {
                    button.removeEventListener("mouseenter", onEnter);
                    button.removeEventListener("mouseleave", onLeave);
                });
            });

            return () => {
                ctaCleanups.forEach((cleanup) => cleanup());
            };
        }, rootRef);

        return () => ctx.revert();
    }, []);

    const formatCount = (value: number) => {
        const padded = String(value).padStart(2, "0");
        return language === "ne" ? padded.replace(/\d/g, (digit) => "०१२३४५६७८९"[Number(digit)]) : padded;
    };

    return (
        <section ref={rootRef} className="relative mt-6 overflow-hidden border-t border-border bg-background md:mt-0">
            <canvas ref={webglRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
            <div className="pointer-events-none absolute inset-y-0 left-[8%] w-px bg-border/55" />
            <div className="pointer-events-none absolute inset-y-0 right-[8%] w-px bg-border/55" />
            <div className="pointer-events-none absolute left-0 right-0 top-[30%] h-px bg-border/55" />
            <div className="pointer-events-none absolute left-0 right-0 bottom-[20%] h-px bg-border/55" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/35" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/70" />

            <div className="container relative mx-auto px-4 py-24 md:py-28 lg:py-32">
                <div className="mx-auto max-w-5xl">
                    <main>
                        <p ref={badgeRef} className="mb-6 inline-flex border border-primary/35 bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                            {content.badge}
                        </p>

                        <h1
                            ref={titleTopRef}
                            className={`text-foreground [font-family:var(--font-bebas)] ${
                                language === "ne"
                                    ? "text-6xl font-bold leading-[1.08] tracking-normal md:text-7xl lg:text-8xl"
                                    : "text-6xl font-black leading-[0.88] tracking-tight md:text-7xl lg:text-8xl"
                            }`}
                        >
                            {content.titleTop}
                        </h1>

                        <h2
                            ref={titleBottomRef}
                            className={`mt-1 text-primary [font-family:var(--font-bebas)] ${
                                language === "ne"
                                    ? "text-4xl font-bold leading-[1.12] tracking-normal md:text-5xl lg:text-6xl"
                                    : "text-4xl font-black leading-[0.94] tracking-tight md:text-5xl lg:text-6xl"
                            }`}
                        >
                            {content.titleBottom}
                        </h2>

                        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {content.subline}
                        </p>

                        <p ref={descriptionRef} className="mt-8 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg md:leading-8">
                            {content.description}
                        </p>

                        <div ref={countdownRef} className="mt-10 max-w-3xl border border-border bg-card/60 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{content.countdownLabel}</p>
                                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{content.electionDate}</p>
                            </div>
                            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                <div className="border border-border bg-background px-2 py-3 text-center">
                                    <p className="font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl">{formatCount(countdown.days)}</p>
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{content.days}</p>
                                </div>
                                <div className="border border-border bg-background px-2 py-3 text-center">
                                    <p className="font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl">{formatCount(countdown.hours)}</p>
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{content.hours}</p>
                                </div>
                                <div className="border border-border bg-background px-2 py-3 text-center">
                                    <p className="font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl">{formatCount(countdown.minutes)}</p>
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{content.minutes}</p>
                                </div>
                                <div className="border border-border bg-background px-2 py-3 text-center">
                                    <p className="font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl">{formatCount(countdown.seconds)}</p>
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{content.seconds}</p>
                                </div>
                            </div>
                        </div>

                        <div ref={ctasRef} className="mt-12 flex flex-wrap gap-3">
                            <Link href="/leaders">
                                <Button ref={primaryCtaRef} size="lg" className="rounded-none px-6 font-mono text-xs uppercase tracking-[0.16em]">
                                    {content.primary}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>

                            <Link href="/articles">
                                <Button ref={secondaryCtaRef} size="lg" variant="outline" className="rounded-none px-6 font-mono text-xs uppercase tracking-[0.16em]">
                                    {content.secondary}
                                </Button>
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        </section>
    );
}
