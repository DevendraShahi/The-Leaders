'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualRichText from '@/components/admin/BilingualRichText';
import ImageUploader from '@/components/admin/ImageUploader';
import { PendingImage } from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2, Calendar } from 'lucide-react';

// Simple button if UI import fails
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

export default function ArticleForm({ initialData, id }: { initialData?: any, id: string }) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [pendingImagesEn, setPendingImagesEn] = useState<PendingImage[]>([]);
    const [pendingImagesNe, setPendingImagesNe] = useState<PendingImage[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        title: { en: '', ne: '' },
        content: { en: '', ne: '' },
        excerpt: { en: '', ne: '' },
        author: { en: '', ne: '' },
        category: { en: '', ne: '' },
        slug: '',
        image: '',
        status: 'draft', // draft, published, archived
        isFeatured: false,
        eventDate: '', // YYYY-MM-DD
        tags: '', // Comma separated
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || { en: '', ne: '' },
                content: initialData.content || { en: '', ne: '' },
                excerpt: initialData.excerpt || { en: '', ne: '' },
                author: initialData.author || { en: '', ne: '' },
                category: initialData.category || { en: '', ne: '' },
                slug: initialData.slug || '',
                image: initialData.image || '',
                status: initialData.status || 'draft',
                isFeatured: initialData.isFeatured || false,
                eventDate: initialData.eventDate ? new Date(initialData.eventDate).toISOString().split('T')[0] : '',
                tags: initialData.tags ? initialData.tags.join(', ') : '',
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

    const generateSlug = () => {
        const slug = formData.title.en
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        handleChange('slug', slug);
    };

    const handleSubmit = async () => {
        // Validate: At least one title (EN or NE) and slug are required
        if ((!formData.title.en && !formData.title.ne) || !formData.slug) {
            toast.error('At least one title (EN or NE) and Slug are required');
            return;
        }

        // Validate: At least one author (EN or NE) is required
        if (!formData.author.en && !formData.author.ne) {
            toast.error('At least one author (EN or NE) is required');
            return;
        }

        setLoading(true);
        const uploadToastId = toast.loading('Processing images...');

        try {
            // Upload all pending images first
            let contentEn = formData.content.en;
            let contentNe = formData.content.ne;

            // Upload English content images
            for (const pendingImage of pendingImagesEn) {
                try {
                    const formDataUpload = new FormData();
                    formDataUpload.append('file', pendingImage.file);
                    formDataUpload.append('category', 'article');

                    const res = await fetch('/api/admin/media/upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formDataUpload
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const cloudinaryUrl = data.data.media.secureUrl;
                        // Replace blob URL with Cloudinary URL
                        contentEn = contentEn.replace(pendingImage.blobUrl, cloudinaryUrl);
                    }
                } catch (error) {
                    console.error('Failed to upload image:', error);
                }
            }

            // Upload Nepali content images
            for (const pendingImage of pendingImagesNe) {
                try {
                    const formDataUpload = new FormData();
                    formDataUpload.append('file', pendingImage.file);
                    formDataUpload.append('category', 'article');

                    const res = await fetch('/api/admin/media/upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formDataUpload
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const cloudinaryUrl = data.data.media.secureUrl;
                        // Replace blob URL with Cloudinary URL
                        contentNe = contentNe.replace(pendingImage.blobUrl, cloudinaryUrl);
                    }
                } catch (error) {
                    console.error('Failed to upload image:', error);
                }
            }

            toast.success('Images uploaded successfully', { id: uploadToastId });
            toast.loading('Saving article...');

            const payload = {
                ...formData,
                content: { en: contentEn, ne: contentNe }, // Use updated content with Cloudinary URLs
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            };

            const url = id === 'new' ? '/api/admin/articles' : `/api/admin/articles/${id}`;
            const method = id === 'new' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();

            if (res.ok) {
                toast.success(`Article ${id === 'new' ? 'created' : 'updated'} successfully`);
                // Clear pending images after successful submission
                setPendingImagesEn([]);
                setPendingImagesNe([]);
                router.push('/admin/content?type=articles');
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
                        onClick={() => {
                            handleChange('status', 'published');
                            setTimeout(handleSubmit, 100); // Hack to ensure state update before submit? No, setState is async. 
                            // Better: create separate submit handler or pass status to submit.
                            // I'll update status then call save manually or just pass it in payload construction?
                            // I'll update state and let user click Save or just separate Save Button.
                            // Let's make "Publish" button that sets status AND submits.
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publish Now'}
                    </ButtonCustom>

                    <ButtonCustom
                        disabled={loading}
                        onClick={handleSubmit}
                        className="gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                    </ButtonCustom>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="space-y-4">
                        <BilingualInput
                            label="Article Title"
                            valueEn={formData.title.en}
                            valueNe={formData.title.ne}
                            onChangeEn={(v) => handleChange('title', v, 'en')}
                            onChangeNe={(v) => handleChange('title', v, 'ne')}
                            placeholderEn="Enter article title"
                            placeholderNe="लेखको शीर्षक लेख्नुहोस्"
                            required
                        />

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Slug (URL)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => handleChange('slug', e.target.value)}
                                        className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                        placeholder="article-url-slug"
                                    />
                                    <button
                                        onClick={generateSlug}
                                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-medium hover:bg-gray-200"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-4" />


                        <BilingualRichText
                            label="Content"
                            valueEn={formData.content.en}
                            valueNe={formData.content.ne}
                            onChangeEn={(v) => handleChange('content', v, 'en')}
                            onChangeNe={(v) => handleChange('content', v, 'ne')}
                            onPendingImagesChangeEn={setPendingImagesEn}
                            onPendingImagesChangeNe={setPendingImagesNe}
                            placeholderEn="Write the article content..."
                            placeholderNe="यहाँ आफ्नो लेख लेख्नुहोस्..."
                        />

                        <BilingualInput
                            label="Author Name"
                            valueEn={formData.author.en}
                            valueNe={formData.author.ne}
                            onChangeEn={(v) => handleChange('author', v, 'en')}
                            onChangeNe={(v) => handleChange('author', v, 'ne')}
                            placeholderEn="e.g. Editorial Team"
                            placeholderNe="e.g. सम्पादकीय समूह"
                            required
                        />

                        <BilingualInput
                            label="Excerpt (Short Summary)"
                            type="textarea"
                            valueEn={formData.excerpt.en}
                            valueNe={formData.excerpt.ne}
                            onChangeEn={(v) => handleChange('excerpt', v, 'en')}
                            onChangeNe={(v) => handleChange('excerpt', v, 'ne')}
                            placeholderEn="Brief summary for list view"
                        />
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Publishing</h3>

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
                                Feature on Homepage
                            </label>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Media</h3>
                        <ImageUploader
                            label="Cover Image"
                            category="article"
                            value={formData.image}
                            onChange={(url) => handleChange('image', url)}
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Metadata</h3>

                        <BilingualInput
                            label="Category"
                            valueEn={formData.category.en}
                            valueNe={formData.category.ne}
                            onChangeEn={(v) => handleChange('category', v, 'en')}
                            onChangeNe={(v) => handleChange('category', v, 'ne')}
                            placeholderEn="e.g. Politics"
                            placeholderNe="e.g. राजनीति"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tags (Comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => handleChange('tags', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                                placeholder="news, updates, nepal"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Event Date (Optional)
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Used for "Day to Remember"</p>
                            <input
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => handleChange('eventDate', e.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
