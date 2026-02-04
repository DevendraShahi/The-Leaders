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

    // Maintenance
    maintenance: {
        global: { isActive: boolean; reason?: string; };
        groups: {
            public: {
                isActive: boolean;
                reason?: string;
                pages: {
                    home: { isActive: boolean; reason?: string; };
                    about: { isActive: boolean; reason?: string; };
                    contact: { isActive: boolean; reason?: string; };
                    articles: { isActive: boolean; reason?: string; };
                    leaders: { isActive: boolean; reason?: string; };
                    history: { isActive: boolean; reason?: string; };
                    accessibility: { isActive: boolean; reason?: string; };
                    privacy: { isActive: boolean; reason?: string; };
                    terms: { isActive: boolean; reason?: string; };
                };
            };
            election: {
                isActive: boolean;
                reason?: string;
                pages: {
                    dashboard: { isActive: boolean; reason?: string; };
                    parties: { isActive: boolean; reason?: string; };
                    candidates: { isActive: boolean; reason?: string; };
                    dailyBrief: { isActive: boolean; reason?: string; };
                    factChecks: { isActive: boolean; reason?: string; };
                    map: { isActive: boolean; reason?: string; };
                    profiles: { isActive: boolean; reason?: string; };
                };
            };
        };
    };

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
                _id: false
            },
        ],
        metaKeywords: [{ type: String }],


        // Advanced Maintenance System
        maintenance: {
            global: {
                isActive: { type: Boolean, default: false },
                reason: { type: String, default: '' }
            },
            groups: {
                public: {
                    isActive: { type: Boolean, default: false },
                    reason: { type: String, default: '' },
                    pages: {
                        home: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        about: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        contact: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        articles: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        leaders: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        history: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        accessibility: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        privacy: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        terms: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } }
                    }
                },
                election: {
                    isActive: { type: Boolean, default: false },
                    reason: { type: String, default: '' },
                    pages: {
                        dashboard: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        parties: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        candidates: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        dailyBrief: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        factChecks: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        map: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } },
                        profiles: { isActive: { type: Boolean, default: false }, reason: { type: String, default: '' } }
                    }
                }
            }
        },

        features: {
            enableComments: { type: Boolean, default: false },
            enableRegistration: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

// HMR handling: Delete model if exists in Development
// if (process.env.NODE_ENV === 'development') {
//     if (models.Settings) {
//         delete models.Settings;
//     }
// }

// We should only have one settings document
const Settings: Model<ISettings> = models.Settings || mongoose.model("Settings", SettingsSchema);

export default Settings;
