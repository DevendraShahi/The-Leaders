import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriber extends Document {
    email: string;
    isActive: boolean;
    subscribedAt: Date;
    isVerified: boolean;
    verifiedAt?: Date;
    verificationCodeHash?: string;
    verificationExpiresAt?: Date;
    verificationSentAt?: Date;
    verificationAttempts: number;
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
        isVerified: {
            type: Boolean,
            default: true,
        },
        verifiedAt: {
            type: Date,
        },
        verificationCodeHash: {
            type: String,
            select: false,
        },
        verificationExpiresAt: {
            type: Date,
        },
        verificationSentAt: {
            type: Date,
        },
        verificationAttempts: {
            type: Number,
            default: 0,
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

SubscriberSchema.index({ email: 1, isVerified: 1 });
SubscriberSchema.index({ verificationExpiresAt: 1 });

// Prevent model overwrite in development
const Subscriber: Model<ISubscriber> = mongoose.models.Subscriber || mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);

export default Subscriber;
