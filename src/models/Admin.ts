import mongoose, { Schema, Model, models } from "mongoose";

export interface IPermissions {
    articles: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        publish: boolean;
    };
    settings: {
        view: boolean;
        modify: boolean;
    };
    users: {
        view: boolean;
        manage: boolean;
    };
    analytics: {
        view: boolean;
        viewAll: boolean;
    };
}

export interface IAdmin {
    _id?: string;
    username: string;
    email: string;
    passwordHash: string;
    role: 'superadmin' | 'cto' | 'editorial' | 'cmo';
    permissions: IPermissions;
    lastLogin?: Date;
    isActive: boolean;
    name?: string;
    avatar?: string;
    createdBy?: string; // ObjectId of admin who created this user
    createdAt?: Date;
    updatedAt?: Date;
}

const PermissionsSchema = new Schema<IPermissions>({
    articles: {
        create: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        publish: { type: Boolean, default: false },
    },
    settings: {
        view: { type: Boolean, default: false },
        modify: { type: Boolean, default: false },
    },
    users: {
        view: { type: Boolean, default: false },
        manage: { type: Boolean, default: false },
    },
    analytics: {
        view: { type: Boolean, default: false },
        viewAll: { type: Boolean, default: false },
    },
}, { _id: false });

const AdminSchema = new Schema<IAdmin>(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            enum: ['superadmin', 'cto', 'editorial', 'cmo'],
            required: true,
            default: 'editorial'
        },
        permissions: {
            type: PermissionsSchema,
            required: true
        },
        lastLogin: { type: Date },
        isActive: { type: Boolean, default: true },
        name: { type: String },
        avatar: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

// Indexes for performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ createdBy: 1 });

const Admin: Model<IAdmin> = models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;
