"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useElectionStore } from "@/lib/election-store";
import { cn } from "@/lib/utils";
import { Map as MapIcon, Loader2, AlertTriangle, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { geoJsonToPath, calculateGeoJsonCentroid, type GeoJSON } from "@/lib/map-utils";

export function ElectionMap({ className }: { className?: string }) {
    // 1. Feature: Maintain Store Integration
    const { selectedDistrict, setSelectedDistrict } = useElectionStore();
    const { hoveredDistrict, setHoveredDistrict } = useElectionStore();

    // Local UI state
    const [showLabels, setShowLabels] = useState(true);

    // 2. Data: Fetch Updated GeoJSON
    const { data: districtData, isLoading, isError } = useQuery({
        queryKey: ["map-geojson-district"],
        queryFn: async () => {
            const res = await fetch("/map/geojson/district.json");
            if (!res.ok) throw new Error("Failed to load district data");
            const json = await res.json();
            if (json.type !== "FeatureCollection") throw new Error("Invalid GeoJSON");
            return json as GeoJSON;
        },
        staleTime: Infinity,
    });

    // 3. Logic: Generate Paths & Centroids
    const mapItems = useMemo(() => {
        if (!districtData) return [];
        return districtData.features.map((feature, index) => {
            const props = feature.properties;
            const id = props?.DISTRICT || String(index);
            const name = props?.DISTRICT || "Unknown";

            return {
                id,
                name,
                d: geoJsonToPath(feature.geometry),
                centroid: calculateGeoJsonCentroid(feature.geometry),
                parentId: String(props?.STATE_C || 0)
            };
        });
    }, [districtData]);

    // 4. Feature: Styling
    const getStyle = (item: any) => {
        const isSelected = selectedDistrict === item.id;
        const isHovered = hoveredDistrict === item.id;

        // Base
        let fill = "var(--muted)";
        let stroke = "var(--border)";
        let strokeWidth = 0.5;
        let fillOpacity = 1;

        // Interaction States
        if (isSelected) {
            fill = "var(--primary)";
            stroke = "var(--primary-foreground)";
            strokeWidth = 1.5;
        } else if (isHovered) {
            fill = "var(--primary)";
            stroke = "var(--primary-foreground)";
            fillOpacity = 0.8;
        } else if (selectedDistrict && selectedDistrict !== item.id) {
            fill = "var(--muted)";
            fillOpacity = 0.3;
        }

        return { fill, stroke, strokeWidth, fillOpacity };
    };

    const handleSelect = (id: string) => {
        setSelectedDistrict(selectedDistrict === id ? null : id);
    };

    // 5. Feature: KTM Valley Index
    const ktmDistricts = ["Kathmandu", "Lalitpur", "Bhaktapur"];

    if (isLoading) {
        return (
            <div className={cn("flex h-full min-h-[400px] items-center justify-center text-muted-foreground animate-pulse", className)}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Map Data...
            </div>
        );
    }

    if (isError) {
        return (
            <div className={cn("flex h-full min-h-[400px] items-center justify-center text-destructive", className)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Failed to load map
            </div>
        );
    }

    return (
        <div className={cn("relative w-full h-full min-h-[300px] bg-slate-50/50 dark:bg-slate-900/10 rounded-xl overflow-hidden", className)}>

            {/* Show Labels Toggle */}
            <div className="absolute top-2 right-2 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 hover:bg-background/80", showLabels && "bg-background/50 text-foreground")}
                    onClick={() => setShowLabels(!showLabels)}
                    title="Toggle Labels"
                >
                    <Type className="h-4 w-4" />
                </Button>
            </div>

            <svg
                viewBox="0 0 1000 500"
                className="w-full h-full max-h-[80vh]"
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
                                className="transition-all duration-300 cursor-pointer hover:opacity-90 active:scale-[0.99]"
                                onMouseEnter={() => setHoveredDistrict(item.id)}
                                onMouseLeave={() => setHoveredDistrict(null)}
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
                            const isSelected = selectedDistrict === item.id;

                            // Abbreviations for crowded areas
                            const abbreviations: Record<string, string> = {
                                "Kathmandu": "KTM",
                                "Bhaktapur": "BKT",
                                "Lalitpur": "LAL",
                            };
                            const displayName = abbreviations[item.name] || item.name;

                            return (
                                <text
                                    key={`label-${item.id}`}
                                    x={item.centroid[0]}
                                    y={item.centroid[1]}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{
                                        fontSize: isSelected ? "12px" : "6px",
                                        fontWeight: isSelected ? 800 : 500,
                                        fill: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
                                        opacity: (!isSelected && !hoveredDistrict) ? 0.7 : 1,
                                        textShadow: "0px 0px 2px rgba(255,255,255,0.7)",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    {displayName}
                                </text>
                            );
                        })}
                    </g>
                )}
            </svg>

            {/* Feature: KTM Valley Index - Top Right with ~20% spacing */}
            <div className="absolute right-4 top-[20%] flex flex-col items-end gap-1 z-20 pointer-events-none">
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase mb-1 mr-1">
                    KTM Valley
                </div>
                {ktmDistricts.map((dName) => {
                    const isSelected = selectedDistrict === dName;

                    return (
                        <button
                            key={dName}
                            onClick={() => handleSelect(dName)}
                            onMouseEnter={() => setHoveredDistrict(dName)}
                            onMouseLeave={() => setHoveredDistrict(null)}
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
        </div>
    );
}
