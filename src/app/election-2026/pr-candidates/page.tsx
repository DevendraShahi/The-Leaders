import { getPRData } from "@/lib/pr-candidate-data";
import { PRCandidateViewer } from "@/components/election/PRCandidateViewer";
import { ElectionMap } from "@/components/election/ElectionMap";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removing unused imports if no longer needed, or keeping if other parts use it
import { BorderBeam } from "@/components/ui/border-beam";

export default async function PRCandidatesPage() {
    const prData = await getPRData();

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="font-bebas text-4xl md:text-6xl text-primary">Proportional Representation Candidates</h1>
                <p className="text-muted-foreground mt-2 font-manrope text-lg">
                    Explore the full list of candidates for the 2026 Election. Select a district on the map or use the filters below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map Section - Takes up 1 column on large screens, or maybe full width top? 
            Let's do full width top or side-by-side depending on preference. 
            Given the vertical nature of the list, side-by-side with map sticky might be nice?
            But the map is wide. Let's put Map on top (or in a card) and List below.
        */}
                <div className="lg:col-span-3">
                    <div className="relative w-full border-y border-primary/20 md:py-12 bg-background/50 backdrop-blur">
                        <div className="h-[400px] md:h-[600px] w-full">
                            <ElectionMap className="w-full h-full" />
                        </div>
                        <div className="absolute top-4 left-4 pointer-events-none">
                            {/* <h3 className="font-bebas text-2xl text-primary drop-shadow-sm">Interactive District Filter</h3> */}
                        </div>
                    </div>
                </div>
            </div>

            <PRCandidateViewer initialData={prData} />
        </div>
    );
}
