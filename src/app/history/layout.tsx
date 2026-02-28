
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "History Timeline",
    description:
    "Explore Nepal's political timeline through key eras, turning points, and archival context from early kingdoms to the modern republic.",
    canonical: "/history",
    keywords: [
        "Nepal political history",
        "Nepal timeline",
        "history of democracy in Nepal",
        "timeline of chaos Nepal",
    ],
});

export default function HistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="homepage-shell history-canvas election-typography min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
}
