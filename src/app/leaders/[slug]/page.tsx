import { getLeaderBySlug } from "@/lib/leaders-db";
import LeaderDetailClient from "@/components/leaders/LeaderDetailClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { profileJsonLd } from "@/lib/seo";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const leader = await getLeaderBySlug(slug);

    if (!leader) {
        return constructMetadata({
            title: "Leader Not Found",
            description: "The requested leader profile could not be found.",
            canonical: `/leaders/${slug}`,
            noIndex: true,
        });
    }

    const name = leader.name?.en || leader.name?.ne || "Leader Profile";
    const description = leader.desc?.en || leader.desc?.ne || leader.bio?.en || leader.bio?.ne || "Leader profile on The Leaders.";

    return constructMetadata({
        title: `${name} Profile`,
        description,
        canonical: `/leaders/${slug}`,
        ogType: "profile",
        ogImage: leader.image || leader.cover || "/the-leader.png",
        keywords: [leader.party?.en || "", leader.position?.en || ""].filter(Boolean),
    });
}

export default async function LeaderProfile({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const leader = await getLeaderBySlug(slug);

    if (!leader) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center">
                <h1 className="text-6xl font-bebas text-primary mb-4">404 - File Not Found</h1>
                <p className="text-zinc-500 mb-8 font-manrope">The requested dossier does not exist or has been redacted.</p>
                <Link href="/leaders">
                    <Button variant="outline">Return to Roster</Button>
                </Link>
            </div>
        );
    }

    const name = leader.name?.en || leader.name?.ne || "Leader";
    const description = leader.desc?.en || leader.desc?.ne || leader.bio?.en || leader.bio?.ne || "Leader profile on The Leaders.";
    const jsonLd = profileJsonLd({
        path: `/leaders/${slug}`,
        name,
        description,
        image: leader.image || leader.cover || undefined,
    });

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <LeaderDetailClient leader={leader} />
        </>
    );
}
