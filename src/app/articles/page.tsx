import { getArticles } from "@/lib/data";
import { ArticlesShell } from "@/components/articles/ArticlesShell";


export const metadata = {
    title: "Articles",
    description: "Read the latest news and perspectives from The Leaders of Nepal.",
};

export const revalidate = 3600;

export default async function ArticlesPage() {
    // In a real app we might verify if limit is needed or pagination
    const articles = await getArticles(30);

    return <ArticlesShell articles={articles} />;
}
