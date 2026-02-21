import { TimelineRoot } from "@/components/timeline/v2/TimelineRoot";
import timelineDataRaw from "@/data/Sep8-Mar5.json";
import { TimelineData } from "@/lib/types/timeline-types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Timeline of Chaos - Election 2026 | The Leaders",
    description: "A chronological archive of Nepal's political journey from September 2025 to March 2026.",
};

export default function TimelinePage() {
    // Cast raw JSON to typed interface
    const data = timelineDataRaw as unknown as TimelineData;

    return (
        <main className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Header Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none mix-blend-difference text-white">
                <div>
                    <h1 className="text-2xl font-bebas uppercase tracking-widest drop-shadow-lg opacity-80">
                        Timeline of Chaos
                    </h1>
                    <p className="text-xs font-mono uppercase tracking-widest opacity-60">
                        Sep 8 • Mar 5
                    </p>
                </div>
            </div>

            {/* Back Button (Floating) */}
            <div className="fixed top-6 right-6 z-50">
                <a
                    href="/election-2026"
                    className="bg-background/10 backdrop-blur-md border border-white/20 hover:border-primary/50 text-xs uppercase font-bold px-4 py-2 rounded-full transition-all hover:bg-primary hover:text-white shadow-lg text-white"
                >
                    Back to Dashboard
                </a>
            </div>

            <TimelineRoot data={data} />
        </main>
    );
}
