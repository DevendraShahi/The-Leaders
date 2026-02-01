"use strict";
"use client";

import { useElectionStore } from "@/lib/election-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const VALLEY_DISTRICTS = [
    { id: "Kathmandu", label: "Kathmandu", color: "text-red-600", bg: "bg-red-500/10" },
    { id: "Lalitpur", label: "Lalitpur", color: "text-blue-600", bg: "bg-blue-500/10" },
    { id: "Bhaktapur", label: "Bhaktapur", color: "text-orange-600", bg: "bg-orange-500/10" }
];

export function KathmanduValleyCallout({ className }: { className?: string }) {
    const { selectedDistrict, setSelectedDistrict } = useElectionStore();

    return (
        <div className={cn("flex flex-col items-end gap-1", className)}>
            <div className="mb-0.5 pr-1">
                <h3 className="font-bebas text-xs uppercase tracking-widest text-muted-foreground/70">KTM Valley</h3>
            </div>

            {VALLEY_DISTRICTS.map((district) => (
                <button
                    key={district.id}
                    onClick={() => setSelectedDistrict(district.id === selectedDistrict ? null : district.id)}
                    className={cn(
                        "group flex items-center justify-between rounded px-2 py-1 text-[10px] uppercase tracking-wider transition-all md:text-xs",
                        selectedDistrict === district.id
                            ? "bg-primary text-primary-foreground shadow-md translate-x-0"
                            : "bg-background/80 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:translate-x-1 backdrop-blur-[2px] border border-border/20"
                    )}
                >
                    <span className="font-bold">
                        {district.label}
                    </span>

                    {selectedDistrict === district.id && (
                        <motion.div
                            layoutId="active-dot"
                            className="ml-2 h-1 w-1 rounded-full bg-white"
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
