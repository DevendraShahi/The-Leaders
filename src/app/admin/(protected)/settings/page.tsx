'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import BilingualInput from '@/components/admin/BilingualInput';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'sonner';
import { Save, Loader2, Globe, Mail, Facebook, Twitter, Instagram, Linkedin, MessageSquare, ShieldAlert, ArrowRight, UserCog } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const { token, user } = useAuth();
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
            facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', tiktok: ''
        },
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
                    headers: { 'Authorization': `Bearer ${token}` },
                    cache: 'no-store'
                });
                const data = await res.json();

                if (res.ok && data.data.settings) {
                    const s = data.data.settings;

                    // Transform Array -> Object for UI
                    const socialLinksObj = {
                        facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '', tiktok: ''
                    };
                    if (Array.isArray(s.socialLinks)) {
                        s.socialLinks.forEach((link: any) => {
                            if (link.platform && link.url) {
                                (socialLinksObj as any)[link.platform.toLowerCase()] = link.url;
                            }
                        });
                    }

                    setFormData({
                        siteName: s.siteName || { en: '', ne: '' },
                        siteDescription: s.siteDescription || { en: '', ne: '' },
                        contactEmail: s.contactEmail || '',
                        phoneNumber: s.phoneNumber || '',
                        address: s.address || { en: '', ne: '' },
                        logoUrl: s.logoUrl || '',
                        faviconUrl: s.faviconUrl || '',
                        socialLinks: socialLinksObj,
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
            // First fetch current settings to preserve maintenance config which is not in this form
            const currentRes = await fetch('/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            const currentData = await currentRes.json();
            const currentSettings = currentData.data?.settings || {};

            // Extract maintenance from updated server state (or default if missing)
            const maintenance = currentSettings.maintenance;

            // Sanitize: Remove system fields from existing settings before merging
            const { _id, createdAt, updatedAt, __v, ...serverFields } = currentSettings;

            // Transform Object -> Array for DB
            const socialLinksArray = Object.entries(formData.socialLinks)
                .filter(([_, url]) => url && url.trim() !== '') // Only send filled links
                .map(([platform, url]) => ({
                    platform: platform.toLowerCase(),
                    url: url.trim(),
                    icon: platform // Simplified for now
                }));

            const payload = {
                ...serverFields, // Keep existing fields we might not be tracking (if any)
                ...formData,     // Overwrite with form data
                socialLinks: socialLinksArray, // Override strict array format
                maintenance      // Explicitly preserve maintenance
            };

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
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

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20 font-manrope">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <h1 className="text-3xl font-bebas tracking-wide text-foreground uppercase">System Settings</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Configure platform</p>
                </div>
                <button
                    disabled={saving}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50 uppercase text-xs font-bold tracking-wider rounded-none shadow-sm"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">

                {/* MAINTENANCE CARD LINK */}
                <Link href="/admin/settings/maintenance" className="group bg-card border border-border hover:border-destructive/50 transition-colors p-6 flex items-center justify-between shadow-sm cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-muted rounded-full group-hover:bg-destructive/10 group-hover:text-destructive transition-colors">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bebas tracking-wide uppercase text-foreground group-hover:text-destructive transition-colors">Maintenance Mode</h2>
                            <p className="text-sm text-muted-foreground">Manage global locks, group access, and emergency downtime screens.</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>

                {user?.role === 'superadmin' && (
                    <Link href="/admin/settings/access-matrix" className="group bg-card border border-border hover:border-primary/50 transition-colors p-6 flex items-center justify-between shadow-sm cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <UserCog className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bebas tracking-wide uppercase text-foreground group-hover:text-primary transition-colors">Access Matrix</h2>
                                <p className="text-sm text-muted-foreground">Set page-level access for each admin account.</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}

                {/* General Settings */}
                <div className="bg-card p-6 border border-border rounded-none space-y-6 shadow-sm">
                    <h2 className="text-xl font-bebas tracking-wide flex items-center gap-2 text-foreground border-b border-border pb-3 uppercase">
                        <Globe className="h-5 w-5 text-primary" /> General Information
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
                        placeholderEn="Meta description..."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUploader label="Site Logo" category="general" value={formData.logoUrl} onChange={(url) => handleChange('logoUrl', url)} />
                        <ImageUploader label="Favicon" category="general" value={formData.faviconUrl} onChange={(url) => handleChange('faviconUrl', url)} />
                    </div>
                </div>

                {/* Contact & Social */}
                <div className="bg-card p-6 border border-border rounded-none space-y-6 shadow-sm">
                    <h2 className="text-xl font-bebas tracking-wide flex items-center gap-2 text-foreground border-b border-border pb-3 uppercase">
                        <Mail className="h-5 w-5 text-primary" /> Contact & Social
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact Email</label>
                            <input type="email" value={formData.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} className="w-full rounded-none border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Phone Number</label>
                            <input type="text" value={formData.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} className="w-full rounded-none border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary" />
                        </div>
                    </div>
                    <BilingualInput label="Address" valueEn={formData.address.en} valueNe={formData.address.ne} onChangeEn={(v) => handleChange('address', v, 'en')} onChangeNe={(v) => handleChange('address', v, 'ne')} placeholderEn="Kathmandu, Nepal" />

                    <div className="space-y-4 pt-4 border-t border-border">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Social Media Links</label>
                        {[
                            { key: 'facebook', icon: Facebook, color: 'text-blue-600' },
                            { key: 'twitter', icon: Twitter, color: 'text-sky-500' },
                            { key: 'instagram', icon: Instagram, color: 'text-pink-600' },
                            { key: 'linkedin', icon: Linkedin, color: 'text-blue-700' },
                            { key: 'youtube', icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>, color: 'text-red-600' },
                            { key: 'tiktok', icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v4a9 9 0 0 1-9-9" /></svg>, color: 'text-black dark:text-white' }
                        ].map(({ key, icon: Icon, color }) => (
                            <div key={key} className="flex items-center gap-3">
                                <div className={`w-8 h-8 flex items-center justify-center bg-muted/30 rounded-full`}>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </div>
                                <input
                                    type="url"
                                    placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                                    value={formData.socialLinks[key as keyof typeof formData.socialLinks]}
                                    onChange={(e) => handleSocialChange(key, e.target.value)}
                                    className="flex-1 rounded-none border border-input bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features & Switches */}
                <div className="bg-card p-6 border border-border rounded-none space-y-6 shadow-sm">
                    <h2 className="text-xl font-bebas tracking-wide flex items-center gap-2 text-foreground border-b border-border pb-3 uppercase">
                        <MessageSquare className="h-5 w-5 text-primary" /> Features
                    </h2>

                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-none">
                        <div>
                            <p className="font-bold text-foreground uppercase tracking-wide text-sm">Enable Comments</p>
                            <p className="text-xs text-muted-foreground">Allow users to comment on articles</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.features.enableComments}
                                onChange={(e) => handleFeatureChange('enableComments', e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-muted-foreground/20 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
