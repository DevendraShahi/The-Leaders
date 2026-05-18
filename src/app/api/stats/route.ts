import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import Leader from "@/models/Leader";
import Article from "@/models/Article";
import { unstable_cache } from "next/cache";

const getCachedStats = unstable_cache(
    async () => {
        await dbConnect();

        const [
            subscriberCount,
            leaderCount,
            articleCount,
        ] = await Promise.all([
            Subscriber.countDocuments({ isActive: true, isVerified: true }),
            Leader.countDocuments(),
            Article.countDocuments({ status: "published" }),
        ]);

        return {
            subscribers: subscriberCount,
            leaders: leaderCount,
            articles: articleCount,
        };
    },
    ["public-stats"],
    { revalidate: 21600, tags: ["stats"] }
);

export async function GET() {
    try {
        return NextResponse.json(await getCachedStats());
    } catch (error) {
        console.error("Stats API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
