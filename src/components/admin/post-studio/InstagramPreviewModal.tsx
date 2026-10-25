"use client";

import { useState, useRef, useEffect } from "react";
import { 
    Bookmark, 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    Copy, 
    Download, 
    Heart, 
    Instagram, 
    MessageCircle, 
    MoreHorizontal, 
    Pencil, 
    Send, 
    Sparkles, 
    X, 
    Wifi, 
    BatteryMedium 
} from "lucide-react";
import type { PostDraft } from "@/lib/post-studio/drafts";
import { Artwork } from "./Artwork";
import { generateInstagramCaption } from "@/lib/post-studio/carousel";
import styles from "./PostStudio.module.css";

interface InstagramPreviewModalProps {
    slides: PostDraft[];
    activeSlideIndex: number;
    onSelectSlide: (index: number) => void;
    onClose: () => void;
    onExportCurrent?: (index: number) => Promise<void>;
    onExportAll?: () => Promise<void>;
}

export default function InstagramPreviewModal({
    slides,
    activeSlideIndex,
    onSelectSlide,
    onClose,
    onExportCurrent,
    onExportAll,
}: InstagramPreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(
        Math.max(0, Math.min(activeSlideIndex, slides.length - 1))
    );
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expandedCaption, setExpandedCaption] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const currentSlide = slides[currentIndex] || slides[0];
    const design = currentSlide.design;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setCurrentIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === "ArrowRight") {
                setCurrentIndex(prev => Math.min(slides.length - 1, prev + 1));
            } else if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [slides.length, onClose]);

    const handleCopyCaption = async () => {
        try {
            const caption = generateInstagramCaption(slides);
            await navigator.clipboard.writeText(caption);
            setCopiedCaption(true);
            setTimeout(() => setCopiedCaption(false), 2500);
        } catch {
            // ignore
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (diff > 40 && currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (diff < -40 && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
        setTouchStart(null);
    };

    // Calculate dimensions
    const phoneWidth = 350;
    const isPortrait = design.format === "portrait";
    const isSquare = design.format === "square";
    const isStory = design.format === "story";
    const mediaHeight = isStory ? 520 : isPortrait ? 438 : isSquare ? 350 : 260;
    const scale = phoneWidth / 360;

    return (
        <div className={styles.instagramModalOverlay} role="dialog" aria-modal="true" aria-label="Instagram Feed Simulator">
            <div className={styles.instagramModalShell}>
                {/* Close Button Top Right */}
                <button 
                    type="button" 
                    className={styles.instagramModalClose} 
                    onClick={onClose}
                    aria-label="Close Instagram Preview"
                >
                    <X size={22} />
                </button>

                <div className={styles.instagramContentRow}>
                    {/* The Realistic Phone Mockup */}
                    <div className={styles.instagramPhoneWrapper}>
                        <div className={styles.instagramPhone}>
                            {/* Phone Notch / Island */}
                            <div className={styles.phoneDynamicIsland} />

                            {/* Phone Status Bar */}
                            <div className={styles.instagramStatusBar}>
                                <span>9:41</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Wifi size={13} />
                                    <BatteryMedium size={15} />
                                </div>
                            </div>

                            {/* Instagram App Header */}
                            <div className={styles.instagramAppHeader}>
                                <ChevronLeft size={22} className={styles.instagramHeaderBack} />
                                <div className={styles.instagramAppTitle}>
                                    <span>theleaders.press</span>
                                    <small>Posts</small>
                                </div>
                                <div style={{ width: 22 }} />
                            </div>

                            {/* Feed Post Header */}
                            <div className={styles.instagramPostHeader}>
                                <div className={styles.instagramAvatarRing}>
                                    <div className={styles.instagramAvatarInner}>
                                        <span className={styles.instagramAvatarText}>TL</span>
                                    </div>
                                </div>
                                <div className={styles.instagramHeaderMeta}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span className={styles.instagramUsername}>theleaders.press</span>
                                        <span className={styles.instagramVerifiedBadge}>✓</span>
                                    </div>
                                    <span className={styles.instagramLocation}>Kathmandu, Nepal</span>
                                </div>
                                <button type="button" className={styles.instagramMoreBtn}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            {/* Post Media Stage with Carousel */}
                            <div 
                                className={styles.instagramMediaStage}
                                style={{ width: phoneWidth, height: mediaHeight }}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div 
                                    className={styles.instagramArtworkWrapper}
                                    style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
                                >
                                    <Artwork design={design} />
                                </div>

                                {/* Slide Counter Badge (Top Right) */}
                                {slides.length > 1 && (
                                    <div className={styles.instagramCounterBadge}>
                                        {currentIndex + 1}/{slides.length}
                                    </div>
                                )}

                                {/* Prev / Next Floating Chevrons */}
                                {slides.length > 1 && currentIndex > 0 && (
                                    <button
                                        type="button"
                                        className={styles.instagramMediaNavLeft}
                                        onClick={() => setCurrentIndex(prev => prev - 1)}
                                        aria-label="Previous Slide"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                )}
                                {slides.length > 1 && currentIndex < slides.length - 1 && (
                                    <button
                                        type="button"
                                        className={styles.instagramMediaNavRight}
                                        onClick={() => setCurrentIndex(prev => prev + 1)}
                                        aria-label="Next Slide"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Action Bar (Heart, Comment, Share, Dots, Bookmark) */}
                            <div className={styles.instagramActionBar}>
                                <div className={styles.instagramActionLeft}>
                                    <button 
                                        type="button" 
                                        className={styles.instagramActionIcon}
                                        onClick={() => setLiked(!liked)}
                                        aria-label={liked ? "Unlike" : "Like"}
                                    >
                                        <Heart 
                                            size={22} 
                                            color={liked ? "#ED4956" : "#262626"} 
                                            fill={liked ? "#ED4956" : "none"} 
                                        />
                                    </button>
                                    <button type="button" className={styles.instagramActionIcon} aria-label="Comment">
                                        <MessageCircle size={22} color="#262626" />
                                    </button>
                                    <button type="button" className={styles.instagramActionIcon} aria-label="Share">
                                        <Send size={20} color="#262626" />
                                    </button>
                                </div>

                                {/* Carousel Dots Indicator */}
                                {slides.length > 1 && (
                                    <div className={styles.instagramDots}>
                                        {slides.map((_, idx) => (
                                            <span
                                                key={idx}
                                                className={`${styles.instagramDot} ${idx === currentIndex ? styles.instagramDotActive : ""}`}
                                                onClick={() => setCurrentIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                )}

                                <button 
                                    type="button" 
                                    className={styles.instagramActionIcon}
                                    onClick={() => setSaved(!saved)}
                                    aria-label={saved ? "Unsave" : "Save"}
                                >
                                    <Bookmark 
                                        size={22} 
                                        color="#262626" 
                                        fill={saved ? "#262626" : "none"} 
                                    />
                                </button>
                            </div>

                            {/* Likes Count */}
                            <div className={styles.instagramLikes}>
                                Liked by <strong>b.p.koirala</strong> and <strong>{liked ? "2,843" : "2,842"} others</strong>
                            </div>

                            {/* Caption Section */}
                            <div className={styles.instagramCaptionSection}>
                                <p className={styles.instagramCaptionText}>
                                    <strong className={styles.instagramUsername}>theleaders.press</strong>{" "}
                                    <span style={{ fontWeight: 600 }}>{design.headline}</span>
                                    {expandedCaption ? (
                                        <>
                                            <span style={{ display: "block", marginTop: 6, whiteSpace: "pre-line" }}>
                                                {design.summary || ""}
                                            </span>
                                            <span style={{ display: "block", marginTop: 8, color: "var(--studio-secondary)" }}>
                                                {design.author ? `— ${design.author}` : ""}
                                            </span>
                                            <span style={{ display: "block", marginTop: 8, color: "#00376B" }}>
                                                #TheLeaders #Nepal #PoliticalThought #Democracy #Analysis
                                            </span>
                                            <button 
                                                type="button" 
                                                className={styles.instagramCaptionToggle}
                                                onClick={() => setExpandedCaption(false)}
                                            >
                                                less
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {" "}
                                            {design.summary ? `${design.summary.slice(0, 70)}… ` : ""}
                                            <button 
                                                type="button" 
                                                className={styles.instagramCaptionToggle}
                                                onClick={() => setExpandedCaption(true)}
                                            >
                                                more
                                            </button>
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Comments Count & Timestamp */}
                            <div className={styles.instagramCommentsMeta}>
                                <span>View all 84 comments</span>
                                <span className={styles.instagramTimestamp}>2 HOURS AGO · SEE TRANSLATION</span>
                            </div>
                        </div>
                    </div>

                    {/* Studio Admin Controls Sidebar */}
                    <div className={styles.instagramSideControls}>
                        <div className={styles.instagramControlHeader}>
                            <div className={styles.row} style={{ gap: 8 }}>
                                <div className={styles.instagramBadge}>
                                    <Instagram size={18} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 16 }}>Instagram Feed Preview</h3>
                                    <p className={styles.subtle} style={{ margin: 0, fontSize: 12 }}>
                                        Interactive mobile simulator for carousel posts.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Slide Selector Buttons */}
                        <div className={styles.field}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--studio-text)" }}>
                                CAROUSEL SLIDES ({slides.length}):
                            </span>
                            <div className={styles.instagramSlidePillList}>
                                {slides.map((slide, idx) => (
                                    <button
                                        key={slide.id}
                                        type="button"
                                        className={`${styles.instagramSlidePill} ${idx === currentIndex ? styles.instagramSlidePillActive : ""}`}
                                        onClick={() => setCurrentIndex(idx)}
                                    >
                                        <span className={styles.instagramPillNumber}>{idx + 1}</span>
                                        <span className={styles.instagramPillTitle}>
                                            {slide.design.headline ? slide.design.headline.slice(0, 24) : `Slide ${idx + 1}`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions Stack */}
                        <div className={styles.instagramActionsStack}>
                            <button
                                type="button"
                                className={styles.primary}
                                style={{ width: "100%" }}
                                onClick={() => {
                                    onSelectSlide(currentIndex);
                                    onClose();
                                }}
                            >
                                <Pencil size={15} />
                                Edit Slide {currentIndex + 1} in Studio
                            </button>

                            <button
                                type="button"
                                className={styles.button}
                                style={{ width: "100%" }}
                                onClick={handleCopyCaption}
                            >
                                {copiedCaption ? <Check size={15} color="var(--studio-green)" /> : <Copy size={15} />}
                                {copiedCaption ? "Caption Copied!" : "Copy Instagram Caption"}
                            </button>

                            {onExportAll && slides.length > 1 && (
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ width: "100%", borderColor: "var(--studio-red)", color: "var(--studio-red)" }}
                                    disabled={exporting}
                                    onClick={async () => {
                                        setExporting(true);
                                        try {
                                            await onExportAll();
                                        } finally {
                                            setExporting(false);
                                        }
                                    }}
                                >
                                    <Download size={15} />
                                    {exporting ? "Preparing ZIP…" : `Export All ${slides.length} Slides (ZIP)`}
                                </button>
                            )}

                            {onExportCurrent && (
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ width: "100%" }}
                                    onClick={() => onExportCurrent(currentIndex)}
                                >
                                    <Download size={15} />
                                    Export Current Slide {currentIndex + 1} (PNG)
                                </button>
                            )}
                        </div>

                        {/* Tips */}
                        <div className={styles.instagramTipsBox}>
                            <Sparkles size={14} color="var(--studio-red)" />
                            <span style={{ fontSize: 11, color: "var(--studio-secondary)", lineHeight: 1.4 }}>
                                <strong>Instagram Tip:</strong> Carousels with 5+ slides generate 3.1× higher engagement and bookmark rates than single image posts.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
