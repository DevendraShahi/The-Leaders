import mongoose, { Schema, Model, models } from "mongoose";

export interface ILeader {
    _id?: string;
    slug: string; // URL friendly ID
    name: string | {
        en: string;
        ne: string;
    };
    // Description / Short bio for cards
    desc: string | {
        en: string;
        ne: string;
    };
    bio: string | {
        en: string;
        ne: string;
    };
    party: string | {
        en: string;
        ne: string;
    };
    position: string | {
        en: string;
        ne: string; // Role like 'The Voice', 'The Democratic Spirit'
    };
    // Era / Years active or lifespan e.g. "1914 - 1982"
    years: string | {
        en: string;
        ne: string;
    };
    image: string; // Portrait
    cover: string; // Cover/Background image

    // Key Stats (flexible key-value pairs)
    stats: Record<string, string> | {
        en: Record<string, string>;
        ne: Record<string, string>;
    };

    // Timeline events
    timeline: {
        year: string;
        event: string | {
            en: string;
            ne: string;
        };
    }[];

    socialLinks?: {
        platform: string;
        url: string;
    }[];
    order?: number;

    // Status & Visibility
    status: 'draft' | 'published' | 'archived' | string;
    isFeatured: boolean;
    isActive: boolean; // For current leaders vs past

    // Special Dates for "Day to Remember"
    birthDate?: Date;
    deathDate?: Date;

    // Metrics
    views: number;
    lastModifiedBy?: mongoose.Types.ObjectId;
}

const LeaderSchema = new Schema<ILeader>(
    {
        slug: { type: String, required: true, unique: true, index: true },
        name: { type: Schema.Types.Mixed, required: true },
        desc: { type: Schema.Types.Mixed, required: true },
        bio: { type: Schema.Types.Mixed, required: true },
        party: { type: Schema.Types.Mixed, required: true },
        position: { type: Schema.Types.Mixed, required: true },
        years: { type: Schema.Types.Mixed, required: true },

        image: { type: String, required: false, default: '' },
        cover: { type: String, required: false, default: '' },

        stats: { type: Schema.Types.Mixed },

        timeline: [{
            year: { type: String, required: true },
            event: { type: Schema.Types.Mixed, required: true }
        }],

        socialLinks: [
            {
                platform: { type: String },
                url: { type: String },
            },
        ],
        order: { type: Number, default: 0 },

        // Status & Visibility
        status: {
            type: String,
            default: 'published'
        },
        isFeatured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },

        // Special Dates
        birthDate: { type: Date },
        deathDate: { type: Date },

        // Metrics
        views: { type: Number, default: 0 },
        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

LeaderSchema.index({ order: 1 });
LeaderSchema.index({ status: 1 });

const Leader: Model<ILeader> = models.Leader || mongoose.model("Leader", LeaderSchema);

export default Leader;
