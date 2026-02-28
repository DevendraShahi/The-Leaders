import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import {
    getPartyManifestoBySlug,
    getPartyManifestos,
} from "@/lib/manifesto-data";
import { ManifestoDetailClient } from "@/components/election/ManifestoDetailClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
    const manifestos = await getPartyManifestos();

    return manifestos.map((manifesto) => ({ slug: manifesto.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const manifesto = await getPartyManifestoBySlug(slug);

    if (!manifesto) {
        return constructMetadata({
            title: "Manifesto Not Found",
            description: "The requested manifesto document could not be found in the archive.",
            canonical: `/election-2026/manifesto/${slug}`,
            noIndex: true,
        });
    }

    return constructMetadata({
        title: `${manifesto.partyName.en} Manifesto ${manifesto.year}`,
        description: manifesto.blurb.en,
        canonical: `/election-2026/manifesto/${manifesto.slug}`,
        keywords: [
            `${manifesto.partyName.en} manifesto`,
            "Nepal election manifesto",
            "election 2026 policy document",
        ],
        modifiedTime: manifesto.updatedAtISO,
    });
}

export default async function ManifestoDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const manifesto = await getPartyManifestoBySlug(slug);

    if (!manifesto) {
        notFound();
    }

    const manifestos = await getPartyManifestos();
    const related = manifestos
        .filter((item) => item.slug !== manifesto.slug)
        .slice(0, 4);

    return <ManifestoDetailClient manifesto={manifesto} related={related} />;
}
