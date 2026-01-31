import mongoose, { Schema, Model, models } from "mongoose";

export interface IHistory {
    _id?: string;
    title: {
        en: string;
        ne: string;
    };
    content: {
        en: string;
        ne: string;
    };
    date: Date;
    image?: string;

    // Status
    status: 'draft' | 'published' | 'archived';
    isFeatured: boolean;
    order?: number;

    lastModifiedBy?: mongoose.Types.ObjectId;
}

const HistorySchema = new Schema<IHistory>(
    {
        title: {
            en: { type: String, required: true },
            ne: { type: String, required: true },
        },
        content: {
            en: { type: String, required: true },
            ne: { type: String, required: true },
        },
        date: { type: Date, required: true },
        image: { type: String },

        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'published'
        },
        isFeatured: { type: Boolean, default: false },
        order: { type: Number, default: 0 },

        lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

HistorySchema.index({ date: 1 });
HistorySchema.index({ status: 1 });

const History: Model<IHistory> = models.History || mongoose.model("History", HistorySchema);

export default History;
