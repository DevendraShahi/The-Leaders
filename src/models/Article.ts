import mongoose, { Schema, Model, models } from "mongoose";

export interface IArticle {
    _id?: string;
    title: {
        en: string;
        ne: string;
    };
    content: {
        en: string;
        ne: string;
    };
    excerpt: {
        en: string;
        ne: string;
    };
    author: {
        en: string;
        ne: string;
    };
    category: {
        en: string;
        ne: string;
    };
    slug: string;
    image: string;
    tags?: string[];

    // Status & Visibility
    status: 'draft' | 'published' | 'archived';
    isFeatured: boolean;
    publishedDate: Date;
    scheduledPublishDate?: Date;

    // Day to Remember Feature
    eventDate?: Date;
    isSpecialDay: boolean;

    // Metrics & Tracking
    views: number;
    lastModifiedBy?: mongoose.Types.ObjectId;

    // SEO
    seoTitle?: { en: string; ne: string };
    seoDescription?: { en: string; ne: string };
}

const ArticleSchema = new Schema<IArticle>(
    {
        title: {
            en: { type: String, required: true },
            ne: { type: String, required: true },
        },
        content: {
            en: { type: String, required: true },
            ne: { type: String, required: true },
        },
        excerpt: {
            en: { type: String, required: true },
            ne: { type: String, required: true },
        },
        author: {
            en: { type: String, required: true },
            ne: { type: String, required: true },
        },
        category: {
            en: { type: String, required: true },
            ne: { type: String, required: true },
        },
        slug: { type: String, required: true, unique: true },
        image: { type: String, required: false, default: '' },
        tags: [{ type: String }],

        // Status & Visibility
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft'
        },
        isFeatured: { type: Boolean, default: false },
        publishedDate: { type: Date, default: Date.now },
        scheduledPublishDate: { type: Date },

        // Day to Remember Feature
        eventDate: { type: Date },
        isSpecialDay: { type: Boolean, default: false },

        // Metrics & Tracking
        views: { type: Number, default: 0 },
        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },

        // SEO
        seoTitle: {
            en: { type: String },
            ne: { type: String },
        },
        seoDescription: {
            en: { type: String },
            ne: { type: String },
        },
    },
    { timestamps: true }
);

// Indexes

ArticleSchema.index({ status: 1 });
ArticleSchema.index({ publishedDate: -1 });
ArticleSchema.index({ 'title.en': 'text', 'title.ne': 'text' }); // Text search

const Article: Model<IArticle> = models.Article || mongoose.model("Article", ArticleSchema);

export default Article;
