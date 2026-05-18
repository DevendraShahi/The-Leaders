import { NextResponse } from "next/server";
import { fetchTrendingTopics } from "@/lib/api/news-service";

export const revalidate = 21600;

export async function GET() {
    try {
        const topics = await fetchTrendingTopics();
        return NextResponse.json({
            success: true,
            data: {
                topics,
                updatedAt: new Date().toISOString(),
                mode: topics.length > 0 ? "verified-live" : "fallback-only",
            },
        });
    } catch (error) {
        console.error("Failed to load trending topics:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Unable to load trending topics",
            },
            { status: 500 }
        );
    }
}
