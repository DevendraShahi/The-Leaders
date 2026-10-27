"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { Clock, ArrowRight, ShieldCheck, FileText, Scale, ExternalLink } from "lucide-react";
import { IArticle } from "@/models/Article";
import { InvestigativeReport } from "@/lib/news-feed";
import styles from "./NewsHome.module.css";

interface NewsInvestigativeGridProps {
    reports?: InvestigativeReport[];
    articles?: IArticle[];
}

export function NewsInvestigativeGrid({ reports, articles }: NewsInvestigativeGridProps) {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    const resolve = (val: { en?: string; ne?: string } | string | undefined | null) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return (isNepali ? val.ne : val.en) || val.en || val.ne || "";
    };

    // Normalized items from verified sources (CIJ Nepal, Himal Khabar, The Leaders Archive)
    const activeReports: InvestigativeReport[] = useMemo(() => {
        if (reports && reports.length >= 3) {
            return reports;
        }

        // If reports aren't supplied or empty, convert published articles
        if (articles && articles.length > 0) {
            return articles.map((a, idx) => ({
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt,
                link: `/articles/${a.slug}`,
                source: "The Leaders Archive",
                sourceDomain: "theleaders.com.np",
                category: a.category || { en: "CIVIC ARCHIVE", ne: "नागरिक अभिलेख" },
                author: a.author || { en: "Editorial Board", ne: "सम्पादकीय मण्डल" },
                publishedDate: a.publishedDate ? new Date(a.publishedDate).toISOString() : new Date().toISOString(),
                readTime: { en: "5 min read", ne: "५ मिनेट" },
                image: a.image || (idx === 0 ? "/art/investigative-annapurna.jpg" : idx === 1 ? "/art/investigative-archive.jpg" : "/art/investigative-madhesh.jpg"),
                isExternal: false
            }));
        }

        // Fallback to verified official resources (NO dummy slugs or 404 links)
        return [
            {
                slug: "cij-annapurna-inquiry",
                title: {
                    en: "Who Does The Annapurna Belong To? Fiscal Authority and Conservation Inquiries",
                    ne: "अन्नपूर्ण संरक्षण क्षेत्र कसको? वित्तीय अधिकार र संरक्षण सम्बन्धी खोज"
                },
                excerpt: {
                    en: "With over NPR 1.77 billion in annual revenue collected, a serious constitutional question emerges: who has the legal authority to govern Nepal's largest conservation area?",
                    ne: "वार्षिक १ अर्ब ७७ करोडभन्दा बढी आम्दानी गर्ने अन्नपूर्ण संरक्षण क्षेत्र व्यवस्थापन गर्ने अधिकार संघ, प्रदेश वा स्थानीय कुन तहको सरकारसँग छ?"
                },
                link: "https://www.cijnepal.org/detail/15636?slug=",
                source: "CIJ Nepal (खोजी पत्रकारिता केन्द्र)",
                sourceDomain: "cijnepal.org",
                category: { en: "CONSTITUTIONAL INQUIRY", ne: "संवैधानिक अनुसन्धान" },
                author: { en: "Centre for Investigative Journalism (CIJ)", ne: "खोजी पत्रकारिता केन्द्र नेपाल" },
                publishedDate: new Date().toISOString(),
                readTime: { en: "7 min read", ne: "७ मिनेट" },
                image: "/art/investigative-annapurna.jpg",
                keyPoints: [
                    {
                        en: "Revenue authority disputed across local governments, provincial councils, and federal ministries.",
                        ne: "राजस्व अधिकार संघ, प्रदेश र स्थानीय तहबीच विवादित र कानुनको अस्पष्टता।"
                    },
                    {
                        en: "Extensive field inquiry into environmental governance and statutory royalties in Gandaki province.",
                        ne: "गण्डकी प्रदेशमा वातावरणीय व्यवस्थापन र कानुनी रोयल्टीमाथि स्थलगत अध्ययन।"
                    }
                ],
                isExternal: true
            },
            {
                slug: "the-leaders",
                title: {
                    en: "The Making of The Leaders: Preserving Nepal's Democratic Memory",
                    ne: "द लिडर्सको निर्माण: नेपालको प्रजातान्त्रिक स्मृति जोगाउने प्रयास"
                },
                excerpt: {
                    en: "An inquiry into why preserving open parliamentary debates, verified biographies, and primary documents is vital for the future of democracy.",
                    ne: "संसदीय बहस, ऐतिहासिक तथ्य र निष्पक्ष जीवनीहरूलाई अभिलेखीकरण गर्नु किन लोकतान्त्रिक संस्थाहरूको भविष्यका लागि आवश्यक छ।"
                },
                link: "/articles/the-leaders",
                source: "The Leaders Archive",
                sourceDomain: "theleaders.com.np",
                category: { en: "CIVIC ARCHIVE", ne: "नागरिक अभिलेख" },
                author: { en: "Editorial Board", ne: "सम्पादकीय मण्डल" },
                publishedDate: new Date().toISOString(),
                readTime: { en: "4 min read", ne: "४ मिनेट" },
                image: "/art/investigative-archive.jpg",
                isExternal: false
            },
            {
                slug: "cij-madhesh-budget",
                title: {
                    en: "Politicized Budget Distribution in Madhesh and the Spirit of Federalism",
                    ne: "मधेश प्रदेशमा बजेट वितरणको राजनीति र संघीयताको मर्म"
                },
                excerpt: {
                    en: "An investigation into how fiscal allocations and discretionary project funding in Madhesh have tested provincial oversight and local autonomy.",
                    ne: "मधेश प्रदेशमा योजना छनोट र बजेट विनियोजनमा भएको राजनीतिक प्रभावले प्रदेश सरकारको औचित्यमाथि उठाएको प्रश्नबारे विस्तृत रिपोर्ट।"
                },
                link: "https://www.cijnepal.org/detail/15635?slug=",
                source: "CIJ Nepal (खोजी पत्रकारिता केन्द्र)",
                sourceDomain: "cijnepal.org",
                category: { en: "PUBLIC FINANCE", ne: "सार्वजनिक वित्त" },
                author: { en: "Centre for Investigative Journalism (CIJ)", ne: "खोजी पत्रकारिता केन्द्र नेपाल" },
                publishedDate: new Date().toISOString(),
                readTime: { en: "6 min read", ne: "६ मिनेट" },
                image: "/art/investigative-madhesh.jpg",
                isExternal: true
            }
        ];
    }, [reports, articles]);

    const heroReport = activeReports[0];
    const sideReports = activeReports.slice(1, 3);
    const bottomReports = activeReports.slice(3, 6);

    const heroTitle = resolve(heroReport.title);
    const heroExcerpt = resolve(heroReport.excerpt);
    const heroAuthor = resolve(heroReport.author);
    const heroCategory = resolve(heroReport.category) || (isNepali ? "विशेष खोज" : "INVESTIGATIVE INQUIRY");
    const heroReadTime = resolve(heroReport.readTime) || (isNepali ? "५ मिनेट" : "5 min read");
    const heroSource = heroReport.source;

    const heroKeyPoints = heroReport.keyPoints && heroReport.keyPoints.length > 0
        ? heroReport.keyPoints.map(p => resolve(p))
        : [
            isNepali 
                ? "प्राथमिक स्रोत, सरकारी अभिलेख र स्थलगत प्रमाणहरूमा आधारित तथ्यगत विश्लेषण।"
                : "Inquiry based on verified records, statutory budgets, and primary public evidence.",
            isNepali
                ? "खोजी पत्रकारिता केन्द्र (CIJ Nepal) तथा स्वतन्त्र शोधकर्ताहरूद्वारा सम्पादित अनुसन्धान।"
                : "Investigative documentation verified by Centre for Investigative Journalism Nepal (CIJ)."
        ];

    return (
        <section id="investigative" className="py-14 bg-background border-b border-border">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-foreground pb-4 mb-8 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-foreground/80 flex items-center gap-1.5">
                            <Scale size={13} className="text-foreground/80" />
                            {isNepali ? "विशेष खोज तथा नीतिगत अनुसन्धान" : "SPECIAL INVESTIGATIONS · POLICY & CONSTITUTIONAL INQUIRIES"}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                            {isNepali ? "खोजमूलक रिपोर्ट तथा नीतिगत विश्लेषण" : "Investigative Reports & Policy Analysis"}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {isNepali
                                ? "खोजी पत्रकारिता केन्द्र (CIJ Nepal), हिमाल खबर तथा संस्थागत अभिलेखबाट सार्वजनिक स्रोत, संघीयता र विधिको शासनमाथि गरिएको तथ्यपरक खोजी।"
                                : "Rigorous, document-backed reporting on fiscal federalism, conservation governance, and public accountability from Centre for Investigative Journalism Nepal (CIJ) and policy bureaus."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href="https://cijnepal.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-foreground hover:underline uppercase tracking-wider"
                        >
                            <span>{isNepali ? "खोजी पत्रकारिता केन्द्र (CIJ) ↗" : "CIJ Nepal Archive ↗"}</span>
                        </a>
                    </div>
                </div>

                {/* Pure Broadsheet Layout: Hero Feature (7 cols) + Companion Stack (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 mb-10 items-stretch">
                    
                    {/* LEFT COLUMN: HERO INVESTIGATIVE REPORT (7 cols with hairline right divider) */}
                    <div className="lg:col-span-7 flex flex-col lg:border-r border-border/40 lg:pr-8">
                        <article className="h-full flex flex-col justify-between">
                            
                            <div>
                                {/* Investigation Header Strip with Verified Source */}
                                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-border/40 text-xs font-mono">
                                    <span className="font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5 text-[11px]">
                                        <FileText size={13} className="text-foreground/70" />
                                        <span>{heroCategory}</span>
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                                        <ShieldCheck size={11} className="text-foreground/70" />
                                        <span>{heroSource}</span>
                                    </span>
                                </div>

                                {/* Headline */}
                                {heroReport.isExternal ? (
                                    <a 
                                        href={heroReport.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="group block mb-3"
                                    >
                                        <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-foreground group-hover:underline underline-offset-2 transition-colors flex items-start justify-between gap-3">
                                            <span>{heroTitle}</span>
                                            <ExternalLink size={18} className="shrink-0 text-muted-foreground group-hover:text-foreground mt-1" />
                                        </h3>
                                    </a>
                                ) : (
                                    <Link href={heroReport.link} className="group block mb-3">
                                        <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-foreground group-hover:underline underline-offset-2 transition-colors">
                                            {heroTitle}
                                        </h3>
                                    </Link>
                                )}

                                {/* Hero Investigative Fine Art Plate */}
                                <div className="my-3.5">
                                    {heroReport.isExternal ? (
                                        <a 
                                            href={heroReport.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="group block overflow-hidden border border-border/60 relative aspect-[16/9] w-full bg-muted shadow-2xs"
                                        >
                                            <img
                                                src={heroReport.image || "/art/investigative-annapurna.jpg"}
                                                alt={heroTitle}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                                            <span className="absolute bottom-2.5 right-3 text-[9.5px] font-mono tracking-wider text-white/95 bg-black/75 px-2 py-0.5 rounded backdrop-blur-sm uppercase">
                                                {isNepali ? "विशेष सम्पादकीय रेखाचित्र" : "EDITORIAL CARTOGRAPHY & SURVEY"}
                                            </span>
                                        </a>
                                    ) : (
                                        <Link 
                                            href={heroReport.link} 
                                            className="group block overflow-hidden border border-border/60 relative aspect-[16/9] w-full bg-muted shadow-2xs"
                                        >
                                            <img
                                                src={heroReport.image || "/art/investigative-annapurna.jpg"}
                                                alt={heroTitle}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                                            <span className="absolute bottom-2.5 right-3 text-[9.5px] font-mono tracking-wider text-white/95 bg-black/75 px-2 py-0.5 rounded backdrop-blur-sm uppercase">
                                                {isNepali ? "विशेष सम्पादकीय रेखाचित्र" : "EDITORIAL CARTOGRAPHY & SURVEY"}
                                            </span>
                                        </Link>
                                    )}
                                    <div className="flex items-center justify-between text-[10.5px] font-mono text-muted-foreground pt-1.5 border-t border-border/30 mt-1">
                                        <span>{isNepali ? "अन्नपूर्ण संरक्षण क्षेत्र तथा प्राकृतिक स्रोत राजस्व सीमांकन रेखाचित्र" : "Annapurna Sanctuary Topographic Survey & Revenue Territory"}</span>
                                        <span className="uppercase text-[9.5px]">THE LEADERS ARCHIVAL DESK</span>
                                    </div>
                                </div>

                                {/* Lead Excerpt */}
                                <p className="text-[14.5px] text-foreground/90 leading-relaxed mb-4 font-sans line-clamp-3">
                                    {heroExcerpt}
                                </p>

                                {/* Editorial Investigation Takeaway (Sleek hairline rule, no bulky box) */}
                                {heroKeyPoints[0] && (
                                    <div className="border-l-2 border-foreground/30 pl-3.5 my-4">
                                        <p className="font-serif italic text-xs leading-relaxed text-foreground/80">
                                            “{heroKeyPoints[0]}”
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Author & Action Footer */}
                            <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs mt-4">
                                <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                                    <Clock size={12} />
                                    <span>{heroReadTime}</span>
                                    <span>•</span>
                                    <span className="text-foreground font-semibold">By {heroAuthor}</span>
                                </div>

                                {heroReport.isExternal ? (
                                    <a
                                        href={heroReport.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-bold text-xs text-foreground hover:underline uppercase tracking-wider font-mono text-[11px]"
                                    >
                                        <span>{isNepali ? "पूर्ण खोज पढ्नुहोस्" : "Read Investigation"}</span>
                                        <ExternalLink size={11} />
                                    </a>
                                ) : (
                                    <Link
                                        href={heroReport.link}
                                        className="inline-flex items-center gap-1 font-bold text-xs text-foreground hover:underline uppercase tracking-wider font-mono text-[11px]"
                                    >
                                        <span>{isNepali ? "पूर्ण विवरण" : "Read Report"}</span>
                                        <ArrowRight size={11} />
                                    </Link>
                                )}
                            </div>

                        </article>
                    </div>

                    {/* RIGHT COLUMN: 2 COMPANION INVESTIGATIONS (5 cols with hairline stack) */}
                    <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-border/40 lg:pl-8">
                        {sideReports.map((report, idx) => {
                            const title = resolve(report.title);
                            const excerpt = resolve(report.excerpt);
                            const category = resolve(report.category) || (isNepali ? "नीतिगत बहस" : "POLICY INQUIRY");
                            const author = resolve(report.author);
                            const readTime = resolve(report.readTime) || (isNepali ? "५ मिनेट" : "5 min read");

                            return (
                                <article 
                                    key={report.slug || idx}
                                    className={`flex flex-col justify-between flex-1 ${idx === 0 ? "pb-6" : "pt-6"}`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-mono mb-2 pb-1.5 border-b border-border/30">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                                                {category}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                {report.sourceDomain}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-4 mb-2">
                                            {report.image && (
                                                <div className="w-24 sm:w-28 shrink-0 aspect-[16/10] overflow-hidden border border-border/50 relative bg-muted mt-0.5">
                                                    <img
                                                        src={report.image}
                                                        alt={title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                {report.isExternal ? (
                                                    <a 
                                                        href={report.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="group block mb-1.5"
                                                    >
                                                        <h4 className="font-serif text-lg font-bold leading-snug text-foreground group-hover:underline underline-offset-2 flex items-start justify-between gap-2">
                                                            <span>{title}</span>
                                                            <ExternalLink size={13} className="shrink-0 text-muted-foreground group-hover:text-foreground mt-1" />
                                                        </h4>
                                                    </a>
                                                ) : (
                                                    <Link href={report.link} className="group block mb-1.5">
                                                        <h4 className="font-serif text-lg font-bold leading-snug text-foreground group-hover:underline underline-offset-2">
                                                            {title}
                                                        </h4>
                                                    </Link>
                                                )}

                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                    {excerpt}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                                        <span className="text-[10.5px] text-muted-foreground font-mono truncate max-w-[200px]">
                                            {author}
                                        </span>
                                        
                                        {report.isExternal ? (
                                            <a 
                                                href={report.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center gap-1 font-bold text-xs text-foreground hover:underline uppercase tracking-wider font-mono text-[11px]"
                                            >
                                                <span>{isNepali ? "रिपोर्ट" : "Read"}</span>
                                                <ExternalLink size={11} />
                                            </a>
                                        ) : (
                                            <Link 
                                                href={report.link} 
                                                className="inline-flex items-center gap-1 font-bold text-xs text-foreground hover:underline uppercase tracking-wider font-mono text-[11px]"
                                            >
                                                <span>{isNepali ? "विवरण" : "Read"}</span>
                                                <ArrowRight size={11} />
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                </div>

                {/* BOTTOM INVESTIGATIVE SHELF (3-Column Broadsheet with Hairline Dividers) */}
                {bottomReports.length > 0 && (
                    <div className="pt-6 border-t-2 border-foreground/30">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-6">
                            {isNepali ? "थप प्रमाणित अनुसन्धान तथा विश्लेषण" : "ADDITIONAL VERIFIED INVESTIGATIVE INQUIRIES"}
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40 gap-6 md:gap-0">
                            {bottomReports.map((report, idx) => {
                                const title = resolve(report.title);
                                const excerpt = resolve(report.excerpt);
                                const category = resolve(report.category) || (isNepali ? "अभिलेख" : "ARCHIVE");
                                const author = resolve(report.author);
                                const readTime = resolve(report.readTime) || (isNepali ? "५ मिनेट" : "5 min read");

                                return (
                                    <article 
                                        key={report.slug || idx}
                                        className={`flex flex-col justify-between ${idx === 0 ? "md:pr-6" : idx === 1 ? "md:px-6 pt-6 md:pt-0" : "md:pl-6 pt-6 md:pt-0"}`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                                                <span className="font-bold uppercase tracking-wider text-foreground/70 truncate">
                                                    {category}
                                                </span>
                                                <span className="text-muted-foreground font-mono text-[9px] shrink-0">
                                                    {report.sourceDomain}
                                                </span>
                                            </div>

                                            {report.isExternal ? (
                                                <a 
                                                    href={report.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="group block mb-1.5"
                                                >
                                                    <h4 className="font-serif text-base font-bold leading-snug text-foreground group-hover:underline underline-offset-2 flex items-start justify-between gap-1.5">
                                                        <span>{title}</span>
                                                        <ExternalLink size={12} className="shrink-0 text-muted-foreground group-hover:text-foreground mt-0.5" />
                                                    </h4>
                                                </a>
                                            ) : (
                                                <Link href={report.link} className="group block mb-1.5">
                                                    <h4 className="font-serif text-base font-bold leading-snug text-foreground group-hover:underline underline-offset-2">
                                                        {title}
                                                    </h4>
                                                </Link>
                                            )}

                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                                                {excerpt}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[160px]">
                                                {readTime} · {author}
                                            </span>

                                            {report.isExternal ? (
                                                <a 
                                                    href={report.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="font-bold text-xs text-foreground hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                                                >
                                                    <span>{isNepali ? "पढ्नुहोस्" : "Read"}</span>
                                                    <ExternalLink size={11} />
                                                </a>
                                            ) : (
                                                <Link 
                                                    href={report.link} 
                                                    className="font-bold text-xs text-foreground hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                                                >
                                                    <span>{isNepali ? "पढ्नुहोस्" : "Read"}</span>
                                                    <ArrowRight size={11} />
                                                </Link>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}
