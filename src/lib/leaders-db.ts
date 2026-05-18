import dbConnect from "@/lib/db";
import Leader, { ILeader } from "@/models/Leader";
import { unstable_cache } from "next/cache";

// Helper to serialize Mongoose document
const serialize = (obj: any) => (obj ? JSON.parse(JSON.stringify(obj)) : null);

export const getLeaders = unstable_cache(async () => {
    try {
        await dbConnect();

        // Sort by order ascending
        const leaders = await Leader.find({ status: "published" })
            .sort({ order: 1 })
            .lean();

        return serialize(leaders) as ILeader[];
    } catch (error) {
        console.error("Failed to load leaders from database:", error);
        return [];
    }
}, ["leaders-list"], { tags: ["leaders"] });

export const getLeaderBySlug = unstable_cache(async (slug: string) => {
    try {
        await dbConnect();

        const leader = await Leader.findOne({ slug, status: "published" }).lean();
        if (!leader) return null;

        return serialize(leader) as ILeader;
    } catch (error) {
        console.error("Failed to load leader by slug from database:", error);
        return null;
    }
}, ["leader-by-slug"], { tags: ["leaders"] });
