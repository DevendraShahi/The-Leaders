import mongoose, { Schema, Model, models } from "mongoose";

export interface IViewEvent {
    visitorId: string;
    path: string;
    pageType: string;
    contentType?: string;
    contentSlug?: string;
    dateKey: string;
    trackingKey: string;
    hits: number;
    country?: string;
    region?: string;
    city?: string;
    firstSeenAt: Date;
    lastSeenAt: Date;
}

const ViewEventSchema = new Schema<IViewEvent>(
    {
        visitorId: { type: String, required: true, index: true },
        path: { type: String, required: true, index: true },
        pageType: { type: String, required: true, index: true },
        contentType: { type: String, index: true },
        contentSlug: { type: String, index: true },
        dateKey: { type: String, required: true, index: true },
        trackingKey: { type: String, required: true, unique: true, index: true },
        hits: { type: Number, default: 1 },
        country: { type: String, index: true },
        region: { type: String, index: true },
        city: { type: String, index: true },
        firstSeenAt: { type: Date, default: Date.now },
        lastSeenAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

ViewEventSchema.index({ dateKey: 1, pageType: 1 });
ViewEventSchema.index({ dateKey: 1, contentType: 1 });
ViewEventSchema.index({ contentType: 1, contentSlug: 1 });

const ViewEvent: Model<IViewEvent> = models.ViewEvent || mongoose.model("ViewEvent", ViewEventSchema);

export default ViewEvent;
