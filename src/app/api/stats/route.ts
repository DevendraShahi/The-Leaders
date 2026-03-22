import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import Leader from "@/models/Leader";
import Article from "@/models/Article";

export async function GET() {
    try {
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

        return NextResponse.json({
            subscribers: subscriberCount,
            leaders: leaderCount,
            articles: articleCount,
        });
    } catch (error) {
        console.error("Stats API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
