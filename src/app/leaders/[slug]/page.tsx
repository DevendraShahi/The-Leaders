import { getLeaderBySlug } from "@/lib/leaders-db";
import LeaderDetailClient from "@/components/leaders/LeaderDetailClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function LeaderProfile({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const leader = await getLeaderBySlug(slug);

    if (!leader) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center">
                <h1 className="text-6xl font-bebas text-primary mb-4">404 - File Not Found</h1>
                <p className="text-zinc-500 mb-8 font-manrope">The requested dossier does not exist or has been redacted.</p>
                <Link href="/leaders">
                    <Button variant="outline" className="font-bebas text-xl">Return to Roster</Button>
                </Link>
            </div>
        );
    }

    return <LeaderDetailClient leader={leader} />;
}

