'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualRichText from '@/components/admin/BilingualRichText';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, Calendar } from 'lucide-react';

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

export default function HistoryForm({ initialData, id }: { initialData?: any, id: string }) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: { en: '', ne: '' },
        content: { en: '', ne: '' },
        date: '',
        image: '',
        status: 'draft',
        isFeatured: false,
        order: 0,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || { en: '', ne: '' },
                content: initialData.content || { en: '', ne: '' },
                date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
                image: initialData.image || '',
                status: initialData.status || 'draft',
                isFeatured: initialData.isFeatured || false,
                order: initialData.order || 0,
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

    const handleSubmit = async () => {
        if ((!formData.title.en && !formData.title.ne) || !formData.date) {
            toast.error('At least one title (EN or NE) and Date are required');
            return;
        }

        setLoading(true);
        try {
            const url = id === 'new' ? '/api/admin/history' : `/api/admin/history/${id}`;
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
                toast.success(`Event ${id === 'new' ? 'created' : 'updated'} successfully`);
                router.push('/admin/content?type=history');
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
                        Save Event
                    </ButtonCustom>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="space-y-4">
                        <BilingualInput
                            label="Event Title"
                            valueEn={formData.title.en}
                            valueNe={formData.title.ne}
                            onChangeEn={(v) => handleChange('title', v, 'en')}
                            onChangeNe={(v) => handleChange('title', v, 'ne')}
                            placeholderEn="e.g. Establishment of Democracy"
                            placeholderNe="e.g. प्रजातन्त्रको स्थापना"
                            required
                        />

                        <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

                        <BilingualRichText
                            label="Description / Details"
                            valueEn={formData.content.en}
                            valueNe={formData.content.ne}
                            onChangeEn={(v) => handleChange('content', v, 'en')}
                            onChangeNe={(v) => handleChange('content', v, 'ne')}
                            placeholderEn="Describe the historical event..."
                        />
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Event Details</h3>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Date of Event
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Required for timeline</p>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
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
                                Highlight Event
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Timeline Order
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">Image</h3>
                        <ImageUploader
                            label="Event Image"
                            category="history"
                            value={formData.image}
                            onChange={(url) => handleChange('image', url)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
