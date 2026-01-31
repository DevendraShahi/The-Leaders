'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import BilingualInput from '@/components/admin/BilingualInput';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'sonner';
import { Save, Loader2, Globe, Mail, Facebook, Twitter, Instagram, Linkedin, MessageSquare } from 'lucide-react';

export default function SettingsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        siteName: { en: '', ne: '' },
        siteDescription: { en: '', ne: '' },
        contactEmail: '',
        phoneNumber: '',
        address: { en: '', ne: '' },
        logoUrl: '',
        faviconUrl: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: ''
        },
        maintenanceMode: false,
        features: {
            enableComments: false,
            enableRegistration: false
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/admin/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok && data.data.settings) {
                    const s = data.data.settings;
                    // Merge with defaults to prevent null errors
                    setFormData({
                        siteName: s.siteName || { en: '', ne: '' },
                        siteDescription: s.siteDescription || { en: '', ne: '' },
                        contactEmail: s.contactEmail || '',
                        phoneNumber: s.phoneNumber || '',
                        address: s.address || { en: '', ne: '' },
                        logoUrl: s.logoUrl || '',
                        faviconUrl: s.faviconUrl || '',
                        socialLinks: {
                            facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '',
                            ...s.socialLinks
                        },
                        maintenanceMode: s.maintenanceMode || false,
                        features: {
                            enableComments: false, enableRegistration: false,
                            ...s.features
                        }
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [token]);

    const handleChange = (field: string, value: any, lang?: 'en' | 'ne') => {
        setFormData(prev => {
            if (lang) {
                return {
                    ...prev,
                    [field]: { ...prev[field as keyof typeof prev] as any, [lang]: value }
                };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleSocialChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [platform]: value }
        }));
    };

    const handleFeatureChange = (feature: string, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            features: { ...prev.features, [feature]: value }
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Settings updated successfully');
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Settings</h1>
                    <p className="text-sm text-gray-500">Manage global configuration and metadata</p>
                </div>

                <button
                    disabled={saving}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* General Settings */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                        <Globe className="h-5 w-5 text-blue-500" /> General Information
                    </h2>

                    <BilingualInput
                        label="Site Name"
                        valueEn={formData.siteName.en}
                        valueNe={formData.siteName.ne}
                        onChangeEn={(v) => handleChange('siteName', v, 'en')}
                        onChangeNe={(v) => handleChange('siteName', v, 'ne')}
                        placeholderEn="The Leaders"
                    />

                    <BilingualInput
                        label="Site Description (SEO)"
                        type="textarea"
                        valueEn={formData.siteDescription.en}
                        valueNe={formData.siteDescription.ne}
                        onChangeEn={(v) => handleChange('siteDescription', v, 'en')}
                        onChangeNe={(v) => handleChange('siteDescription', v, 'ne')}
                        placeholderEn="Meta description for search engines..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUploader
                            label="Site Logo"
                            category="general"
                            value={formData.logoUrl}
                            onChange={(url) => handleChange('logoUrl', url)}
                        />
                        <ImageUploader
                            label="Favicon"
                            category="general"
                            value={formData.faviconUrl}
                            onChange={(url) => handleChange('faviconUrl', url)}
                        />
                    </div>
                </div>

                {/* Contact & Social */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                        <Mail className="h-5 w-5 text-emerald-500" /> Contact & Social
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <BilingualInput
                        label="Address"
                        valueEn={formData.address.en}
                        valueNe={formData.address.ne}
                        onChangeEn={(v) => handleChange('address', v, 'en')}
                        onChangeNe={(v) => handleChange('address', v, 'ne')}
                        placeholderEn="Kathmandu, Nepal"
                    />

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Social Media Links</label>

                        <div className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-blue-600 w-8" />
                            <input
                                type="url"
                                placeholder="Facebook URL"
                                value={formData.socialLinks.facebook}
                                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-sky-500 w-8" />
                            <input
                                type="url"
                                placeholder="Twitter/X URL"
                                value={formData.socialLinks.twitter}
                                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Instagram className="h-4 w-4 text-pink-600 w-8" />
                            <input
                                type="url"
                                placeholder="Instagram URL"
                                value={formData.socialLinks.instagram}
                                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4 text-blue-700 w-8" />
                            <input
                                type="url"
                                placeholder="LinkedIn URL"
                                value={formData.socialLinks.linkedin}
                                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Features & Switches */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                        <MessageSquare className="h-5 w-5 text-purple-500" /> Features & Mode
                    </h2>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Comments</p>
                            <p className="text-xs text-gray-500">Allow users to comment on articles</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.features.enableComments}
                                onChange={(e) => handleFeatureChange('enableComments', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                            <p className="text-xs text-gray-500">Show maintenance page to all users except admin</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.maintenanceMode}
                                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
