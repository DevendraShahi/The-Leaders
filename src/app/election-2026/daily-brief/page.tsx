import { getDailyBriefs } from "@/lib/election-data";
import { DailyBriefCard } from "@/components/election/DailyBriefCard";
import { Separator } from "@/components/ui/separator";

export default async function ElectionDailyBrief() {
    const briefs = await getDailyBriefs();

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="font-bebas text-4xl md:text-6xl text-primary mb-4">Daily Election Briefs</h1>
                <p className="text-muted-foreground font-manrope text-lg max-w-2xl">
                    Complete daily summaries of election activities, EC announcements, and campaign trails.
                    Your essential morning read.
                </p>
            </div>

            <Separator className="my-8" />

            {briefs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {briefs.map((brief) => (
                        <DailyBriefCard
                            key={brief.slug}
                            title={brief.title}
                            slug={brief.slug}
                            date={brief.date}
                            summary={brief.summary}
                            tags={brief.tags}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No briefs published yet.</p>
                </div>
            )}
        </div>
    );
}
