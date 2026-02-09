import mongoose, { Schema, Model, models } from "mongoose";

export interface IPerplexityIngestSnapshot {
    adminId: mongoose.Types.ObjectId;
    meta: {
        generated_at_utc: string;
        focus: string;
        locale_mode: "en" | "ne" | "both";
        update_mode: "merge" | "replace";
    };
    affected: {
        dailyBriefSlugs: string[];
        factCheckSlugs: string[];
        articleSlugs: string[];
    };
    before: {
        dailyBriefs: Record<string, any>[];
        factChecks: Record<string, any>[];
        articles: Record<string, any>[];
    };
    createdAt?: Date;
    updatedAt?: Date;
}

const SnapshotSchema = new Schema<IPerplexityIngestSnapshot>(
    {
        adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
        meta: {
            generated_at_utc: { type: String, required: true },
            focus: { type: String, required: true },
            locale_mode: { type: String, enum: ["en", "ne", "both"], required: true },
            update_mode: { type: String, enum: ["merge", "replace"], required: true },
        },
        affected: {
            dailyBriefSlugs: [{ type: String }],
            factCheckSlugs: [{ type: String }],
            articleSlugs: [{ type: String }],
        },
        before: {
            dailyBriefs: [{ type: Schema.Types.Mixed }],
            factChecks: [{ type: Schema.Types.Mixed }],
            articles: [{ type: Schema.Types.Mixed }],
        },
    },
    { timestamps: true }
);

SnapshotSchema.index({ createdAt: -1 });
SnapshotSchema.index({ adminId: 1, createdAt: -1 });

const modelName = "PerplexityIngestSnapshot";
const PerplexityIngestSnapshot: Model<IPerplexityIngestSnapshot> =
    (models[modelName] as Model<IPerplexityIngestSnapshot>) ||
    mongoose.model(modelName, SnapshotSchema);

export default PerplexityIngestSnapshot;
