import dbConnect from "@/lib/db";
import Leader, { ILeader } from "@/models/Leader";
import { unstable_cache } from "next/cache";

// Helper to serialize Mongoose document
const serialize = (obj: any) => (obj ? JSON.parse(JSON.stringify(obj)) : null);

export const getLeaders = unstable_cache(async () => {
    try {
        await dbConnect();

        // Sort by order ascending, include published and archived leaders
        const leaders = await Leader.find({ status: { $ne: "draft" } })
            .sort({ order: 1, _id: 1 })
            .limit(100)
            .select("slug name desc party position years image cover isActive order dataSources quote")
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

        const leader = await Leader.findOne({ slug, status: { $ne: "draft" } }).lean();
        if (!leader) return null;

        return serialize(leader) as ILeader;
    } catch (error) {
        console.error("Failed to load leader by slug from database:", error);
        return null;
    }
}, ["leader-by-slug"], { tags: ["leaders"] });
