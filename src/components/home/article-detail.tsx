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
        <article className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
            {/* Floating Back Button */}
            <div className="fixed top-24 left-4 z-50 md:left-8">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 hover:text-white transition-all shadow-lg flex items-center justify-center group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                </Button>
            </div>

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
                        className="hidden lg:block fixed bottom-24 right-6 z-30 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-red-500" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Reader Settings</h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Font Size */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Type className="h-4 w-4 text-red-500" />
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">Font Size</h4>
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
                                                className={`h-9 ${size.width} px-0 text-white/70 hover:bg-white/10 border-white/20 transition-all ${fontSize === size.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
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
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">Font Family</h4>
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
                                                className={`flex-1 h-9 px-3 text-xs font-medium border-white/20 text-white/70 hover:bg-white/10 transition-all flex items-center justify-center gap-1 ${fontFamily === font.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
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
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">Line Spacing</h4>
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
                                                className={`flex-1 h-9 px-3 text-xs font-medium border-white/20 text-white/70 hover:bg-white/10 transition-all ${lineHeight === spacing.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
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
                            className="fixed inset-0 bg-black/80 z-[30] lg:hidden"
                            onClick={toggleSettings}
                        />
                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[35] lg:hidden bg-zinc-900 border-t border-white/10 rounded-t-2xl"
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
                                        className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* Font Size */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Type className="h-4 w-4 text-red-500" />
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">Font Size</h4>
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
                                                    className={`h-10 text-xs sm:text-sm font-medium border-white/20 text-white/70 hover:bg-white/10 transition-all ${fontSize === size.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
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
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">Font Family</h4>
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
                                                    className={`h-10 text-xs font-medium border-white/20 text-white/70 hover:bg-white/10 transition-all flex items-center justify-center gap-1 ${fontFamily === font.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
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
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">Line Spacing</h4>
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
                                                    className={`h-10 text-xs font-medium border-white/20 text-white/70 hover:bg-white/10 transition-all ${lineHeight === spacing.id ? 'border-red-500 text-red-500 bg-red-500/10' : ''}`}
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
            <div className="relative h-[55vh] sm:h-[65vh] w-full overflow-hidden pt-20 sm:pt-24">
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
                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <div className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-16 pt-24">
                        {/* Header Actions: Category & Language */}
                        <div className="relative z-20 flex flex-wrap items-center gap-4 mb-6">
                            <Badge className="bg-transparent border-2 border-red-600 text-red-500 hover:bg-red-600/10 px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                                {article.category[lang]}
                            </Badge>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleLang}
                                className="h-8 border-white/30 text-white bg-white/10 hover:bg-white hover:text-black hover:border-white transition-all rounded-full flex items-center gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider backdrop-blur-md"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                {lang === "en" ? "नेपाली संस्करण" : "English Version"}
                            </Button>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] sm:leading-[0.95] max-w-4xl lg:max-w-5xl uppercase tracking-tighter mb-6">
                            {article.title[lang]}
                        </h1>

                        {/* Author & Date Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-white/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm">
                                    {article.author[lang]?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{article.author[lang]}</p>
                                    <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Author</p>
                                </div>
                            </div>
                            <div className="hidden sm:block w-px h-6 bg-white/20" />
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-red-500" />
                                <span className="text-xs sm:text-sm font-medium">
                                    {new Date(article.publishedDate).toLocaleDateString(
                                        lang === "en" ? "en-US" : "ne-NP",
                                        { year: 'numeric', month: 'long', day: 'numeric' }
                                    )}
                                </span>
                            </div>
                            <div className="hidden sm:block w-px h-6 bg-white/20" />
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-red-500" />
                                <span className="text-xs sm:text-sm font-medium">8 min read</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16">
                    {/* Article Content */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        {/* Article Text with Dynamic Styling */}
                        <article className={`max-w-none ${fontSizeClasses[fontSize]} ${fontFamilyClasses[fontFamily]} ${lineHeightClasses[lineHeight]}`}>
                            <div
                                className="article-content text-white/90"
                                dangerouslySetInnerHTML={{ __html: article.content[lang] }}
                            />
                        </article>

                        {/* Divider */}
                        <div className="w-16 sm:w-32 h-px bg-gradient-to-r from-red-600 to-transparent my-10 sm:my-12" />

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
                            {article.tags?.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-transparent border border-white/10 text-white/60 hover:border-red-600/50 hover:text-red-500 px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] transition-all"
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </div>

                        {/* Share Section */}
                        <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10 mb-8 sm:mb-12">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Share Article</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 text-xs font-medium border-white/20 text-white/70 hover:bg-white hover:text-black hover:border-white transition-all rounded-full flex items-center gap-2"
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                    <span>Share</span>
                                </Button>
                            </div>
                        </div>

                        {/* Mobile Related Articles */}
                        {relatedArticles.length > 0 && (
                            <div className="lg:hidden mt-12 pt-10 border-t border-white/10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-1 w-1 rounded-full bg-red-600" />
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-white">More to Read</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {relatedArticles.map((related) => (
                                        <Link
                                            key={related._id as string}
                                            href={`/articles/${related.slug}`}
                                            className="group block bg-zinc-900/50 border border-white/5 overflow-hidden"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden bg-zinc-800">
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
                                                <h4 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-red-500 transition-colors">
                                                    {related.title[lang] || related.title.en}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-white/40">
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
                    </div>

                    {/* Sidebar - Desktop Only */}
                    <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
                        <aside className="sticky top-28 space-y-8">
                            {/* Excerpt Card */}
                            <div className="relative bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-sm border border-zinc-800/50 overflow-hidden">
                                {/* Top Accent */}
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                                {/* Left Accent Line */}
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 via-red-800 to-red-900" />

                                {/* Content */}
                                <div className="relative p-6 sm:p-8">
                                    {/* Decorative Quote Mark */}
                                    <div className="absolute top-4 left-4 text-[80px] font-serif text-red-600/10 leading-none select-none font-bold">
                                        &quot;
                                    </div>

                                    {/* Header */}
                                    <div className="relative z-10 mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-red-500">Featured</span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                                            Key Insight
                                        </h3>
                                    </div>

                                    {/* Quote Content */}
                                    <blockquote className="relative z-10">
                                        <p className="text-base sm:text-lg leading-relaxed text-white/90 mb-4 pl-3 border-l-2 border-red-600/50">
                                            {article.excerpt[lang]}
                                        </p>
                                    </blockquote>

                                    {/* Bottom Decorative Quote */}
                                    <div className="relative z-10 flex justify-end">
                                        <div className="text-4xl font-serif text-red-600/20 leading-none font-bold">
                                            &quot;
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full h-px bg-gradient-to-r from-red-600/50 to-transparent my-6" />

                                    {/* Meta Info */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
                                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                                            <span className="font-medium">{article.author[lang]}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
                                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                                            <span className="text-[10px] sm:text-xs">
                                                {new Date(article.publishedDate).toLocaleDateString(
                                                    lang === "en" ? "en-US" : "ne-NP",
                                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Branding */}
                                <div className="bg-black/50 border-t border-zinc-800/50 p-3 sm:p-4">
                                    <p className="text-center text-[9px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/40">
                                        The Leaders Archive
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info Card */}
                            <div className="p-4 sm:p-6 bg-zinc-900/30 border border-zinc-800/30">
                                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 mb-3 sm:mb-4">
                                    About This Article
                                </h4>
                                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                                    Part of our curated collection documenting visionaries, revolutionaries, and statesmen who shaped Nepal&#39;s destiny.
                                </p>
                            </div>

                            {/* Related Articles - Desktop */}
                            {relatedArticles.length > 0 && (
                                <div className="space-y-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px bg-red-600 w-8" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">Read Also</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {relatedArticles.map((related) => (
                                            <Link
                                                key={related._id as string}
                                                href={`/articles/${related.slug}`}
                                                className="group block"
                                            >
                                                <article className="flex gap-4 group-hover:bg-white/5 p-3 -mx-3 rounded-lg transition-colors">
                                                    <div className="w-20 h-20 shrink-0 overflow-hidden rounded bg-zinc-800">
                                                        <img
                                                            src={related.image || `https://placehold.co/100x100/png?text=${related.title.en.charAt(0)}`}
                                                            alt={related.title[lang] || related.title.en}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-between py-1">
                                                        <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-red-500 transition-colors">
                                                            {related.title[lang] || related.title.en}
                                                        </h4>
                                                        <span className="text-[10px] uppercase tracking-wider text-white/40">
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
                    </div>
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
