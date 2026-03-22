import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import { absoluteUrl } from "@/lib/seo";
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
    const manifestoJsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: `${manifesto.partyName.en} Manifesto ${manifesto.year}`,
        description: manifesto.blurb.en,
        url: absoluteUrl(`/election-2026/manifesto/${manifesto.slug}`),
        inLanguage: ["en", "ne"],
        ...(manifesto.updatedAtISO ? { dateModified: manifesto.updatedAtISO } : {}),
        author: {
            "@type": "Organization",
            name: manifesto.partyName.en,
        },
        publisher: {
            "@type": "Organization",
            name: "The Leaders",
            url: absoluteUrl("/"),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(manifestoJsonLd) }}
            />
            <ManifestoDetailClient manifesto={manifesto} related={related} />
        </>
    );
}
