import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() { return []; }

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Page Not Found | The Leaders",
        robots: { index: false, follow: false },
    };
}

export default async function DailyBriefDetailPage() {
    notFound();
    // application/ld+json
    return null;
}
