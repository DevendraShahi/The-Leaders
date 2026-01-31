import { getParties } from "@/lib/election-data";
import { PartyGrid } from "@/components/election/PartyGrid";
import { Separator } from "@/components/ui/separator";

export default async function ElectionProfiles() {
    const parties = await getParties();

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="font-bebas text-4xl md:text-6xl text-primary mb-4">Election Parties & Profiles</h1>
                <p className="text-muted-foreground font-manrope text-lg max-w-2xl">
                    Meet the political landscape. Search and explore registered parties, their leaders, and foundational details.
                </p>
            </div>

            <Separator className="my-8" />

            <div className="mb-12">
                <PartyGrid parties={parties} />
            </div>
        </div>
    );
}
