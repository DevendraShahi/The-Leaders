import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";

interface DailyBriefCardProps {
    title: string;
    slug: string;
    date: string;
    summary: string;
    tags?: string[];
}

export function DailyBriefCard({ title, slug, date, summary, tags }: DailyBriefCardProps) {
    return (
        <Card className="hover:border-primary/50 transition-colors group h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="font-normal text-muted-foreground uppercase tracking-wider text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(date), "MMM d, yyyy")}
                    </Badge>
                    {tags && tags.length > 0 && (
                        <div className="flex gap-1">
                            {tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
                            ))}
                        </div>
                    )}
                </div>
                <CardTitle className="font-bebas text-2xl tracking-wide group-hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/election-2026/daily-brief/${slug}`}>
                        {title}
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 font-serif">
                    {summary}
                </p>
                <Link
                    href={`/election-2026/daily-brief/${slug}`}
                    className="text-sm font-bold uppercase tracking-wider flex items-center text-primary hover:underline mt-auto"
                >
                    Read Full Brief <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
            </CardContent>
        </Card>
    );
}
