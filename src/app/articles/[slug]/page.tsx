import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles } from "@/lib/data";
import { ArticleDetail } from "@/components/home/article-detail";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { articleJsonLd } from "@/lib/seo";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        return constructMetadata({
            title: "Article Not Found",
            description: "The requested article could not be found.",
            canonical: `/articles/${slug}`,
            noIndex: true,
        });
    }

    const title = article.title?.en || article.title?.ne || "Article";
    const description = article.excerpt?.en || article.excerpt?.ne || "Read this article on The Leaders.";
    const publishedTime = article.publishedDate ? new Date(article.publishedDate).toISOString() : undefined;
    const modifiedTime = (article as any).updatedAt ? new Date((article as any).updatedAt).toISOString() : undefined;

    return constructMetadata({
        title,
        description,
        canonical: `/articles/${slug}`,
        ogType: "article",
        ogImage: article.image || "/the-leader.png",
        publishedTime,
        modifiedTime,
        author: article.author?.en || article.author?.ne || "The Leaders Team",
        keywords: article.tags || [],
    });
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const [article, allArticles] = await Promise.all([
        getArticleBySlug(slug),
        getArticles(12),
    ]);

    if (!article) {
        notFound();
    }

    const relatedArticles = allArticles.filter((item) => item.slug !== slug).slice(0, 6);
    const jsonLd = articleJsonLd({
        path: `/articles/${slug}`,
        headline: article.title?.en || article.title?.ne || "Article",
        description: article.excerpt?.en || article.excerpt?.ne || "Read this article on The Leaders.",
        image: article.image,
        datePublished: article.publishedDate ? new Date(article.publishedDate).toISOString() : undefined,
        dateModified: (article as any).updatedAt ? new Date((article as any).updatedAt).toISOString() : undefined,
        authorName: article.author?.en || article.author?.ne || "The Leaders Team",
        keywords: article.tags || [],
    });

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ArticleDetail article={article} relatedArticles={relatedArticles} />
        </>
    );
}
