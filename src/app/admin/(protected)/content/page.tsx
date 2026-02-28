'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { articleColumns, leaderColumns, historyColumns, briefColumns, factCheckColumns, electionArticleColumns } from './columns';
import { useAuth } from '@/components/admin/AuthProvider';
import { toast } from 'sonner';
import { Plus, Loader2, RefreshCw, Upload, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/providers/language-provider';
import { LanguageToggle } from '@/components/language-toggle';
import { MarkdownPreview } from '@/components/admin/MarkdownPreview';
import { Edit, Trash } from 'lucide-react';

function ContentList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const { language } = useLanguage();

    // Default tab from URL or 'articles'
    const type = searchParams.get('type') || 'articles';
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingStatusKeys, setUpdatingStatusKeys] = useState<Set<string>>(new Set());
    const [pendingDelete, setPendingDelete] = useState<{ id: string; type: string } | null>(null);
    const [pendingBulkDeleteRows, setPendingBulkDeleteRows] = useState<any[] | null>(null);
    const [previewItem, setPreviewItem] = useState<any | null>(null);
    const [previewItemType, setPreviewItemType] = useState<'article' | 'leader' | 'history' | 'brief' | 'fact-check' | 'election-article' | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const pickLocalized = (value: any) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (language === 'ne') return value.ne || value.en || '';
        return value.en || value.ne || '';
    };

    const fetchContent = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (dateFrom) params.set('from', dateFrom);
            if (dateTo) params.set('to', dateTo);
            if (statusFilter) params.set('status', statusFilter);

            const endpoint = `/api/admin/${type}?${params.toString()}`;
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const responseData = await res.json();

            if (res.ok) {
                // Determine data key based on type
                let key = type;
                if (type === 'fact-checks') key = 'factChecks';
                if (type === 'election-articles') key = 'electionArticles';

                setData(responseData.data[key] || []);
                setTotalPages(responseData.data.pagination.pages);
                setTotalItems(responseData.data.pagination.total || 0);
                setPageSize(responseData.data.pagination.limit || 10);
            } else {
                toast.error('Failed to load content');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
        // Reset page when switching types? Yes preferably.
    }, [type, page, token, dateFrom, dateTo, statusFilter]);

    useEffect(() => {
        setPreviewItem(null);
        setPreviewItemType(null);
    }, [type]);

    const handleTabChange = (newType: string) => {
        // Update URL
        router.push(`/admin/content?type=${newType}`);
        setPage(1);
    };

    const handlePreview = async (row: any, itemType: string) => {
        const allowedTypes = new Set(['article', 'leader', 'history', 'brief', 'fact-check', 'election-article']);
        if (!allowedTypes.has(itemType)) return;
        if (!token) return;
        const normalizedType = itemType as 'article' | 'leader' | 'history' | 'brief' | 'fact-check' | 'election-article';
        const itemId = getBulkDeleteId(row, normalizedType);
        const routeType = getRouteType(normalizedType);
        if (!itemId || !routeType) return;

        setPreviewLoading(true);
        try {
            const res = await fetch(`/api/admin/${routeType}/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const response = await res.json();

            const keyMap: Record<string, string> = {
                article: 'article',
                leader: 'leader',
                history: 'history',
                brief: 'brief',
                'fact-check': 'factCheck',
                'election-article': 'electionArticle',
            };
            const payloadKey = keyMap[normalizedType];
            const previewPayload = response?.data?.[payloadKey];

            if (!res.ok || !previewPayload) {
                throw new Error(response?.error || 'Failed to load preview');
            }
            setPreviewItem(previewPayload);
            setPreviewItemType(normalizedType);
        } catch (error: any) {
            toast.error(error?.message || (language === 'ne' ? 'पूर्वावलोकन लोड गर्न सकिएन' : 'Failed to load preview'));
        } finally {
            setPreviewLoading(false);
        }
    };

    const executeDelete = async (id: string, deleteType: string) => {
        try {
            const mapping: any = {
                'article': 'articles',
                'leader': 'leaders',
                'history': 'history',
                'brief': 'briefs',
                'fact-check': 'fact-checks',
                'election-article': 'election-articles'
            };

            const routeType = mapping[deleteType] || deleteType;

            const res = await fetch(`/api/admin/${routeType}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Item deleted successfully');
                setPreviewItem(null);
                setPreviewItemType(null);
                fetchContent(); // Refresh
            } else {
                toast.error('Failed to delete item');
            }
        } catch (error) {
            toast.error('Error deleting item');
        }
    };

    const handleDelete = (id: string, deleteType: string) => {
        setPendingDelete({ id, type: deleteType });
    };

    const handleStatusChange = async (row: any, itemType: string, status: string) => {
        if (!token) return;
        const routeType = getRouteType(itemType);
        const itemId = getBulkDeleteId(row, itemType);
        if (!itemId) return;
        const rowKey = `${itemType}:${itemId}`;

        setUpdatingStatusKeys((prev) => {
            const next = new Set(prev);
            next.add(rowKey);
            return next;
        });

        try {
            const res = await fetch(`/api/admin/${routeType}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result?.error || 'Failed to update status');
            }

            setData((prev) =>
                prev.map((item) => {
                    const candidateId = getBulkDeleteId(item, itemType);
                    if (candidateId !== itemId) return item;
                    return {
                        ...item,
                        status,
                        ...(itemType === 'brief' ? { isPublished: status === 'published' } : {})
                    };
                })
            );

            // Also update preview item if it matches
            if (previewItem && getBulkDeleteId(previewItem, previewItemType!) === itemId) {
                setPreviewItem({
                    ...previewItem,
                    status,
                    ...(itemType === 'brief' ? { isPublished: status === 'published' } : {})
                });
            }

            toast.success('Status updated');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update status');
        } finally {
            setUpdatingStatusKeys((prev) => {
                const next = new Set(prev);
                next.delete(rowKey);
                return next;
            });
        }
    };

    const isStatusUpdating = (row: any, itemType: string) => {
        const itemId = getBulkDeleteId(row, itemType);
        if (!itemId) return false;
        return updatingStatusKeys.has(`${itemType}:${itemId}`);
    };

    const getRouteType = (deleteType: string) => {
        const mapping: Record<string, string> = {
            'article': 'articles',
            'leader': 'leaders',
            'history': 'history',
            'brief': 'briefs',
            'fact-check': 'fact-checks',
            'election-article': 'election-articles'
        };
        return mapping[deleteType] || deleteType;
    };

    const getBulkDeleteId = (row: any, deleteType: string): string => {
        if (deleteType === 'brief' || deleteType === 'fact-check' || deleteType === 'election-article') {
            if (row?.slug) return String(row.slug);
        }
        const raw = row?.id ?? row?._id ?? row?.slug;
        if (!raw) return '';
        if (typeof raw === 'string') return raw;
        if (raw?.$oid) return String(raw.$oid);
        if (typeof raw?.toString === 'function') return raw.toString();
        return String(raw);
    };

    const executeBulkDelete = async (rows: any[]) => {
        if (!token || rows.length === 0) return;

        const sectionTypeMap: Record<string, string> = {
            articles: 'article',
            leaders: 'leader',
            history: 'history',
            briefs: 'brief',
            'fact-checks': 'fact-check',
            'election-articles': 'election-article'
        };
        const itemType = sectionTypeMap[type] || type;
        const routeType = getRouteType(itemType);

        try {
            const results = await Promise.all(
                rows.map(async (row) => {
                    const itemId = getBulkDeleteId(row, itemType);
                    if (!itemId) return { ok: false };
                    const res = await fetch(`/api/admin/${routeType}/${itemId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    return { ok: res.ok };
                })
            );

            const successCount = results.filter((r) => r.ok).length;
            const failureCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(`${successCount} item(s) deleted successfully`);
            }
            if (failureCount > 0) {
                toast.error(`${failureCount} item(s) failed to delete`);
            }
            fetchContent();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting selected items');
        }
    };

    const handleBulkDelete = async (rows: any[]) => {
        if (!token || rows.length === 0) return;
        setPendingBulkDeleteRows(rows);
    };

    const getColumns = () => {
        switch (type) {
            case 'leaders': return leaderColumns(handleDelete, handleStatusChange, isStatusUpdating, language, handlePreview);
            case 'history': return historyColumns(handleDelete, handleStatusChange, isStatusUpdating, language, handlePreview);
            case 'fact-checks': return factCheckColumns(handleDelete, handleStatusChange, isStatusUpdating, language, handlePreview);
            case 'briefs': return briefColumns(handleDelete, handleStatusChange, isStatusUpdating, language, handlePreview);
            case 'election-articles': return electionArticleColumns(handleDelete, handleStatusChange, isStatusUpdating, language, handlePreview);
            case 'articles':
            default: return articleColumns(handleDelete, handleStatusChange, isStatusUpdating, language, handlePreview);
        }
    };

    const getCreatePath = () => {
        if (type === 'leaders') return '/admin/content/leader/new';
        if (type === 'history') return '/admin/content/history/new';
        if (type === 'briefs') return '/admin/content/brief/new';
        if (type === 'fact-checks') return '/admin/content/fact-check/new';
        if (type === 'election-articles') return '/admin/content/election-article/new';
        return '/admin/content/article/new';
    };

    const getCreateLabel = () => {
        if (type === 'history') return language === 'ne' ? 'नयाँ घटना' : 'New Event';
        if (type === 'briefs') return language === 'ne' ? 'नयाँ संक्षिप्त' : 'New Brief';
        if (type === 'fact-checks') return language === 'ne' ? 'नयाँ तथ्य जाँच' : 'New Fact Check';
        if (type === 'election-articles') return language === 'ne' ? 'नयाँ चुनावी लेख' : 'New Election Article';
        return language === 'ne' ? `नयाँ ${type.slice(0, -1)}` : `New ${type.slice(0, -1)}`;
    };


    const previewTitle = previewItemType === 'article'
        ? pickLocalized(previewItem?.title)
        : previewItemType === 'leader'
            ? pickLocalized(previewItem?.name)
            : previewItemType === 'history'
                ? pickLocalized(previewItem?.title)
                : previewItemType === 'brief'
                    ? pickLocalized(previewItem?.title)
                    : previewItemType === 'fact-check'
                        ? pickLocalized(previewItem?.claim)
                        : previewItemType === 'election-article'
                            ? (language === 'ne' ? (previewItem?.title_ne || previewItem?.title_en) : (previewItem?.title_en || previewItem?.title_ne))
                            : '';

    const previewSubtitle = previewItemType === 'article'
        ? pickLocalized(previewItem?.excerpt)
        : previewItemType === 'leader'
            ? pickLocalized(previewItem?.desc)
            : previewItemType === 'history'
                ? ''
                : previewItemType === 'brief'
                    ? pickLocalized(previewItem?.summary)
                    : previewItemType === 'fact-check'
                        ? pickLocalized(previewItem?.claimBy)
                        : previewItemType === 'election-article'
                            ? (language === 'ne' ? (previewItem?.excerpt_ne || previewItem?.excerpt_en) : (previewItem?.excerpt_en || previewItem?.excerpt_ne))
                            : '';

    const previewContent = previewItemType === 'article'
        ? pickLocalized(previewItem?.content)
        : previewItemType === 'leader'
            ? pickLocalized(previewItem?.bio)
            : previewItemType === 'history'
                ? pickLocalized(previewItem?.content)
                : previewItemType === 'brief'
                    ? pickLocalized(previewItem?.content)
                    : previewItemType === 'fact-check'
                        ? pickLocalized(previewItem?.analysis)
                        : previewItemType === 'election-article'
                            ? (language === 'ne' ? (previewItem?.content_ne || previewItem?.content_en) : (previewItem?.content_en || previewItem?.content_ne))
                            : '';

    const previewMetaPrimary = previewItemType === 'article'
        ? pickLocalized(previewItem?.author) || (language === 'ne' ? 'अज्ञात लेखक' : 'Unknown author')
        : previewItemType === 'leader'
            ? pickLocalized(previewItem?.position)
            : previewItemType === 'fact-check'
                ? (language === 'ne' ? 'दाबीकर्ता' : 'Claimed by')
                : previewItemType === 'election-article'
                    ? (previewItem?.editor || (language === 'ne' ? 'सम्पादक अज्ञात' : 'Unknown editor'))
                    : '';

    const previewMetaSecondary = previewItemType === 'leader'
        ? pickLocalized(previewItem?.party)
        : previewItemType === 'fact-check'
            ? pickLocalized(previewItem?.claimBy)
            : '';

    const previewCategory = previewItemType === 'article'
        ? pickLocalized(previewItem?.category)
        : previewItemType === 'leader'
            ? pickLocalized(previewItem?.party)
            : previewItemType === 'fact-check'
                ? (previewItem?.verdict || '')
                : '';

    const previewImage = previewItem?.image || previewItem?.cover || '';
    const previewDate = previewItem?.publishedDate || previewItem?.date || previewItem?.createdAt;

    const previewRelatedItems = data
        .filter((item) => String(item?._id || item?.id) !== String(previewItem?._id || previewItem?.id))
        .slice(0, 4);

    const relatedSectionLabel = previewItemType === 'article'
        ? (language === 'ne' ? 'सम्बन्धित लेखहरू' : 'Related Articles')
        : previewItemType === 'leader'
            ? (language === 'ne' ? 'सम्बन्धित नेताहरू' : 'Related Leaders')
            : previewItemType === 'history'
                ? (language === 'ne' ? 'सम्बन्धित इतिहास' : 'Related History')
                : previewItemType === 'brief'
                    ? (language === 'ne' ? 'सम्बन्धित संक्षिप्त' : 'Related Briefs')
                    : previewItemType === 'fact-check'
                        ? (language === 'ne' ? 'सम्बन्धित तथ्य जाँच' : 'Related Fact Checks')
                        : (language === 'ne' ? 'सम्बन्धित चुनावी लेखहरू' : 'Related Election Articles');

    // Editorial Theme Classes
    const tabBase = "flex-none shrink-0 whitespace-nowrap px-6 py-2 text-sm font-mono uppercase tracking-wider transition-all border-b-2";
    const activeTab = "border-primary text-primary font-bold bg-primary/5";
    const inactiveTab = "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 min-w-0">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-6 min-w-0">
                <div>
                    <h1 className="font-bebas text-4xl text-foreground tracking-wide">
                        {language === 'ne' ? 'कन्टेन्ट व्यवस्थापन' : 'Content Management'}
                    </h1>
                    <p className="text-muted-foreground font-manrope text-sm mt-1">
                        {language === 'ne'
                            ? 'द लिडर्स अभिलेखका लागि सुरक्षित प्रशासन।'
                            : 'Secure administration for The Leaders archive.'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto sm:justify-end">
                    <LanguageToggle className="h-10" />

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchContent}
                        className="rounded-none font-mono uppercase text-xs h-10 border-border w-full sm:w-auto"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {language === 'ne' ? 'रिफ्रेस' : 'Refresh'}
                    </Button>

                    <Link
                        href={getCreatePath()}
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-5 py-2.5 transition-colors text-[11px] sm:text-sm font-bold font-mono uppercase tracking-wider rounded-none h-10 shadow-sm w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {getCreateLabel()}
                    </Link>

                    <Link
                        href="/admin/content/import"
                        className="inline-flex items-center justify-center gap-2 border border-border bg-background hover:bg-muted text-foreground px-4 py-2.5 transition-colors text-xs font-bold font-mono uppercase tracking-wider rounded-none h-10 w-full sm:w-auto"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        {language === 'ne' ? 'परप्लेक्सिटी इम्पोर्ट' : 'Import Perplexity'}
                    </Link>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                        {language === 'ne' ? 'स्थिति' : 'Status'}
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="h-10 px-3 border border-border bg-background text-foreground rounded-none text-sm min-w-[140px]"
                    >
                        <option value="">{language === 'ne' ? 'सबै' : 'All'}</option>
                        <option value="draft">{language === 'ne' ? 'मस्यौदा' : 'Draft'}</option>
                        <option value="published">{language === 'ne' ? 'प्रकाशित' : 'Published'}</option>
                        <option value="archived">{language === 'ne' ? 'अभिलेख' : 'Archived'}</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                        {language === 'ne' ? 'देखि' : 'From'}
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setPage(1);
                        }}
                        className="h-10 px-3 border border-border bg-background text-foreground rounded-none text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                        {language === 'ne' ? 'सम्म' : 'To'}
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setPage(1);
                        }}
                        className="h-10 px-3 border border-border bg-background text-foreground rounded-none text-sm"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setStatusFilter('');
                        setDateFrom('');
                        setDateTo('');
                        setPage(1);
                    }}
                    className="rounded-none font-mono uppercase text-xs h-10 border-border"
                >
                    {language === 'ne' ? 'मिति खाली गर्नुहोस्' : 'Clear Dates'}
                </Button>
            </div>

            {/* Type Switcher Tabs - Minimalist Editorial Style */}
            <div className="w-full border-b border-border overflow-x-auto overscroll-x-contain [touch-action:pan-x] [-webkit-overflow-scrolling:touch]">
                <div className="inline-flex min-w-max">
                    <button
                        onClick={() => handleTabChange('articles')}
                        className={`${tabBase} ${type === 'articles' ? activeTab : inactiveTab}`}
                    >
                        {language === 'ne' ? 'लेखहरू' : 'Articles'}
                    </button>
                    <button
                        onClick={() => handleTabChange('election-articles')}
                        className={`${tabBase} ${type === 'election-articles' ? activeTab : inactiveTab}`}
                    >
                        {language === 'ne' ? 'चुनावी लेखहरू' : 'Election Articles'}
                    </button>
                    <button
                        onClick={() => handleTabChange('leaders')}
                        className={`${tabBase} ${type === 'leaders' ? activeTab : inactiveTab}`}
                    >
                        {language === 'ne' ? 'नेताहरू' : 'Leaders'}
                    </button>
                    <button
                        onClick={() => handleTabChange('history')}
                        className={`${tabBase} ${type === 'history' ? activeTab : inactiveTab}`}
                    >
                        {language === 'ne' ? 'इतिहास' : 'History'}
                    </button>
                    <button
                        onClick={() => handleTabChange('briefs')}
                        className={`${tabBase} ${type === 'briefs' ? activeTab : inactiveTab}`}
                    >
                        {language === 'ne' ? 'संक्षिप्तहरू' : 'Briefs'}
                    </button>
                    <button
                        onClick={() => handleTabChange('fact-checks')}
                        className={`${tabBase} ${type === 'fact-checks' ? activeTab : inactiveTab}`}
                    >
                        {language === 'ne' ? 'तथ्य जाँच' : 'Fact Checks'}
                    </button>
                </div>
            </div>

            {previewLoading ? (
                <div className="bg-card border border-border rounded-none shadow-sm">
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                        <span className="font-mono text-xs uppercase tracking-widest">
                            {language === 'ne' ? 'पूर्वावलोकन लोड हुँदै...' : 'Loading preview...'}
                        </span>
                    </div>
                </div>
            ) : previewItem ? (
                <div className="border border-border bg-card/40 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none h-9"
                                onClick={() => {
                                    setPreviewItem(null);
                                    setPreviewItemType(null);
                                }}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {language === 'ne' ? 'फिर्ता' : 'Back'}
                            </Button>
                            <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-l border-border pl-4">
                                {language === 'ne' ? 'पूर्वावलोकन' : 'Preview'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Button variant="secondary" size="sm" className="h-9 rounded-none px-4" asChild>
                                <Link
                                    href={`/admin/content/${previewItemType}/${getBulkDeleteId(previewItem, previewItemType || '')}`}
                                    title={language === "ne" ? "सम्पादन" : "Edit"}
                                >
                                    <Edit className="h-3.5 w-3.5 sm:mr-2" />
                                    <span className="hidden sm:inline">{language === "ne" ? "सम्पादन" : "Edit"}</span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <article className="space-y-5">
                        <div className="space-y-3">
                            {previewCategory && (
                                <span className="inline-flex border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-primary font-mono">
                                    {previewCategory}
                                </span>
                            )}
                            <h2 className="font-bebas text-4xl tracking-wide leading-[0.95]">
                                {previewTitle || (language === 'ne' ? 'शीर्षक उपलब्ध छैन' : 'Untitled')}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.13em] text-muted-foreground">
                                {previewMetaPrimary && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                        {previewMetaPrimary}
                                    </span>
                                )}
                                {previewMetaSecondary && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                        {previewMetaSecondary}
                                    </span>
                                )}
                                {previewDate && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                        {new Date(previewDate).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>

                        {previewImage && (
                            <div className="border border-border overflow-hidden">
                                <img
                                    src={previewImage}
                                    alt={previewTitle || ''}
                                    className="h-[280px] sm:h-[360px] w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-4">
                                {previewSubtitle && (
                                    <MarkdownPreview
                                        content={previewSubtitle}
                                        className="prose-p:text-base prose-p:leading-8"
                                    />
                                )}
                                <MarkdownPreview content={previewContent || ''} />
                                {previewItemType === 'fact-check' && Array.isArray(previewItem?.sources) && previewItem.sources.length > 0 && (
                                    <div className="border border-border bg-background/50 p-4">
                                        <h4 className="font-bebas text-xl tracking-wide mb-2">
                                            {language === 'ne' ? 'स्रोतहरू' : 'Sources'}
                                        </h4>
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/90">
                                            {previewItem.sources.map((source: string, idx: number) => (
                                                <li key={`${source}-${idx}`}>{source}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Editor Decision Actions */}
                            <div className="lg:col-span-8 mt-2 pt-6 border-t border-border/70 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                        {language === 'ne' ? 'निर्णय लिनुहोस्:' : 'Publishing Decision:'}
                                    </span>
                                    <select
                                        value={previewItem?.status === true ? 'published' : previewItem?.status === false ? 'draft' : previewItem?.status || 'draft'}
                                        onChange={(e) => {
                                            if (previewItem && previewItemType) {
                                                handleStatusChange(previewItem, previewItemType, e.target.value);
                                            }
                                        }}
                                        disabled={isStatusUpdating(previewItem, previewItemType || '')}
                                        className="h-10 rounded-none border border-border bg-background px-4 font-mono text-[11px] font-bold uppercase tracking-wide text-foreground min-w-[140px]"
                                    >
                                        {isStatusUpdating(previewItem, previewItemType || '') && (
                                            <option value={previewItem?.status}>{language === "ne" ? "सुरक्षित हुँदै..." : "Saving..."}</option>
                                        )}
                                        <option value="draft">{language === "ne" ? "मस्यौदा" : "Draft"}</option>
                                        <option value="published">{language === "ne" ? "प्रकाशित" : "Published"}</option>
                                        <option value="archived">{language === "ne" ? "अभिलेख" : "Archived"}</option>
                                    </select>
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-10 rounded-none px-5 font-mono text-[11px] uppercase tracking-wider"
                                    onClick={() => handleDelete(getBulkDeleteId(previewItem, previewItemType || ''), previewItemType || '')}
                                    title={language === "ne" ? "हटाउनुहोस्" : "Delete"}
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    {language === "ne" ? "हटाउनुहोस्" : "Delete"}
                                </Button>
                            </div>
                            <aside className="lg:col-span-4 space-y-4">
                                <div className="border border-border bg-background/60 p-4">
                                    <h3 className="font-bebas text-2xl tracking-wide mb-3">
                                        {relatedSectionLabel}
                                    </h3>
                                    {previewRelatedItems.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            {language === 'ne' ? 'यस पृष्ठमा अन्य सम्बन्धित सामग्री उपलब्ध छैनन्।' : 'No related items available on this page.'}
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {previewRelatedItems.map((item) => (
                                                <button
                                                    key={String(item?._id || item?.id)}
                                                    type="button"
                                                    onClick={() => handlePreview(item, previewItemType || 'article')}
                                                    className="w-full text-left border-b border-border/70 pb-3 last:border-b-0 last:pb-0"
                                                >
                                                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1">
                                                        {(item?.publishedDate || item?.date || item?.createdAt)
                                                            ? new Date(item?.publishedDate || item?.date || item?.createdAt).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })
                                                            : ''}
                                                    </div>
                                                    <div className="font-manrope text-sm leading-snug text-foreground hover:text-primary transition-colors">
                                                        {previewItemType === 'leader'
                                                            ? (pickLocalized(item?.name) || (language === 'ne' ? 'शीर्षक उपलब्ध छैन' : 'Untitled'))
                                                            : previewItemType === 'fact-check'
                                                                ? (pickLocalized(item?.claim) || (language === 'ne' ? 'शीर्षक उपलब्ध छैन' : 'Untitled'))
                                                                : previewItemType === 'election-article'
                                                                    ? (language === 'ne' ? (item?.title_ne || item?.title_en) : (item?.title_en || item?.title_ne))
                                                                    : (pickLocalized(item?.title) || (language === 'ne' ? 'शीर्षक उपलब्ध छैन' : 'Untitled'))}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </aside>
                        </div>
                    </article>
                </div >
            ) : (
                <>
                    {/* Content Table - Clean & Sharp */}
                    <div className="bg-card border border-border rounded-none shadow-sm">
                        {loading && data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                                <span className="font-mono text-xs uppercase tracking-widest">
                                    {language === 'ne' ? 'रेकर्डहरू लोड हुँदै...' : 'Loading Records...'}
                                </span>
                            </div>
                        ) : (
                            <DataTable
                                columns={getColumns()}
                                data={data}
                                onDelete={handleBulkDelete}
                                totalRows={totalItems}
                                currentPage={page}
                                pageSize={pageSize}
                                searchKey={
                                    type === 'leaders'
                                        ? 'name.en'
                                        : type === 'briefs'
                                            ? 'title'
                                            : type === 'fact-checks'
                                                ? 'claim'
                                                : type === 'election-articles'
                                                    ? 'title_en'
                                                    : 'title.en'
                                }
                            />
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-card border border-border hover:bg-muted disabled:opacity-50 rounded-none transition-colors"
                            >
                                {language === 'ne' ? 'अघिल्लो' : 'Previous'}
                            </button>
                            <span className="flex items-center px-4 text-sm font-mono text-muted-foreground">
                                {language === 'ne' ? `पृष्ठ ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-card border border-border hover:bg-muted disabled:opacity-50 rounded-none transition-colors"
                            >
                                {language === 'ne' ? 'अर्को' : 'Next'}
                            </button>
                        </div>
                    )}
                </>
            )
            }

            <ConfirmDialog
                open={!!pendingDelete}
                onOpenChange={(open) => {
                    if (!open) setPendingDelete(null);
                }}
                title={language === 'ne' ? 'यो सामग्री हटाउनुहुन्छ?' : 'Delete this item?'}
                description={language === 'ne' ? 'यो कार्य फिर्ता लिन सकिँदैन।' : 'This action cannot be undone.'}
                confirmLabel={language === 'ne' ? 'हटाउनुहोस्' : 'Delete'}
                variant="destructive"
                onConfirm={async () => {
                    if (!pendingDelete) return;
                    await executeDelete(pendingDelete.id, pendingDelete.type);
                    setPendingDelete(null);
                }}
            />

            <ConfirmDialog
                open={!!pendingBulkDeleteRows}
                onOpenChange={(open) => {
                    if (!open) setPendingBulkDeleteRows(null);
                }}
                title={
                    pendingBulkDeleteRows
                        ? (language === 'ne'
                            ? `${pendingBulkDeleteRows.length} चयन गरिएका सामग्री हटाउनुहुन्छ?`
                            : `Delete ${pendingBulkDeleteRows.length} selected item(s)?`)
                        : (language === 'ne' ? 'चयन गरिएका सामग्री हटाउनुहुन्छ?' : 'Delete selected items?')
                }
                description={language === 'ne' ? 'यो कार्य फिर्ता लिन सकिँदैन।' : 'This action cannot be undone.'}
                confirmLabel={language === 'ne' ? 'चयन हटाउनुहोस्' : 'Delete Selected'}
                variant="destructive"
                onConfirm={async () => {
                    if (!pendingBulkDeleteRows) return;
                    await executeBulkDelete(pendingBulkDeleteRows);
                    setPendingBulkDeleteRows(null);
                }}
            />
        </div >
    );
}

export default function ContentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ContentList />
        </Suspense>
    );
}
