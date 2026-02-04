import dbConnect from "@/lib/db";
import Leader, { ILeader } from "@/models/Leader";

// Helper to serialize Mongoose document
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serialize = (obj: any) => obj ? JSON.parse(JSON.stringify(obj)) : null;

export async function getLeaders() {
    await dbConnect();

    // Sort by order ascending
    const leaders = await Leader.find({})
        .sort({ order: 1 })
        .lean();

    return serialize(leaders) as ILeader[];
}

export async function getLeaderBySlug(slug: string) {
    await dbConnect();

    const leader = await Leader.findOne({ slug }).lean();

    if (!leader) return null;

    return serialize(leader) as ILeader;
}
