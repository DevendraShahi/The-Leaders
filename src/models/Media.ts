import mongoose, { Schema, Model, models } from "mongoose";

export interface IMedia {
    _id?: string;
    publicId: string;
    secureUrl: string;
    originalFilename: string;
    format: string;
    size: number;
    width: number;
    height: number;
    category: 'article' | 'leader' | 'history' | 'social' | 'general';
    tags: string[];
    altText?: {
        en: string;
        ne: string;
    };
    credit?: string;
    rightsStatus?: 'licensed' | 'owned' | 'public_domain' | 'permission_granted' | 'unknown';
    uploadedBy?: mongoose.Types.ObjectId;
}

const MediaSchema = new Schema<IMedia>(
    {
        publicId: { type: String, required: true, unique: true },
        secureUrl: { type: String, required: true },
        originalFilename: { type: String, required: true },
        format: { type: String, required: true },
        size: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        category: {
            type: String,
            enum: ['article', 'leader', 'history', 'social', 'general'],
            default: 'general',
            required: true
        },
        tags: [{ type: String }],
        altText: {
            en: { type: String },
            ne: { type: String },
        },
        credit: { type: String, trim: true, maxlength: 200, default: '' },
        rightsStatus: { type: String, enum: ['licensed', 'owned', 'public_domain', 'permission_granted', 'unknown'], default: 'unknown' },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

// Indexes for faster searching
MediaSchema.index({ category: 1 });
MediaSchema.index({ tags: 1 });
MediaSchema.index({ createdAt: -1 });

const Media: Model<IMedia> = models.Media || mongoose.model("Media", MediaSchema);

export default Media;
