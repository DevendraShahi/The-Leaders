import mongoose, { Schema, Model, models } from "mongoose";

export interface IAuditLog {
    _id?: string;
    adminId: string; // Reference to Admin
    adminEmail: string;
    adminRole: 'superadmin' | 'cto' | 'editorial' | 'cmo';
    action: string; // e.g., 'CREATE_ARTICLE', 'UPDATE_SETTINGS', 'DELETE_ADMIN'
    resource: string; // e.g., 'article', 'settings', 'admin'
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        adminId: { type: String, required: true, index: true },
        adminEmail: { type: String, required: true },
        adminRole: {
            type: String,
            enum: ['superadmin', 'cto', 'editorial', 'cmo'],
            required: true
        },
        action: { type: String, required: true, index: true },
        resource: { type: String, required: true, index: true },
        resourceId: { type: String },
        details: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
        userAgent: { type: String },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false }
);

// Compound indexes for efficient querying
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, action: 1 });
AuditLogSchema.index({ timestamp: -1 });

const AuditLog: Model<IAuditLog> = models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;
