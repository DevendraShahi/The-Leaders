import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getColumnArticleBySlug, getColumnArticles } from "@/lib/election-data";
import { constructMetadata } from "@/lib/metadata";
import { ColumnDetailClient } from "./ColumnDetailClient";

export async function generateMetadata({
    params,
}: {
    params: { slug: string };
}): Promise<Metadata> {
    const article = await getColumnArticleBySlug(params.slug);
    if (!article) return constructMetadata({ title: "Article Not Found", description: "The requested column article could not be found." });

    return constructMetadata({
        title: article.title_en,
        description: article.excerpt_en,
        canonical: `/coverage/columns/${article.slug}`,
        keywords: article.tags || [],
        ogImage: article.image,
    });
}

// Generate static paths for the 10 most recent columns to optimize performance.
// The rest will fall back to dynamic rendering on demand.
export async function generateStaticParams() {
    const articles = await getColumnArticles(10);
    return articles.map((article) => ({
        slug: article.slug,
    }));
}

export const revalidate = 21600;

export default async function ColumnDetailPage({
    params,
}: {
    params: { slug: string };
}) {
    const article = await getColumnArticleBySlug(params.slug);

    if (!article) {
        notFound();
    }

    return <ColumnDetailClient article={article} />;
}
