import mongoose, { Schema, Model, models } from "mongoose";

export interface IAdmin {
    _id?: string;
    username: string;
    email: string;
    passwordHash: string;
    role: 'superadmin' | 'editor';
    lastLogin?: Date;
    isActive: boolean;
    name?: string;
    avatar?: string;
}

const AdminSchema = new Schema<IAdmin>(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['superadmin', 'editor'], default: 'superadmin' },
        lastLogin: { type: Date },
        isActive: { type: Boolean, default: true },
        name: { type: String },
        avatar: { type: String },
    },
    { timestamps: true }
);

const Admin: Model<IAdmin> = models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;
