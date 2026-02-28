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
            <div className="homepage-shell leaders-canvas election-typography flex min-h-screen flex-col items-center justify-center px-6 text-center">
                <h1 className="mb-4 font-editorial text-5xl text-primary sm:text-6xl">404 - File Not Found</h1>
                <p className="mb-8 max-w-xl text-sm text-muted-foreground sm:text-base">
                    The requested leader profile does not exist or has been redacted.
                </p>
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
