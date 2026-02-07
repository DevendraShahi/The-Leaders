'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import ArticleForm from '@/components/admin/forms/ArticleForm';
import LeaderForm from '@/components/admin/forms/LeaderForm';
import HistoryForm from '@/components/admin/forms/HistoryForm';
import ImageUploader from '@/components/admin/ImageUploader';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
    const params = useParams();
    // Safety check: params can be null during hydration
    const type = params?.type as string;
    const id = params?.id as string;

    const { token } = useAuth();

    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(id !== 'new');
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [savingImage, setSavingImage] = useState(false);
    const [resolvedId, setResolvedId] = useState<string>("");

    const validTypes = ['article', 'leader', 'history', 'brief', 'fact-check', 'election-article'];

    useEffect(() => {
        // If no params yet, wait
        if (!type || !id) return;

        if (!validTypes.includes(type)) {
            // Will be handled by render
            return;
        }

        const decodeSafe = (value: string) => {
            try {
                return decodeURIComponent(value);
            } catch {
                return value;
            }
        };

        const fetchFallbackBySearch = async (apiType: string, key: string, searchValue: string) => {
            const res = await fetch(`/api/admin/${apiType}?page=1&limit=50&search=${encodeURIComponent(searchValue)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return null;
            const data = await res.json();
            const items = data?.data?.[key] || [];
            if (!Array.isArray(items) || items.length === 0) return null;
            const decoded = decodeSafe(searchValue);
            const bySlug = items.find((item: any) => item?.slug === decoded || item?.slug === searchValue);
            return bySlug || items[0];
        };

        const fetchData = async () => {
            if (!token || id === 'new') {
                setLoading(false);
                return;
            }

            try {
                const apiType =
                    type === 'history'
                        ? 'history'
                        : type === 'brief'
                            ? 'briefs'
                            : type === 'fact-check'
                                ? 'fact-checks'
                                : type === 'election-article'
                                    ? 'election-articles'
                                    : type + 's';

                // Construct URL carefully
                const url = `/api/admin/${apiType}/${id}`;

                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const key =
                        type === 'article'
                            ? 'article'
                            : type === 'leader'
                                ? 'leader'
                                : type === 'history'
                                    ? 'history'
                                    : type === 'brief'
                                        ? 'brief'
                                        : type === 'fact-check'
                                            ? 'factCheck'
                                            : 'electionArticle';

                    // apiResponse wraps in { success, data }, so we access data[key] directly
                    if (data.data && data.data[key]) {
                        setInitialData(data.data[key]);
                        setImageUrl(data.data[key]?.image || "");
                        setResolvedId(data.data[key]?._id?.toString?.() || data.data[key]?.id || id);
                    } else {
                        throw new Error("Data format invalid");
                    }
                } else {
                    const errorData = await res.json();
                    const message = errorData.error || 'Failed to load data';

                    if (message.toLowerCase().includes('not found')) {
                        const fallbackKey =
                            type === 'brief'
                                ? 'briefs'
                                : type === 'election-article'
                                    ? 'electionArticles'
                                    : null;

                        if (fallbackKey) {
                            const fallback = await fetchFallbackBySearch(apiType, fallbackKey, id);
                            if (fallback) {
                                setInitialData(fallback);
                                setImageUrl(fallback?.image || "");
                                setResolvedId(fallback?._id?.toString?.() || fallback?.id || id);
                                setLoading(false);
                                return;
                            }
                        }
                    }

                    throw new Error(message);
                }
            } catch (error: any) {
                console.error(error);
                setError(error.message);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id, token]);

    const updateImage = async (url: string) => {
        if (!token) return;
        if (!type || !id) return;
        setSavingImage(true);
        try {
            const apiType =
                type === 'history'
                    ? 'history'
                    : type === 'brief'
                        ? 'briefs'
                        : type === 'fact-check'
                            ? 'fact-checks'
                            : type === 'election-article'
                                ? 'election-articles'
                                : type + 's';

            let targetId = resolvedId || id;
            // For slug-based types, prefer slug when available
            if (type === 'brief' || type === 'fact-check' || type === 'election-article') {
                if (initialData?.slug) targetId = initialData.slug;
            }
            const res = await fetch(`/api/admin/${apiType}/${targetId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: url })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update image');
            }

            setImageUrl(url);
            toast.success('Image updated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update image');
        } finally {
            setSavingImage(false);
        }
    };

    // Render Logic with safe guards
    if (!type || !id) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!validTypes.includes(type)) {
        return notFound();
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-card border border-border shadow-sm max-w-md mx-auto mt-10">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bebas tracking-wide mb-2">Error Loading Content</h2>
                <p className="text-muted-foreground mb-6 font-manrope text-sm">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-none">
                    Try Again
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading Editor...</p>
            </div>
        );
    }

    const FieldRow = ({ label, value }: { label: string; value?: string }) => (
        <div className="border-b border-border py-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="text-sm font-manrope text-foreground mt-1 whitespace-pre-wrap">{value || '-'}</div>
        </div>
    );

    const ViewWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="max-w-4xl mx-auto mt-8 bg-card border border-border rounded-none p-6">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <h1 className="font-bebas text-3xl tracking-wide">{title}</h1>
                <Button onClick={() => window.history.back()} variant="outline" className="rounded-none text-xs font-mono uppercase">
                    Back
                </Button>
            </div>
            <div className="mb-6">
                <ImageUploader
                    value={imageUrl}
                    onChange={(url) => updateImage(url)}
                    category="general"
                    label={savingImage ? "Saving..." : "Cover Image"}
                />
            </div>
            {children}
        </div>
    );

    const viewOnlyTypes = ['brief', 'fact-check', 'election-article'];

    if (id === 'new' && viewOnlyTypes.includes(type)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-card border border-border shadow-sm max-w-md mx-auto mt-10">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bebas tracking-wide mb-2">Creation Not Supported</h2>
                <p className="text-muted-foreground mb-6 font-manrope text-sm">
                    This content type is managed via import or system pipelines.
                </p>
                <Button onClick={() => window.history.back()} variant="outline" className="rounded-none">
                    Back
                </Button>
            </div>
        );
    }

    // Pass key to force re-mounting if type changes, ensuring clean state
    switch (type) {
        case 'article':
            return <ArticleForm key="article-form" initialData={initialData} id={id} />;
        case 'leader':
            return <LeaderForm key="leader-form" initialData={initialData} id={id} />;
        case 'history':
            return <HistoryForm key="history-form" initialData={initialData} id={id} />;
        case 'brief':
            return (
                <ViewWrapper title="Daily Brief">
                    <FieldRow label="Title" value={initialData?.title} />
                    <FieldRow label="Date" value={initialData?.date} />
                    <FieldRow label="Published" value={String(!!initialData?.isPublished)} />
                    <FieldRow label="Tags" value={(initialData?.tags || []).join(", ")} />
                    <FieldRow label="Summary" value={initialData?.summary} />
                    <FieldRow label="Content" value={initialData?.content} />
                </ViewWrapper>
            );
        case 'fact-check':
            return (
                <ViewWrapper title="Fact Check">
                    <FieldRow label="Claim" value={initialData?.claim} />
                    <FieldRow label="Claimed By" value={initialData?.claimBy} />
                    <FieldRow label="Verdict" value={initialData?.verdict} />
                    <FieldRow label="Date" value={initialData?.date} />
                    <FieldRow label="Sources" value={(initialData?.sources || []).join("\n")} />
                    <FieldRow label="Analysis" value={initialData?.analysis} />
                </ViewWrapper>
            );
        case 'election-article':
            return (
                <ViewWrapper title="Election Article">
                    <FieldRow label="Editor" value={initialData?.editor} />
                    <FieldRow label="Title" value={initialData?.title_en} />
                    <FieldRow label="Status" value={initialData?.status} />
                    <FieldRow label="Tags" value={(initialData?.tags || []).join(", ")} />
                    <FieldRow label="Excerpt" value={initialData?.excerpt_en} />
                    <FieldRow label="Content" value={initialData?.content_en} />
                </ViewWrapper>
            );
        default:
            return notFound();
    }
}
