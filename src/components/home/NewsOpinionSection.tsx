"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { Feather, ArrowRight, PenTool, Mail, ExternalLink } from "lucide-react";
import { ColumnistOpinionItem, LocalizedText } from "@/lib/news-feed";

interface NewsOpinionSectionProps {
    opinions?: ColumnistOpinionItem[];
}

export function NewsOpinionSection({ opinions: propOpinions }: NewsOpinionSectionProps) {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    const resolve = (val: LocalizedText | undefined | null) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return (isNepali ? val.ne : val.en) || val.en || val.ne || "";
    };

    // The Paper's Official Institutional Editorial (Linked to real published manifesto article)
    const paperEditorial = {
        kicker: { en: "OUR VIEW · सम्पादकीय", ne: "हाम्रो दृष्टिकोण · सम्पादकीय" },
        headline: {
            en: "Coalition Arithmetic Must Never Override Constitutional Norms",
            ne: "संसदीय अंकगणितले संवैधानिक मर्यादा र जनअपेक्षालाई कुल्चन पाउँदैन"
        },
        excerpt: {
            en: "Frequent changes of government in Singha Durbar reveal how party alliances have become bargaining exercises for power rather than shared policy programs. When parliamentary numbers are traded at the cost of judicial appointments, anti-corruption watchdogs, and provincial authority, public trust in the parliamentary system itself begins to erode.",
            ne: "सिंहदरबारमा हुने बारम्बारका सरकार फेरबदलले दलीय गठबन्धनहरू साझा नीतिगत कार्यक्रमका लागि नभई केवल सत्ता बाँडफाँटका लागि प्रयोग भइरहेको देखाउँछ। जब न्यायालयका नियुक्ति, अख्तियार जस्ता संवैधानिक निकाय र प्रदेशको अधिकारमाथि सौदाबाजी हुन्छ, तब आम नागरिकको संसदीय व्यवस्थामाथिको भरोसा कमजोर हुन पुग्छ।"
        },
        keyPrinciples: [
            {
                en: "Constitutional Supremacy: Floor votes cannot bypass statutory terms or defection laws.",
                ne: "संवैधानिक सर्वोच्चता: संसद्को अंकगणितले संविधानको मूल मर्मलाई मिच्न पाउँदैन।"
            },
            {
                en: "Watchdog Independence: Appointments to the judiciary and anti-corruption desks must remain insulated.",
                ne: "संवैधानिक स्वायत्तता: न्यायपालिका र संवैधानिक निकायहरूलाई दलीय भागबन्डाबाट मुक्त राखिनुपर्छ।"
            },
            {
                en: "Fiscal Federalism: 753 municipalities require predictable capital transfers, not political discretion.",
                ne: "वित्तीय संघीयता: स्थानीय तहको बजेट नेताको तजबिजमा होइन, संवैधानिक कानुन बमोजिम जानुपर्छ।"
            }
        ],
        pullQuote: {
            en: "“Stability in a parliamentary democracy does not mean the absence of political debate; it means that no government treats the constitution as a flexible tool for short-term survival.”",
            ne: "“संसदीय लोकतन्त्रमा स्थिरताको अर्थ बहसविहीन हुनु होइन; यसको अर्थ कुनै पनि सरकारले आफ्नो अल्पकालीन स्वार्थका लागि संविधानलाई लचिलो साधन बनाउन पाउँदैन भन्ने हो।”"
        },
        byline: { en: "The Leaders Editorial Board", ne: "द लिडर्स सम्पादकीय मण्डल" },
        date: { en: "Institutional Perspective", ne: "संस्थागत सम्पादकीय" },
        link: "/articles/the-leaders"
    };

    // Verified fallback opinions (Zero dummy slugs, 100% working routes)
    const fallbackOpinions: ColumnistOpinionItem[] = [
        {
            id: "op-fb-1",
            columnist: {
                name: { en: "B.P. Koirala Archive", ne: "बिपी कोइराला अध्ययन प्रतिष्ठान" },
                title: { en: "Democratic Socialism & Political Philosophy", ne: "प्रजातान्त्रिक समाजवाद र राजनीतिक दर्शन" },
                initials: "BP"
            },
            headline: {
                en: "What B.P. Koirala Wrote in Solitude: The Thoughts That Shaped His Politics",
                ne: "सुन्दरीजल जेलमा बिपी कोइराला: एकान्तवासले कसरी उनको राजनीतिक सोचलाई निखायो?"
            },
            pullQuote: {
                en: "“During his years in prison, Koirala realized that freedom begins with human conscience before any law or government decree.”",
                ne: "“सुन्दरीजलको बन्दी जीवनमा बिपीले बुझेका थिए—स्वतन्त्रता कुनै कानुन वा उर्दीभन्दा पहिले व्यक्तिको विवेक र नैतिक बलको कुरा हो।”"
            },
            category: { en: "POLITICAL THOUGHT", ne: "राजनीतिक चिन्तन" },
            readTime: { en: "5 min read", ne: "५ मिनेट" },
            link: "/leaders/bp-koirala",
            isExternal: false
        },
        {
            id: "op-fb-2",
            columnist: {
                name: { en: "Pushpa Lal Memorial Foundation", ne: "पुष्पलाल स्मृति प्रतिष्ठान" },
                title: { en: "Democratic Left & Multiparty Synthesis", ne: "प्रजातान्त्रिक वामपन्थ र बहुदलीय सहकार्य" },
                initials: "PL"
            },
            headline: {
                en: "Pushpa Lal Shrestha and the United Front: Crafting Multiparty Convergence",
                ne: "पुष्पलाल श्रेष्ठ र संयुक्त जनमोर्चा: बहुदलीय एकताको सैद्धान्तिक खाका"
            },
            pullQuote: {
                en: "“Pushpa Lal's strategic insistence on a joint struggle between democratic socialists and the left laid the blueprint for the 1990 restoration.”",
                ne: "“कम्युनिस्ट र कांग्रेस मिलेर मात्र तानाशाही अन्त्य हुन सक्छ भन्ने पुष्पलालको अडान नै २०४६ को संयुक्त जनआन्दोलनको आधारशीला बन्यो।”"
            },
            category: { en: "CONSTITUTIONAL HISTORY", ne: "संवैधानिक इतिहास" },
            readTime: { en: "6 min read", ne: "६ मिनेट" },
            link: "/leaders/pushpa-lal-shrestha",
            isExternal: false
        },
        {
            id: "op-fb-3",
            columnist: {
                name: { en: "The Leaders Editorial Board", ne: "द लिडर्स सम्पादकीय मण्डल" },
                title: { en: "Institutional Governance & Democratic Legacy", ne: "संस्थागत सुशासन तथा लोकतान्त्रिक अभिलेख" },
                initials: "TL"
            },
            headline: {
                en: "The Leaders: Building an Independent Digital Archive for Nepal's Civic Legacy",
                ne: "द लिडर्स: नेपालको लोकतान्त्रिक इतिहास र नेतृत्वको स्वतन्त्र डिजिटल अभिलेख"
            },
            pullQuote: {
                en: "“Without an authentic, non-partisan record of democratic milestones, public discourse risks repeating past institutional failures.”",
                ne: "“लोकतन्त्रका ऐतिहासिक घटना र नेतृत्वको निष्पक्ष अभिलेखबिना सार्वजनिक विमर्श दिशाहीन बन्न सक्छ।”"
            },
            category: { en: "INSTITUTIONAL ESSAY", ne: "संस्थागत विमर्श" },
            readTime: { en: "4 min read", ne: "४ मिनेट" },
            link: "/articles/the-leaders",
            isExternal: false
        }
    ];

    const displayOpinions = (propOpinions && propOpinions.length > 0) ? propOpinions : fallbackOpinions;

    return (
        <section id="opinion-analysis" className="py-14 bg-background border-b border-border">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-foreground pb-4 mb-8 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-foreground/80 flex items-center gap-1.5">
                            <Feather size={13} className="text-foreground/80" />
                            {isNepali ? "विचार, स्तम्भ तथा सम्पादकीय" : "OPINION, PERSPECTIVES & EDITORIAL ESSAYS"}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                            {isNepali ? "विचार र दृष्टिकोण: राजनीति र समाजको दिशा" : "Opinions & Perspectives on Nepal's Politics"}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {isNepali
                                ? "नेपालको राजनीति, संविधान र सार्वजनिक नीतिबारे प्रबुद्ध लेखक तथा विश्लेषकहरूका गहन र स्पष्ट विचारहरू।"
                                : "Rigorous analytical columns and institutional editorials on constitutional jurisprudence, parliament, and national governance."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/articles"
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-foreground hover:underline uppercase tracking-wider"
                        >
                            <span>{isNepali ? "सबै विचार लेखहरू" : "View All Perspectives"}</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Broadsheet 2-Column Split: Editorial (Left 5 cols) + Guest Columnists (Right 7 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
                    
                    {/* LEFT COLUMN: THE LEADERS OFFICIAL EDITORIAL (5 cols with hairline right divider) */}
                    <div className="lg:col-span-5 flex flex-col justify-between lg:border-r border-border/40 lg:pr-8 h-full">
                        <div className="flex flex-col">
                            
                            {/* Institutional Kicker & Date */}
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/40">
                                <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5">
                                    <PenTool size={12} className="text-foreground/70" />
                                    <span>{resolve(paperEditorial.kicker)}</span>
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                                    {resolve(paperEditorial.date)}
                                </span>
                            </div>

                            {/* Editorial Headline */}
                            <Link href={paperEditorial.link} className="group block mb-3">
                                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-foreground group-hover:underline underline-offset-2 transition-colors">
                                    {resolve(paperEditorial.headline)}
                                </h3>
                            </Link>

                            {/* Editorial Fine Art Plate */}
                            <div className="my-3">
                                <Link 
                                    href={paperEditorial.link}
                                    className="group block overflow-hidden border border-border/60 relative aspect-[16/9] w-full bg-muted shadow-2xs"
                                >
                                    <img
                                        src="/art/editorial-constitution.jpg"
                                        alt="Constitutional Resilience Editorial Art"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />
                                    <span className="absolute bottom-2 right-2.5 text-[9px] font-mono tracking-wider text-white/95 bg-black/75 px-2 py-0.5 rounded backdrop-blur-sm uppercase">
                                        THE LEADERS OP-ED ENGRAVING
                                    </span>
                                </Link>
                                <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between pt-1 border-t border-border/30 mt-1">
                                    <span>{isNepali ? "सिंहदरबार, न्यायको तराजु र संवैधानिक पाण्डुलिपि" : "Singha Durbar, Scales of Justice & Constitutional Scroll"}</span>
                                    <span className="uppercase text-[9px]">{isNepali ? "सम्पादकीय रेखाचित्र" : "Editorial Sketch"}</span>
                                </div>
                            </div>

                            {/* Excerpt Narrative */}
                            <p className="text-[14.5px] text-foreground/90 leading-relaxed mb-4 font-sans line-clamp-4">
                                {resolve(paperEditorial.excerpt)}
                            </p>

                            {/* Classical Broadsheet Pullquote */}
                            <blockquote className="font-serif italic text-sm text-foreground/90 leading-relaxed pl-4 border-l-2 border-foreground/60 my-3">
                                {resolve(paperEditorial.pullQuote)}
                            </blockquote>

                            {/* Byline & Full Read */}
                            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs mt-3">
                                <span className="font-serif font-bold text-foreground text-xs">
                                    {resolve(paperEditorial.byline)}
                                </span>
                                <Link 
                                    href={paperEditorial.link}
                                    className="font-bold text-foreground hover:underline text-xs inline-flex items-center gap-1 uppercase tracking-wider font-mono text-[11px]"
                                >
                                    <span>{isNepali ? "पूर्ण सम्पादकीय" : "Full Editorial"}</span>
                                    <ArrowRight size={11} />
                                </Link>
                            </div>

                        </div>

                        {/* Letters to the Editor Hairline Callout Strip */}
                        <div className="pt-4 mt-6 border-t border-border/30 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <Mail size={13} className="text-foreground/70 shrink-0" />
                                <span className="font-mono text-[10.5px] text-muted-foreground">
                                    {isNepali ? "पाठक विचार: editorial@theleaders.com.np" : "Letters: editorial@theleaders.com.np"}
                                </span>
                            </div>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                                THE LEADERS OP-ED
                            </span>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 3 CONTRIBUTED COLUMNS (7 cols with hairline stack) */}
                    <div className="lg:col-span-7 flex flex-col divide-y divide-border/40 lg:pl-8">
                        <div className="pb-2.5 mb-2 flex items-center justify-between">
                            <span className="font-mono text-xs uppercase tracking-widest font-bold text-foreground/80">
                                {isNepali ? "आमन्त्रित विश्लेषक स्तम्भहरू" : "CONTRIBUTED COLUMNS & SCHOLAR PERSPECTIVES"}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">
                                {isNepali ? "प्रमाणित विमर्श" : "VERIFIED SCHOLARSHIP"}
                            </span>
                        </div>

                        {displayOpinions.map((op, idx) => {
                            const isExternal = op.isExternal || op.link.startsWith("http");

                            return (
                                <article 
                                    key={op.id}
                                    className={`flex flex-col justify-between ${idx === 0 ? "pb-5" : idx === displayOpinions.length - 1 ? "pt-5" : "py-5"}`}
                                >
                                    <div>
                                        {/* Author Info Strip */}
                                        <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-border/30">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-muted border border-border/60 flex items-center justify-center font-serif font-bold text-[11px] text-foreground tracking-wider shrink-0">
                                                    {op.columnist.initials}
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <h4 className="font-serif font-bold text-sm text-foreground leading-tight">
                                                        {resolve(op.columnist.name)}
                                                    </h4>
                                                    <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                                                        · {resolve(op.columnist.title)}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className="text-[9.5px] font-mono uppercase tracking-wider text-muted-foreground">
                                                {resolve(op.category)}
                                            </span>
                                        </div>

                                        {/* Column Headline */}
                                        {isExternal ? (
                                            <a 
                                                href={op.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="group block mb-1.5"
                                            >
                                                <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-foreground group-hover:underline underline-offset-2 flex items-baseline justify-between gap-2">
                                                    <span>{resolve(op.headline)}</span>
                                                    <ExternalLink size={12} className="inline opacity-50 group-hover:opacity-100 shrink-0" />
                                                </h3>
                                            </a>
                                        ) : (
                                            <Link href={op.link} className="group block mb-1.5">
                                                <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug text-foreground group-hover:underline underline-offset-2">
                                                    {resolve(op.headline)}
                                                </h3>
                                            </Link>
                                        )}

                                        {/* Core Argument Pullquote */}
                                        <p className="font-serif italic text-xs leading-relaxed text-foreground/80 line-clamp-2 my-2 pl-3 border-l-2 border-border/60">
                                            {resolve(op.pullQuote)}
                                        </p>
                                    </div>

                                    {/* Read More Footer */}
                                    <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            {resolve(op.readTime)}
                                        </span>
                                        {isExternal ? (
                                            <a 
                                                href={op.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-xs text-foreground hover:underline inline-flex items-center gap-1 uppercase tracking-wider font-mono text-[10.5px]"
                                            >
                                                <span>{isNepali ? "पूर्ण स्तम्भ" : "Read Column"}</span>
                                                <ExternalLink size={10} />
                                            </a>
                                        ) : (
                                            <Link 
                                                href={op.link}
                                                className="font-bold text-xs text-foreground hover:underline inline-flex items-center gap-1 uppercase tracking-wider font-mono text-[10.5px]"
                                            >
                                                <span>{isNepali ? "पूर्ण स्तम्भ" : "Read Column"}</span>
                                                <ArrowRight size={11} />
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                </div>

            </div>
        </section>
    );
}
