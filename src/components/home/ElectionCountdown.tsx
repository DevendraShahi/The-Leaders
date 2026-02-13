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
    const [isHeroHovered, setIsHeroHovered] = useState(false);
    const [isWebglReady, setIsWebglReady] = useState(false);
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
        if (!gl) {
            setIsWebglReady(false);
            return;
        }

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
            uniform vec2 u_pointer;
            uniform vec2 u_velocity;
            uniform float u_energy;
            uniform float u_hover;
            uniform float u_dark;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            float noise(in vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                    u.y
                );
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amp = 0.5;
                for (int i = 0; i < 5; i++) {
                    value += amp * noise(p);
                    p = p * 2.02 + vec2(12.17, 4.31);
                    amp *= 0.52;
                }
                return value;
            }

            float mesh(vec2 p, float scale, float width) {
                vec2 g = abs(fract(p * scale - 0.5) - 0.5) / fwidth(p * scale);
                float line = min(g.x, g.y);
                return 1.0 - smoothstep(width, width + 1.1, line);
            }

            vec3 basePalette(float dark, float t) {
                vec3 darkA = vec3(0.028, 0.032, 0.042);
                vec3 darkB = vec3(0.058, 0.062, 0.082);
                vec3 lightA = vec3(0.962, 0.963, 0.968);
                vec3 lightB = vec3(0.905, 0.912, 0.928);
                vec3 a = mix(lightA, darkA, dark);
                vec3 b = mix(lightB, darkB, dark);
                return mix(a, b, t);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
                vec2 p = uv * aspect;
                vec2 pointer = u_pointer * aspect;
                vec2 velocity = u_velocity;

                vec2 delta = p - pointer;
                float dist = max(length(delta), 0.0001);
                float magnetic = exp(-dist * 4.6) * (0.22 + 0.95 * u_hover);

                float n1 = fbm(p * 2.4 + vec2(u_time * 0.06, -u_time * 0.04));
                float n2 = fbm(p * 5.7 - vec2(u_time * 0.04, u_time * 0.05));
                vec2 flow = vec2(n1 - 0.5, n2 - 0.5) * 0.038 * u_intensity;

                vec2 pull = normalize(delta + vec2(0.00001)) * magnetic * 0.08;
                vec2 vortex = vec2(-delta.y, delta.x) * (sin(dist * 22.0 - u_time * 3.2) * magnetic * 0.024);

                vec2 displaced = p + flow + pull + vortex + velocity * magnetic * 0.05;

                float noiseField = fbm(displaced * 3.6 + vec2(0.0, u_time * 0.03));
                float coarse = mesh(displaced + vec2(noiseField * 0.08), 10.0, 0.82);
                float fine = mesh(displaced - vec2(noiseField * 0.05), 21.0, 1.26);

                float splitAmount = clamp(length(velocity) * 0.22 + u_energy * 0.18, 0.0, 0.055);
                vec2 splitDir = normalize(velocity + vec2(0.001, 0.001));
                float rField = mesh(displaced + splitDir * splitAmount, 15.0, 1.05);
                float bField = mesh(displaced - splitDir * splitAmount, 15.0, 1.05);

                float spotlight = smoothstep(0.55, 0.0, dist) * (0.22 + u_energy * 0.55) * u_hover;
                float edgeGlow = smoothstep(0.20, 0.02, abs(dist - 0.12)) * (0.08 + u_energy * 0.2) * u_hover;
                float vignette = 1.0 - smoothstep(0.18, 0.98, distance(uv, vec2(0.5)));

                vec3 accent = vec3(0.7176, 0.1098, 0.1098);
                vec3 base = basePalette(u_dark, uv.y * 0.8 + noiseField * 0.2);
                vec3 meshTone = mix(vec3(0.06, 0.065, 0.08), vec3(0.85, 0.86, 0.89), u_dark);

                vec3 field = meshTone * (coarse * 0.17 + fine * 0.11) * vignette;
                field += vec3(rField * 0.22, fine * 0.08, bField * 0.22) * (0.35 + u_energy * 0.6);

                vec3 glow = accent * (spotlight * 1.45 + edgeGlow * 1.75 + magnetic * 0.14);
                float grain = (hash(gl_FragCoord.xy + u_time * 32.0) - 0.5) * 0.035;

                vec3 color = base + field + glow + vec3(grain);
                float alpha = clamp(0.22 + (coarse + fine) * 0.16 + spotlight * 0.55 + edgeGlow * 0.42, 0.0, 0.9);
                gl_FragColor = vec4(color, alpha);
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
        if (!vertexShader || !fragmentShader) {
            setIsWebglReady(false);
            return;
        }

        const program = gl.createProgram();
        if (!program) {
            setIsWebglReady(false);
            return;
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            setIsWebglReady(false);
            return;
        }
        setIsWebglReady(true);
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
        const pointerLoc = gl.getUniformLocation(program, "u_pointer");
        const velocityLoc = gl.getUniformLocation(program, "u_velocity");
        const energyLoc = gl.getUniformLocation(program, "u_energy");
        const hoverLoc = gl.getUniformLocation(program, "u_hover");
        const darkLoc = gl.getUniformLocation(program, "u_dark");

        const getThemeIntensity = () =>
            document.documentElement.classList.contains("dark") ? 1.0 : 0.68;
        let intensity = getThemeIntensity();
        let darkFlag = document.documentElement.classList.contains("dark") ? 1 : 0;
        const pointerState = { x: 0.5, y: 0.5, vx: 0.0, vy: 0.0, energy: 0.0, hover: 0.0 };
        let lastPointerX = 0.5;
        let lastPointerY = 0.5;

        const toPointerX = gsap.quickTo(pointerState, "x", { duration: 0.5, ease: "power3.out" });
        const toPointerY = gsap.quickTo(pointerState, "y", { duration: 0.5, ease: "power3.out" });
        const toVelocityX = gsap.quickTo(pointerState, "vx", { duration: 0.32, ease: "power3.out" });
        const toVelocityY = gsap.quickTo(pointerState, "vy", { duration: 0.32, ease: "power3.out" });
        const toEnergy = gsap.quickTo(pointerState, "energy", { duration: 0.45, ease: "power2.out" });
        const toHover = gsap.quickTo(pointerState, "hover", { duration: 0.35, ease: "power2.out" });

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
        const allowInteractivePointer = !reducedMotion && hasFinePointer;

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
            darkFlag = document.documentElement.classList.contains("dark") ? 1 : 0;
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

        const onPointerMove = (event: PointerEvent) => {
            if (!allowInteractivePointer || !rootRef.current) return;
            const rect = rootRef.current.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = 1 - (event.clientY - rect.top) / rect.height;
            const clampedX = Math.min(1, Math.max(0, x));
            const clampedY = Math.min(1, Math.max(0, y));

            const dx = clampedX - lastPointerX;
            const dy = clampedY - lastPointerY;
            const speed = Math.min(Math.sqrt(dx * dx + dy * dy) * 28.0, 1.0);

            lastPointerX = clampedX;
            lastPointerY = clampedY;

            toPointerX(clampedX);
            toPointerY(clampedY);
            toVelocityX(dx * 9.0);
            toVelocityY(dy * 9.0);
            toEnergy(speed);

            rootRef.current.style.setProperty("--hero-mx", `${clampedX * 100}%`);
            rootRef.current.style.setProperty("--hero-my", `${(1 - clampedY) * 100}%`);
            rootRef.current.style.setProperty("--hero-energy", String(speed));
        };

        const onPointerEnter = () => {
            if (!allowInteractivePointer) return;
            toHover(1);
            setIsHeroHovered(true);
        };

        const onPointerLeave = () => {
            toHover(0);
            toEnergy(0);
            toVelocityX(0);
            toVelocityY(0);
            setIsHeroHovered(false);
        };

        if (rootRef.current) {
            rootRef.current.addEventListener("pointermove", onPointerMove, { passive: true });
            rootRef.current.addEventListener("pointerenter", onPointerEnter, { passive: true });
            rootRef.current.addEventListener("pointerleave", onPointerLeave, { passive: true });
        }

        const render = () => {
            if (isVisible && inViewport) {
                resize();
                const elapsed = (performance.now() - start) / 1000;
                pointerState.vx *= 0.94;
                pointerState.vy *= 0.94;
                pointerState.energy *= 0.965;
                gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
                gl.uniform1f(timeLoc, elapsed);
                gl.uniform1f(intensityLoc, intensity);
                gl.uniform2f(pointerLoc, pointerState.x, pointerState.y);
                gl.uniform2f(velocityLoc, pointerState.vx, pointerState.vy);
                gl.uniform1f(energyLoc, pointerState.energy);
                gl.uniform1f(hoverLoc, pointerState.hover);
                gl.uniform1f(darkLoc, darkFlag);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
            raf = requestAnimationFrame(render);
        };
        render();

        return () => {
            setIsWebglReady(false);
            cancelAnimationFrame(raf);
            document.removeEventListener("visibilitychange", onVisibility);
            sectionObserver.disconnect();
            window.removeEventListener("resize", resize);
            observer.disconnect();
            if (rootRef.current) {
                rootRef.current.removeEventListener("pointermove", onPointerMove);
                rootRef.current.removeEventListener("pointerenter", onPointerEnter);
                rootRef.current.removeEventListener("pointerleave", onPointerLeave);
            }
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
        <section
            ref={rootRef}
            data-webgl={isWebglReady ? "ready" : "fallback"}
            className="election-typography relative mt-6 overflow-hidden border-t border-border bg-background md:mt-0"
        >
            <canvas
                ref={webglRef}
                className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${isWebglReady ? "opacity-70" : "opacity-0"}`}
            />

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
                            className={`text-foreground [font-family:var(--font-bebas)] ${language === "ne"
                                ? "text-4xl font-semibold leading-[1.12] tracking-normal md:text-6xl lg:text-7xl"
                                : "text-4xl font-black leading-[0.92] tracking-tight md:text-6xl lg:text-7xl"
                                }`}
                        >
                            {content.titleTop}
                        </h1>

                        <h2
                            ref={titleBottomRef}
                            className={`mt-1 text-primary [font-family:var(--font-bebas)] ${language === "ne"
                                ? "text-3xl font-semibold leading-[1.15] tracking-normal md:text-5xl lg:text-6xl"
                                : "text-3xl font-black leading-[0.96] tracking-tight md:text-5xl lg:text-6xl"
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
