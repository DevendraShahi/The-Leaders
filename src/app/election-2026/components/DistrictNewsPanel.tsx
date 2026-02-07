"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MapPin, Users, TrendingUp, Calendar, ExternalLink } from "lucide-react"; // Import ExternalLink
import { DistrictNews, DistrictNewsData } from "@/lib/analytics-data"; // Correct Import
import { format } from "date-fns";
import { useElectionStore } from "@/lib/election-store";
import { useEffect, useState } from "react";
import { fetchDistrictNews } from "@/lib/api/news-service";
import { fetchDistrictInfo } from "@/lib/api/wikipedia-service";

interface DistrictNewsPanelProps {
    district: string | null;
    data: DistrictNewsData | null; // Keep for fallback/initial structure if needed
    onClose: () => void;
}

export function DistrictNewsPanel({ district, data: initialData, onClose }: DistrictNewsPanelProps) {
    const { setSelectedDistrict } = useElectionStore();
    const [news, setNews] = useState<DistrictNews | null>(null);
    const [wikiInfo, setWikiInfo] = useState<any>(null); // Type 'any' for simplicity, defined in service
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (district) {
            setLoading(true);
            const loadData = async () => {
                try {
                    // Only fetch Wiki info for description/image
                    // We rely on initialData (local "fresh" 2026 data) for news and stats
                    const fetchedWiki = await fetchDistrictInfo(district);
                    setWikiInfo(fetchedWiki);
                } catch (error) {
                    console.error("Failed to fetch district wiki data", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        } else {
            setWikiInfo(null);
        }
    }, [district]);


    if (!district) return null;

    const handleClose = () => {
        setSelectedDistrict(null);
        onClose();
    };

    // Use initialData (generated specific 2026 data) as primary source
    const displayNews = initialData?.latestUpdates || [];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 z-[100] h-screen w-full overflow-y-auto border-l border-border bg-background shadow-2xl md:w-[480px]"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-border bg-background/95 p-6 backdrop-blur">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-[#B71C1C]" />
                                <h2 className="font-bebas text-3xl uppercase tracking-wide text-foreground">
                                    {district}
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                District Insights & Updates (2026)
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6 p-6">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            <div className="h-32 animate-pulse rounded-lg bg-muted/20" />
                            <div className="h-24 animate-pulse rounded-lg bg-muted/20" />
                            <div className="h-24 animate-pulse rounded-lg bg-muted/20" />
                        </div>
                    ) : (
                        <>
                            {/* Wiki Summary / Intro (if available) */}
                            {wikiInfo && (
                                <div className="rounded-lg bg-muted/10 p-4">
                                    {wikiInfo.thumbnail && (
                                        <div className="mb-3 h-40 w-full overflow-hidden rounded-md">
                                            <img
                                                src={wikiInfo.thumbnail.source}
                                                alt={wikiInfo.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {wikiInfo.extract}
                                    </p>
                                </div>
                            )}

                            {/* Quick Stats (From Local Data) */}
                            {initialData && (
                                <Card className="border-[#B71C1C]/20 bg-gradient-to-br from-[#B71C1C]/5 to-transparent">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="font-bebas text-lg uppercase text-muted-foreground">District Stats (2026 Est.)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-lg border border-border/50 bg-background/50 p-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users className="h-4 w-4" />
                                                    <span className="text-xs uppercase">Est. Voters</span>
                                                </div>
                                                <p className="mt-1 font-bebas text-2xl text-foreground">
                                                    {(initialData.demographicInfo.voters / 1000).toFixed(0)}K
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-border/50 bg-background/50 p-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="text-xs uppercase">Constituencies</span>
                                                </div>
                                                <p className="mt-1 font-bebas text-2xl text-foreground">
                                                    {initialData.demographicInfo.constituencies}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}


                            {/* LIVE Updates (From Generative Local Data - "Realistic") */}
                            <div>
                                <h3 className="mb-4 font-bebas text-xl uppercase tracking-wide">Latest Election Development</h3>
                                <div className="space-y-3">
                                    {displayNews.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No recent updates filed for this district.</p>
                                    ) : (
                                        displayNews.map((update: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Card className="overflow-hidden border-l-4 border-l-[#B71C1C] transition-all hover:shadow-md">
                                                    <CardContent className="p-4">
                                                        <div className="mb-2 flex items-start justify-between gap-2">
                                                            <h4 className="flex-1 font-bold leading-tight text-foreground">
                                                                {update.title}
                                                            </h4>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                {update.date}
                                                            </div>
                                                        </div>
                                                        <p className="mb-2 text-sm text-muted-foreground">
                                                            {update.summary}
                                                        </p>
                                                        <p className="text-xs font-medium text-muted-foreground">
                                                            Impact: <span className={update.impact === 'High' ? 'text-red-500' : 'text-gray-500'}>{update.impact}</span>
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
