import { getElectionArticleBySlug } from "@/lib/election-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnalysisDetailClient } from "./AnalysisDetailClient";

interface AnalysisDetailPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AnalysisDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getElectionArticleBySlug(slug);
    if (!article) {
        return {
            title: "Election Analysis – Not Found | The Leaders",
        };
    }

    return {
        title: `${article.title_en} – Election Analysis | The Leaders`,
        description: article.excerpt_en,
    };
}

export const revalidate = 600;

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
    const { slug } = await params;
    const article = await getElectionArticleBySlug(slug);
    if (!article) {
        notFound();
    }

    return <AnalysisDetailClient article={article} />;
}
