import { getDailyBriefs } from "@/lib/election-data";
import { notFound } from "next/navigation";
import { DailyBriefDetailClient } from "./DailyBriefDetailClient";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { articleJsonLd } from "@/lib/seo";

function localizedText(value: any): string {
    if (typeof value === "string") return value;
    return value?.en || value?.ne || "";
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const briefs = await getDailyBriefs();
    return briefs.map((brief) => ({
        slug: brief.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const briefs = await getDailyBriefs();
    const brief = briefs.find((b) => b.slug === slug);

    if (!brief) {
        return constructMetadata({
            title: "Daily Brief Not Found",
            description: "The requested daily brief could not be found.",
            canonical: `/election-2026/daily-brief/${slug}`,
            noIndex: true,
        });
    }

    const title = localizedText(brief.title) || "Election Daily Brief";
    const description = localizedText(brief.summary) || "Latest election daily brief from The Leaders.";

    return constructMetadata({
        title,
        description,
        canonical: `/election-2026/daily-brief/${slug}`,
        ogType: "article",
        ogImage: brief.image || "/the-leader.png",
        publishedTime: brief.date ? new Date(brief.date).toISOString() : undefined,
        keywords: brief.tags || [],
    });
}

export default async function DailyBriefDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const briefs = await getDailyBriefs();
    const brief = briefs.find((b) => b.slug === slug);

    if (!brief) {
        notFound();
    }

    const jsonLd = articleJsonLd({
        path: `/election-2026/daily-brief/${slug}`,
        headline: localizedText(brief.title) || "Election Daily Brief",
        description: localizedText(brief.summary) || "Latest election daily brief from The Leaders.",
        image: brief.image,
        datePublished: brief.date ? new Date(brief.date).toISOString() : undefined,
        keywords: brief.tags || [],
    });

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <DailyBriefDetailClient brief={brief} />
        </>
    );
}
