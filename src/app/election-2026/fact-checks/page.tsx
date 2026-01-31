import { getFactChecks } from "@/lib/election-data";
import { FactCheckCard } from "@/components/election/FactCheckCard";
import { Separator } from "@/components/ui/separator";

export default async function ElectionFactChecks() {
    const factChecks = await getFactChecks();

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="font-bebas text-4xl md:text-6xl text-primary mb-4">Election Fact Checks</h1>
                <p className="text-muted-foreground font-manrope text-lg max-w-2xl">
                    We rigorously verify claims made by politicians, parties, and social media to fight misinformation.
                </p>
            </div>

            <Separator className="my-8" />

            {factChecks.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {factChecks.map((check, index) => (
                        <div key={index}> {/* Use index as no slug provided for fact check in sample data yet, or create slug */}
                            <FactCheckCard
                                claim={check.claim}
                                claimBy={check.claimBy}
                                verdict={check.verdict}
                                analysis={check.analysis}
                                date={check.date}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
                    <p className="text-muted-foreground">No fact checks published yet.</p>
                </div>
            )}
        </div>
    );
}
