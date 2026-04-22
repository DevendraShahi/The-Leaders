import mongoose, { Schema, Model, models } from "mongoose";

export interface IActivityLog {
    adminId: mongoose.Types.ObjectId;
    action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'publish' | 'unpublish' | 'bulk_action';
    entityType:
        | 'Article'
        | 'Leader'
        | 'History'
        | 'Media'
        | 'Settings'
        | 'Admin'
        | 'Auth'
        | 'ElectionContent'
        | 'DailyBrief'
        | 'FactCheck'
        | 'ElectionArticle'
        | 'ColumnArticle';
    entityId?: string;
    description: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
        action: {
            type: String,
            enum: ['create', 'update', 'delete', 'login', 'logout', 'publish', 'unpublish', 'bulk_action'],
            required: true
        },
        entityType: {
            type: String,
            enum: [
                'Article',
                'Leader',
                'History',
                'Media',
                'Settings',
                'Admin',
                'Auth',
                'ElectionContent',
                'DailyBrief',
                'FactCheck',
                'ElectionArticle',
                'ColumnArticle'
            ],
            required: true
        },
        entityId: { type: String },
        description: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed }, // Flexible field for extra data
        ipAddress: { type: String },
        userAgent: { type: String },
    },
    {
        timestamps: true, // This gives us createdAt (when the activity happened)
        capped: { size: 1048576, max: 1000 } // Cap the collection to 1MB or 1000 entries to prevent infinite growth
    }
);

ActivityLogSchema.index({ adminId: 1 });
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1 });

const modelName = "ActivityLog";
if (models[modelName] && process.env.NODE_ENV !== "production") {
    delete models[modelName];
}

const ActivityLog: Model<IActivityLog> =
    (models[modelName] as Model<IActivityLog>) || mongoose.model(modelName, ActivityLogSchema);

export default ActivityLog;
