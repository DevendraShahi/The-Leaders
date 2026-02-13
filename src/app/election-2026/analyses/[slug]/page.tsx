import { getElectionArticleBySlug } from "@/lib/election-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnalysisDetailClient } from "./AnalysisDetailClient";
import { constructMetadata } from "@/lib/metadata";
import { articleJsonLd } from "@/lib/seo";

interface AnalysisDetailPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AnalysisDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getElectionArticleBySlug(slug);
    if (!article) {
        return constructMetadata({
            title: "Election Analysis Not Found",
            description: "The requested election analysis could not be found.",
            canonical: `/election-2026/analyses/${slug}`,
            noIndex: true,
        });
    }

    return constructMetadata({
        title: `${article.title_en} – Election Analysis`,
        description: article.excerpt_en,
        canonical: `/election-2026/analyses/${slug}`,
        ogType: "article",
        ogImage: article.image || "/the-leader.png",
        publishedTime: article.createdAt,
        modifiedTime: article.createdAt,
        author: article.editor || "The Leaders Editorial Team",
        keywords: article.tags || [],
    });
}

export const revalidate = 600;

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
    const { slug } = await params;
    const article = await getElectionArticleBySlug(slug);
    if (!article) {
        notFound();
    }

    const jsonLd = articleJsonLd({
        path: `/election-2026/analyses/${slug}`,
        headline: article.title_en,
        description: article.excerpt_en,
        image: article.image,
        datePublished: article.createdAt,
        dateModified: article.createdAt,
        authorName: article.editor || "The Leaders Editorial Team",
        keywords: article.tags || [],
    });

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <AnalysisDetailClient article={article} />
        </>
    );
}
