import mongoose, { Schema, Model, models } from "mongoose";

export interface ISettings {
    siteName: {
        en: string;
        ne: string;
    };
    siteDescription: {
        en: string;
        ne: string;
    };
    logoUrl?: string;
    faviconUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    phoneNumber?: string;
    address?: {
        en?: string;
        ne?: string;
    };
    socialLinks?: {
        platform: string;
        url: string;
        icon?: string;
    }[];
    metaKeywords?: string[];
    maintenanceMode: boolean;
    features: {
        enableComments: boolean;
        enableRegistration: boolean;
    };
}

const SettingsSchema = new Schema<ISettings>(
    {
        siteName: {
            en: { type: String, default: 'The Leaders' },
            ne: { type: String, default: 'द लीडर्स' },
        },
        siteDescription: {
            en: { type: String },
            ne: { type: String },
        },
        logoUrl: { type: String },
        faviconUrl: { type: String },
        contactEmail: { type: String },
        contactPhone: { type: String },
        phoneNumber: { type: String },
        address: {
            en: { type: String },
            ne: { type: String },
        },
        socialLinks: [
            {
                platform: { type: String },
                url: { type: String },
                icon: { type: String },
            },
        ],
        metaKeywords: [{ type: String }],
        maintenanceMode: { type: Boolean, default: false },
        features: {
            enableComments: { type: Boolean, default: false },
            enableRegistration: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

// We should only have one settings document
const Settings: Model<ISettings> = models.Settings || mongoose.model("Settings", SettingsSchema);

export default Settings;
