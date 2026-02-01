import { getArticles } from "@/lib/data";
import { ArticleGrid } from "./article-grid";

export async function NewsSection() {
    const articles = await getArticles(3);

    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-background border-t border-border/10">
            <div className="container px-4 mx-auto">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-6xl font-bebas font-bold text-foreground uppercase tracking-tight">
                        News & <span className="text-primary">Perspectives</span>
                    </h2>
                    <div className="w-24 h-1 bg-primary mx-auto mt-4" />
                </div>

                <ArticleGrid articles={articles} />
            </div>
        </section>
    );
}
