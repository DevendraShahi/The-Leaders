import { getDailyBriefs } from "@/lib/election-data";
import { Separator } from "@/components/ui/separator";
import { DailyBriefGrid } from "@/components/election/daily-brief/DailyBriefGrid";
import { DailyBriefStack } from "@/components/election/daily-brief/DailyBriefStack";
import { DailyBriefTimelineV2 } from "@/components/election/daily-brief/DailyBriefTimelineV2";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
    searchParams?: {
        layout?: string;
    };
}

function resolveLayout(layout?: string) {
    if (layout === "grid" || layout === "stack" || layout === "timeline") return layout;
    return "grid";
}

export default async function ElectionDailyBrief({ searchParams }: PageProps) {
    const briefs = await getDailyBriefs();
    const layout = resolveLayout(searchParams?.layout);
    const showLayoutLabel = !!searchParams?.layout;

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Subtle Paper Grain */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='1'/%3E%3C/svg%3E")`,
                }}
            />
            {/* Header Section */}
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <div className="inline-block border border-primary/20 bg-primary/5 px-4 py-1 mb-4">
                        <span className="text-primary font-mono text-xs uppercase tracking-widest">
                            Election 2026
                        </span>
                    </div>
                    <h1 className="font-bebas text-5xl md:text-7xl text-foreground mb-6 uppercase tracking-tight">
                        The Daily <span className="text-primary">Brief</span>
                    </h1>
                    <p className="text-muted-foreground font-sans text-xl leading-relaxed">
                        A disciplined archive of what moved the election story each day — from EC directives to
                        campaign turning points and integrity signals.
                    </p>
                    {showLayoutLabel && (
                        <div className="mt-4 inline-flex border border-border bg-muted/30 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            Layout: {layout}
                        </div>
                    )}
                </div>

                <Separator className="my-8" />
            </div>

            {/* Timeline Content */}
            {briefs.length > 0 ? (
                <>
                    {layout === "grid" && <DailyBriefGrid briefs={briefs} />}
                    {layout === "stack" && <DailyBriefStack briefs={briefs} />}
                    {layout === "timeline" && <DailyBriefTimelineV2 briefs={briefs} />}
                </>
            ) : (
                <div className="container mx-auto max-w-4xl px-4 py-24">
                    <div className="flex flex-col items-center justify-center bg-muted/30 border border-dashed border-border p-12">
                        <div className="w-16 h-16 bg-muted flex items-center justify-center mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="font-bebas text-2xl text-muted-foreground mb-2 uppercase">No Briefings Yet</h3>
                        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                            Check back tomorrow for updates
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
