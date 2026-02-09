import { getDailyBriefs } from "@/lib/election-data";
import { notFound } from "next/navigation";
import { DailyBriefDetailClient } from "./DailyBriefDetailClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const briefs = await getDailyBriefs();
    return briefs.map((brief) => ({
        slug: brief.slug,
    }));
}

export default async function DailyBriefDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const briefs = await getDailyBriefs();
    const brief = briefs.find((b) => b.slug === slug);

    if (!brief) {
        notFound();
    }

    return <DailyBriefDetailClient brief={brief} />;
}
