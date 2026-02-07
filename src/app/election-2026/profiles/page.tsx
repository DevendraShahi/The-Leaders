import { getParties } from "@/lib/election-data";
import { PartyGrid } from "@/components/election/PartyGrid";
import { Separator } from "@/components/ui/separator";

export default async function ElectionProfiles() {
    const parties = await getParties();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 border-b border-border/60 pb-8">
                    <div className="flex items-center gap-4 mb-4 opacity-60">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            Election 2026 Archive
                        </span>
                        <div className="h-px w-12 bg-border" />
                        <span className="text-xs font-mono uppercase tracking-widest text-primary">
                            Parties & Profiles
                        </span>
                    </div>
                    <h1 className="font-bebas text-5xl md:text-7xl text-foreground mb-4 uppercase tracking-tight">
                        Parties & Profiles
                    </h1>
                    <p className="text-muted-foreground font-manrope text-lg max-w-2xl leading-relaxed">
                        Meet the political landscape. Search and explore registered parties, their leaders, and foundational details for the 2026 election.
                    </p>
                </div>

                <Separator className="my-8" />

                <PartyGrid parties={parties} />
            </div>
        </div>
    );
}
