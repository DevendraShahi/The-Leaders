"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Settings2, User } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IArticle } from "@/models/Article";

interface ArticleDetailProps {
    article: IArticle;
    relatedArticles?: IArticle[];
}

export function ArticleDetail({ article, relatedArticles = [] }: ArticleDetailProps) {
    const router = useRouter();
    const { language } = useLanguage();
    const [showReaderSettings, setShowReaderSettings] = useState(true);
    const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
    const [lineHeight, setLineHeight] = useState<"normal" | "relaxed">("normal");
    const [contentLanguage, setContentLanguage] = useState<"en" | "ne">(language);
    const [hasLanguageOverride, setHasLanguageOverride] = useState(false);

    const title = article.title?.[contentLanguage] || article.title?.en;
    const content = article.content?.[contentLanguage] || article.content?.en;
    const excerpt = article.excerpt?.[contentLanguage] || article.excerpt?.en;
    const author = article.author?.[contentLanguage] || article.author?.en;
    const category = article.category?.[contentLanguage] || article.category?.en;
    const image = article.image || "https://placehold.co/1920x1080/png?text=Article";

    const publishedDate = new Date(article.publishedDate).toLocaleDateString(
        contentLanguage === "en" ? "en-US" : "ne-NP",
        { year: "numeric", month: "long", day: "numeric" }
    );

    const readerClasses =
        fontSize === "sm"
            ? lineHeight === "normal"
                ? "text-base leading-7"
                : "text-base leading-8"
            : fontSize === "lg"
                ? lineHeight === "normal"
                    ? "text-xl leading-9"
                    : "text-xl leading-10"
                : lineHeight === "normal"
                    ? "text-lg leading-8"
                    : "text-lg leading-9";

    useEffect(() => {
        const savedSize = localStorage.getItem("article_reader_font_size");
        const savedLineHeight = localStorage.getItem("article_reader_line_height");
        const savedPanel = localStorage.getItem("article_reader_panel_open");

        if (savedSize === "sm" || savedSize === "md" || savedSize === "lg") {
            setFontSize(savedSize);
        }
        if (savedLineHeight === "normal" || savedLineHeight === "relaxed") {
            setLineHeight(savedLineHeight);
        }
        if (savedPanel === "true" || savedPanel === "false") {
            setShowReaderSettings(savedPanel === "true");
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("article_reader_font_size", fontSize);
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem("article_reader_line_height", lineHeight);
    }, [lineHeight]);

    useEffect(() => {
        localStorage.setItem("article_reader_panel_open", showReaderSettings ? "true" : "false");
    }, [showReaderSettings]);

    useEffect(() => {
        if (!hasLanguageOverride) {
            setContentLanguage(language);
        }
    }, [language, hasLanguageOverride]);

    return (
        <article className="min-h-screen bg-background text-foreground">
            <header className="relative border-b border-border/50 pt-20">
                <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
                <div className="absolute inset-0">
                    <img src={image} alt={title} className="h-full w-full object-cover opacity-20" />
                </div>
                <div className="container relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/articles")}
                        className="mb-6 rounded-none"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {language === "en" ? "Articles" : "लेखहरू"}
                    </Button>

                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <Badge className="rounded-none border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                            {category}
                        </Badge>
                        {article.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-none border border-border bg-background/70 text-[10px] uppercase tracking-[0.12em]">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <h1 className="max-w-5xl font-bebas text-4xl uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        {title}
                    </h1>

                    <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-border/60 pt-5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {author}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {publishedDate}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {language === "en" ? "Long Read" : "विस्तृत लेख"}
                        </span>
                    </div>
                </div>
            </header>

            <section className="container mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:py-14">
                <div className="lg:col-span-8">
                    <div className="mb-5 border border-border bg-card/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                    <Settings2 className="h-4 w-4 text-primary" />
                                    {language === "en" ? "Reader Settings" : "पढाइ सेटिङ"}
                                </div>
                                <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
                                <div className="inline-flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant={contentLanguage === "en" ? "default" : "outline"}
                                        size="sm"
                                        className="rounded-none"
                                        onClick={() => {
                                            setContentLanguage("en");
                                            setHasLanguageOverride(true);
                                        }}
                                    >
                                        English
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={contentLanguage === "ne" ? "default" : "outline"}
                                        size="sm"
                                        className="rounded-none"
                                        onClick={() => {
                                            setContentLanguage("ne");
                                            setHasLanguageOverride(true);
                                        }}
                                    >
                                        नेपाली
                                    </Button>
                                    {hasLanguageOverride && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-none"
                                            onClick={() => {
                                                setHasLanguageOverride(false);
                                                setContentLanguage(language);
                                            }}
                                        >
                                            {language === "en" ? "Use App Language" : "एप भाषा"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-none"
                                onClick={() => setShowReaderSettings((prev) => !prev)}
                            >
                                {showReaderSettings
                                    ? language === "en"
                                        ? "Hide"
                                        : "लुकाउनुहोस्"
                                    : language === "en"
                                        ? "Show"
                                        : "देखाउनुहोस्"}
                            </Button>
                        </div>

                        {showReaderSettings && (
                            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
                                <div>
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                        {language === "en" ? "Font Size" : "अक्षर आकार"}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={fontSize === "sm" ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-none"
                                            onClick={() => setFontSize("sm")}
                                        >
                                            A-
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={fontSize === "md" ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-none"
                                            onClick={() => setFontSize("md")}
                                        >
                                            A
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={fontSize === "lg" ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-none"
                                            onClick={() => setFontSize("lg")}
                                        >
                                            A+
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                        {language === "en" ? "Line Spacing" : "लाइन दूरी"}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={lineHeight === "normal" ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-none"
                                            onClick={() => setLineHeight("normal")}
                                        >
                                            {language === "en" ? "Normal" : "सामान्य"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={lineHeight === "relaxed" ? "default" : "outline"}
                                            size="sm"
                                            className="rounded-none"
                                            onClick={() => setLineHeight("relaxed")}
                                        >
                                            {language === "en" ? "Relaxed" : "फराकिलो"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-card/20 p-5 sm:p-8">
                        <p className={`mb-8 text-foreground/90 ${fontSize === "sm" ? "text-base leading-7" : fontSize === "lg" ? "text-xl leading-9" : "text-lg leading-8"}`}>
                            {excerpt}
                        </p>

                        <div
                            className={`article-content prose prose-neutral max-w-none prose-headings:font-bebas prose-headings:uppercase prose-headings:tracking-wide prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline dark:prose-invert ${readerClasses}`}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>

                    {relatedArticles.length > 0 && (
                        <div className="mt-10 border-t border-border pt-8 lg:hidden">
                            <h2 className="mb-5 font-bebas text-3xl uppercase tracking-wide">
                                {language === "en" ? "Related Articles" : "सम्बन्धित लेखहरू"}
                            </h2>
                            <div className="space-y-4">
                                {relatedArticles.slice(0, 4).map((item) => {
                                    const itemTitle = item.title?.[contentLanguage] || item.title?.en;
                                    const itemDate = new Date(item.publishedDate).toLocaleDateString(
                                        contentLanguage === "en" ? "en-US" : "ne-NP",
                                        { year: "numeric", month: "short", day: "numeric" }
                                    );
                                    return (
                                        <Link key={item._id as string} href={`/articles/${item.slug}`} className="group block border border-border bg-card/50 p-4 transition-colors hover:border-primary/50 hover:bg-card">
                                            <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{itemDate}</div>
                                            <h3 className="line-clamp-2 text-lg leading-tight text-foreground transition-colors group-hover:text-primary">{itemTitle}</h3>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="hidden lg:col-span-4 lg:block">
                    <div className="sticky top-28 space-y-6">
                        <div className="border border-border bg-card/40 p-6">
                            <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-primary">
                                {language === "en" ? "Article Brief" : "लेख सार"}
                            </div>
                            <p className="text-sm leading-relaxed text-foreground/85">{excerpt}</p>
                        </div>

                        {relatedArticles.length > 0 && (
                            <div className="border border-border bg-card/30 p-6">
                                <h2 className="mb-4 font-bebas text-2xl uppercase tracking-wide">
                                    {language === "en" ? "Related Articles" : "सम्बन्धित लेखहरू"}
                                </h2>
                                <div className="space-y-4">
                                    {relatedArticles.slice(0, 5).map((item) => {
                                        const itemTitle = item.title?.[contentLanguage] || item.title?.en;
                                        const itemDate = new Date(item.publishedDate).toLocaleDateString(
                                            contentLanguage === "en" ? "en-US" : "ne-NP",
                                            { year: "numeric", month: "short", day: "numeric" }
                                        );
                                        return (
                                            <Link key={item._id as string} href={`/articles/${item.slug}`} className="group block border-b border-border/70 pb-4 last:border-b-0 last:pb-0">
                                                <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{itemDate}</div>
                                                <h3 className="line-clamp-2 text-base leading-tight text-foreground transition-colors group-hover:text-primary">{itemTitle}</h3>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </section>

            <style jsx global>{`
                .article-content h2 {
                    margin-top: 2.2rem;
                    margin-bottom: 1rem;
                    font-size: 2rem;
                    line-height: 1;
                }
                .article-content h3 {
                    margin-top: 1.6rem;
                    margin-bottom: 0.8rem;
                    font-size: 1.35rem;
                    line-height: 1.2;
                    letter-spacing: 0.01em;
                }
                .article-content p {
                    margin-bottom: 1.15rem;
                }
                .article-content ul,
                .article-content ol {
                    margin-bottom: 1.25rem;
                    padding-left: 1.25rem;
                }
                .article-content li {
                    margin-bottom: 0.5rem;
                }
                .article-content blockquote {
                    margin: 1.5rem 0;
                    border-left: 3px solid #b71c1c;
                    padding: 0.75rem 0 0.75rem 1rem;
                    background: rgba(183, 28, 28, 0.05);
                }
            `}</style>
        </article>
    );
}
