import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/data";
import { ArticleDetail } from "@/components/home/article-detail";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    return <ArticleDetail article={article} />;
}
