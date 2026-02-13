import mongoose, { Schema, Document, Model } from "mongoose";

// --- Types ---
type LocalizedText = string | { en?: string; ne?: string };

export interface IDailyBrief extends Document {
    title: LocalizedText;
    slug: string;
    date: Date;
    summary: LocalizedText;
    content: LocalizedText; // HTML or Markdown
    tags: string[];
    isPublished: boolean;
    status: "draft" | "published" | "archived";
    image?: string;
    views: number;
}

export interface IFactCheck extends Document {
    claim: LocalizedText;
    slug?: string;
    claimBy: LocalizedText; // Person/Party making the claim
    verdict: "true" | "false" | "misleading" | "unverified";
    analysis: LocalizedText;
    sources: string[];
    date: Date;
    status: "draft" | "published" | "archived";
    image?: string;
    views: number;
}

export interface IElectionArticle extends Document {
    editor?: string;
    title_en: string;
    title_ne?: string;
    excerpt_en: string;
    excerpt_ne?: string;
    content_en: string;
    content_ne?: string;
    slug: string;
    tags: string[];
    status: "draft" | "published" | "archived";
    image?: string;
    views: number;
}

// --- Schemas ---

const DailyBriefSchema = new Schema<IDailyBrief>(
    {
        title: { type: Schema.Types.Mixed, required: true },
        slug: { type: String, required: true, unique: true },
        date: { type: Date, default: Date.now },
        summary: { type: Schema.Types.Mixed },
        content: { type: Schema.Types.Mixed },
        tags: [String],
        isPublished: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        image: { type: String },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const FactCheckSchema = new Schema<IFactCheck>(
    {
        claim: { type: Schema.Types.Mixed, required: true },
        slug: { type: String, index: true },
        claimBy: { type: Schema.Types.Mixed },
        verdict: {
            type: String,
            enum: ["true", "false", "misleading", "unverified"],
            required: true,
        },
        analysis: { type: Schema.Types.Mixed },
        sources: [String],
        date: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        image: { type: String },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const ElectionArticleSchema = new Schema<IElectionArticle>(
    {
        editor: { type: String },
        title_en: { type: String, required: true },
        title_ne: { type: String },
        excerpt_en: { type: String, required: true },
        excerpt_ne: { type: String },
        content_en: { type: String, required: true },
        content_ne: { type: String },
        slug: { type: String, required: true, unique: true },
        tags: [String],
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        image: { type: String },
        views: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// --- Models ---

const modelPathChecks: Record<string, string[]> = {
    DailyBrief: ["title", "summary", "content"],
    FactCheck: ["claim", "claimBy", "analysis"],
};

const shouldRefreshModel = <T extends Document>(name: string, existing: Model<T>, schema: Schema<T>): boolean => {
    if (process.env.NODE_ENV === "production") return false;
    const pathsToCheck = modelPathChecks[name] || [];
    return pathsToCheck.some((pathName) => {
        const existingInstance = (existing.schema.path(pathName) as any)?.instance;
        const newInstance = (schema.path(pathName) as any)?.instance;
        return existingInstance !== newInstance;
    });
};

const getModel = <T extends Document>(name: string, schema: Schema<T>): Model<T> => {
    const existing = mongoose.models[name] as Model<T> | undefined;
    if (existing && shouldRefreshModel(name, existing, schema)) {
        try {
            mongoose.deleteModel(name);
        } catch {
            // Ignore and fall through to model creation attempt.
        }
        return mongoose.model<T>(name, schema);
    }
    return existing || mongoose.model<T>(name, schema);
};

export const DailyBrief = getModel<IDailyBrief>("DailyBrief", DailyBriefSchema);
export const FactCheck = getModel<IFactCheck>("FactCheck", FactCheckSchema);
export const ElectionArticle = getModel<IElectionArticle>("ElectionArticle", ElectionArticleSchema);
