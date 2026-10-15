import mongoose, { Model, Schema, models } from "mongoose";

export type AdminAccessRequestStatus = "pending" | "approved" | "rejected";

export interface IAdminAccessRequest {
    _id?: string;
    clerkId: string;
    email: string;
    name?: string;
    username?: string;
    status: AdminAccessRequestStatus;
    reviewedBy?: string;
    reviewedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const AdminAccessRequestSchema = new Schema<IAdminAccessRequest>(
    {
        clerkId: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true, trim: true, lowercase: true, index: true },
        name: { type: String, trim: true },
        username: { type: String, trim: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
        reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
        reviewedAt: { type: Date },
    },
    { timestamps: true },
);

AdminAccessRequestSchema.index({ status: 1, createdAt: -1 });

const AdminAccessRequest: Model<IAdminAccessRequest> =
    models.AdminAccessRequest || mongoose.model("AdminAccessRequest", AdminAccessRequestSchema);

export default AdminAccessRequest;
