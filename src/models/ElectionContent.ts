import mongoose, { Schema, Document, Model } from "mongoose";

// --- Types ---

export interface IDailyBrief extends Document {
    title: string;
    slug: string;
    date: Date;
    summary: string;
    content: string; // HTML or Markdown
    tags: string[];
    isPublished: boolean;
}

export interface IFactCheck extends Document {
    claim: string;
    claimBy: string; // Person/Party making the claim
    verdict: "true" | "false" | "misleading" | "unverified";
    analysis: string;
    sources: string[];
    date: Date;
}

// --- Schemas ---

const DailyBriefSchema = new Schema<IDailyBrief>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        date: { type: Date, default: Date.now },
        summary: String,
        content: String,
        tags: [String],
        isPublished: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const FactCheckSchema = new Schema<IFactCheck>(
    {
        claim: { type: String, required: true },
        claimBy: String,
        verdict: {
            type: String,
            enum: ["true", "false", "misleading", "unverified"],
            required: true,
        },
        analysis: String,
        sources: [String],
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// --- Models ---

const getModel = <T extends Document>(name: string, schema: Schema<T>): Model<T> => {
    return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
};

export const DailyBrief = getModel<IDailyBrief>("DailyBrief", DailyBriefSchema);
export const FactCheck = getModel<IFactCheck>("FactCheck", FactCheckSchema);
