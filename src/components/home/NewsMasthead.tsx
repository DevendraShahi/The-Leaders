"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import { ArrowRight, Flame, CloudSun, Radio, Globe, CalendarDays, Volume2, Pause, Play } from "lucide-react";
import styles from "./NewsHome.module.css";

export type LocalizedText = string | { en?: string; ne?: string };

interface NewsMastheadProps {
    tickerItems?: {
        title: LocalizedText;
        link: string;
        tag?: LocalizedText;
    }[];
}

export function NewsMasthead({ tickerItems = [] }: NewsMastheadProps) {
    const { language } = useLanguage();
    const isNepali = language === "ne";
    const [isPaused, setIsPaused] = useState(false);

    const resolve = (val: LocalizedText | undefined | null) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        return (isNepali ? val.ne : val.en) || val.en || val.ne || "";
    };

    // Calculate exact Gregorian & Bikram Sambat datelines
    const datelineInfo = useMemo(() => {
        const now = new Date();
        const enOptions: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const enDate = now.toLocaleDateString('en-US', enOptions);

        const gYear = now.getFullYear();
        const gMonth = now.getMonth();
        const gDate = now.getDate();

        const bsMonthsNe = [
            "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
            "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
        ];
        const nepaliDays = [
            "आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"
        ];
        const neDayName = nepaliDays[now.getDay()];

        const bsYear = gMonth >= 3 && (gMonth > 3 || gDate >= 14) ? gYear + 57 : gYear + 56;

        const toDevanagari = (num: number | string) => {
            const digits: Record<string, string> = {
                "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
                "5": "५", "6": "६", "7": "७", "8": "८", "9": "९"
            };
            return String(num).replace(/[0-9]/g, (d) => digits[d] || d);
        };

        const offsets = [
            { gM: 0, gD: 15, bsM: 9 },   // Jan 15 -> Magh
            { gM: 1, gD: 13, bsM: 10 },  // Feb 13 -> Falgun
            { gM: 2, gD: 15, bsM: 11 },  // Mar 15 -> Chaitra
            { gM: 3, gD: 14, bsM: 0 },   // Apr 14 -> Baisakh
            { gM: 4, gD: 15, bsM: 1 },   // May 15 -> Jestha
            { gM: 5, gD: 15, bsM: 2 },   // Jun 15 -> Ashadh
            { gM: 6, gD: 16, bsM: 3 },   // Jul 16 -> Shrawan
            { gM: 7, gD: 17, bsM: 4 },   // Aug 17 -> Bhadra
            { gM: 8, gD: 17, bsM: 5 },   // Sep 17 -> Ashwin
            { gM: 9, gD: 17, bsM: 6 },   // Oct 17 -> Kartik
            { gM: 10, gD: 16, bsM: 7 },  // Nov 16 -> Mangsir
            { gM: 11, gD: 16, bsM: 8 },  // Dec 16 -> Poush
        ];

        let currentOffset = offsets[0];
        for (let i = offsets.length - 1; i >= 0; i--) {
            if (gMonth > offsets[i].gM || (gMonth === offsets[i].gM && gDate >= offsets[i].gD)) {
                currentOffset = offsets[i];
                break;
            }
        }
        let approxBsDay = 1;
        if (gMonth === currentOffset.gM) {
            approxBsDay = gDate - currentOffset.gD + 1;
        } else {
            approxBsDay = (30 - currentOffset.gD) + gDate + 1;
        }
        approxBsDay = Math.max(1, Math.min(32, approxBsDay));

        const bsMonthNameNe = bsMonthsNe[currentOffset.bsM];
        const neDate = `${neDayName}, ${toDevanagari(approxBsDay)} ${bsMonthNameNe} ${toDevanagari(bsYear)} वि.सं.`;

        return {
            enDate,
            neDate,
            weatherText: isNepali ? "काठमाडौँ १९°से · सफा" : "Kathmandu 19°C · Clear",
            editionVol: isNepali ? "खण्ड ४ · अङ्क २८८" : "VOL. IV · NO. 288"
        };
    }, [isNepali]);

    const fallbackItems = useMemo(() => [
        {
            title: isNepali 
                ? "संसदीय विशेष समिति: नीतिगत सुधार तथा विधिको शासनबारे नयाँ छलफल" 
                : "Parliamentary Committee Convenes on Constitutional & Policy Reforms",
            link: "/articles",
            tag: isNepali ? "विशेष कभरेज" : "SPECIAL REPORT"
        },
        {
            title: isNepali 
                ? "इतिहासको पुनर्पठन: बिपी कोइरालाको प्रजातान्त्रिक समाजवाद र आजको सान्दर्भिकता" 
                : "Revisiting BP Koirala’s Democratic Socialism in Contemporary Nepal",
            link: "/articles",
            tag: isNepali ? "विश्लेषण" : "ANALYSIS"
        },
        {
            title: isNepali
                ? "अर्थतन्त्र र सुशासन: आगामी आर्थिक वर्षको नीतिगत प्राथमिकतामाथि गम्भीर बहस"
                : "Fiscal Policy Debate: Navigating Governance and Economic Growth",
            link: "/articles",
            tag: isNepali ? "अर्थतन्त्र" : "ECONOMY"
        },
        {
            title: isNepali
                ? "संवैधानिक इजलास: संघीयता र स्थानीय सरकारका अधिकार क्षेत्रसम्बन्धी महत्वपूर्ण फैसला"
                : "Constitutional Bench Issues Landmark Guidance on Sub-National Governance",
            link: "/articles",
            tag: isNepali ? "संविधान" : "CONSTITUTION"
        }
    ], [isNepali]);

    const activeTicker = tickerItems.length > 0 ? tickerItems : fallbackItems;

    return (
        <header className="w-full bg-background select-none">
            
            {/* 1. TOP DATELINE & WEATHER BAR */}
            <div className="container mx-auto px-4">
                <div className={styles.mastheadBar}>
                    <div className={styles.datelineGroup}>
                        <span className="font-semibold text-foreground tracking-normal">
                            {isNepali ? datelineInfo.neDate : datelineInfo.enDate}
                        </span>
                        <span className="opacity-40">•</span>
                        <span className="hidden sm:inline font-medium text-foreground/80">
                            {isNepali ? datelineInfo.enDate : datelineInfo.neDate}
                        </span>
                        <span className="opacity-40 hidden md:inline">•</span>
                        <span className="hidden md:inline-flex items-center gap-1.5 text-foreground/70">
                            <CloudSun size={13} className="text-amber-500" />
                            <span>{datelineInfo.weatherText}</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono font-medium hidden sm:inline text-muted-foreground">
                            {datelineInfo.editionVol}
                        </span>
                        <span className="opacity-40 hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5">
                            <Globe size={11} className="text-foreground/70" />
                            <span className="font-mono text-[10px] font-semibold tracking-wider text-foreground/80">
                                {isNepali ? "डिजिटल अभिलेख संस्करण" : "DIGITAL EDITION"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. GRAND BROADSHEET NAMEPLATE */}
            <div className={styles.nameplateWrapper}>
                <div className="container mx-auto px-4">
                    <div className={styles.nameplateContent}>
                        <Link href="/" className="group inline-block">
                            <h1 className={styles.nameplateTitle}>
                                THE LEADERS
                            </h1>
                        </Link>

                        <div className={styles.nameplateSubtitle}>
                            {isNepali ? "द लिडर्स · नेपालको प्रजातान्त्रिक अभिलेख" : "THE LEADERS · DEMOCRACY ARCHIVE"}
                        </div>

                        <p className={styles.nameplateMotto}>
                            {isNepali
                                ? "“नेपालको प्रजातान्त्रिक आन्दोलन, राजनेता, संसद् र राजनीतिक इतिहासको तथ्यपरक एवं निष्पक्ष डिजिटल अभिलेख।”"
                                : "“An Independent Journal & Archive of Nepal’s Democratic Struggle, Statesmanship & Public History.”"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. SIGNATURE BROADSHEET DOUBLE RULE */}
            <div className="container mx-auto px-4 my-1">
                <div className={styles.broadsheetDoubleRule} />
            </div>

            {/* 4. SECTION JUMP BAR */}
            <nav className={styles.sectionNavBar} aria-label="Newspaper section navigation">
                <div className="container mx-auto px-4">
                    <div className={styles.sectionNavList}>
                        <a href="#front-page" className={styles.sectionNavLinkActive}>
                            {isNepali ? "मुख्य पृष्ठ" : "Front Page"}
                        </a>
                        <a href="#top-stories" className={styles.sectionNavLink}>
                            {isNepali ? "प्रमुख समाचार" : "Top Stories"}
                        </a>
                        <a href="#dispatch-wire" className={styles.sectionNavLink}>
                            {isNepali ? "२४ घण्टे तार" : "24h Wire"}
                        </a>
                        <a href="#political-architects" className={styles.sectionNavLink}>
                            {isNepali ? "ऐतिहासिक नेताहरू" : "The Architects"}
                        </a>
                        <a href="#investigative" className={styles.sectionNavLink}>
                            {isNepali ? "खोजमूलक" : "Investigations"}
                        </a>
                        <a href="#opinion-analysis" className={styles.sectionNavLink}>
                            {isNepali ? "विचार र विमर्श" : "Opinion"}
                        </a>
                        <a href="#democracy-chronicles" className={styles.sectionNavLink}>
                            {isNepali ? "ऐतिहासिक कालखण्ड" : "Milestones"}
                        </a>
                        <a href="#morning-dispatch" className={styles.sectionNavLink}>
                            {isNepali ? "दैनिक ब्रिफिङ" : "Morning Dispatch"}
                        </a>
                    </div>
                </div>
            </nav>

            {/* 5. EDITORIAL DISPATCH WIRE TICKER */}
            <div 
                className={styles.tickerSection}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="container mx-auto px-4 flex items-center justify-between gap-3">
                    
                    {/* Badge */}
                    <div className={styles.tickerBadge}>
                        <Radio size={11} className="text-background" />
                        <span>{isNepali ? "ताजा तार" : "DISPATCH WIRE"}</span>
                    </div>

                    {/* Marquee Content */}
                    <div className={styles.tickerContent}>
                        <div 
                            className={`${styles.tickerTrack} ${isPaused ? styles.tickerTrackPaused : ""}`}
                        >
                            {/* Duplicate ticker items once for seamless continuous broadsheet marquee */}
                            {[...activeTicker, ...activeTicker].map((item, idx) => {
                                const isExternal = item.link?.startsWith("http");
                                return (
                                    <Link 
                                        key={idx} 
                                        href={item.link}
                                        target={isExternal ? "_blank" : undefined}
                                        rel={isExternal ? "noopener noreferrer" : undefined}
                                        className="inline-flex items-center gap-2 hover:text-foreground transition-colors whitespace-nowrap text-[13px] text-foreground font-medium group"
                                    >
                                        {item.tag && (
                                            <span className="text-[10px] font-mono font-semibold text-foreground/80 uppercase tracking-wider bg-muted border border-border px-1.5 py-0.5 rounded">
                                                {resolve(item.tag)}
                                            </span>
                                        )}
                                        <span className="group-hover:underline underline-offset-2">
                                            {resolve(item.title)}
                                        </span>
                                        <span className="opacity-30 text-xs ml-3 text-muted-foreground">•</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls & Timeline Link */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsPaused(!isPaused)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                            title={isPaused ? (isNepali ? "पुनः सुरु गर्नुहोस्" : "Resume Ticker") : (isNepali ? "रोक्नुहोस्" : "Pause Ticker")}
                            aria-label={isPaused ? "Resume Ticker" : "Pause Ticker"}
                        >
                            {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        </button>
                        <Link 
                            href="#dispatch-wire"
                            className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                        >
                            <span>{isNepali ? "ताजा तार हेर्नुहोस्" : "Live Wire Dispatches"}</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>

                </div>
            </div>

        </header>
    );
}
