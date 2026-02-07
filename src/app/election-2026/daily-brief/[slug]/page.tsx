import { getDailyBriefs } from "@/lib/election-data";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const briefs = await getDailyBriefs();
    return briefs.map((brief) => ({
        slug: brief.slug,
    }));
}

export default async function DailyBriefDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const briefs = await getDailyBriefs();
    const brief = briefs.find((b) => b.slug === slug);

    if (!brief) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Back Navigation */}
            <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">
                <div className="container mx-auto max-w-4xl px-4 py-4">
                    <Link
                        href="/election-2026/daily-brief"
                        className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Daily Briefs
                    </Link>
                </div>
            </div>

            {/* Article Header */}
            <header className="relative border-b-2 border-primary/20 overflow-hidden">
                {brief.image && (
                    <div className="absolute inset-0">
                        <img
                            src={brief.image}
                            alt={brief.title}
                            className="h-full w-full object-cover object-center opacity-40"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/95" />
                    </div>
                )}
                <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12">
                    <div className="mb-6">
                        <div className="inline-block border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
                            <span className="text-primary font-mono text-xs uppercase tracking-widest">
                                Daily Intelligence
                            </span>
                        </div>
                    </div>

                    <h1 className="font-bebas text-5xl md:text-7xl text-foreground mb-6 uppercase tracking-tight leading-[0.95]">
                        {brief.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <time dateTime={brief.date}>
                                {format(new Date(brief.date), "EEEE, MMMM d, yyyy")}
                            </time>
                        </div>

                        {brief.tags && brief.tags.length > 0 && (
                            <>
                                <span className="text-border">•</span>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    <div className="flex flex-wrap gap-2">
                                        {brief.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                                className="font-mono text-xs uppercase px-2 py-0.5 rounded-none"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Summary */}
                    {brief.summary && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xl md:text-2xl font-sans leading-relaxed text-foreground/90 italic">
                                {brief.summary}
                            </p>
                        </div>
                    )}
                </div>
            </header>

            <article className="container mx-auto max-w-4xl px-4 py-12">
                <Separator className="my-8" />

                {/* Main Content */}
                <div className="prose prose-lg max-w-none">
                    <div
                        className="font-sans text-lg leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{ __html: brief.content }}
                    />
                </div>

                {/* Footer Navigation */}
                <div className="mt-16 pt-8 border-t border-border">
                    <Link
                        href="/election-2026/daily-brief"
                        className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        View All Daily Briefs
                    </Link>
                </div>
            </article>
        </div>
    );
}
