import mongoose, { Schema, Model } from "mongoose";

export interface ILeader {
    _id?: string;
    slug: string; // URL friendly ID
    name: {
        en: string;
        ne: string;
    };
    // Description / Short bio for cards
    desc: {
        en: string;
        ne: string;
    };
    bio: {
        en: string;
        ne: string;
    };
    party: {
        en: string;
        ne: string;
    };
    position: {
        en: string;
        ne: string; // Role like 'The Voice', 'The Democratic Spirit'
    };
    // Era / Years active or lifespan e.g. "1914 - 1982"
    years: {
        en: string;
        ne: string;
    };
    image: string; // Portrait
    cover: string; // Cover/Background image

    // Key Stats (flexible key-value pairs)
    stats: Record<string, {
        en: string;
        ne: string;
    }>;

    // Timeline events
    timeline: {
        year: string;
        event: {
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
        name: {
            en: { type: String, default: '', required: false },
            ne: { type: String, default: '', required: false }
        },
        desc: {
            en: { type: String, default: '', required: false },
            ne: { type: String, default: '', required: false }
        },
        bio: {
            en: { type: String, default: '', required: false },
            ne: { type: String, default: '', required: false }
        },
        party: {
            en: { type: String, default: '', required: false },
            ne: { type: String, default: '', required: false }
        },
        position: {
            en: { type: String, default: '', required: false },
            ne: { type: String, default: '', required: false }
        },
        years: {
            en: { type: String, default: '', required: false },
            ne: { type: String, default: '', required: false }
        },

        image: { type: String, required: false, default: '' },
        cover: { type: String, required: false, default: '' },

        // New Dynamic Stats Structure (Mixed to support legacy Object data during migration)
        stats: { type: Schema.Types.Mixed, default: [] },

        timeline: [{
            year: { type: String, required: true },
            event: {
                en: { type: String, default: '' },
                ne: { type: String, default: '' }
            }
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

// Prevent Mongoose overwrite warning in development
if (mongoose.models.Leader) {
    delete mongoose.models.Leader;
}

const Leader: Model<ILeader> = mongoose.model("Leader", LeaderSchema);

export default Leader;
