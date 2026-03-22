"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    AlignLeft,
    ArrowLeft,
    ArrowRight,
    Calendar,
    Check,
    Clock3,
    Globe,
    Link2,
    ListTree,
    Pause,
    Play,
    Share2,
    Settings2,
    Square,
    Type,
    User,
    Volume2,
    X,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IArticle } from "@/models/Article";
import { cn } from "@/lib/utils";

interface ArticleDetailProps {
    article: IArticle;
    relatedArticles?: IArticle[];
}

interface TocHeading {
    id: string;
    text: string;
    level: 2 | 3;
}

interface NewspaperSection {
    id: string;
    title: string;
    level: 2 | 3 | 0;
    headingHtml: string | null;
    blocks: string[];
}

type ReaderFontSize = "sm" | "md" | "lg" | "xl";
type ReaderFontFamily = "sans" | "serif" | "mono";
type ReaderLineHeight = "tight" | "normal" | "relaxed";
type ReaderMelody = "off" | "melody1" | "melody2" | "melody3" | "melody4";
type ReaderSpeechState = "idle" | "playing" | "paused";

const READER_MELODY_OPTIONS: Array<{
    id: ReaderMelody;
    src: string | null;
    labelEn: string;
    labelNe: string;
}> = [
    { id: "off", src: null, labelEn: "Off", labelNe: "बन्द" },
    { id: "melody1", src: "/reader-melody/melody1.mp3", labelEn: "Melody 1", labelNe: "धुन १" },
    { id: "melody2", src: "/reader-melody/melody2.mp3", labelEn: "Melody 2", labelNe: "धुन २" },
    { id: "melody3", src: "/reader-melody/melody3.mp3", labelEn: "Melody 3", labelNe: "धुन ३" },
    { id: "melody4", src: "/reader-melody/melody4.mp3", labelEn: "Melody 4", labelNe: "धुन ४" },
];

const READER_TTS_RATE_OPTIONS = [
    { id: 0.85, labelEn: "0.85x", labelNe: "०.८५x" },
    { id: 1, labelEn: "1x", labelNe: "१x" },
    { id: 1.2, labelEn: "1.2x", labelNe: "१.२x" },
] as const;

const stripHtml = (value: string) =>
    value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const estimateReadTime = (text: string) => {
    const words = stripHtml(text).split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(words / 210));
};

const anchorBase = (value: string) => {
    const normalized = stripHtml(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    return normalized || "section";
};

const extractContentWithAnchors = (rawHtml: string, language: "en" | "ne") => {
    const toc: TocHeading[] = [];
    let headingCounter = 0;

    const html = rawHtml.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_, tag: string, attrs: string, inner: string) => {
        headingCounter += 1;
        const level: 2 | 3 = tag.toLowerCase() === "h2" ? 2 : 3;
        const text = stripHtml(inner) || (language === "en" ? `Section ${headingCounter}` : `खण्ड ${headingCounter}`);
        const id = `article-sec-${headingCounter}-${anchorBase(text).slice(0, 32)}`;
        const attrsWithoutId = String(attrs).replace(/\sid\s*=\s*(".*?"|'.*?'|[^\s>]+)/i, "");

        toc.push({ id, text, level });
        return `<${tag}${attrsWithoutId} id="${id}">${inner}</${tag}>`;
    });

    return { html, toc };
};

const extractNewspaperSections = (html: string, language: "en" | "ne") => {
    const sections: NewspaperSection[] = [];
    let current: NewspaperSection = {
        id: "section-intro",
        title: language === "en" ? "Lead" : "मुख्य भाग",
        level: 0,
        headingHtml: null,
        blocks: [],
    };

    const blockRegex =
        /<(h[23])\b[^>]*>[\s\S]*?<\/\1>|<p\b[^>]*>[\s\S]*?<\/p>|<ul\b[^>]*>[\s\S]*?<\/ul>|<ol\b[^>]*>[\s\S]*?<\/ol>|<blockquote\b[^>]*>[\s\S]*?<\/blockquote>|<figure\b[^>]*>[\s\S]*?<\/figure>|<img\b[^>]*>|<iframe\b[^>]*>[\s\S]*?<\/iframe>|<video\b[^>]*>[\s\S]*?<\/video>/gi;

    const flush = () => {
        if (!current.headingHtml && !current.blocks.length) return;
        if (current.headingHtml && !current.blocks.length) return;
        sections.push(current);
    };

    const matches = html.match(blockRegex) || [];
    matches.forEach((block) => {
        const headingMatch = block.match(/^<h([23])\b/i);
        if (headingMatch) {
            flush();

            const level = Number(headingMatch[1]) as 2 | 3;
            const idMatch = block.match(/\sid=["']([^"']+)["']/i);
            const text = stripHtml(block) || (language === "en" ? "Section" : "खण्ड");

            current = {
                id: idMatch?.[1] || `section-${sections.length + 1}`,
                title: text,
                level,
                headingHtml: block,
                blocks: [],
            };
            return;
        }

        const cleaned = stripHtml(block);
        const hasMedia = /<img\b|<iframe\b|<video\b|<figure\b/i.test(block);
        if (!cleaned && !hasMedia) return;
        current.blocks.push(block);
    });

    flush();

    if (!sections.length) {
        return [
            {
                id: "section-fallback",
                title: language === "en" ? "Article" : "लेख",
                level: 0 as const,
                headingHtml: null,
                blocks: html ? [html] : [],
            },
        ];
    }

    return sections;
};

const FONT_SIZE_CLASS: Record<ReaderFontSize, string> = {
    sm: "text-[1rem]",
    md: "text-[1.08rem]",
    lg: "text-[1.16rem]",
    xl: "text-[1.24rem]",
};

const FONT_FAMILY_CLASS: Record<ReaderFontFamily, string> = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
};

const LINE_HEIGHT_CLASS: Record<ReaderLineHeight, string> = {
    tight: "leading-7",
    normal: "leading-[1.9]",
    relaxed: "leading-[2.05]",
};

interface ReaderWaveToggleProps {
    ariaLabel: string;
    open: boolean;
    onToggle: () => void;
}

const ReaderWaveToggle = forwardRef<HTMLButtonElement, ReaderWaveToggleProps>(function ReaderWaveToggle(
    { ariaLabel, open, onToggle },
    ref
) {
    const shouldReduceMotion = useReducedMotion();
    const waveCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = waveCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const PI2 = Math.PI * 2;
        const HALF_PI = Math.PI / 2;
        const speed = 8;

        let dpr = 1;
        let width = 1;
        let height = 1;
        let yAxis = 0;
        let waveWidth = 1;
        let waveLeft = 0;
        let time = 0;
        let raf = 0;

        type WaveLine = {
            timeModifier: number;
            lineWidth: number;
            amplitude: number;
            wavelength: number;
            segmentLength: number;
            strokeStyle: string | CanvasGradient;
        };

        let waves: WaveLine[] = [];

        const ease = (percent: number, amplitude: number) => amplitude * (Math.sin(percent * PI2 - HALF_PI) + 1) * 0.5;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = Math.max(1, Math.round(rect.width * dpr));
            height = Math.max(1, Math.round(rect.height * dpr));
            canvas.width = width;
            canvas.height = height;

            yAxis = height / 2;
            waveWidth = width * 0.98;
            waveLeft = width * 0.025;

            const amplitude = Math.max(height * 0.14, 2);
            const wavelength = Math.max(width * 0.078, 4.5);
            const segment = Math.max(width * 0.01, 2);
            const gradient = ctx.createLinearGradient(0, 0, width, 0);

            gradient.addColorStop(0, "rgba(183,28,28,0)");
            gradient.addColorStop(0.5, shouldReduceMotion ? "rgba(183,28,28,0.56)" : "rgba(183,28,28,0.78)");
            gradient.addColorStop(1, "rgba(183,28,28,0)");

            waves = [
                {
                    timeModifier: 1,
                    lineWidth: 1.65,
                    amplitude,
                    wavelength,
                    segmentLength: segment,
                    strokeStyle: gradient,
                },
                {
                    timeModifier: 1.6,
                    lineWidth: 1.3,
                    amplitude,
                    wavelength: wavelength * 0.42,
                    segmentLength: segment * 0.58,
                    strokeStyle: gradient,
                },
                {
                    timeModifier: 1.2,
                    lineWidth: 1.05,
                    amplitude: -amplitude,
                    wavelength: wavelength * 0.2,
                    segmentLength: segment * 0.58,
                    strokeStyle: gradient,
                },
                {
                    timeModifier: 1.45,
                    lineWidth: 0.9,
                    amplitude: -amplitude * 0.67,
                    wavelength: wavelength * 0.36,
                    segmentLength: segment * 0.58,
                    strokeStyle: gradient,
                },
            ];
        };

        const drawWave = (wave: WaveLine) => {
            const segmentLength = Math.max(Math.round(wave.segmentLength), 1);
            ctx.lineWidth = wave.lineWidth * dpr;
            ctx.strokeStyle = wave.strokeStyle;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(0, yAxis);
            ctx.lineTo(waveLeft, yAxis);

            for (let i = 0; i < waveWidth; i += segmentLength) {
                const x = time * speed * wave.timeModifier + (-yAxis + i) / wave.wavelength;
                const y = Math.sin(x);
                const waveAmplitude = ease(i / waveWidth, wave.amplitude);
                ctx.lineTo(i + waveLeft, yAxis + waveAmplitude * y);
            }

            ctx.lineTo(width, yAxis);
            ctx.stroke();
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            waves.forEach(drawWave);
        };

        const loop = () => {
            time -= 0.007;
            draw();
            raf = window.requestAnimationFrame(loop);
        };

        const handleResize = () => {
            resize();
            draw();
        };

        resize();
        draw();
        window.addEventListener("resize", handleResize);

        if (shouldReduceMotion) {
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }

        raf = window.requestAnimationFrame(loop);

        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener("resize", handleResize);
        };
    }, [shouldReduceMotion]);

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.22 }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"
        >
            <Button
                ref={ref}
                type="button"
                onClick={onToggle}
                size="lg"
                className={cn(
                    "relative h-12 w-[132px] rounded-full border border-[var(--np-reader-border-strong)] bg-[var(--np-reader-surface)] p-[5px] text-[var(--np-reader-ink)] shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition-all hover:scale-[1.015] hover:bg-[var(--np-reader-surface-2)]",
                    open && "ring-2 ring-[var(--np-accent)] shadow-[0_16px_34px_rgba(183,28,28,0.24)]"
                )}
                aria-label={ariaLabel}
            >
                <span className="relative block h-full w-full overflow-hidden rounded-full border border-[var(--np-reader-border)] bg-[var(--np-reader-surface-2)]">
                    <canvas ref={waveCanvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_72%)]" />
                    <span className="pointer-events-none absolute inset-y-[4px] left-1/2 w-[66%] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
                </span>
            </Button>
        </motion.div>
    );
});

export function ArticleDetail({ article, relatedArticles = [] }: ArticleDetailProps) {
    const { language } = useLanguage();
    const shouldReduceMotion = useReducedMotion();

    const articleBoundaryRef = useRef<HTMLDivElement>(null);
    const contentFrameRef = useRef<HTMLDivElement>(null);
    const readerToggleRef = useRef<HTMLButtonElement>(null);
    const readerDesktopPanelRef = useRef<HTMLElement>(null);
    const readerMobilePanelRef = useRef<HTMLElement>(null);
    const readerMusicAudioRef = useRef<HTMLAudioElement | null>(null);
    const readerSpeechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const readerMusicWasPlayingRef = useRef(false);

    const [contentLanguage, setContentLanguage] = useState<"en" | "ne">(language);
    const [hasLanguageOverride, setHasLanguageOverride] = useState(false);
    const [fontSize, setFontSize] = useState<ReaderFontSize>("md");
    const [fontFamily, setFontFamily] = useState<ReaderFontFamily>("sans");
    const [lineHeight, setLineHeight] = useState<ReaderLineHeight>("relaxed");
    const [readerMelody, setReaderMelody] = useState<ReaderMelody>("off");
    const [speechRate, setSpeechRate] = useState(1);
    const [speechState, setSpeechState] = useState<ReaderSpeechState>("idle");
    const [speechSupported, setSpeechSupported] = useState(false);
    const [showReaderTools, setShowReaderTools] = useState(false);
    const [showReaderToggle, setShowReaderToggle] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shared, setShared] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

    const displayLang = useMemo(() => {
        const primary = contentLanguage;
        const fallback = primary === 'en' ? 'ne' : 'en';
        
        const hasActualContent = (lang: 'en' | 'ne') => {
            const rawContent = article.content?.[lang] || '';
            const stripped = stripHtml(rawContent);
            const hasMedia = /<img|<iframe|<video|<figure/i.test(rawContent);
            return stripped.length > 0 || hasMedia;
        };

        if (hasActualContent(primary)) return primary;
        if (hasActualContent(fallback)) return fallback;
        return primary;
    }, [article.content, contentLanguage]);

    const isShowingFallback = useMemo(() => {
        const primary = contentLanguage;
        const fallback = primary === 'en' ? 'ne' : 'en';
        const rawContentPrimary = article.content?.[primary] || '';
        const strippedPrimary = stripHtml(rawContentPrimary);
        const hasMediaPrimary = /<img|<iframe|<video|<figure/i.test(rawContentPrimary);
        
        const rawContentFallback = article.content?.[fallback] || '';
        const strippedFallback = stripHtml(rawContentFallback);
        const hasMediaFallback = /<img|<iframe|<video|<figure/i.test(rawContentFallback);
        
        return !(strippedPrimary.length > 0 || hasMediaPrimary) && (strippedFallback.length > 0 || hasMediaFallback);
    }, [article.content, contentLanguage]);

    const title = article.title?.[displayLang] || article.title?.en || article.title?.ne || "";
    const content = article.content?.[displayLang] || article.content?.en || article.content?.ne || "";
    const excerpt = article.excerpt?.[displayLang] || article.excerpt?.en || article.excerpt?.ne || "";
    const author = article.author?.[displayLang] || article.author?.en || article.author?.ne || "";
    const category = article.category?.[displayLang] || article.category?.en || article.category?.ne || "";
    const image = article.image || "https://placehold.co/1920x1080/png?text=Article";

    const publishedAt = new Date(article.publishedDate);
    const locale = contentLanguage === "en" ? "en-US" : "ne-NP";
    const publishedDate = publishedAt.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const publicationDay = publishedAt.toLocaleDateString(locale, { weekday: "long" });
    const editionNo = String((publishedAt.getMonth() + 1) * 100 + publishedAt.getDate()).padStart(4, "0");

    const readingMinutes = useMemo(() => estimateReadTime(`${excerpt} ${content}`), [excerpt, content]);
    const wordCount = useMemo(() => stripHtml(content).split(" ").filter(Boolean).length, [content]);

    const { html: contentHtml, toc: tocHeadings } = useMemo(
        () => extractContentWithAnchors(content, displayLang),
        [content, displayLang]
    );

    const leadParagraphs = useMemo(() => {
        if (excerpt) {
            return excerpt.split('\n').map(p => stripHtml(p).trim()).filter(Boolean);
        }
        const text = stripHtml(contentHtml);
        return [text.slice(0, 250) + "..."].filter(t => t !== "...");
    }, [excerpt, contentHtml]);

    const sectionCount = tocHeadings.length;

    const speechText = useMemo(() => {
        return [title, excerpt, stripHtml(contentHtml)]
            .map((entry) => entry.trim())
            .filter(Boolean)
            .join(". ");
    }, [title, excerpt, contentHtml]);

    useEffect(() => {
        const audio = new Audio();
        audio.preload = "none";
        audio.loop = true;
        audio.volume = 0.22;
        readerMusicAudioRef.current = audio;

        return () => {
            audio.pause();
            audio.removeAttribute("src");
            readerMusicAudioRef.current = null;
        };
    }, []);

    useEffect(() => {
        const savedSize = localStorage.getItem("article_reader_font_size_v4");
        const savedFamily = localStorage.getItem("article_reader_font_family_v4");
        const savedLineHeight = localStorage.getItem("article_reader_line_height_v4");
        const savedLangOverride = localStorage.getItem("article_reader_lang_override_v4");
        const savedMelody = localStorage.getItem("article_reader_melody_v1");
        const savedSpeechRate = localStorage.getItem("article_reader_tts_rate_v1");

        if (savedSize === "sm" || savedSize === "md" || savedSize === "lg" || savedSize === "xl") setFontSize(savedSize);
        if (savedFamily === "sans" || savedFamily === "serif" || savedFamily === "mono") setFontFamily(savedFamily);
        if (savedLineHeight === "tight" || savedLineHeight === "normal" || savedLineHeight === "relaxed") setLineHeight(savedLineHeight);

        if (savedLangOverride === "en" || savedLangOverride === "ne") {
            setContentLanguage(savedLangOverride);
            setHasLanguageOverride(true);
        }
        if (savedMelody && READER_MELODY_OPTIONS.some((option) => option.id === savedMelody)) {
            setReaderMelody(savedMelody as ReaderMelody);
        }
        if (savedSpeechRate) {
            const parsedRate = Number(savedSpeechRate);
            if (READER_TTS_RATE_OPTIONS.some((option) => option.id === parsedRate)) {
                setSpeechRate(parsedRate);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("article_reader_font_size_v4", fontSize);
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem("article_reader_font_family_v4", fontFamily);
    }, [fontFamily]);

    useEffect(() => {
        localStorage.setItem("article_reader_line_height_v4", lineHeight);
    }, [lineHeight]);

    useEffect(() => {
        localStorage.setItem("article_reader_melody_v1", readerMelody);
    }, [readerMelody]);

    useEffect(() => {
        localStorage.setItem("article_reader_tts_rate_v1", String(speechRate));
    }, [speechRate]);

    useEffect(() => {
        if (hasLanguageOverride) {
            localStorage.setItem("article_reader_lang_override_v4", contentLanguage);
            return;
        }
        localStorage.removeItem("article_reader_lang_override_v4");
    }, [contentLanguage, hasLanguageOverride]);

    useEffect(() => {
        if (!hasLanguageOverride) setContentLanguage(language);
    }, [language, hasLanguageOverride]);

    useEffect(() => {
        const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
        setSpeechSupported(supported);

        return () => {
            if (!supported) return;
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        const audio = readerMusicAudioRef.current;
        if (!audio) return;

        const selectedMelody = READER_MELODY_OPTIONS.find((option) => option.id === readerMelody);
        if (!selectedMelody?.src) {
            audio.pause();
            audio.currentTime = 0;
            audio.removeAttribute("src");
            readerMusicWasPlayingRef.current = false;
            return;
        }

        if (typeof window !== "undefined") {
            const currentSrc = audio.getAttribute("src");
            if (currentSrc !== selectedMelody.src) {
                audio.src = selectedMelody.src;
            }
        }

        const speechIsActive = typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
        if (speechIsActive) {
            readerMusicWasPlayingRef.current = true;
            return;
        }

        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => {
                // Ignore autoplay blocking; user can trigger playback from settings.
            });
        }
    }, [readerMelody]);

    useEffect(() => {
        const footerNode = document.querySelector("footer");

        const updateProgress = () => {
            const node = contentFrameRef.current;
            const boundary = articleBoundaryRef.current;

            if (!node || !boundary) {
                setReadProgress(0);
                setShowReaderToggle(false);
                return;
            }

            const rect = node.getBoundingClientRect();
            const viewport = window.innerHeight || 1;
            const total = Math.max(rect.height, 1);
            const seen = Math.max(0, viewport - rect.top);
            const ratio = Math.max(0, Math.min(1, seen / total));
            const boundaryRect = boundary.getBoundingClientRect();
            const footerRect = footerNode?.getBoundingClientRect();
            const isInsideBoundary = boundaryRect.top < viewport - 88 && boundaryRect.bottom > 120;
            const isFooterVisible = Boolean(footerRect && footerRect.top < viewport - 8 && footerRect.bottom > 0);

            setReadProgress(Math.round(ratio * 100));
            setShowReaderToggle(isInsideBoundary && !isFooterVisible);
        };

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);

        return () => {
            window.removeEventListener("scroll", updateProgress);
            window.removeEventListener("resize", updateProgress);
        };
    }, [contentHtml, fontSize, fontFamily, lineHeight]);

    useEffect(() => {
        if (!showReaderToggle && showReaderTools) {
            setShowReaderTools(false);
        }
    }, [showReaderToggle, showReaderTools]);

    useEffect(() => {
        const root = contentFrameRef.current;
        if (!root) return;

        const headingNodes = Array.from(root.querySelectorAll("h2[id], h3[id]")) as HTMLElement[];
        if (!headingNodes.length) {
            setActiveHeadingId(null);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]) setActiveHeadingId((visible[0].target as HTMLElement).id);
            },
            {
                root: null,
                rootMargin: "-18% 0px -62% 0px",
                threshold: [0, 0.2, 0.45, 0.7],
            }
        );

        headingNodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [contentHtml, fontSize, fontFamily, lineHeight]);

    useEffect(() => {
        if (!showReaderTools) return;
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setShowReaderTools(false);
        };
        window.addEventListener("keydown", onEscape);
        return () => window.removeEventListener("keydown", onEscape);
    }, [showReaderTools]);

    useEffect(() => {
        if (!showReaderTools) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (!target) return;

            const clickedToggle = readerToggleRef.current?.contains(target);
            const clickedDesktopPanel = readerDesktopPanelRef.current?.contains(target);
            const clickedMobilePanel = readerMobilePanelRef.current?.contains(target);

            if (clickedToggle || clickedDesktopPanel || clickedMobilePanel) return;
            setShowReaderTools(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [showReaderTools]);

    const copyCurrentLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
        } catch {
            setCopied(false);
        }
    };

    const jumpToHeading = (id: string) => {
        const node = document.getElementById(id);
        if (!node) return;

        const top = node.getBoundingClientRect().top + window.scrollY - 112;
        window.scrollTo({ top, behavior: "smooth" });
    };

    const toggleReaderLanguage = () => {
        setHasLanguageOverride(true);
        setContentLanguage((prev) => (prev === "en" ? "ne" : "en"));
    };

    const pauseReaderMusicForSpeech = () => {
        const audio = readerMusicAudioRef.current;
        if (!audio || readerMelody === "off" || audio.paused) {
            readerMusicWasPlayingRef.current = false;
            return;
        }

        audio.pause();
        readerMusicWasPlayingRef.current = true;
    };

    const resumeReaderMusicAfterSpeech = () => {
        if (!readerMusicWasPlayingRef.current || readerMelody === "off") return;

        const audio = readerMusicAudioRef.current;
        if (!audio) {
            readerMusicWasPlayingRef.current = false;
            return;
        }

        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => {
                // Ignore playback errors (e.g., autoplay policy).
            });
        }
        readerMusicWasPlayingRef.current = false;
    };

    const resolvePreferredVoice = (voices: SpeechSynthesisVoice[]) => {
        if (!voices.length) return null;
        const preferredPrefix = contentLanguage === "ne" ? "ne" : "en";

        const exactMatch = voices.find((voice) => voice.lang.toLowerCase() === (contentLanguage === "ne" ? "ne-np" : "en-us"));
        if (exactMatch) return exactMatch;

        const prefixMatch = voices.find((voice) => voice.lang.toLowerCase().startsWith(preferredPrefix));
        if (prefixMatch) return prefixMatch;

        return voices[0];
    };

    const stopReaderSpeech = (shouldResumeMusic = true) => {
        if (!speechSupported || typeof window === "undefined") return;

        const synth = window.speechSynthesis;
        synth.cancel();
        readerSpeechUtteranceRef.current = null;
        setSpeechState("idle");

        if (shouldResumeMusic) {
            resumeReaderMusicAfterSpeech();
        }
    };

    const toggleReaderSpeech = () => {
        if (!speechSupported || contentLanguage !== "en" || typeof window === "undefined") return;

        const synth = window.speechSynthesis;
        if (speechState === "playing" && synth.speaking) {
            synth.pause();
            setSpeechState("paused");
            return;
        }

        if (speechState === "paused" && synth.paused) {
            synth.resume();
            setSpeechState("playing");
            return;
        }

        const narration = speechText.trim();
        if (!narration) return;

        synth.cancel();
        pauseReaderMusicForSpeech();

        const utterance = new SpeechSynthesisUtterance(narration);
        const voices = synth.getVoices();
        const voice = resolvePreferredVoice(voices);
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = "en-US";
        }
        utterance.rate = speechRate;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onstart = () => setSpeechState("playing");
        utterance.onpause = () => setSpeechState("paused");
        utterance.onresume = () => setSpeechState("playing");
        utterance.onend = () => {
            readerSpeechUtteranceRef.current = null;
            setSpeechState("idle");
            resumeReaderMusicAfterSpeech();
        };
        utterance.onerror = () => {
            readerSpeechUtteranceRef.current = null;
            setSpeechState("idle");
            resumeReaderMusicAfterSpeech();
        };

        readerSpeechUtteranceRef.current = utterance;
        synth.speak(utterance);
    };

    useEffect(() => {
        if (contentLanguage === "en" || !speechSupported || typeof window === "undefined") return;

        const synth = window.speechSynthesis;
        if (!(synth.speaking || synth.paused)) return;

        synth.cancel();
        readerSpeechUtteranceRef.current = null;
        setSpeechState("idle");

        if (!readerMusicWasPlayingRef.current || readerMelody === "off") return;
        const audio = readerMusicAudioRef.current;
        if (!audio) {
            readerMusicWasPlayingRef.current = false;
            return;
        }
        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => {
                // Ignore playback errors (e.g., autoplay policy).
            });
        }
        readerMusicWasPlayingRef.current = false;
    }, [contentLanguage, speechSupported, readerMelody]);

    const setReaderMelodyPreference = (melodyId: ReaderMelody) => {
        setReaderMelody(melodyId);

        const audio = readerMusicAudioRef.current;
        if (!audio) return;

        const selectedMelody = READER_MELODY_OPTIONS.find((option) => option.id === melodyId);
        if (!selectedMelody?.src) {
            audio.pause();
            audio.currentTime = 0;
            audio.removeAttribute("src");
            readerMusicWasPlayingRef.current = false;
            return;
        }

        const currentSrc = audio.getAttribute("src");
        if (currentSrc !== selectedMelody.src) {
            audio.src = selectedMelody.src;
        }

        const speechIsActive = typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
        if (speechIsActive) {
            readerMusicWasPlayingRef.current = true;
            return;
        }

        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => {
                // Ignore playback errors (e.g., autoplay policy).
            });
        }
    };

    const shareCurrentLink = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title,
                    text: excerpt || title,
                    url: window.location.href,
                });
                setShared(true);
                window.setTimeout(() => setShared(false), 1400);
                return;
            }

            await navigator.clipboard.writeText(window.location.href);
            setShared(true);
            window.setTimeout(() => setShared(false), 1400);
        } catch {
            setShared(false);
        }
    };

    const readerOptionBaseClass =
        "border-[var(--np-reader-border)] bg-[var(--np-reader-surface-2)] text-[var(--np-reader-muted)] hover:bg-[var(--np-reader-hover)] hover:text-[var(--np-reader-ink)]";
    const readerOptionActiveClass = "border-[var(--np-accent)] bg-[var(--np-accent-soft)] text-[var(--np-accent)]";
    const ttsEnabled = speechSupported && contentLanguage === "en";
    const speechToggleLabel =
        speechState === "playing"
            ? language === "en"
                ? "Pause"
                : "पज"
            : speechState === "paused"
                ? language === "en"
                    ? "Resume"
                    : "जारी"
                : language === "en"
                    ? "Play"
                    : "प्ले";

    return (
        <article className="newspaper-page min-h-screen">
            <div className="fixed inset-x-0 top-[68px] z-50 h-[3px] bg-[var(--np-rule-soft)]">
                <motion.div
                    className="h-full bg-[var(--np-accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${readProgress}%` }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                />
            </div>

            <div className="np-canvas">
                <div className="np-wrap mx-auto max-w-[1460px] px-3 pb-12 pt-5 sm:px-4 sm:pt-7 lg:px-6">
                    <div
                        ref={articleBoundaryRef}
                        className="np-frame relative overflow-hidden border border-[var(--np-rule)] bg-[var(--np-paper)] shadow-[var(--np-frame-shadow)]"
                    >
                        <header className="np-utility border-b border-[var(--np-rule)] px-4 py-3 sm:px-6">
                            <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
                                <Link
                                    href="/articles"
                                    className="justify-self-start inline-flex min-h-10 items-center gap-2 border border-[var(--np-rule)] bg-[var(--np-paper-soft)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--np-ink)] transition-colors hover:border-[var(--np-accent)] hover:text-[var(--np-accent)]"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {language === "en" ? "Back to Articles" : "लेख सूचीमा फर्कनुहोस्"}
                                </Link>

                                <div className="justify-self-center flex flex-wrap items-center justify-center gap-2">
                                    <span className="np-meta">{language === "en" ? "Independent Journal" : "स्वतन्त्र जर्नल"}</span>
                                    <span className="np-dot" />
                                    <span className="np-meta">{language === "en" ? `No. ${editionNo}` : `क्र. ${editionNo}`}</span>
                                </div>

                                <div className="justify-self-end flex flex-wrap items-center justify-end gap-2">
                                    <span className="np-meta">{publicationDay}</span>
                                    <span className="np-dot" />
                                    <span className="np-meta">{publishedDate}</span>
                                </div>
                            </div>
                        </header>

                        <section className="np-nameplate border-b border-[var(--np-rule)] px-4 py-5 sm:px-6">
                            <p className="np-masthead">{language === "en" ? "THE LEADERS TIMES" : "द लिडर्स टाइम्स"}</p>
                            <p className="np-subhead">{language === "en" ? "Political Ledger And Public Analysis" : "राजनीतिक अभिलेख र सार्वजनिक विश्लेषण"}</p>
                        </section>

                        <section className="border-b border-[var(--np-rule)]">
                            <figure className="relative w-full border-b border-[var(--np-rule)] bg-[var(--np-paper-soft)] flex justify-center items-center overflow-hidden">
                                <img src={image} alt={title || "Article"} className="w-full h-auto max-h-[85vh] object-contain saturate-100 contrast-100" />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.0)_70%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />
                            </figure>

                            <article className="np-lead p-6 sm:p-8 lg:p-12 xl:px-16 mx-auto max-w-[100ch]">
                                {isShowingFallback && (
                                    <div className="mb-6 w-full border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs sm:text-sm font-mono tracking-wide text-amber-700 dark:text-amber-400">
                                        {contentLanguage === 'en' 
                                            ? "The English version of this article is currently unavailable. Displaying the Nepali version instead."
                                            : "यस लेखको नेपाली संस्करण हाल उपलब्ध छैन। अङ्ग्रेजी संस्करण देखाइएको छ।"}
                                    </div>
                                )}
                                <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                                    <Badge variant="secondary" className="rounded-none border border-[var(--np-accent)] bg-[color:var(--np-accent-soft)] px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--np-accent)]">
                                        {category}
                                    </Badge>
                                    <span className="np-dot" />
                                    <span className="np-meta inline-flex items-center gap-1.5 text-sm">
                                        <User className="h-4 w-4 text-[var(--np-accent)]" />
                                        {author}
                                    </span>
                                    <span className="np-dot" />
                                    <span className="np-meta inline-flex items-center gap-1.5 text-sm">
                                        <Clock3 className="h-4 w-4 text-[var(--np-accent)]" />
                                        {readingMinutes} {language === "en" ? "min" : "मिनेट"}
                                    </span>
                                </div>

                                <h1 className="np-headline text-center text-4xl sm:text-5xl lg:text-6xl mb-8 leading-tight">{title}</h1>

                                <div className="np-lede mt-6 text-center text-lg sm:text-xl leading-relaxed text-[var(--np-ink-soft)] font-medium max-w-[80ch] mx-auto">
                                    {leadParagraphs.map((paragraph, idx) => (
                                        <p key={`${idx}-${paragraph.slice(0, 20)}`} className="mb-4 last:mb-0">{paragraph}</p>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-wrap justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={shareCurrentLink}
                                        className="inline-flex min-h-12 items-center gap-2 border border-[var(--np-rule)] bg-[var(--np-paper-soft)] px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-[var(--np-ink)] transition-colors hover:border-[var(--np-accent)] hover:text-[var(--np-accent)]"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        {shared
                                            ? language === "en"
                                                ? "Shared"
                                                : "सेयर भयो"
                                            : language === "en"
                                                ? "Share"
                                                : "सेयर"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={copyCurrentLink}
                                        className="inline-flex min-h-12 items-center gap-2 border border-[var(--np-rule)] bg-[var(--np-paper-soft)] px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-[var(--np-ink)] transition-colors hover:border-[var(--np-accent)] hover:text-[var(--np-accent)]"
                                    >
                                        <Link2 className="h-4 w-4" />
                                        {copied
                                            ? language === "en"
                                                ? "Link Copied"
                                                : "लिङ्क कपी भयो"
                                            : language === "en"
                                                ? "Copy Link"
                                                : "लिङ्क कपी"}
                                    </button>
                                </div>
                            </article>
                        </section>

                        <section className="np-reading-grid grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
                            <main className="order-1 min-w-0 border-t border-[var(--np-rule)] xl:border-r xl:border-t-0">
                                <div
                                    ref={contentFrameRef}
                                    className={cn(
                                        "np-paper p-5 sm:p-8 lg:p-10",
                                        FONT_SIZE_CLASS[fontSize],
                                        FONT_FAMILY_CLASS[fontFamily],
                                        LINE_HEIGHT_CLASS[lineHeight]
                                    )}
                                >
                                    <div className="np-article-flow mx-auto max-w-[90ch]">
                                        <div className="np-section-block pt-4">
                                            <div className="np-section-columns grid grid-cols-1 gap-0">
                                                <div 
                                                    className="np-first-paragraph article-content prose prose-neutral prose-headings:scroll-mt-24 prose-headings:text-[var(--np-ink)] prose-strong:text-[var(--np-ink)] prose-a:text-[var(--np-accent)] prose-a:no-underline hover:prose-a:underline"
                                                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </main>

                            <aside className="order-2 border-t border-[var(--np-rule)] p-4 xl:max-h-[calc(100vh-108px)] xl:self-start xl:overflow-y-auto xl:border-t-0 xl:sticky xl:top-[92px]">
                                <div className="border border-[var(--np-rule)] bg-[var(--np-paper-soft)] p-4">
                                    <h2 className="np-right-title inline-flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-[var(--np-accent)]" />
                                        {language === "en" ? "Edition Index" : "संस्करण सूचक"}
                                    </h2>
                                    <div className="mt-3 space-y-2">
                                        <div className="np-index-row">
                                            <span>{language === "en" ? "Category" : "श्रेणी"}</span>
                                            <span>{category}</span>
                                        </div>
                                        <div className="np-index-row">
                                            <span>{language === "en" ? "Read Time" : "समय"}</span>
                                            <span>{readingMinutes}m</span>
                                        </div>
                                        <div className="np-index-row">
                                            <span>{language === "en" ? "Word Count" : "शब्द संख्या"}</span>
                                            <span>{wordCount.toLocaleString(locale)}</span>
                                        </div>
                                        <div className="np-index-row">
                                            <span>{language === "en" ? "Sections" : "खण्डहरू"}</span>
                                            <span>{sectionCount || "-"}</span>
                                        </div>
                                    </div>

                                    {article.tags?.length ? (
                                        <div className="mt-4">
                                            <p className="np-small-title mb-2">{language === "en" ? "Keywords" : "कुञ्जी शब्दहरू"}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {article.tags.slice(0, 6).map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="rounded-none border border-[var(--np-rule)] bg-[var(--np-paper)] text-[10px] uppercase tracking-[0.12em] text-[var(--np-ink)]"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {relatedArticles.length > 0 ? (
                                    <div className="mt-4 border border-[var(--np-rule)] bg-[var(--np-paper-soft)] p-4">
                                        <h2 className="np-right-title">{language === "en" ? "Related Articles" : "सम्बन्धित लेखहरू"}</h2>
                                        <div className="mt-4 space-y-3">
                                            {relatedArticles.slice(0, 4).map((item) => {
                                                const itemTitle = item.title?.[contentLanguage] || item.title?.en;
                                                const itemDate = new Date(item.publishedDate).toLocaleDateString(locale, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                });

                                                return (
                                                    <Link
                                                        key={item._id as string}
                                                        href={`/articles/${item.slug}`}
                                                        className="group block border border-[var(--np-rule)] bg-[var(--np-paper)] p-3 transition-colors hover:border-[var(--np-accent)]"
                                                    >
                                                        <p className="np-meta">{itemDate}</p>
                                                        <h3 className="mt-1 line-clamp-2 text-[1.02rem] text-[var(--np-ink)] transition-colors group-hover:text-[var(--np-accent)]">
                                                            {itemTitle}
                                                        </h3>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                        <Link
                                            href="/articles"
                                            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[var(--np-rule)] bg-[var(--np-paper)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--np-ink)] transition-colors hover:border-[var(--np-accent)] hover:text-[var(--np-accent)]"
                                        >
                                            {language === "en" ? "Browse All Articles" : "सबै लेख हेर्नुहोस्"}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                ) : null}

                                {tocHeadings.length > 0 ? (
                                    <div className="mt-4 border border-[var(--np-rule)] bg-[var(--np-paper-soft)] p-4">
                                        <h2 className="np-right-title inline-flex items-center gap-2">
                                            <ListTree className="h-4 w-4 text-[var(--np-accent)]" />
                                            {language === "en" ? "Sections" : "खण्डहरू"}
                                        </h2>
                                        <div className="mt-3 h-[320px] space-y-1.5 overflow-auto pr-1">
                                            {tocHeadings.map((heading) => (
                                                <button
                                                    key={heading.id}
                                                    type="button"
                                                    onClick={() => jumpToHeading(heading.id)}
                                                    className={cn(
                                                        "w-full border px-2.5 py-2 text-left text-[12px] leading-5 transition-colors",
                                                        heading.level === 3 ? "ml-2 w-[calc(100%-0.5rem)]" : "",
                                                        activeHeadingId === heading.id
                                                            ? "border-[var(--np-accent)] bg-[color:var(--np-accent-soft)] text-[var(--np-accent)]"
                                                            : "border-[var(--np-rule)] bg-[var(--np-paper)] text-[var(--np-ink)] hover:border-[var(--np-accent)] hover:text-[var(--np-accent)]"
                                                    )}
                                                >
                                                    {heading.text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </aside>
                        </section>
                    </div>
                </div>
            </div>

            {showReaderToggle ? (
                <ReaderWaveToggle
                    ref={readerToggleRef}
                    open={showReaderTools}
                    onToggle={() => setShowReaderTools((prev) => !prev)}
                    ariaLabel={language === "en" ? "Open reader settings" : "रीडर सेटिङ खोल्नुहोस्"}
                />
            ) : null}

            <AnimatePresence>
                {showReaderTools && showReaderToggle ? (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[58] bg-black/45 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReaderTools(false)}
                        />

                        <motion.section
                            ref={readerDesktopPanelRef}
                            initial={{ opacity: 0, y: 20, scaleY: 0.75 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: 16, scaleY: 0.75 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            style={{ transformOrigin: "50% 100%" }}
                            className="fixed bottom-24 left-1/2 z-[60] hidden w-[360px] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--np-reader-border)] bg-[var(--np-reader-surface)] text-[var(--np-reader-ink)] shadow-[0_24px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:block"
                        >
                            <div className="border-b border-[var(--np-reader-border)] p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="h-4 w-4 text-[var(--np-accent)]" />
                                        <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">
                                            {language === "en" ? "Reader Settings" : "रीडर सेटिङ"}
                                        </h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowReaderTools(false)}
                                        className="h-8 w-8 p-0 text-[var(--np-reader-muted)] hover:bg-[var(--np-reader-hover)] hover:text-[var(--np-reader-ink)]"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">
                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Type className="h-4 w-4 text-[var(--np-accent)]" />
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Font Size" : "अक्षर आकार"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: "sm", label: "A-" },
                                            { id: "md", label: "A" },
                                            { id: "lg", label: "A+" },
                                            { id: "xl", label: "A++" },
                                        ].map((sizeOption) => (
                                            <Button
                                                key={sizeOption.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFontSize(sizeOption.id as ReaderFontSize)}
                                                className={cn("h-9 px-0 text-[11px] font-medium", readerOptionBaseClass, fontSize === sizeOption.id && readerOptionActiveClass)}
                                            >
                                                {sizeOption.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <AlignLeft className="h-4 w-4 text-[var(--np-accent)]" />
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Font Family" : "फन्ट परिवार"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "sans", label: "Sans", className: "font-sans" },
                                            { id: "serif", label: "Serif", className: "font-serif" },
                                            { id: "mono", label: "Mono", className: "font-mono" },
                                        ].map((fontOption) => (
                                            <Button
                                                key={fontOption.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFontFamily(fontOption.id as ReaderFontFamily)}
                                                className={cn("h-9 text-[11px] font-medium", readerOptionBaseClass, fontFamily === fontOption.id && readerOptionActiveClass)}
                                            >
                                                <span className={fontOption.className}>{fontOption.label}</span>
                                                {fontFamily === fontOption.id ? <Check className="ml-1 h-3 w-3" /> : null}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Settings2 className="h-4 w-4 text-[var(--np-accent)]" />
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Line Spacing" : "लाइन स्पेसिङ"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "tight", label: language === "en" ? "Tight" : "घनिष्ट" },
                                            { id: "normal", label: language === "en" ? "Normal" : "सामान्य" },
                                            { id: "relaxed", label: language === "en" ? "Relaxed" : "फराकिलो" },
                                        ].map((spaceOption) => (
                                            <Button
                                                key={spaceOption.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setLineHeight(spaceOption.id as ReaderLineHeight)}
                                                className={cn("h-9 text-[11px] font-medium", readerOptionBaseClass, lineHeight === spaceOption.id && readerOptionActiveClass)}
                                            >
                                                {spaceOption.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Volume2 className="h-4 w-4 text-[var(--np-accent)]" />
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Reading Music" : "पठन सङ्गीत"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {READER_MELODY_OPTIONS.map((melodyOption) => (
                                            <Button
                                                key={melodyOption.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setReaderMelodyPreference(melodyOption.id)}
                                                className={cn("h-9 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass, readerMelody === melodyOption.id && readerOptionActiveClass)}
                                            >
                                                {language === "en" ? melodyOption.labelEn : melodyOption.labelNe}
                                                {readerMelody === melodyOption.id ? <Check className="ml-1 h-3 w-3" /> : null}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Play className="h-4 w-4 text-[var(--np-accent)]" />
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Text To Speech" : "टेक्स्ट टु स्पिच"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {READER_TTS_RATE_OPTIONS.map((rateOption) => (
                                            <Button
                                                key={rateOption.id}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSpeechRate(rateOption.id)}
                                                disabled={!ttsEnabled}
                                                className={cn("h-9 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass, speechRate === rateOption.id && readerOptionActiveClass)}
                                            >
                                                {language === "en" ? rateOption.labelEn : rateOption.labelNe}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={toggleReaderSpeech}
                                            disabled={!ttsEnabled}
                                            className={cn("h-9 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass, speechState !== "idle" && readerOptionActiveClass)}
                                        >
                                            {speechState === "playing" ? <Pause className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                                            {speechToggleLabel}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => stopReaderSpeech(true)}
                                            disabled={!ttsEnabled || speechState === "idle"}
                                            className={cn("h-9 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass)}
                                        >
                                            <Square className="mr-1 h-3 w-3" />
                                            {language === "en" ? "Stop" : "रोक्नुहोस्"}
                                        </Button>
                                    </div>
                                    {!speechSupported ? (
                                        <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Speech not supported on this browser" : "यो ब्राउजरमा स्पिच समर्थित छैन"}
                                        </p>
                                    ) : contentLanguage !== "en" ? (
                                        <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Text to speech is available only in English" : "टेक्स्ट टु स्पिच हाल अंग्रेजीमा मात्र उपलब्ध छ"}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-[var(--np-reader-border)] p-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={toggleReaderLanguage}
                                    className="h-10 w-full border-[var(--np-accent)] bg-[var(--np-accent-soft)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-accent)] hover:bg-[var(--np-accent)] hover:text-white"
                                >
                                    <Globe className="mr-1.5 h-3.5 w-3.5" />
                                    {contentLanguage === "en" ? "नेपालीमा पढ्नुहोस्" : "Read in English"}
                                </Button>
                                {hasLanguageOverride ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setHasLanguageOverride(false);
                                            setContentLanguage(language);
                                        }}
                                        className="h-9 w-full text-[11px] uppercase tracking-[0.12em] text-[var(--np-reader-muted)] hover:bg-[var(--np-reader-hover)] hover:text-[var(--np-reader-ink)]"
                                    >
                                        {language === "en" ? "Use App Language" : "एप भाषामा फर्कनुहोस्"}
                                    </Button>
                                ) : null}
                            </div>
                        </motion.section>

                        <motion.section
                            ref={readerMobilePanelRef}
                            initial={{ opacity: 0, y: 30, scaleY: 0.78 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: 24, scaleY: 0.78 }}
                            transition={{ duration: 0.26, ease: "easeOut" }}
                            style={{ transformOrigin: "50% 100%" }}
                            className="fixed bottom-0 left-0 right-0 z-[60] overflow-hidden rounded-t-2xl border-t border-[var(--np-reader-border)] bg-[var(--np-reader-surface)] text-[var(--np-reader-ink)] lg:hidden"
                        >
                            <div className="p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Settings2 className="h-5 w-5 text-[var(--np-accent)]" />
                                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">
                                            {language === "en" ? "Reader Settings" : "रीडर सेटिङ"}
                                        </h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowReaderTools(false)}
                                        className="h-8 w-8 p-0 text-[var(--np-reader-muted)] hover:bg-[var(--np-reader-hover)] hover:text-[var(--np-reader-ink)]"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Font Size" : "अक्षर आकार"}
                                        </p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: "sm", label: "A-" },
                                                { id: "md", label: "A" },
                                                { id: "lg", label: "A+" },
                                                { id: "xl", label: "A++" },
                                            ].map((sizeOption) => (
                                                <Button
                                                    key={sizeOption.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFontSize(sizeOption.id as ReaderFontSize)}
                                                    className={cn("h-10 text-xs font-medium", readerOptionBaseClass, fontSize === sizeOption.id && readerOptionActiveClass)}
                                                >
                                                    {sizeOption.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Font Family" : "फन्ट परिवार"}
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "sans", label: "Sans", className: "font-sans" },
                                                { id: "serif", label: "Serif", className: "font-serif" },
                                                { id: "mono", label: "Mono", className: "font-mono" },
                                            ].map((fontOption) => (
                                                <Button
                                                    key={fontOption.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFontFamily(fontOption.id as ReaderFontFamily)}
                                                    className={cn("h-10 text-xs font-medium", readerOptionBaseClass, fontFamily === fontOption.id && readerOptionActiveClass)}
                                                >
                                                    <span className={fontOption.className}>{fontOption.label}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            {language === "en" ? "Line Spacing" : "लाइन स्पेसिङ"}
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "tight", label: language === "en" ? "Tight" : "घनिष्ट" },
                                                { id: "normal", label: language === "en" ? "Normal" : "सामान्य" },
                                                { id: "relaxed", label: language === "en" ? "Relaxed" : "फराकिलो" },
                                            ].map((spaceOption) => (
                                                <Button
                                                    key={spaceOption.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setLineHeight(spaceOption.id as ReaderLineHeight)}
                                                    className={cn("h-10 text-xs font-medium", readerOptionBaseClass, lineHeight === spaceOption.id && readerOptionActiveClass)}
                                                >
                                                    {spaceOption.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            <Volume2 className="h-4 w-4 text-[var(--np-accent)]" />
                                            {language === "en" ? "Reading Music" : "पठन सङ्गीत"}
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {READER_MELODY_OPTIONS.map((melodyOption) => (
                                                <Button
                                                    key={melodyOption.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setReaderMelodyPreference(melodyOption.id)}
                                                    className={cn("h-10 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass, readerMelody === melodyOption.id && readerOptionActiveClass)}
                                                >
                                                    {language === "en" ? melodyOption.labelEn : melodyOption.labelNe}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-reader-muted)]">
                                            <Play className="h-4 w-4 text-[var(--np-accent)]" />
                                            {language === "en" ? "Text To Speech" : "टेक्स्ट टु स्पिच"}
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {READER_TTS_RATE_OPTIONS.map((rateOption) => (
                                                <Button
                                                    key={rateOption.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSpeechRate(rateOption.id)}
                                                    disabled={!ttsEnabled}
                                                    className={cn("h-10 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass, speechRate === rateOption.id && readerOptionActiveClass)}
                                                >
                                                    {language === "en" ? rateOption.labelEn : rateOption.labelNe}
                                                </Button>
                                            ))}
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleReaderSpeech}
                                                disabled={!ttsEnabled}
                                                className={cn("h-10 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass, speechState !== "idle" && readerOptionActiveClass)}
                                            >
                                                {speechState === "playing" ? <Pause className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                                                {speechToggleLabel}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => stopReaderSpeech(true)}
                                                disabled={!ttsEnabled || speechState === "idle"}
                                                className={cn("h-10 text-[10px] font-medium uppercase tracking-[0.08em]", readerOptionBaseClass)}
                                            >
                                                <Square className="mr-1 h-3 w-3" />
                                                {language === "en" ? "Stop" : "रोक्नुहोस्"}
                                            </Button>
                                        </div>
                                        {!speechSupported ? (
                                            <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[var(--np-reader-muted)]">
                                                {language === "en" ? "Speech not supported on this browser" : "यो ब्राउजरमा स्पिच समर्थित छैन"}
                                            </p>
                                        ) : contentLanguage !== "en" ? (
                                            <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[var(--np-reader-muted)]">
                                                {language === "en" ? "Text to speech is available only in English" : "टेक्स्ट टु स्पिच हाल अंग्रेजीमा मात्र उपलब्ध छ"}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="border-t border-[var(--np-reader-border)] pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={toggleReaderLanguage}
                                            className="h-10 w-full border-[var(--np-accent)] bg-[var(--np-accent-soft)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--np-accent)] hover:bg-[var(--np-accent)] hover:text-white"
                                        >
                                            <Globe className="mr-1.5 h-3.5 w-3.5" />
                                            {contentLanguage === "en" ? "नेपालीमा पढ्नुहोस्" : "Read in English"}
                                        </Button>
                                        {hasLanguageOverride ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                    setHasLanguageOverride(false);
                                                    setContentLanguage(language);
                                                }}
                                                className="mt-2 h-9 w-full text-[11px] uppercase tracking-[0.12em] text-[var(--np-reader-muted)] hover:bg-[var(--np-reader-hover)] hover:text-[var(--np-reader-ink)]"
                                            >
                                                {language === "en" ? "Use App Language" : "एप भाषामा फर्कनुहोस्"}
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </>
                ) : null}
            </AnimatePresence>

            <style jsx global>{`
                .newspaper-page {
                    --np-paper: #f6f0e3;
                    --np-paper-soft: #fbf7ef;
                    --np-ink: #191919;
                    --np-muted: #5a534b;
                    --np-rule: rgba(18, 18, 18, 0.25);
                    --np-rule-soft: rgba(18, 18, 18, 0.15);
                    --np-accent: #b71c1c;
                    --np-accent-soft: rgba(183, 28, 28, 0.12);
                    --np-frame-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
                    --np-canvas-radial-1: rgba(183, 28, 28, 0.08);
                    --np-canvas-radial-2: rgba(0, 0, 0, 0.06);
                    --np-canvas-stop-1: #fdf8ef;
                    --np-canvas-stop-2: #f4eddf;
                    --np-canvas-stop-3: #eee4d2;
                    --np-photo-overlay-start: rgba(20, 20, 20, 0.08);
                    --np-photo-overlay-end: rgba(20, 20, 20, 0.52);
                    --np-photo-caption-bg: rgba(245, 238, 224, 0.86);
                    --np-reader-surface: rgba(250, 246, 238, 0.96);
                    --np-reader-surface-2: rgba(255, 255, 255, 0.9);
                    --np-reader-hover: rgba(183, 28, 28, 0.08);
                    --np-reader-ink: #1c1b19;
                    --np-reader-muted: #62594f;
                    --np-reader-border: rgba(20, 18, 16, 0.2);
                    --np-reader-border-strong: rgba(20, 18, 16, 0.3);
                    color: var(--np-ink);
                }
                :root[data-theme="dark"] .newspaper-page,
                [data-theme="dark"] .newspaper-page,
                .dark .newspaper-page {
                    --np-paper: #13171c;
                    --np-paper-soft: #191f26;
                    --np-ink: #f2e7d2;
                    --np-muted: #b8ab97;
                    --np-rule: rgba(242, 231, 210, 0.2);
                    --np-rule-soft: rgba(242, 231, 210, 0.12);
                    --np-accent: #b71c1c;
                    --np-accent-soft: rgba(183, 28, 28, 0.2);
                    --np-frame-shadow: 0 16px 42px rgba(0, 0, 0, 0.48);
                    --np-canvas-radial-1: rgba(183, 28, 28, 0.18);
                    --np-canvas-radial-2: rgba(106, 136, 170, 0.14);
                    --np-canvas-stop-1: #0d1014;
                    --np-canvas-stop-2: #121821;
                    --np-canvas-stop-3: #1a232f;
                    --np-photo-overlay-start: rgba(9, 11, 13, 0.24);
                    --np-photo-overlay-end: rgba(6, 8, 10, 0.72);
                    --np-photo-caption-bg: rgba(14, 18, 22, 0.86);
                    --np-reader-surface: rgba(19, 19, 19, 0.96);
                    --np-reader-surface-2: rgba(28, 28, 28, 0.92);
                    --np-reader-hover: rgba(255, 255, 255, 0.08);
                    --np-reader-ink: #f4f4f4;
                    --np-reader-muted: #bebebe;
                    --np-reader-border: rgba(255, 255, 255, 0.14);
                    --np-reader-border-strong: rgba(255, 255, 255, 0.24);
                }
                .np-canvas {
                    min-height: 100vh;
                    background:
                        radial-gradient(circle at 14% -4%, var(--np-canvas-radial-1), transparent 40%),
                        radial-gradient(circle at 84% 12%, var(--np-canvas-radial-2), transparent 42%),
                        linear-gradient(180deg, var(--np-canvas-stop-1) 0%, var(--np-canvas-stop-2) 55%, var(--np-canvas-stop-3) 100%);
                }
                .np-meta {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    font-size: 10px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: var(--np-muted);
                }
                .np-dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 999px;
                    background: var(--np-accent);
                }
                .np-masthead {
                    font-family: var(--font-editorial), serif;
                    font-size: clamp(1.7rem, 3.8vw, 3.25rem);
                    line-height: 1.02;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    text-align: center;
                    color: var(--np-ink);
                }
                .np-subhead {
                    margin-top: 0.35rem;
                    font-family: var(--font-sans), sans-serif;
                    font-size: 0.92rem;
                    line-height: 1.5;
                    text-align: center;
                    color: var(--np-muted);
                }
                .np-front-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                }
                @media (min-width: 1024px) {
                    .np-front-grid {
                        grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
                    }
                }
                .np-small-title {
                    font-family: var(--font-editorial), serif;
                    font-size: 0.92rem;
                    line-height: 1.2;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: var(--np-ink);
                }
                .np-headline {
                    font-family: var(--font-editorial), serif;
                    font-size: clamp(2.2rem, 5.2vw, 4.6rem);
                    line-height: 0.99;
                    letter-spacing: -0.012em;
                    text-wrap: balance;
                    color: var(--np-ink);
                }
                .np-lede {
                    font-size: clamp(1rem, 1.36vw, 1.18rem);
                    line-height: 1.76;
                    color: var(--np-muted);
                }
                .np-lede p + p {
                    margin-top: 0.9rem;
                }
                .np-index-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.75rem;
                    border: 1px solid var(--np-rule);
                    background: var(--np-paper-soft);
                    padding: 0.52rem 0.64rem;
                    font-family: var(--font-sans), sans-serif;
                    font-size: 0.78rem;
                    line-height: 1.35;
                    color: var(--np-ink);
                }
                .np-paper {
                    background: var(--np-paper-soft);
                }
                .np-reading-grid {
                    align-items: start;
                }
                .np-article-flow {
                    display: grid;
                    gap: 2.1rem;
                }
                .np-section-block {
                    display: grid;
                    gap: 1rem;
                }
                .np-section-block .article-content > *:last-child {
                    margin-bottom: 0;
                }
                .np-section-block .article-content h2:first-child,
                .np-section-block .article-content h3:first-child {
                    margin-top: 0;
                }
                @media (min-width: 1024px) {
                    .np-section-columns > .article-content + .article-content {
                        border-left: 1px solid var(--np-rule-soft);
                        margin-left: 0.4rem;
                        padding-left: 1.6rem;
                    }
                }
                .article-content h2 {
                    margin-top: 2rem;
                    margin-bottom: 0.9rem;
                    font-size: clamp(1.55rem, 2.4vw, 2.2rem);
                    line-height: 1.2;
                    font-family: var(--font-editorial), serif;
                    color: var(--np-ink);
                }
                .article-content h3 {
                    margin-top: 1.45rem;
                    margin-bottom: 0.68rem;
                    font-size: clamp(1.18rem, 1.8vw, 1.5rem);
                    line-height: 1.24;
                    font-family: var(--font-editorial), serif;
                    color: var(--np-ink);
                }
                .article-content p {
                    margin-bottom: 1.2rem;
                    text-wrap: pretty;
                    color: var(--np-ink);
                }
                .np-first-paragraph p:first-of-type::first-letter {
                    float: left;
                    margin: 0.05rem 0.48rem 0 0;
                    font-size: clamp(1.95rem, 4.9vw, 2.85rem);
                    line-height: 0.94;
                    font-family: var(--font-editorial), serif;
                    font-weight: 700;
                    color: var(--np-accent);
                }
                .article-content ul,
                .article-content ol {
                    margin-bottom: 1.15rem;
                    padding-left: 1.35rem;
                }
                .article-content li {
                    margin-bottom: 0.42rem;
                    color: var(--np-ink);
                }
                .article-content blockquote {
                    margin: 1.65rem 0;
                    border-left: 3px solid var(--np-accent);
                    padding: 0.85rem 0 0.85rem 1rem;
                    background: var(--np-accent-soft);
                    color: var(--np-ink);
                }
                @media (max-width: 640px) {
                    .np-masthead {
                        font-size: clamp(1.35rem, 6vw, 2rem);
                    }
                    .np-headline {
                        font-size: clamp(1.95rem, 8.2vw, 2.95rem);
                        line-height: 1.05;
                    }
                    .article-content h2 {
                        margin-top: 1.32rem;
                        margin-bottom: 0.62rem;
                        font-size: 1.36rem;
                    }
                    .article-content h3 {
                        margin-top: 0.98rem;
                        margin-bottom: 0.55rem;
                        font-size: 1.12rem;
                    }
                    .np-first-paragraph p:first-of-type::first-letter {
                        margin-right: 0.34rem;
                        font-size: 2rem;
                    }
                }
            `}</style>
        </article>
    );
}
