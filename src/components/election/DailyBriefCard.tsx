import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Calendar } from "lucide-react";

interface DailyBriefCardProps {
    title: string;
    slug: string;
    date: string;
    summary: string;
    tags?: string[];
}

export function DailyBriefCard({ title, slug, date, summary, tags }: DailyBriefCardProps) {
    return (
        <Card className="group h-full flex flex-col bg-card border border-border hover:border-primary transition-all duration-300 rounded-none">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider text-muted-foreground border-border rounded-none">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(date), "MMM d, yyyy")}
                    </Badge>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <CardTitle className="font-bebas text-2xl tracking-wide text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/election-2026/daily-brief/${slug}`}>
                        {title}
                    </Link>
                </CardTitle>

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] font-mono uppercase px-2 py-0.5 bg-secondary border border-border rounded-none">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 font-manrope flex-1">
                    {summary}
                </p>

                <div className="pt-4 border-t border-dashed border-border">
                    <Link
                        href={`/election-2026/daily-brief/${slug}`}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                        Read Full Brief
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
