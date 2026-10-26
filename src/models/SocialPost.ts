import mongoose, { Schema, type Model, models } from "mongoose";
import { socialFontBounds, socialPhotoFilters, socialPostFormats, socialPostLocales, socialPostStates, socialPostTemplates, type SocialTypography } from "@/lib/social-post";

export interface ISocialPost {
    _id?: string;
    title: string;
    ownerId: mongoose.Types.ObjectId;
    reviewerId?: mongoose.Types.ObjectId;
    sourceStory?: { entityType: "article" | "brief" | "column"; id: string };
    revision: number;
    templateId: (typeof socialPostTemplates)[number];
    templateVersion: number;
    brandKitVersion: number;
    format: (typeof socialPostFormats)[number];
    outputLanguage: (typeof socialPostLocales)[number];
    copy: Record<"en" | "ne", Record<string, unknown>>;
    typography?: SocialTypography;
    media: { mediaId?: mongoose.Types.ObjectId; credit: string; rightsStatus: string; focalX: number; focalY: number; zoom: number; filter?: (typeof socialPhotoFilters)[number]; filterIntensity?: number };
    sources: Array<{ url: string; publisher: string; title: string; excerpt: string; publishedAt?: Date; trusted: boolean; verifiedAt?: Date; verifiedBy?: mongoose.Types.ObjectId }>;
    verification: { claimsConfirmed: boolean; sourcesConfirmed: boolean };
    internalNotes: string;
    status: (typeof socialPostStates)[number];
    approval?: { reviewerId: mongoose.Types.ObjectId; revision: number; artifactId: mongoose.Types.ObjectId; approvedAt: Date };
    renderArtifacts: Array<{ revision: number; locale: string; format: string; mediaId?: mongoose.Types.ObjectId; url: string; hash: string; createdAt: Date }>;
}

const localizedCopy = {
    headline: { type: String, default: "", maxlength: 180 }, deck: { type: String, default: "", maxlength: 2000 },
    category: { type: String, default: "NEWS", maxlength: 48 }, eyebrow: { type: String, default: "", maxlength: 72 },
    quoteSpeaker: { type: String, default: "", maxlength: 120 }, quoteContext: { type: String, default: "", maxlength: 180 },
    statisticValue: { type: String, default: "", maxlength: 48 }, statisticLabel: { type: String, default: "", maxlength: 120 }, statisticAsOf: { type: String, default: "", maxlength: 80 },
    captionInstagram: { type: String, default: "", maxlength: 2200 }, captionFacebook: { type: String, default: "", maxlength: 5000 },
    hashtags: [{ type: String, maxlength: 60 }], linkText: { type: String, default: "", maxlength: 120 }, altText: { type: String, default: "", maxlength: 500 },
    _id: false,
};

const SocialPostSchema = new Schema<ISocialPost>({
    title: { type: String, required: true, trim: true, maxlength: 160 },
    ownerId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "Admin", index: true },
    sourceStory: { entityType: { type: String, enum: ["article", "brief", "column"] }, id: String, _id: false },
    revision: { type: Number, required: true, default: 0 },
    templateId: { type: String, enum: socialPostTemplates, required: true, default: "news" },
    templateVersion: { type: Number, required: true, default: 1 }, brandKitVersion: { type: Number, required: true, default: 1 },
    format: { type: String, enum: socialPostFormats, required: true, default: "portrait" },
    outputLanguage: { type: String, enum: socialPostLocales, required: true, default: "ne" },
    copy: { en: localizedCopy, ne: localizedCopy },
    typography: Object.fromEntries(socialPostLocales.map(locale => [locale, {
        headlineSize: { type: Number, min: socialFontBounds.headlineSize[0], max: socialFontBounds.headlineSize[1] },
        deckSize: { type: Number, min: socialFontBounds.deckSize[0], max: socialFontBounds.deckSize[1] }, _id: false,
    }])),
    media: {
        mediaId: { type: Schema.Types.ObjectId, ref: "Media" }, credit: { type: String, default: "", maxlength: 200 },
        rightsStatus: { type: String, enum: ["licensed", "owned", "public_domain", "permission_granted", "unknown"], default: "unknown" },
        focalX: { type: Number, default: 0.5, min: 0, max: 1 }, focalY: { type: Number, default: 0.5, min: 0, max: 1 }, zoom: { type: Number, default: 1, min: 1, max: 2.5 }, _id: false,
        filter: { type: String, enum: socialPhotoFilters, default: "none" }, filterIntensity: { type: Number, default: 1, min: 0, max: 1 },
    },
    sources: [{ url: String, publisher: String, title: String, excerpt: String, publishedAt: Date, trusted: { type: Boolean, default: false }, verifiedAt: Date, verifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" }, _id: false }],
    verification: { claimsConfirmed: { type: Boolean, default: false }, sourcesConfirmed: { type: Boolean, default: false }, _id: false },
    internalNotes: { type: String, default: "", maxlength: 4000, select: false },
    status: { type: String, enum: socialPostStates, required: true, default: "draft", index: true },
    approval: { reviewerId: { type: Schema.Types.ObjectId, ref: "Admin" }, revision: Number, artifactId: { type: Schema.Types.ObjectId, ref: "Media" }, approvedAt: Date, _id: false },
    renderArtifacts: [{ revision: Number, locale: String, format: String, mediaId: { type: Schema.Types.ObjectId, ref: "Media" }, url: String, hash: String, createdAt: { type: Date, default: Date.now }, _id: false }],
}, { timestamps: true });

SocialPostSchema.index({ ownerId: 1, updatedAt: -1 });
SocialPostSchema.index({ reviewerId: 1, status: 1, updatedAt: -1 });

const SocialPost: Model<ISocialPost> = models.SocialPost || mongoose.model("SocialPost", SocialPostSchema);
export default SocialPost;
