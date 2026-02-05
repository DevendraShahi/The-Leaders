import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriber extends Document {
    email: string;
    isActive: boolean;
    subscribedAt: Date;
}

const SubscriberSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Prevent model overwrite in development
const Subscriber: Model<ISubscriber> = mongoose.models.Subscriber || mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);

export default Subscriber;
