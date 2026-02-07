import { getElectionArticles } from "@/lib/election-data";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Election Analyses – Nepal Election 2026 | The Leaders",
    description:
        "Deeper dives into the political dynamics, narratives, and numbers behind Nepal's 2026 election.",
};

export const revalidate = 600;

export default async function ElectionAnalysesPage() {
    // Fetch a generous number of articles; these are editor-curated
    const articles = await getElectionArticles(50);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="border-b border-border/30 bg-gradient-to-b from-background to-background/60">
                <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <Link
                            href="/election-2026"
                            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Election 2026
                        </Link>
                    </div>

                    <header className="space-y-4">
                        <span className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                            <FileText className="h-3 w-3 text-primary" />
                            Election Analyses
                        </span>
                        <h1 className="font-bebas text-5xl md:text-6xl tracking-tight uppercase">
                            Deeper Election{" "}
                            <span className="bg-gradient-to-r from-primary to-[#D32F2F] bg-clip-text text-transparent">
                                Analyses
                            </span>
                        </h1>
                        <p className="max-w-3xl font-sans text-base md:text-lg leading-relaxed text-muted-foreground">
                            Deeper dives into the political dynamics, narratives, and numbers behind Nepal&apos;s
                            2026 election. Curated analysis pieces from The Leaders editorial desk.
                        </p>
                    </header>
                </div>
            </div>

            <main className="container mx-auto max-w-5xl px-4 py-10 md:py-12 space-y-8">
                {articles.length === 0 ? (
                    <div className="border border-dashed border-border px-6 py-16 text-center">
                        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                            No election analyses have been published yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {articles.map((article) => (
                            <Card
                                key={article.slug}
                                className="border-border/40 rounded-none bg-card hover:border-primary/60 transition-colors"
                            >
                                {article.image && (
                                    <div className="relative h-44 w-full overflow-hidden border-b border-border/60">
                                        <img
                                            src={article.image}
                                            alt={article.title_en}
                                            className="h-full w-full object-cover object-center"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent" />
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="space-y-1">
                                            <CardTitle className="font-bebas text-2xl md:text-3xl tracking-wide uppercase">
                                                <Link
                                                    href={`/election-2026/analyses/${article.slug}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {article.title_en}
                                                </Link>
                                            </CardTitle>
                                            {article.createdAt && (
                                                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                                                    {new Date(article.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        {article.editor && (
                                            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                                                Editor: {article.editor}
                                            </p>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-3">
                                    <p className="font-sans text-sm md:text-base leading-relaxed text-muted-foreground">
                                        {article.excerpt_en}
                                    </p>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                                        Full reader view available
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
