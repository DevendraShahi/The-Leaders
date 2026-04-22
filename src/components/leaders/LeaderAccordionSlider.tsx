"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronLeft, ChevronRight, ArrowRight, Users, LayoutGrid } from "lucide-react";
import { ILeader } from "@/models/Leader";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES, tString, type LanguageCode } from "@/lib/locales";
import { cn } from "@/lib/utils";

type LocalizedField = { en?: string; ne?: string } | string | null | undefined;

const resolveContent = (field: LocalizedField, language: LanguageCode) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    const primary = language === "ne" ? field.ne : field.en;
    const fallback = language === "ne" ? field.en : field.ne;
    return primary || fallback || "";
};

const normalizeSearchText = (value: string) =>
    value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

interface LeaderAccordionSliderProps {
    leaders: ILeader[];
}

type SortKey = "featured" | "nameAsc" | "nameDesc" | "yearsAsc" | "yearsDesc";

export default function LeaderAccordionSlider({ leaders }: LeaderAccordionSliderProps) {
    const { language } = useLanguage();
    const isNepali = language === "ne";
    const [activeIndex, setActiveIndex] = useState(-1);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortKey, setSortKey] = useState<SortKey>("featured");

    const filteredLeaders = useMemo(() => {
        let result = [...leaders];

        if (searchTerm) {
            const term = normalizeSearchText(searchTerm);
            result = result.filter(leader => {
                const name = normalizeSearchText(resolveContent(leader.name, language));
                const position = normalizeSearchText(resolveContent(leader.position, language));
                const party = normalizeSearchText(resolveContent(leader.party, language));
                return name.includes(term) || position.includes(term) || party.includes(term);
            });
        }

        if (statusFilter !== "all") {
            if (statusFilter === "featured") {
                result = result.filter(l => l.isFeatured);
            } else if (statusFilter === "active") {
                result = result.filter(l => l.isActive && String(l.status).toLowerCase() !== "archived");
            } else if (statusFilter === "legacy") {
                result = result.filter(l => !l.isActive || String(l.status).toLowerCase() === "archived");
            }
        }

        result.sort((a, b) => {
            const aName = resolveContent(a.name, language);
            const bName = resolveContent(b.name, language);
            const aYears = resolveContent(a.years, language);
            const bYears = resolveContent(b.years, language);

            if (sortKey === "featured") {
                if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
                return aName.localeCompare(bName, isNepali ? "ne" : "en");
            }
            if (sortKey === "nameAsc") return aName.localeCompare(bName, isNepali ? "ne" : "en");
            if (sortKey === "nameDesc") return bName.localeCompare(aName, isNepali ? "ne" : "en");
            if (sortKey === "yearsAsc") return aYears.localeCompare(bYears, isNepali ? "ne" : "en");
            if (sortKey === "yearsDesc") return bYears.localeCompare(aYears, isNepali ? "ne" : "en");
            return 0;
        });

        return result;
    }, [leaders, searchTerm, statusFilter, sortKey, language, isNepali]);

    const stats = useMemo(() => ({
        total: leaders.length,
    }), [leaders]);

    const goTo = useCallback((index: number) => {
        if (index < 0 || index >= filteredLeaders.length) return;
        if (activeIndex === index) {
            setActiveIndex(-1);
            return;
        }
        setActiveIndex(index);
    }, [filteredLeaders.length, activeIndex]);

    const goPrev = () => goTo(activeIndex - 1);
    const goNext = () => goTo(activeIndex + 1);

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setSortKey("featured");
    };

    const hasActiveFilters = searchTerm || statusFilter !== "all" || sortKey !== "featured";

    const sortOptions = [
        { value: "featured", label: isNepali ? "विशेष" : "Featured" },
        { value: "nameAsc", label: isNepali ? "नाम (अ-ज)" : "Name A-Z" },
        { value: "nameDesc", label: isNepali ? "नाम (ज-अ)" : "Name Z-A" },
        { value: "yearsAsc", label: isNepali ? "पुरानो" : "Oldest" },
        { value: "yearsDesc", label: isNepali ? "नयाँ" : "Newest" },
    ];

    const statusOptions = [
        { value: "all", label: isNepali ? "सबै" : "All" },
        { value: "featured", label: isNepali ? "विशेष" : "Featured" },
    ];

    return (
        <div className="accordion-gallery">
            {/* Header */}
            <header className="accordion-header">
                <div className="accordion-header-content">
                    <div className="accordion-title-section">
                        <p className="accordion-kicker">
                            {isNepali ? "प्रोफाइल र विवरण" : "Profiles & Dossiers"}
                        </p>
                        <h1 className={cn(
                            "accordion-title",
                            isNepali ? "font-semibold tracking-normal" : ""
                        )}>
                            {isNepali ? "स्तम्भहरू" : "The Leaders"}
                        </h1>
                        <p className="accordion-subtitle">
                            {isNepali 
                                ? "नेपालको राजनीतिक नेतृत्वको व्यापक अभिलेख" 
                                : "A comprehensive archive of Nepal's political leadership"}
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="accordion-view-toggle">
                        <Link href="/leaders" className="accordion-view-btn">
                            <LayoutGrid className="w-4 h-4" />
                            <span>{isNepali ? "मूल दृश्य" : "Original View"}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <section className="accordion-stats">
                <div className="accordion-stats-content">
                    <div className="accordion-stat">
                        <Users className="w-5 h-5 accordion-stat-icon" />
                        <div>
                            <p className="accordion-stat-label">{isNepali ? "जम्मा" : "Total"}</p>
                            <p className="accordion-stat-value">{stats.total}</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="accordion-search">
                        <Search className="w-4 h-4 accordion-search-icon" />
                        <input
                            type="text"
                            placeholder={isNepali ? "स्तम्भ खोज्नुहोस्..." : "Search leaders..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="accordion-search-input"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="accordion-search-clear"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="accordion-stats-search">
                    <Search className="w-4 h-4 accordion-search-icon" />
                    <input
                        type="text"
                        placeholder={isNepali ? "स्तम्भ खोज्नुहोस्..." : "Search leaders..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="accordion-search-input"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="accordion-search-clear"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </section>

            {/* Filters */}
            <section className="accordion-filters">
                <div className="accordion-filters-content">
                    <div className="accordion-filter-group">
                        <span className="accordion-filter-label">{isNepali ? "स्थिति" : "Status"}</span>
                        <div className="accordion-filter-buttons">
                            {statusOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatusFilter(opt.value)}
                                    className={cn(
                                        "accordion-filter-btn",
                                        statusFilter === opt.value && "accordion-filter-btn-active"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="accordion-filter-group">
                        <span className="accordion-filter-label">{isNepali ? "क्रम" : "Sort"}</span>
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                            className="accordion-filter-select"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="accordion-clear-btn">
                            {isNepali ? "हटाउनुहोस्" : "Clear"}
                        </button>
                    )}

                    <p className="accordion-results-count">
                        {isNepali ? `${filteredLeaders.length} भेटियो` : `${filteredLeaders.length} found`}
                    </p>
                </div>
            </section>

            {/* Horizontal Slider */}
            <section className="accordion-slider">
                <ul className="accordion-track">
                    {filteredLeaders.map((leader, index) => (
                        <LeaderCard
                            key={leader._id || leader.slug}
                            leader={leader}
                            isActive={index === activeIndex}
                            index={index}
                            language={language}
                            isNepali={isNepali}
                            onActivate={() => goTo(index)}
                        />
                    ))}
                </ul>
            </section>

            {/* Navigation */}
            <section className="accordion-navigation">
                <div className="accordion-nav-content">
                    <div className="accordion-nav-buttons">
                        <button
                            onClick={goPrev}
                            disabled={activeIndex <= 0}
                            className="accordion-nav-btn"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goNext}
                            disabled={activeIndex === filteredLeaders.length - 1}
                            className="accordion-nav-btn"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="accordion-dots">
                        {filteredLeaders.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goTo(index)}
                                className={cn("accordion-dot", index === activeIndex && "accordion-dot-active")}
                                aria-label={`Go to ${index + 1}`}
                            />
                        ))}
                    </div>

                    <p className="accordion-nav-count">
                        {activeIndex >= 0 ? `${activeIndex + 1} / ${filteredLeaders.length}` : `— / ${filteredLeaders.length}`}
                    </p>
                </div>
            </section>

            {/* Empty State */}
            {filteredLeaders.length === 0 && (
                <div className="accordion-empty">
                    <p className="accordion-empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                    </p>
                    <h3>{isNepali ? "केहि भेटिएन" : "No leaders found"}</h3>
                    <p>{isNepali ? "तपाईंको खोजसँग मिल्ने स्तम्भहरू छैनन्" : "No leaders match your search"}</p>
                    <button onClick={clearFilters} className="accordion-empty-btn">
                        {isNepali ? "फिल्टर हटाउनुहोस्" : "Clear filters"}
                    </button>
                </div>
            )}
        </div>
    );
}

interface LeaderCardProps {
    leader: ILeader;
    isActive: boolean;
    index: number;
    language: LanguageCode;
    isNepali: boolean;
    onActivate: () => void;
}

function LeaderCard({ leader, isActive, index, language, isNepali, onActivate }: LeaderCardProps) {
    const name = resolveContent(leader.name, language);
    const position = resolveContent(leader.position, language);
    const party = resolveContent(leader.party, language);
    const years = resolveContent(leader.years, language);
    const desc = resolveContent(leader.desc, language);
    const isLegacy = !leader.isActive || String(leader.status).toLowerCase() === "archived";

    return (
        <article
            className={cn("accordion-card", isActive && "accordion-card-active")}
            onClick={onActivate}
        >
            <div className="accordion-card-bg">
                {leader.image ? (
                    <Image
                        src={leader.image}
                        alt={name}
                        fill
                        className="accordion-card-image"
                        sizes="30rem"
                    />
                ) : (
                    <div className="accordion-card-placeholder">
                        <span>{name.charAt(0)}</span>
                    </div>
                )}
            </div>
            <div className="accordion-card-overlay" />
            <div className="accordion-card-content">
                <div className="accordion-card-closed">
                    <h3 className="accordion-card-name">{name}</h3>
                    {leader.isFeatured && <span className="accordion-card-badge">★</span>}
                </div>
                <div className="accordion-card-open">
                    <div className="accordion-card-info">
                        {years && <p className="accordion-card-years">{years}</p>}
                        <h3 className={cn(
                            "accordion-card-title",
                            isNepali ? "font-semibold" : ""
                        )}>
                            {name}
                        </h3>
                        <p className="accordion-card-position">{position}</p>
                        {party && (
                            <p className="accordion-card-party">{party}</p>
                        )}
                        <Link
                            href={`/leaders/${leader.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="accordion-card-btn"
                        >
                            {isNepali ? "प्रोफाइल हेर्नुहोस्" : "View Profile"}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
