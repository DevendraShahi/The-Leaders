"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useElectionStore } from "@/lib/election-store";
import { cn } from "@/lib/utils";

export function ElectionMap({ className }: { className?: string }) {
    // Integrating with the new unified store
    const { selectedDistrict, setSelectedDistrict } = useElectionStore();
    const { hoveredDistrict, setHoveredDistrict } = useElectionStore();

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [districtLabels, setDistrictLabels] = useState<{ id: string; x: number; y: number }[]>([]);

    const { data: svgContent, isLoading, isError } = useQuery({
        queryKey: ["election-map-svg"],
        queryFn: async () => {
            // In a real app, we might need a mapping key if SVGs use English vs Nepali IDs
            const res = await fetch("/map/nepal-districts.svg");
            if (!res.ok) throw new Error("Failed to load map");
            return res.text();
        },
        staleTime: Infinity,
    });

    // Handle Map Interactions via Event Delegation
    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === "path" && target.id) {
            // Toggle selection or force select
            setSelectedDistrict(target.id === selectedDistrict ? null : target.id);
        }
    };

    const handleMapHover = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        // Only track active hover state for styling, no tooltip
        if (target.tagName === "path" && target.id) {
            if (hoveredDistrict !== target.id) {
                setHoveredDistrict(target.id);
            }
        } else if (hoveredDistrict !== null) {
            setHoveredDistrict(null);
        }
    };

    // Effect: Apply styles to the SVG DOM nodes managed by Ref
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const svg = mapContainerRef.current.querySelector("svg");
        if (!svg) return;

        // Force Responsive SVG
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.display = "block";

        // Helper to set fill
        const updatePathStyles = () => {
            const paths = svg.querySelectorAll("path");
            paths.forEach((path) => {
                const isSelected = path.id === selectedDistrict;
                const isHovered = path.id === hoveredDistrict;

                // Base style
                path.style.transition = "all 0.2s ease";
                path.style.cursor = "pointer";
                path.style.stroke = isSelected ? "var(--primary)" : "var(--border)";
                path.style.strokeWidth = isSelected ? "2px" : "1px";

                // Determine Fill
                if (isSelected) {
                    path.style.fill = "var(--primary)";
                    path.style.stroke = "var(--primary-foreground)";
                    path.style.fillOpacity = "1";
                } else if (isHovered) {
                    path.style.fill = "var(--primary)";
                    path.style.fillOpacity = "0.6";
                } else {
                    path.style.fill = "var(--card)"; // Default district color
                    path.style.fillOpacity = "1";
                }
            });
        };

        // Separate Label Calculation to run once on content load or resize
        const calculateLabels = () => {
            requestAnimationFrame(() => {
                const containerRect = mapContainerRef.current?.getBoundingClientRect();
                if (!containerRect || !svg) return;

                const newLabels: { id: string; x: number; y: number }[] = [];
                const paths = svg.querySelectorAll("path");

                paths.forEach(path => {
                    if (!path.id) return;
                    const rect = path.getBoundingClientRect();

                    // Calculate center relative to container
                    const x = rect.left - containerRect.left + (rect.width / 2);
                    const y = rect.top - containerRect.top + (rect.height / 2);

                    newLabels.push({ id: path.id, x, y });
                });
                setDistrictLabels(newLabels);
            });
        };

        updatePathStyles();
        calculateLabels();

        // Add resize listener
        window.addEventListener('resize', calculateLabels);
        return () => window.removeEventListener('resize', calculateLabels);

    }, [selectedDistrict, hoveredDistrict, svgContent]);

    if (isLoading) {
        return <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">Loading Map Data...</div>;
    }

    if (isError || !svgContent) {
        return <div className="flex h-full items-center justify-center text-destructive">Failed to load map.</div>;
    }

    return (
        <div
            ref={mapContainerRef}
            className={cn("w-full h-full min-h-[300px] overflow-hidden relative cursor-crosshair", className)}
            onClick={handleMapClick}
            onMouseMove={handleMapHover}
            onMouseLeave={() => setHoveredDistrict(null)}
        >
            <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />

            {/* Static Labels */}
            {districtLabels.map((label) => (
                <div
                    key={label.id}
                    className="absolute pointer-events-none text-[3px] font-medium md:text-[6px] md:font-bold text-center text-foreground/80 drop-shadow-sm select-none tracking-tight"
                    style={{
                        left: label.x,
                        top: label.y,
                        transform: "translate(-50%, -50%)",
                        textShadow: "0px 0px 2px rgba(255,255,255,0.8)"
                    }}
                >
                    {label.id}
                </div>
            ))}
        </div>
    );
}
