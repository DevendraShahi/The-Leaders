"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, CheckCircle2, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TrendingTopic } from "@/lib/analytics-data";
import { useLanguage } from "@/components/providers/language-provider";

interface TrendingTopicsSectionProps {
    initialData: TrendingTopic[];
}

const NEPALI_TOPIC_FALLBACKS: Record<string, string> = {
    "Public Service Delivery Reform": "सार्वजनिक सेवा सुधार",
    "Youth Employment and Migration": "युवा रोजगारी र बसाइँसराइ",
    "Inflation and Household Costs": "महँगी र घरखर्च",
    "Corruption and Procurement Oversight": "भ्रष्टाचार र खरिद पारदर्शिता",
    "Federalism and Inter-Government Coordination": "संघीयता र तहबीच समन्वय",
    "Education Quality and Teacher Accountability": "शिक्षा गुणस्तर र शिक्षक जिम्मेवारी",
    "Urban Mobility and Road Safety": "सहरी यातायात र सडक सुरक्षा",
    "Health Access and Insurance Reach": "स्वास्थ्य पहुँच र बीमा",
    "Agriculture Support and Market Access": "कृषि सहयोग र बजार पहुँच",
    "Climate Resilience and Disaster Readiness": "जलवायु जोखिम र विपद् तयारी",
    "Digital Rights and Information Integrity": "डिजिटल अधिकार र सूचना विश्वसनीयता",
    "Tourism Recovery and Local Enterprise": "पर्यटन पुनरुत्थान र स्थानीय उद्यम",
};

const NEPALI_SUMMARY_FALLBACKS: Record<string, string> = {
    "Public Service Delivery Reform":
        "सेवा प्रवाह छिटो बनाउने, डिजिटल सेवा विस्तार गर्ने र स्थानीय उत्तरदायित्व बढाउने बहस प्रमुख छ।",
    "Youth Employment and Migration":
        "युवा रोजगारी, सीप विकास र विदेश बसाइँसराइ कम गर्ने नीति चुनावी बहसको केन्द्रमा छन्।",
    "Inflation and Household Costs":
        "दैनिक उपभोग्य वस्तुको महँगी र घरखर्च व्यवस्थापन अहिले मतदाताको प्रत्यक्ष चिन्ता बनेको छ।",
    "Corruption and Procurement Oversight":
        "भ्रष्टाचार नियन्त्रण र सार्वजनिक खरिद प्रक्रियाको पारदर्शिता सम्बन्धी बहस उच्च छ।",
    "Federalism and Inter-Government Coordination":
        "संघ, प्रदेश र स्थानीय तहबीच कामको समन्वय र जिम्मेवारी स्पष्टताबारे चर्चा जारी छ।",
    "Education Quality and Teacher Accountability":
        "शिक्षक उपस्थिती, शिक्षण गुणस्तर र पाठ्यक्रमको व्यवहारिकताबारे व्यापक चर्चा भइरहेको छ।",
    "Urban Mobility and Road Safety":
        "सहरी क्षेत्रमा ट्राफिक जाम, सार्वजनिक यातायात र सडक सुरक्षाका मुद्दा लगातार बढिरहेका छन्।",
    "Health Access and Insurance Reach":
        "गुणस्तरीय स्वास्थ्य सेवा पहुँच र स्वास्थ्य बीमाको कार्यान्वयन अझै मुख्य प्राथमिकता बनेको छ।",
    "Agriculture Support and Market Access":
        "कृषि लागत, सिँचाइ सुविधा र उत्पादनको बजार पहुँचबारे ग्रामीण क्षेत्रमा बहस स्थिर छ।",
    "Climate Resilience and Disaster Readiness":
        "बाढी, पहिरो र विपद् तयारी सम्बन्धी नीति चर्चाले स्थानीय एजेन्डामा स्थान बनाइरहेको छ।",
    "Digital Rights and Information Integrity":
        "अनलाइन गोपनीयता, गलत सूचना नियन्त्रण र डिजिटल अधिकारबारे चासो बढ्दो छ।",
    "Tourism Recovery and Local Enterprise":
        "पर्यटन पुनरुत्थान र स्थानीय व्यवसाय पुनर्जीवनबारे बहस अझै जारी छ तर गति केही घटेको छ।",
};

type RichTrendingTopic = TrendingTopic & {
    changePercent: number;
    category: string;
    sourceCount: number;
    momentumScore: number;
    summary: string;
    summaryNe: string;
    topicNe: string;
    verification: "verified" | "partial" | "fallback";
    tags: string[];
    references: NonNullable<TrendingTopic["references"]>;
};

function normalizeTopics(topics: TrendingTopic[]): RichTrendingTopic[] {
    const byMentions = [...topics].sort((a, b) => b.mentions - a.mentions);
    const maxMentions = byMentions[0]?.mentions ?? 1;

    return byMentions.map((topic) => {
        const inferredMomentum = Math.max(
            35,
            Math.min(99, Math.round((topic.mentions / maxMentions) * 100))
        );

        return {
            ...topic,
            changePercent: topic.changePercent ?? 0,
            category: topic.category ?? "Campaign",
            sourceCount: topic.sourceCount ?? 0,
            momentumScore: topic.momentumScore ?? inferredMomentum,
            summary:
                topic.summary ??
                "Topic velocity remains significant across election-focused coverage.",
            summaryNe:
                topic.summaryNe ??
                NEPALI_SUMMARY_FALLBACKS[topic.topic] ??
                "निर्वाचन सम्बन्धी समाचारमा यस विषयको चर्चा अझै उल्लेखनीय रूपमा सक्रिय छ।",
            topicNe: topic.topicNe ?? NEPALI_TOPIC_FALLBACKS[topic.topic] ?? topic.topic,
            verification: topic.verification ?? "fallback",
            tags: (topic.tags ?? []).slice(0, 3),
            references: (topic.references ?? []).slice(0, 5),
        };
    });
}

function getTrendCopy(
    trend: TrendingTopic["trend"],
    changePercent: number,
    language: "en" | "ne"
) {
    const signedChange = `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`;

    if (trend === "up") {
        return {
            icon: TrendingUp,
            label: language === "en" ? `${signedChange} acceleration` : `${signedChange} वृद्धि`,
            textClass: "text-primary",
        };
    }
    if (trend === "down") {
        return {
            icon: TrendingDown,
            label: language === "en" ? `${signedChange} slowdown` : `${signedChange} कमी`,
            textClass: "text-foreground/75",
        };
    }
    return {
        icon: Minus,
        label: language === "en" ? "Stable movement" : "स्थिर प्रवृत्ति",
        textClass: "text-muted-foreground",
    };
}

export function TrendingTopicsSection({ initialData }: TrendingTopicsSectionProps) {
    const { language } = useLanguage();
    const shouldReduceMotion = useReducedMotion();
    const [topics, setTopics] = useState<TrendingTopic[]>(initialData);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const locale = language === "ne" ? "ne-NP" : "en-US";

    useEffect(() => {
        const loadTrends = async () => {
            try {
                const response = await fetch("/api/election/trending-topics", {
                    cache: "no-store",
                });
                if (!response.ok) return;
                const payload = await response.json();
                const freshTopics = payload?.data?.topics as TrendingTopic[] | undefined;
                if (freshTopics && freshTopics.length > 0) {
                    setTopics(freshTopics);
                    if (payload?.data?.updatedAt) {
                        setUpdatedAt(payload.data.updatedAt);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch trending topics:", error);
            }
        };

        loadTrends();
        const timer = setInterval(loadTrends, 1000 * 60 * 15);
        return () => clearInterval(timer);
    }, []);

    const normalizedTopics = useMemo(() => normalizeTopics(topics), [topics]);
    const [leadTopic, ...otherTopics] = normalizedTopics;
    const rankedTopics = otherTopics.slice(0, 8);

    if (!leadTopic) {
        return (
            <div className="mx-auto max-w-5xl border border-border/70 bg-card/40 p-6">
                <p className="home-meta">
                    {language === "en"
                        ? "No trend dataset available right now."
                        : "हाल ट्रेन्ड डाटासेट उपलब्ध छैन।"}
                </p>
            </div>
        );
    }

    const leadTrend = getTrendCopy(leadTopic.trend, leadTopic.changePercent, language);
    const leadMentions = leadTopic.mentions.toLocaleString(locale);
    const resolvedLeadTitle = language === "ne" ? leadTopic.topicNe : leadTopic.topic;
    const resolvedLeadSummary = language === "ne" ? leadTopic.summaryNe : leadTopic.summary;
    const resolvedUpdatedText = updatedAt
        ? new Date(updatedAt).toLocaleString(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : null;

    return (
        <div className="homepage-shell mx-auto w-full max-w-6xl">
            <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                <motion.article
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.32 }}
                    className="border border-border/80 bg-background/70 p-5"
                >
                    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-4">
                        <div>
                            <p className="home-meta">
                                {language === "en" ? "Lead Topic Signal" : "मुख्य विषय संकेत"}
                            </p>
                            <h3 className="home-title-md mt-2 text-foreground">
                                {resolvedLeadTitle}
                            </h3>
                        </div>
                        <div className="inline-flex h-9 w-9 items-center justify-center border border-primary/45 bg-primary/10 text-primary">
                            <Activity className="h-4 w-4" />
                        </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {resolvedLeadSummary}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="border border-border/75 bg-card/50 p-3">
                            <p className="home-meta">
                                {language === "en" ? "Mentions" : "उल्लेख"}
                            </p>
                            <p className="mt-1 font-editorial text-3xl leading-none text-foreground">
                                {leadMentions}
                            </p>
                        </div>
                        <div className="border border-border/75 bg-card/50 p-3">
                            <p className="home-meta">
                                {language === "en" ? "Category" : "श्रेणी"}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                                {leadTopic.category}
                            </p>
                        </div>
                        <div className="border border-border/75 bg-card/50 p-3">
                            <p className="home-meta">
                                {language === "en" ? "Sources" : "स्रोत"}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                                {leadTopic.sourceCount.toLocaleString(locale)}
                            </p>
                        </div>
                        <div className="border border-border/75 bg-card/50 p-3">
                            <p className="home-meta">
                                {language === "en" ? "Momentum" : "गति"}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                                {leadTopic.momentumScore}/100
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-mono uppercase tracking-[0.14em] ${
                                leadTopic.verification === "verified"
                                    ? "border-primary/45 bg-primary/10 text-primary"
                                    : leadTopic.verification === "partial"
                                      ? "border-border/70 bg-card/45 text-foreground"
                                      : "border-border/70 bg-card/35 text-muted-foreground"
                            }`}
                        >
                            <CheckCircle2 className="h-3 w-3" />
                            {language === "en"
                                ? leadTopic.verification === "verified"
                                    ? "Verified"
                                    : leadTopic.verification === "partial"
                                      ? "Partially Verified"
                                      : "Fallback"
                                : leadTopic.verification === "verified"
                                  ? "प्रमाणित"
                                  : leadTopic.verification === "partial"
                                    ? "आंशिक प्रमाणित"
                                    : "फलब्याक"}
                        </span>

                        {resolvedUpdatedText && (
                            <span className="text-[11px] text-muted-foreground">
                                {language === "en"
                                    ? `Updated: ${resolvedUpdatedText}`
                                    : `अपडेट: ${resolvedUpdatedText}`}
                            </span>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {leadTopic.tags.map((tag) => (
                            <span
                                key={`lead-tag-${tag}`}
                                className="border border-border/70 bg-card/45 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {leadTopic.references.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                {language === "en" ? "Refs" : "स्रोत"}
                            </span>
                            {leadTopic.references.slice(0, 5).map((reference) => (
                                <a
                                    key={`${leadTopic.topic}-${reference.url}-${reference.abbr}`}
                                    href={reference.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`${reference.source}: ${reference.title}`}
                                    className="border border-border/60 bg-background/70 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                >
                                    {reference.abbr}
                                </a>
                            ))}
                        </div>
                    )}

                    <div className={`mt-4 inline-flex items-center gap-2 text-xs ${leadTrend.textClass}`}>
                        <leadTrend.icon className="h-3.5 w-3.5" />
                        <span className="font-mono uppercase tracking-[0.14em]">
                            {leadTrend.label}
                        </span>
                    </div>
                </motion.article>

                <div className="space-y-3">
                    {rankedTopics.map((topic, index) => {
                        const trendInfo = getTrendCopy(topic.trend, topic.changePercent, language);
                        const topicTitle = language === "ne" ? topic.topicNe : topic.topic;
                        return (
                            <motion.article
                                key={`${topic.topic}-${index}`}
                                initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.24, delay: index * 0.035 }}
                                className="border border-border/75 bg-background/65 p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-primary/35 bg-primary/10 font-mono text-[11px] text-primary">
                                            {index + 2}
                                        </div>
                                        <div>
                                            <p className="home-meta">{topic.category}</p>
                                            <h4 className="mt-1 text-sm font-semibold leading-5 text-foreground">
                                                {topicTitle}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 text-[11px] ${trendInfo.textClass}`}>
                                        <trendInfo.icon className="h-3.5 w-3.5" />
                                        <span className="font-mono uppercase tracking-[0.12em]">
                                            {topic.trend === "stable"
                                                ? language === "en"
                                                    ? "steady"
                                                    : "स्थिर"
                                                : `${topic.changePercent > 0 ? "+" : ""}${topic.changePercent.toFixed(1)}%`}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 h-1.5 overflow-hidden bg-muted/30">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.max(6, topic.momentumScore)}%` }}
                                    />
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                    <span>
                                        {topic.mentions.toLocaleString(locale)}{" "}
                                        {language === "en" ? "mentions" : "उल्लेख"}
                                    </span>
                                    <span>
                                        {topic.sourceCount.toLocaleString(locale)}{" "}
                                        {language === "en" ? "sources" : "स्रोत"}
                                    </span>
                                    <span>
                                        {language === "en" ? "signal" : "संकेत"} {topic.momentumScore}/100
                                    </span>
                                    <span>
                                        {language === "en"
                                            ? topic.verification === "verified"
                                                ? "verified"
                                                : topic.verification === "partial"
                                                  ? "partial"
                                                  : "fallback"
                                            : topic.verification === "verified"
                                              ? "प्रमाणित"
                                              : topic.verification === "partial"
                                                ? "आंशिक"
                                                : "फलब्याक"}
                                    </span>
                                </div>

                                {topic.references.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center gap-1">
                                        {topic.references.slice(0, 3).map((reference) => (
                                            <a
                                                key={`${topic.topic}-${reference.url}-${reference.abbr}`}
                                                href={reference.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`${reference.source}: ${reference.title}`}
                                                className="border border-border/60 bg-background/70 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
                                            >
                                                {reference.abbr}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
