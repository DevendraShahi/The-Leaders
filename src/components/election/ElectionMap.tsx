"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useElectionStore } from "@/lib/election-store";
import { cn } from "@/lib/utils";

interface DistrictPath {
    id: string;
    d: string;
}

interface DistrictLabel {
    id: string;
    x: number;
    y: number;
}

export function ElectionMap({ className }: { className?: string }) {
    const { selectedDistrict, setSelectedDistrict } = useElectionStore();
    const { hoveredDistrict, setHoveredDistrict } = useElectionStore();

    const [paths, setPaths] = useState<DistrictPath[]>([]);
    const [labels, setLabels] = useState<DistrictLabel[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRefs = useRef<{ [key: string]: SVGPathElement | null }>({});

    // 1. Fetch SVG Text
    const { data: svgText, isLoading, isError } = useQuery({
        queryKey: ["election-map-svg"],
        queryFn: async () => {
            const res = await fetch("/map/nepal-districts.svg");
            if (!res.ok) throw new Error("Failed to load map");
            return res.text();
        },
        staleTime: Infinity,
    });

    // 2. Parse SVG Text into Data
    useEffect(() => {
        if (!svgText) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const pathElements = doc.querySelectorAll("path");

        const extractedPaths: DistrictPath[] = [];
        pathElements.forEach((el) => {
            if (el.id && el.getAttribute("d")) {
                extractedPaths.push({
                    id: el.id,
                    d: el.getAttribute("d")!,
                });
            }
        });

        setPaths(extractedPaths);
    }, [svgText]);

    // 3. Calculate Centroids for Labels (After Render)
    useLayoutEffect(() => {
        if (paths.length === 0) return;

        const newLabels: DistrictLabel[] = [];

        Object.entries(pathRefs.current).forEach(([id, element]) => {
            if (element) {
                try {
                    const bbox = element.getBBox();
                    newLabels.push({
                        id,
                        x: bbox.x + bbox.width / 2,
                        y: bbox.y + bbox.height / 2
                    });
                } catch (e) {
                    console.warn(`Could not calculate bbox for district ${id}`, e);
                }
            }
        });

        setLabels(newLabels);
    }, [paths]);


    // 4. Stable Handlers for Performance
    const handleSelect = useCallback((id: string) => {
        // Use the store value directly instead of functional update if store doesn't support it
        // Check if we can access the latest state. 
        // Since selectedDistrict is a dependency, we need to include it. 
        // BUT including it breaks memoization of the handler if selectedDistrict changes.
        // TRICK: We can just dispatch the action. If Zustand store's setSelectedDistrict 
        // doesn't support `prev => ...`, we need to read from the store `getState()` or rely on the prop.
        // However, standard Zustand setters are usually just `set({ selectedDistrict: value })`.
        // Let's rely on the fact that `selectedDistrict` is in the component scope.
        // We will pass the *current selection logic* to the store setter.

        // Actually, to make handleSelect STABLE (dependency-free), we can't depend on `selectedDistrict`.
        // But the Child `MapPath` knows if it is selected via props `isSelected`.
        // So `MapPath` can just call `onSelect(district.id)` and the Parent decides logic.
        // Wait, if Parent has `handleSelect` that depends on `selectedDistrict`, it changes every time selection changes.
        // Then `MapPath` re-renders every time selection changes.
        // This is inevitable if we want to update `isSelected` prop.
        // The optimization we want is: don't re-render ALL paths when ONE is selected.
        // Memo ensures that only the path whose `isSelected` CHANGED will re-render. 
        // Steps:
        // 1. `paths.map` passes `isSelected={selected === id}`.
        // 2. `handleSelect` changes.
        // 3. `MapPath` gets new `onSelect` prop.
        // 4. `MapPath` re-renders even if `isSelected` didn't change... UNLESS `onSelect` is stable.

        // Solution: Use `useElectionStore.getState().selectedDistrict` inside the callback 
        // so we don't need it as a dependency!

        const current = useElectionStore.getState().selectedDistrict;
        useElectionStore.getState().setSelectedDistrict(current === id ? null : id);

    }, []); // Empty dependency array = STABLE!

    const handleHover = useCallback((id: string | null) => {
        useElectionStore.getState().setHoveredDistrict(id);
    }, []);

    if (isLoading) {
        return <div className="flex h-full min-h-[400px] items-center justify-center text-muted-foreground animate-pulse">Loading Map Data...</div>;
    }

    if (isError) {
        return <div className="flex h-full min-h-[400px] items-center justify-center text-destructive">Failed to load map.</div>;
    }

    return (
        <div className={cn("w-full h-full min-h-[300px] relative flex items-center justify-center overflow-hidden", className)}>
            <svg
                ref={svgRef}
                viewBox="0 0 800 403" // Matches the original SVG viewBox
                className="w-full h-full max-h-[80vh]"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.3))" }}
            >
                {/* District Paths */}
                <g className="transition-all duration-500 ease-out">
                    {paths.map((district) => (
                        <MapPath
                            key={district.id}
                            district={district}
                            isSelected={selectedDistrict === district.id}
                            isHovered={hoveredDistrict === district.id}
                            onSelect={handleSelect}
                            onHover={handleHover}
                            pathRef={(el) => { pathRefs.current[district.id] = el; }}
                        />
                    ))}
                </g>

                {/* District Labels */}
                <g className="pointer-events-none select-none" style={{ zIndex: 20 }}>
                    {labels.map((label) => {
                        const isSelected = selectedDistrict === label.id;
                        return (
                            <text
                                key={label.id}
                                x={label.x}
                                y={label.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{
                                    fontSize: isSelected ? "7px" : "5px",
                                    fontWeight: isSelected ? 700 : 500,
                                    fill: isSelected ? "var(--primary-foreground)" : "var(--foreground)",
                                    fillOpacity: isSelected ? 1 : 0.7,
                                    textShadow: isSelected
                                        ? "none"
                                        : "0px 0px 3px var(--background)",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {label.id}
                            </text>
                        );
                    })}
                </g>
            </svg>

            {/* KTM Valley Index (Responsive) */}
            <div className="absolute right-2 bottom-4 md:top-1/2 md:bottom-auto md:-translate-y-1/2 flex flex-row md:flex-col items-end gap-1 z-30 pointer-events-none">
                <div className="hidden md:block text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase mb-2 mr-2">
                    KTM Valley
                </div>
                {["Kathmandu", "Lalitpur", "Bhaktapur"].map((district) => {
                    const isSelected = selectedDistrict === district;
                    return (
                        <button
                            key={district}
                            onClick={() => handleSelect(district)}
                            onMouseEnter={() => handleHover(district)}
                            onMouseLeave={() => handleHover(null)}
                            className={cn(
                                "pointer-events-auto text-[8px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1 transition-all text-right uppercase tracking-wider bg-background/50 md:bg-transparent backdrop-blur md:backdrop-filter-none rounded border md:border-none border-border/50",
                                isSelected
                                    ? "text-primary scale-110 border-primary"
                                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                            )}
                        >
                            {district}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Optimization: Memoized Path Component
// MUST NOT use inline arrow functions in parent or this memo breaks
import React, { memo } from 'react';

const MapPath = memo(({
    district,
    isSelected,
    isHovered,
    onSelect,
    onHover,
    pathRef
}: {
    district: DistrictPath;
    isSelected: boolean;
    isHovered: boolean;
    onSelect: (id: string) => void;
    onHover: (id: string | null) => void;
    pathRef: (el: SVGPathElement | null) => void;
}) => {
    // Styling Logic
    let fill = "var(--muted)";
    let stroke = "var(--border)";
    let strokeWidth = "1px";
    let fillOpacity = 1;

    if (isSelected) {
        fill = "var(--primary)";
        stroke = "var(--primary-foreground)";
        strokeWidth = "2px";
        fillOpacity = 1;
    } else if (isHovered) {
        fill = "var(--primary)";
        stroke = "var(--primary-foreground)";
        strokeWidth = "1.5px";
        fillOpacity = 0.6;
    }

    return (
        <path
            id={district.id}
            d={district.d}
            ref={pathRef}
            onClick={() => onSelect(district.id)}
            onMouseEnter={() => onHover(district.id)}
            onMouseLeave={() => onHover(null)}
            style={{
                fill,
                stroke,
                strokeWidth,
                fillOpacity,
                transition: "all 0.1s ease-out", // Very fast transition for responsiveness
                cursor: "pointer",
                vectorEffect: "non-scaling-stroke",
                outline: "none"
            }}
            className="hover:z-10 relative"
        />
    );
}, (prev, next) => {
    // Custom equality check for performance
    return (
        prev.isSelected === next.isSelected &&
        prev.isHovered === next.isHovered &&
        prev.district.id === next.district.id
        // onSelect/onHover/pathRef are assumed stable now
    );
});