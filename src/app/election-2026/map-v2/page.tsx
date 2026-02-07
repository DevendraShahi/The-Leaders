import { InteractiveNepalMap } from "@/components/election/InteractiveNepalMap";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

export const metadata = {
    title: "Interactive Election Map V2 | The Leaders",
    description: "Advanced interactive visualization of Nepal's electoral districts and provinces.",
};

export default function MapV2Page() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 px-0 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="space-y-3 border-b border-border/60 pb-6">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                Election 2026
                            </span>
                            <div className="h-px w-12 bg-border" />
                            <span className="text-xs font-mono uppercase tracking-widest text-primary">
                                Interactive Map V2
                            </span>
                        </div>
                        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-tight uppercase">
                            Election Map V2
                        </h1>
                        <p className="text-muted-foreground font-manrope max-w-3xl">
                            Explore a full-screen, interactive visualization of Nepal&apos;s electoral geography. Switch between province and district views to analyze where the 2026 race is unfolding.
                        </p>
                    </div>

                    <div className="h-[640px] w-full border border-border bg-muted/10">
                        <InteractiveNepalMap className="h-full w-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <div className="p-4 bg-muted/20 border border-border rounded-none">
                            <h3 className="font-bebas text-lg mb-2 uppercase tracking-wide">Province View</h3>
                            <p className="text-sm text-muted-foreground font-manrope">
                                Aggregated view showing all 7 provinces with distinct color coding for high-level analysis.
                            </p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-none">
                            <h3 className="font-bebas text-lg mb-2 uppercase tracking-wide">District View</h3>
                            <p className="text-sm text-muted-foreground font-manrope">
                                Detailed view of all 77 districts. Hover for quick stats and click to focus specific regions.
                            </p>
                        </div>
                        <div className="p-4 bg-muted/20 border border-border rounded-none">
                            <h3 className="font-bebas text-lg mb-2 uppercase tracking-wide">Constituency Mode</h3>
                            <p className="text-sm text-muted-foreground font-manrope">
                                Upcoming mode to visualize election constituencies and seat outcomes at a glance.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
