import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Info, ShieldCheck, Calendar } from "lucide-react";
import { ElectionMap } from "@/components/election/ElectionMap";
import { BorderBeam } from "@/components/ui/border-beam";
import { getDailyBriefs, getFactChecks } from "@/lib/election-data";
import { format } from "date-fns";

export default async function ElectionDashboard() {
    const briefs = await getDailyBriefs();
    const factChecks = await getFactChecks();
    const latestBrief = briefs[0];
    const latestFactCheck = factChecks[0];

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="font-bebas text-4xl md:text-6xl text-primary">Election 2026 Central</h1>
                    <p className="text-muted-foreground mt-2 font-manrope text-lg">
                        Grand Central Station for live updates, data, and verified facts.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Subscribe to Alerts</Button>
                    <Button asChild>
                        <Link href="/election-2026/pr-candidates">View Interactive Map</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Map Area (Takes 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border-y border-primary/20 bg-card/50 backdrop-blur min-h-[500px] flex flex-col relative py-8">
                        <div className="flex flex-row items-center justify-between px-4 pb-4">
                            <h3 className="text-xl font-bold uppercase tracking-wider font-bebas">Live District Map</h3>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 w-full h-[500px] relative">
                            <ElectionMap className="w-full h-full" />
                            {/* Legend Overlay */}
                            <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur p-2 rounded border text-xs text-muted-foreground space-y-1 pointe-events-none">
                                <div className="flex items-center gap-1">
                                    <div className="h-3 w-3 rounded-full bg-primary" /> Projected Win
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-3 w-3 rounded-full bg-card border border-border" /> Undecided
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Sections Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">PR Candidates List</CardTitle>
                                <CardDescription>Search and filter Proportional Representation candidates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-32 bg-primary/10 rounded mb-2 flex items-center justify-center text-primary/40 font-bebas text-4xl">
                                    PR LIST
                                </div>
                                <Button variant="link" className="px-0 text-primary" asChild>
                                    <Link href="/election-2026/pr-candidates">View Full List <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Party Manifestos</CardTitle>
                                <CardDescription>What do they stand for?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-32 bg-muted/10 rounded mb-2" />
                                <Button variant="link" className="px-0 text-primary" asChild>
                                    <Link href="/election-2026/profiles">Compare Parties <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar: Daily Brief & Fact Checks (Takes 1 column) */}
                <div className="space-y-6">
                    {/* Daily Brief */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Daily Briefing
                                {latestBrief && (
                                    <span className="text-xs font-normal text-muted-foreground ml-auto">
                                        {format(new Date(latestBrief.date), "MMM d")}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {latestBrief ? (
                                <>
                                    <div className="space-y-2">
                                        <Link href={`/election-2026/daily-brief/${latestBrief.slug}`} className="block group">
                                            <h4 className="font-bold leading-tight group-hover:underline cursor-pointer group-hover:text-primary transition-colors">
                                                {latestBrief.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                                                {latestBrief.summary}
                                            </p>
                                        </Link>
                                    </div>
                                    {briefs.length > 1 && <Separator />}
                                    {/* Could list more briefs here if available */}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No briefs available today.</p>
                            )}

                            <Button className="w-full mt-2" variant="secondary" asChild>
                                <Link href="/election-2026/daily-brief">Read Today's Full Brief</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Latest Fact Check */}
                    <Card className="border-l-4 border-l-destructive/80">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <ShieldCheck className="h-5 w-5" /> Fact Check
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {latestFactCheck ? (
                                <>
                                    <h4 className="font-bold text-lg leading-tight mb-2">Claim: "{latestFactCheck.claim}"</h4>
                                    <div className="bg-destructive/10 text-destructive px-2 py-1 rounded inline-block text-sm font-bold uppercase mb-2">
                                        Verdict: {latestFactCheck.verdict}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {latestFactCheck.analysis}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent fact checks.</p>
                            )}

                            <Button variant="link" className="mt-2 px-0 text-destructive" asChild>
                                <Link href="/election-2026/fact-checks">See All Verifications</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
