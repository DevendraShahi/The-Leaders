'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualRichText from '@/components/admin/BilingualRichText';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, Calendar, Link as LinkIcon, Facebook, Twitter, Flag } from 'lucide-react';

function ButtonCustom({ children, disabled, onClick, className, variant = 'primary' }: any) {
    const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const styles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    };
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}
        >
            {children}
        </button>
    );
}

export default function LeaderForm({ initialData, id }: { initialData?: any, id: string }) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: { en: '', ne: '' },
        bio: { en: '', ne: '' },
        party: { en: '', ne: '' },
        position: { en: '', ne: '' },
        image: '',
        status: 'draft',
        isFeatured: false,
        isActive: true, // Living/Active
        birthDate: '',
        deathDate: '',
        order: 0,
        socialLinks: {
            facebook: '',
            twitter: '',
            wikipedia: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || { en: '', ne: '' },
                bio: initialData.bio || { en: '', ne: '' },
                party: initialData.party || { en: '', ne: '' },
                position: initialData.position || { en: '', ne: '' },
                image: initialData.image || '',
                status: initialData.status || 'draft',
                isFeatured: initialData.isFeatured || false,
                isActive: initialData.isActive ?? true,
                birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
                deathDate: initialData.deathDate ? new Date(initialData.deathDate).toISOString().split('T')[0] : '',
                order: initialData.order || 0,
                socialLinks: initialData.socialLinks || { facebook: '', twitter: '', wikipedia: '' },
            });
        }
    }, [initialData]);

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

    const handleSubmit = async () => {
        if (!formData.name.en && !formData.name.ne) {
            toast.error('At least one name (EN or NE) is required');
            return;
        }

        setLoading(true);
        try {
            const url = id === 'new' ? '/api/admin/leaders' : `/api/admin/leaders/${id}`;
            const method = id === 'new' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const responseData = await res.json();

            if (res.ok) {
                toast.success(`Leader ${id === 'new' ? 'created' : 'updated'} successfully`);
                router.push('/admin/content?type=leaders');
            } else {
                toast.error(responseData.error || 'Operation failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <ButtonCustom variant="secondary" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back
                </ButtonCustom>
                <div className="flex gap-3">
                    <ButtonCustom
                        disabled={loading}
                        onClick={() => handleChange('status', 'draft')}
                        variant="secondary"
                    >
                        Save as Draft
                    </ButtonCustom>
                    <ButtonCustom
                        disabled={loading}
                        onClick={handleSubmit}
                        className="gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Leader
                    </ButtonCustom>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="space-y-4">
                        <BilingualInput
                            label="Full Name"
                            valueEn={formData.name.en}
                            valueNe={formData.name.ne}
                            onChangeEn={(v) => handleChange('name', v, 'en')}
                            onChangeNe={(v) => handleChange('name', v, 'ne')}
                            placeholderEn="e.g. B.P. Koirala"
                            placeholderNe="e.g. विश्वेश्वर प्रसाद कोइराला"
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <BilingualInput
                                label="Party"
                                valueEn={formData.party.en}
                                valueNe={formData.party.ne}
                                onChangeEn={(v) => handleChange('party', v, 'en')}
                                onChangeNe={(v) => handleChange('party', v, 'ne')}
                                placeholderEn="Nepali Congress"
                            />
                            <BilingualInput
                                label="Position / Title"
                                valueEn={formData.position.en}
                                valueNe={formData.position.ne}
                                onChangeEn={(v) => handleChange('position', v, 'en')}
                                onChangeNe={(v) => handleChange('position', v, 'ne')}
                                placeholderEn="Former Prime Minister"
                            />
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

                        <BilingualRichText
                            label="Biography"
                            valueEn={formData.bio.en}
                            valueNe={formData.bio.ne}
                            onChangeEn={(v) => handleChange('bio', v, 'en')}
                            onChangeNe={(v) => handleChange('bio', v, 'ne')}
                            placeholderEn="Write biography..."
                        />
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Status & Visibility</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={formData.isFeatured}
                                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Feature as Key Leader
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Currently Active/Living
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Display Order
                            </label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => handleChange('order', parseInt(e.target.value))}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Profile Image</h3>
                        <ImageUploader
                            label="Portrait"
                            category="leader"
                            value={formData.image}
                            onChange={(url) => handleChange('image', url)}
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Dates</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Birth Date
                            </label>
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => handleChange('birthDate', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Death Date
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Leave empty if living</p>
                            <input
                                type="date"
                                value={formData.deathDate}
                                onChange={(e) => handleChange('deathDate', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Social Links</h3>

                        <div className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-blue-600" />
                            <input
                                type="url"
                                placeholder="Facebook URL"
                                value={formData.socialLinks.facebook}
                                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Twitter className="h-4 w-4 text-sky-500" />
                            <input
                                type="url"
                                placeholder="Twitter/X URL"
                                value={formData.socialLinks.twitter}
                                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-gray-500" />
                            <input
                                type="url"
                                placeholder="Wikipedia URL"
                                value={formData.socialLinks.wikipedia}
                                onChange={(e) => handleSocialChange('wikipedia', e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
