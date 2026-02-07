"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Map as MapIcon, Loader2, AlertTriangle, Layers, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { geoJsonToPath, calculateGeoJsonCentroid, type GeoJSON } from "@/lib/map-utils";

// Local Data Imports
import statesData from "@/data/states.json";

type ViewMode = "province" | "district";

export function InteractiveNepalMap({ className }: { className?: string }) {
    const [viewMode, setViewMode] = useState<ViewMode>("province");
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showLabels, setShowLabels] = useState(true);

    // Fetch Province GeoJSON
    const { data: provinceData, isLoading: isLoadingProvince } = useQuery({
        queryKey: ["map-geojson-province"],
        queryFn: async () => {
            const res = await fetch("/map/geojson/province.json");
            if (!res.ok) throw new Error("Failed to load province data");
            return await res.json() as GeoJSON;
        },
        staleTime: Infinity,
    });

    // Fetch District GeoJSON
    const { data: districtData, isLoading: isLoadingDistrict, isError: isDistrictError } = useQuery({
        queryKey: ["map-geojson-district"],
        queryFn: async () => {
            const res = await fetch("/map/geojson/district.json");
            if (!res.ok) throw new Error("Failed to load district data");
            const json = await res.json();
            if (json.type !== "FeatureCollection") throw new Error("Invalid GeoJSON");
            return json as GeoJSON;
        },
        staleTime: Infinity,
        retry: 1
    });

    const activeData = viewMode === "province" ? provinceData : districtData;
    const isLoading = isLoadingProvince || (viewMode === "district" && isLoadingDistrict);

    // Generate Paths & Centroids
    const mapItems = useMemo(() => {
        if (!activeData) return [];
        return activeData.features.map((feature, index) => {
            const props = feature.properties;
            const id = viewMode === 'province'
                ? String(props?.STATE_C || index)
                : String(props?.DCODE || index);

            const name = viewMode === 'province'
                ? props?.STATE_N
                : (props?.DISTRICT || props?.DISTRICT_N || "Unknown");

            return {
                id,
                name,
                d: geoJsonToPath(feature.geometry),
                centroid: calculateGeoJsonCentroid(feature.geometry),
                parentId: String(props?.STATE_C || 0)
            };
        });
    }, [activeData, viewMode]);

    // Matching Colors from ElectionMap.tsx (Primary / Muted theme)
    // NOTE: ElectionMap used CSS variables. We will replicate that logic.
    const getStyle = (item: any) => {
        const isSelected = selectedId === item.id;
        const isHovered = hoveredId === item.id;

        // Base
        let fill = "var(--muted)";
        let stroke = "var(--border)";
        let strokeWidth = viewMode === 'province' ? 1.5 : 0.5;
        let fillOpacity = 1;

        // Province Mode: Use Colorful Palette by default
        if (viewMode === 'province' && !isSelected && !isHovered) {
            const provinceColors: Record<string, string> = {
                "1": "#EF4444", "2": "#F97316", "3": "#10B981",
                "4": "#8B5CF6", "5": "#F59E0B", "6": "#06B6D4", "7": "#3B82F6"
            };
            fill = provinceColors[item.id] || fill;
            stroke = "#fff";
        }

        // Interaction States (Overrides)
        if (isSelected) {
            fill = "var(--primary)";
            stroke = "var(--primary-foreground)";
            strokeWidth = viewMode === 'province' ? 2 : 1;
        } else if (isHovered) {
            fill = "var(--primary)"; // Or a lighter shade if available, using opacity for now
            stroke = "var(--primary-foreground)";
            fillOpacity = 0.8;
        } else if (selectedId && selectedId !== item.id) {
            // Dim others when something is selected
            fill = "var(--muted)";
            fillOpacity = 0.3;
        }

        return { fill, stroke, strokeWidth, fillOpacity };
    };

    const handleSelect = (id: string) => {
        setSelectedId(prev => prev === id ? null : id);
    };

    return (
        <div className={cn("flex flex-col h-full bg-background border border-border rounded-xl overflow-hidden shadow-sm", className)}>
            {/* Header */}
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <MapIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bebas text-lg leading-none">Interactive Election Map</h3>
                        <p className="text-xs text-muted-foreground font-mono">
                            {viewMode === 'province' ? "Provincial Breakdown" : "District Level Detail"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowLabels(!showLabels)}
                        className={showLabels ? "bg-accent text-accent-foreground" : ""}
                        title="Toggle Labels"
                    >
                        <Type className="h-4 w-4" />
                    </Button>
                    <div className="flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => { setViewMode("province"); setSelectedId(null); }}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-1",
                                viewMode === "province" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Layers className="w-3 h-3" /> Province
                        </button>
                        <button
                            onClick={() => { setViewMode("district"); setSelectedId(null); }}
                            disabled={isDistrictError && !districtData}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-1",
                                viewMode === "district" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                                isDistrictError && !districtData && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <MapIcon className="w-3 h-3" /> District
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Canvas */}
            <div className="relative flex-1 bg-slate-50/50 dark:bg-slate-900/10 min-h-[500px] flex items-center justify-center overflow-hidden">
                {isLoading && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="font-mono text-xs">Generating Geometry...</span>
                    </div>
                )} {isDistrictError && viewMode === 'district' && !districtData && (
                    <div className="flex flex-col items-center gap-2 text-destructive max-w-xs text-center">
                        <AlertTriangle className="h-10 w-10 mb-2" />
                        <h4 className="font-bold">District Data Missing</h4>
                    </div>
                )}

                {!isLoading && (
                    <svg
                        viewBox="0 0 1000 500"
                        className="w-full h-full max-h-[80vh] transition-all duration-700"
                        style={{ filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.05))" }}
                    >
                        <g>
                            {mapItems.map((item) => {
                                const style = getStyle(item);
                                return (
                                    <path
                                        key={item.id}
                                        d={item.d}
                                        fill={style.fill}
                                        stroke={style.stroke}
                                        strokeWidth={style.strokeWidth}
                                        fillOpacity={style.fillOpacity}
                                        className="transition-all duration-300 cursor-pointer hover:opacity-90"
                                        onMouseEnter={() => setHoveredId(item.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        onClick={() => handleSelect(item.id)}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                );
                            })}
                        </g>

                        {/* Labels Layer */}
                        {showLabels && (
                            <g className="pointer-events-none select-none">
                                {mapItems.map((item) => {
                                    if (!item.centroid) return null;
                                    const isSelected = selectedId === item.id;
                                    // Optimization: Only render labels for Provinces OR Selected District, OR all Districts if Zoom/View permits
                                    // To match old map: render all small labels
                                    return (
                                        <text
                                            key={`label-${item.id}`}
                                            x={item.centroid[0]}
                                            y={item.centroid[1]}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            style={{
                                                fontSize: viewMode === 'province' ? "14px" : (isSelected ? "12px" : "6px"),
                                                fontWeight: isSelected ? 800 : 500,
                                                fill: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
                                                opacity: viewMode === 'district' && !isSelected && !hoveredId ? 0.7 : 1, // Fade out non-selected districts slightly to reduce clutter
                                                textShadow: "0px 0px 2px rgba(255,255,255,0.7)",
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            {item.name}
                                        </text>
                                    );
                                })}
                            </g>
                        )}
                    </svg>
                )}

                {/* KTM Valley Index (Bottom Right) */}
                {viewMode === 'district' && (
                    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-1 pointer-events-none">
                        <div className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase mb-1 mr-1">
                            KTM Valley
                        </div>
                        {["Kathmandu", "Lalitpur", "Bhaktapur"].map((dName) => {
                            // Find ID for these districts
                            const dItem = mapItems.find(i => i.name === dName);
                            if (!dItem) return null;
                            const isSelected = selectedId === dItem.id;

                            return (
                                <button
                                    key={dName}
                                    onClick={() => handleSelect(dItem.id)}
                                    // Simulated Hover
                                    onMouseEnter={() => setHoveredId(dItem.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className={cn(
                                        "pointer-events-auto text-[10px] font-bold px-3 py-1 transition-all text-right uppercase tracking-wider rounded border border-border/50 bg-background/80 backdrop-blur-sm",
                                        isSelected
                                            ? "text-primary border-primary scale-105 shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:scale-105"
                                    )}
                                >
                                    {dName}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Map TooltipOverlay */}
                <AnimatePresence>
                    {(hoveredId || selectedId) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-6 left-6 bg-card/95 backdrop-blur border border-border p-4 rounded-xl shadow-xl max-w-[240px] z-10 pointer-events-none"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {viewMode}
                                </span>
                                {selectedId && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                            </div>

                            <div className="font-bebas text-2xl text-foreground leading-none">
                                {mapItems.find(p => p.id === (hoveredId || selectedId))?.name || "Unknown"}
                            </div>

                            {viewMode === 'district' && (
                                <div className="mt-1 text-xs text-muted-foreground font-mono">
                                    Province {mapItems.find(p => p.id === (hoveredId || selectedId))?.parentId}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
