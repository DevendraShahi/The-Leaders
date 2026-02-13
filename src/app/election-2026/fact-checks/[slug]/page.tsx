import { getFactChecks } from "@/lib/election-data";
import { notFound } from "next/navigation";
import { FactCheckDetailClient } from "./FactCheckDetailClient";
import { slugify } from "@/lib/slug";
import type { LocalizedValue } from "@/lib/election-data";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { articleJsonLd } from "@/lib/seo";

function resolveClaim(value: LocalizedValue): string {
    if (typeof value === "string") return value;
    return value.en || value.ne || "";
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const factChecks = await getFactChecks();
    return factChecks
        .map((check) => check.slug || slugify(resolveClaim(check.claim), 60) || check.id || "")
        .filter(Boolean)
        .map((resolvedSlug) => ({ slug: resolvedSlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const factChecks = await getFactChecks();
    const factCheck = factChecks.find(
        (fc) => (fc.slug || slugify(resolveClaim(fc.claim), 60) || fc.id || "") === slug
    );

    if (!factCheck) {
        return constructMetadata({
            title: "Fact Check Not Found",
            description: "The requested fact check could not be found.",
            canonical: `/election-2026/fact-checks/${slug}`,
            noIndex: true,
        });
    }

    const claimText = resolveClaim(factCheck.claim);
    const analysisText = typeof factCheck.analysis === "string"
        ? factCheck.analysis
        : (factCheck.analysis?.en || factCheck.analysis?.ne || "");

    return constructMetadata({
        title: `Fact Check: ${claimText}`,
        description: analysisText || "Election fact check from The Leaders.",
        canonical: `/election-2026/fact-checks/${slug}`,
        ogType: "article",
        ogImage: factCheck.image || "/the-leader.png",
        publishedTime: factCheck.date ? new Date(factCheck.date).toISOString() : undefined,
        keywords: ["fact check", "election 2026", factCheck.verdict].filter(Boolean),
    });
}

export default async function FactCheckDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const factChecks = await getFactChecks();
    const factCheck = factChecks.find(
        (fc) => (fc.slug || slugify(resolveClaim(fc.claim), 60) || fc.id || "") === slug
    );

    if (!factCheck) {
        notFound();
    }

    const claimText = resolveClaim(factCheck.claim);
    const analysisText = typeof factCheck.analysis === "string"
        ? factCheck.analysis
        : (factCheck.analysis?.en || factCheck.analysis?.ne || "");
    const jsonLd = articleJsonLd({
        path: `/election-2026/fact-checks/${slug}`,
        headline: `Fact Check: ${claimText}`,
        description: analysisText || "Election fact check from The Leaders.",
        image: factCheck.image,
        datePublished: factCheck.date ? new Date(factCheck.date).toISOString() : undefined,
        keywords: ["fact check", "election 2026", factCheck.verdict].filter(Boolean),
    });

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <FactCheckDetailClient factCheck={factCheck} />
        </>
    );
}
