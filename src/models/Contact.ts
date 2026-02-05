import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    subject: string;
    message: string;
    feeling?: string;
    attachmentUrl?: string;
    status: "new" | "read" | "replied";
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        location: { type: String },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        feeling: { type: String },
        attachmentUrl: { type: String },
        status: { type: String, enum: ["new", "read", "replied"], default: "new" },
    },
    { timestamps: true }
);

const Contact: Model<IContact> =
    mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
