"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    User,
    Globe,
    Share2,
    Clock,
    Settings,
    X,
    Type,
    AlignLeft,
    Check,
    Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IArticle } from "@/models/Article";

interface ArticleDetailProps {
    article: IArticle;
    relatedArticles?: IArticle[];
}

type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type FontFamily = 'sans' | 'serif' | 'mono';
type LineHeight = 'tight' | 'normal' | 'relaxed';

export function ArticleDetail({ article, relatedArticles = [] }: ArticleDetailProps) {
    const router = useRouter();
    const [lang, setLang] = useState<"en" | "ne">("en");
    const [showSettings, setShowSettings] = useState(false);
    const [fontSize, setFontSize] = useState<FontSize>('md');
    const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
    const [lineHeight, setLineHeight] = useState<LineHeight>('normal');

    const toggleLang = () => {
        setLang((prev) => (prev === "en" ? "ne" : "en"));
    };

    const toggleSettings = () => {
        setShowSettings((prev) => !prev);
    };

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push('/articles');
        }
    };

    // Font size mapping
    const fontSizeClasses = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl',
        xl: 'text-2xl',
    };

    // Font family mapping
    const fontFamilyClasses = {
        sans: 'font-sans',
        serif: 'font-serif',
        mono: 'font-mono',
    };

    // Line height mapping
    const lineHeightClasses = {
        tight: 'leading-relaxed',
        normal: 'leading-loose',
        relaxed: 'leading-[2.25]',
    };

    return (
        <article className="min-h-screen bg-background text-foreground selection:bg-red-600 selection:text-white">
            {/* Floating Back Button */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="fixed top-24 left-4 z-50 md:left-8"
            >
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full bg-background/40 backdrop-blur-md border border-border text-foreground hover:bg-background/60 transition-all shadow-lg flex items-center justify-center group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                </Button>
            </motion.div>

            {/* Floating Settings Button */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="fixed bottom-6 right-6 z-40"
            >
                <Button
                    onClick={toggleSettings}
                    className={`h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all duration-300 ${showSettings ? 'rotate-45' : ''}`}
                    size="lg"
                >
                    <Sliders className="h-6 w-6" />
                </Button>
            </motion.div>

            {/* Desktop Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="hidden lg:block fixed bottom-24 right-6 z-30 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-red-500" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Reader Settings</h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Font Size */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Type className="h-4 w-4 text-red-500" />
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Font Size</h4>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'sm', label: 'A-', width: 'w-10' },
                                            { id: 'md', label: 'A', width: 'w-12' },
                                            { id: 'lg', label: 'A+', width: 'w-14' },
                                            { id: 'xl', label: 'A++', width: 'w-16' },
                                        ].map((size) => (
                                            <Button
                                                key={size.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFontSize(size.id as FontSize)}
                                                className={`h-9 ${size.width} px-0 text-muted-foreground hover:bg-accent border-border transition-all ${fontSize === size.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
                                            >
                                                <span className={size.id === 'sm' ? 'text-xs' : size.id === 'lg' ? 'text-lg' : size.id === 'xl' ? 'text-xl' : 'text-sm'}>{size.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Font Family */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlignLeft className="h-4 w-4 text-red-500" />
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Font Family</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'sans', label: 'Sans' },
                                            { id: 'serif', label: 'Serif' },
                                            { id: 'mono', label: 'Mono' },
                                        ].map((font) => (
                                            <Button
                                                key={font.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setFontFamily(font.id as FontFamily)}
                                                className={`flex-1 h-9 px-3 text-xs font-medium border-border text-muted-foreground hover:bg-accent transition-all flex items-center justify-center gap-1 ${fontFamily === font.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
                                            >
                                                <span className={font.id === 'serif' ? 'font-serif' : font.id === 'mono' ? 'font-mono' : 'font-sans'}>
                                                    {font.label}
                                                </span>
                                                {fontFamily === font.id && <Check className="h-3 w-3" />}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Line Height */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Settings className="h-4 w-4 text-red-500" />
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Line Spacing</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'tight', label: 'Tight' },
                                            { id: 'normal', label: 'Normal' },
                                            { id: 'relaxed', label: 'Relaxed' },
                                        ].map((spacing) => (
                                            <Button
                                                key={spacing.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setLineHeight(spacing.id as LineHeight)}
                                                className={`flex-1 h-9 px-3 text-xs font-medium border-border text-muted-foreground hover:bg-accent transition-all ${lineHeight === spacing.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
                                            >
                                                {spacing.label}
                                                {lineHeight === spacing.id && <Check className="h-3 w-3 ml-1" />}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>


                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Settings Panel (Bottom Sheet Only) */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[30] lg:hidden"
                            onClick={toggleSettings}
                        />
                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[35] lg:hidden bg-card border-t border-border rounded-t-2xl"
                        >
                            <div className="container mx-auto px-4 py-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-red-500" />
                                        <h3 className="text-base font-bold uppercase tracking-wider">Reader Settings</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleSettings}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* Font Size */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Type className="h-4 w-4 text-red-500" />
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Font Size</h4>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: 'sm', label: 'A-' },
                                                { id: 'md', label: 'A' },
                                                { id: 'lg', label: 'A+' },
                                                { id: 'xl', label: 'A++' },
                                            ].map((size) => (
                                                <Button
                                                    key={size.id}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFontSize(size.id as FontSize)}
                                                    className={`h-10 text-xs sm:text-sm font-medium border-border text-muted-foreground hover:bg-accent transition-all ${fontSize === size.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
                                                >
                                                    {size.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Family */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlignLeft className="h-4 w-4 text-red-500" />
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Font Family</h4>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'sans', label: 'Sans' },
                                                { id: 'serif', label: 'Serif' },
                                                { id: 'mono', label: 'Mono' },
                                            ].map((font) => (
                                                <Button
                                                    key={font.id}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setFontFamily(font.id as FontFamily)}
                                                    className={`h-10 text-xs font-medium border-border text-muted-foreground hover:bg-accent transition-all flex items-center justify-center gap-1 ${fontFamily === font.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
                                                >
                                                    <span className={font.id === 'serif' ? 'font-serif' : font.id === 'mono' ? 'font-mono' : 'font-sans'}>
                                                        {font.label}
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Line Height */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Settings className="h-4 w-4 text-red-500" />
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Line Spacing</h4>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'tight', label: 'Tight' },
                                                { id: 'normal', label: 'Normal' },
                                                { id: 'relaxed', label: 'Relaxed' },
                                            ].map((spacing) => (
                                                <Button
                                                    key={spacing.id}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setLineHeight(spacing.id as LineHeight)}
                                                    className={`h-10 text-xs font-medium border-border text-muted-foreground hover:bg-accent transition-all ${lineHeight === spacing.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
                                                >
                                                    {spacing.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative h-[55vh] sm:h-[65vh] w-full overflow-hidden pt-20 sm:pt-24"
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('${article.image || "https://placehold.co/1920x1080/png?text=Article"}')`,
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

                {/* Content */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 z-10"
                >
                    <div className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-16 pt-24">
                        {/* Language Switch - Segmented Control */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="relative z-20 mb-8"
                        >
                            <div className="inline-flex bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => lang !== "en" && toggleLang()}
                                    className={`relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-md ${lang === "en"
                                        ? "bg-white text-black shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    English
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => lang !== "ne" && toggleLang()}
                                    className={`relative z-10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-md ${lang === "ne"
                                        ? "bg-red-600 text-white shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    नेपाली
                                </Button>
                            </div>
                        </motion.div>

                        {/* Title with Category */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                            className="mb-6"
                        >

                            <div className="flex items-center gap-3 mb-3">
                                {/* Title */}
                                <motion.h1
                                    layout
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] sm:leading-[0.95] max-w-4xl lg:max-w-5xl uppercase tracking-tighter"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={lang}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.4 }}
                                            className="block"
                                        >
                                            {article.title[lang]}
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.h1>

                                {/* Category Label with Layout Animation */}
                                <motion.div
                                    layout
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-1 h-6 bg-red-600" />
                                    <span className="text-red-500 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] relative">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={lang}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="block"
                                            >
                                                {article.category[lang]}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Author & Date Row - Redesigned Mobile */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-white/80"
                        >
                            {/* Author Block */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/10">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={lang}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {article.author[lang]?.charAt(0) || 'A'}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-white leading-tight">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={lang}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ duration: 0.3 }}
                                                className="block"
                                            >
                                                {article.author[lang]}
                                            </motion.span>
                                        </AnimatePresence>
                                    </p>
                                    <p className="text-[10px] text-red-400 uppercase tracking-widest font-semibold mt-0.5">Author</p>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-8 bg-white/10" />

                            {/* Meta Block - Simplified for Mobile */}
                            <div className="flex flex-row items-center gap-4 pl-0 sm:pl-0 sm:border-0 w-full sm:w-auto mt-2 sm:mt-0">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-red-500" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider leading-none mb-0.5">Published</span>
                                        <span className="text-xs font-medium text-white">
                                            {new Date(article.publishedDate).toLocaleDateString(
                                                lang === "en" ? "en-US" : "ne-NP",
                                                { year: 'numeric', month: 'short', day: 'numeric' }
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-px h-6 bg-white/10" />

                                <div className="flex items-center gap-2.5">
                                    <Clock className="h-4 w-4 text-red-500" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider leading-none mb-0.5">Read Time</span>
                                        <span className="text-xs font-medium text-white">8 min</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            </motion.div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16">
                    {/* Article Content */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="lg:col-span-7 xl:col-span-8"
                    >
                        {/* Article Text with Dynamic Styling */}
                        <article className={`max-w-none ${fontSizeClasses[fontSize]} ${fontFamilyClasses[fontFamily]} ${lineHeightClasses[lineHeight]}`}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={lang}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="article-content text-foreground/90"
                                    dangerouslySetInnerHTML={{ __html: article.content[lang] }}
                                />
                            </AnimatePresence>
                        </article>

                        {/* Divider */}
                        <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="w-16 sm:w-32 h-px bg-gradient-to-r from-red-600 to-transparent my-10 sm:my-12 origin-left"
                        />

                        {/* Tags */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-12"
                        >
                            {article.tags?.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-transparent border border-border text-muted-foreground hover:border-red-600/50 hover:text-red-500 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] transition-all"
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </motion.div>

                        {/* Share Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="flex items-center justify-between mt-8 pt-8 border-t border-border mb-8 sm:mb-12"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Share Article</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 text-xs font-medium border-border text-muted-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-all rounded-full flex items-center gap-2"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    <span>Share</span>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Mobile Related Articles */}
                        {relatedArticles.length > 0 && (
                            <div className="lg:hidden mt-12 pt-10 border-t border-border">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-1 w-1 rounded-full bg-red-600" />
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-foreground">More to Read</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {relatedArticles.map((related) => (
                                        <Link
                                            key={related._id as string}
                                            href={`/articles/${related.slug}`}
                                            className="group block bg-card/50 border border-border overflow-hidden"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden bg-muted">
                                                <img
                                                    src={related.image || `https://placehold.co/600x400/png?text=${related.title.en}`}
                                                    alt={related.title[lang] || related.title.en}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <Badge className="bg-red-600/10 text-red-500 border-none rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
                                                    {related.category?.[lang] || related.category?.en || 'Article'}
                                                </Badge>
                                                <h4 className="text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-red-500 transition-colors">
                                                    {related.title[lang] || related.title.en}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{related.author?.[lang] || related.author?.en}</span>
                                                    <span>•</span>
                                                    <span>{new Date(related.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar - Desktop Only */}
                    <motion.div
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="hidden lg:block lg:col-span-5 xl:col-span-4"
                    >
                        <aside className="sticky top-28 space-y-8">
                            {/* Excerpt Card - Standardized Design */}
                            <div className="group relative bg-card border border-border overflow-hidden transition-all duration-300 hover:border-red-600/30">
                                {/* Ambient Glow Effect */}
                                <div className="absolute -inset-1 bg-gradient-to-br from-red-600/20 via-transparent to-red-900/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

                                {/* Top Accent Bar */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-80" />

                                {/* Decorative Corner Accents */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-600/5 to-transparent rounded-bl-full" />
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-red-600/5 to-transparent rounded-tr-full" />

                                {/* Content */}
                                <div className="relative p-6 sm:p-8">


                                    {/* Header Section */}
                                    <div className="relative z-10 mb-8">
                                        {/* Featured Badge */}
                                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 backdrop-blur-sm">
                                            <div className="relative">
                                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-600 animate-ping opacity-75" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Featured Insight</span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2 font-bebas uppercase">
                                            Key Insight
                                        </h3>

                                        {/* Subtitle Line */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-[2px] w-12 bg-gradient-to-r from-red-600 to-transparent rounded-full" />
                                            <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">Essential Takeaway</span>
                                        </div>
                                    </div>

                                    <blockquote className="relative z-10 mb-6">
                                        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 via-red-500 to-red-600" />
                                        <p className="text-base sm:text-lg leading-relaxed text-foreground/90 pl-4">
                                            {article.excerpt[lang]}
                                        </p>
                                    </blockquote>

                                    {/* Divider */}
                                    <div className="w-full h-px bg-border my-6" />

                                    {/* Meta Information */}
                                    <div className="relative z-10 space-y-3">
                                        {/* Author */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Author</span>
                                                <span className="text-sm font-semibold text-foreground">{article.author[lang]}</span>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider block">Published</span>
                                                <span className="text-sm font-semibold text-foreground">
                                                    {new Date(article.publishedDate).toLocaleDateString(
                                                        lang === "en" ? "en-US" : "ne-NP",
                                                        { year: 'numeric', month: 'long', day: 'numeric' }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-muted/30 border-t border-border px-6 py-3">
                                    <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                                        The Leaders Archive
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info Card */}
                            <div className="p-4 sm:p-6 bg-card/30 border border-border">
                                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 sm:mb-4">
                                    About This Article
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                                    Part of our curated collection documenting visionaries, revolutionaries, and statesmen who shaped Nepal&#39;s destiny.
                                </p>
                            </div>

                            {/* Related Articles - Desktop */}
                            {relatedArticles.length > 0 && (
                                <div className="space-y-6 pt-4 border-t border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px bg-red-600 w-8" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Read Also</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {relatedArticles.map((related) => (
                                            <Link
                                                key={related._id as string}
                                                href={`/articles/${related.slug}`}
                                                className="group block"
                                            >
                                                <article className="flex gap-4 group-hover:bg-accent/50 p-3 -mx-3 rounded-lg transition-colors">
                                                    <div className="w-20 h-20 shrink-0 overflow-hidden rounded bg-muted">
                                                        <img
                                                            src={related.image || `https://placehold.co/100x100/png?text=${related.title.en.charAt(0)}`}
                                                            alt={related.title[lang] || related.title.en}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-between py-1">
                                                        <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-red-500 transition-colors">
                                                            {related.title[lang] || related.title.en}
                                                        </h4>
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                                            {new Date(related.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </article>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </motion.div>
                </div>
            </div>

            {/* Global Styles */}
            <style jsx global>{`
                .article-content p {
                    margin-bottom: 1.75rem;
                }
                .article-content h2 {
                    margin-top: 2.5rem;
                    margin-bottom: 1.25rem;
                    font-size: 1.5em;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }
                .article-content h3 {
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    font-size: 1.25em;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                }
                .article-content ul,
                .article-content ol {
                    margin-bottom: 1.75rem;
                    padding-left: 1.5rem;
                }
                .article-content li {
                    margin-bottom: 0.625rem;
                }
                .article-content blockquote {
                    margin: 1.75rem 0;
                    padding-left: 1.75rem;
                    padding-right: 1rem;
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    border-left: 3px solid #dc2626;
                    background: linear-gradient(to right, rgba(220, 38, 38, 0.05), transparent);
                }
                .article-content a {
                    color: #dc2626;
                    text-decoration: underline;
                    transition: all 0.3s;
                }
                .article-content a:hover {
                    color: #fff;
                }
                .article-content strong {
                    color: #fff;
                    font-weight: 700;
                }
            `}</style>
        </article>
    );
}
