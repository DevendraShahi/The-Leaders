import { getFactChecks } from "@/lib/election-data";
import { notFound } from "next/navigation";
import { FactCheckDetailClient } from "./FactCheckDetailClient";
import { slugify } from "@/lib/slug";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const factChecks = await getFactChecks();
    return factChecks.map((check) => ({
        slug: check.slug || slugify(check.claim, 60),
    }));
}

export default async function FactCheckDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const factChecks = await getFactChecks();
    const factCheck = factChecks.find((fc) => (fc.slug || slugify(fc.claim, 60)) === slug);

    if (!factCheck) {
        notFound();
    }

    return <FactCheckDetailClient factCheck={factCheck} />;
}
