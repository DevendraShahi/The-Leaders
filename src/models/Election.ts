import mongoose, { Schema, Document, Model } from "mongoose";

// --- Types ---

export interface IElectionParty extends Document {
    name: string;
    slug: string;
    logo: string;
    color: string;
    foundedYear?: number;
    leader?: string;
    manifestoSummary?: string;
}

export interface IElectionCandidate extends Document {
    name: string;
    slug: string;
    party: mongoose.Types.ObjectId; // Reference to ElectionParty
    constituency?: string; // e.g., "Kathmandu-1"
    district: string; // Reference to district name/ID
    bio: string;
    photo: string;
    incumbent: boolean;
    status: "active" | "withdrawn" | "disqualified";
    votes: number;
}

export interface IElectionDistrict extends Document {
    name: string; // e.g., "Kathmandu"
    totalVoters: number;
    province: string;
    coordinates?: [number, number]; // Centroid
    status: "pending" | "voting" | "counting" | "declared";
    winner?: mongoose.Types.ObjectId; // Reference to Candidate or Party
    leadingParty?: mongoose.Types.ObjectId;
}

// --- Schemas ---

const ElectionPartySchema = new Schema<IElectionParty>(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        logo: { type: String },
        color: { type: String, default: "#000000" },
        foundedYear: Number,
        leader: String,
        manifestoSummary: String,
    },
    { timestamps: true }
);

const ElectionCandidateSchema = new Schema<IElectionCandidate>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        party: { type: Schema.Types.ObjectId, ref: "ElectionParty" },
        constituency: String,
        district: { type: String, required: true, index: true },
        bio: String,
        photo: String,
        incumbent: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["active", "withdrawn", "disqualified"],
            default: "active",
        },
        votes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const ElectionDistrictSchema = new Schema<IElectionDistrict>(
    {
        name: { type: String, required: true, unique: true },
        totalVoters: { type: Number, default: 0 },
        province: String,
        status: {
            type: String,
            enum: ["pending", "voting", "counting", "declared"],
            default: "pending",
        },
        winner: { type: Schema.Types.ObjectId, ref: "ElectionParty" }, // Simplified to Party for map highlighting
        leadingParty: { type: Schema.Types.ObjectId, ref: "ElectionParty" },
    },
    { timestamps: true }
);

// --- Models ---

// Helper to prevent overwrite error in dev hot reload
const getModel = <T extends Document>(name: string, schema: Schema<T>): Model<T> => {
    return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
};

export const ElectionParty = getModel<IElectionParty>("ElectionParty", ElectionPartySchema);
export const ElectionCandidate = getModel<IElectionCandidate>("ElectionCandidate", ElectionCandidateSchema);
export const ElectionDistrict = getModel<IElectionDistrict>("ElectionDistrict", ElectionDistrictSchema);
