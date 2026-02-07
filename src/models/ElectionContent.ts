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
    image?: string;
}

export interface IFactCheck extends Document {
    claim: string;
    slug?: string;
    claimBy: string; // Person/Party making the claim
    verdict: "true" | "false" | "misleading" | "unverified";
    analysis: string;
    sources: string[];
    date: Date;
    image?: string;
}

export interface IElectionArticle extends Document {
    editor?: string;
    title_en: string;
    excerpt_en: string;
    content_en: string;
    slug: string;
    tags: string[];
    status: "draft" | "published" | "archived";
    image?: string;
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
        image: { type: String },
    },
    { timestamps: true }
);

const FactCheckSchema = new Schema<IFactCheck>(
    {
        claim: { type: String, required: true },
        slug: { type: String, index: true },
        claimBy: String,
        verdict: {
            type: String,
            enum: ["true", "false", "misleading", "unverified"],
            required: true,
        },
        analysis: String,
        sources: [String],
        date: { type: Date, default: Date.now },
        image: { type: String },
    },
    { timestamps: true }
);

const ElectionArticleSchema = new Schema<IElectionArticle>(
    {
        editor: { type: String },
        title_en: { type: String, required: true },
        excerpt_en: { type: String, required: true },
        content_en: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        tags: [String],
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        image: { type: String },
    },
    { timestamps: true }
);

// --- Models ---

const getModel = <T extends Document>(name: string, schema: Schema<T>): Model<T> => {
    return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
};

export const DailyBrief = getModel<IDailyBrief>("DailyBrief", DailyBriefSchema);
export const FactCheck = getModel<IFactCheck>("FactCheck", FactCheckSchema);
export const ElectionArticle = getModel<IElectionArticle>("ElectionArticle", ElectionArticleSchema);
