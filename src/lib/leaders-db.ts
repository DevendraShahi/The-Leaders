import dbConnect from "@/lib/db";
import Leader, { ILeader } from "@/models/Leader";

// Helper to serialize Mongoose document
const serialize = (obj: any) => (obj ? JSON.parse(JSON.stringify(obj)) : null);

export async function getLeaders() {
    await dbConnect();

    // Sort by order ascending
    const leaders = await Leader.find({ status: "published" })
        .sort({ order: 1 })
        .lean();

    return serialize(leaders) as ILeader[];
}

export async function getLeaderBySlug(slug: string) {
    await dbConnect();

    const leader = await Leader.findOne({ slug, status: "published" }).lean();

    if (!leader) return null;

    return serialize(leader) as ILeader;
}
