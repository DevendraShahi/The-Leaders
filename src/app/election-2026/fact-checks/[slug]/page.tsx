import { getFactChecks } from "@/lib/election-data";
import { notFound } from "next/navigation";
import { FactCheckDetailClient } from "./FactCheckDetailClient";
import { slugify } from "@/lib/slug";
import type { LocalizedValue } from "@/lib/election-data";

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

export default async function FactCheckDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const factChecks = await getFactChecks();
    const factCheck = factChecks.find(
        (fc) => (fc.slug || slugify(resolveClaim(fc.claim), 60) || fc.id || "") === slug
    );

    if (!factCheck) {
        notFound();
    }

    return <FactCheckDetailClient factCheck={factCheck} />;
}
