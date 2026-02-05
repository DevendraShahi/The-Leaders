import { getArticles } from "@/lib/data";
import { ArticleGrid } from "@/components/home/article-grid";


export const metadata = {
    title: "Articles",
    description: "Read the latest news and perspectives from The Leaders of Nepal.",
};

export const revalidate = 3600;

export default async function ArticlesPage() {
    // In a real app we might verify if limit is needed or pagination
    const articles = await getArticles(20);

    return (
        <div className="container mx-auto px-4 py-20 min-h-screen">
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bebas font-bold text-foreground uppercase tracking-tight">
                    News & <span className="text-primary">Perspectives</span>
                </h1>
                <div className="w-24 h-1 bg-primary mx-auto mt-4" />
                <p className="mt-6 text-muted-foreground font-manrope max-w-2xl mx-auto">
                    Explore the archives of thought, analysis, and history.
                </p>
            </div>

            {(!articles || articles.length === 0) ? (
                <div className="text-center py-20 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/50">
                    <p className="text-xl text-muted-foreground font-bebas tracking-wide">
                        Unable to load articles at this time.
                    </p>
                    <p className="text-sm text-zinc-500 mt-2 font-manrope">
                        Please check your connection code or try again later.
                    </p>
                </div>
            ) : (
                <ArticleGrid articles={articles} />
            )}
        </div>
    );
}
