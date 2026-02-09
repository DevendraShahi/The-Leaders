import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles } from "@/lib/data";
import { ArticleDetail } from "@/components/home/article-detail";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
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

    return <ArticleDetail article={article} relatedArticles={relatedArticles} />;
}
