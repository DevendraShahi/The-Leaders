'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { articleColumns, leaderColumns, historyColumns, briefColumns, factCheckColumns, electionArticleColumns } from './columns';
import { useAuth } from '@/components/admin/AuthProvider';
import { toast } from 'sonner';
import { Plus, Loader2, RefreshCw, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

function ContentList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();

    // Default tab from URL or 'articles'
    const type = searchParams.get('type') || 'articles';
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchContent = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const endpoint = `/api/admin/${type}?page=${page}&limit=10`;
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
    }, [type, page, token]);

    const handleTabChange = (newType: string) => {
        // Update URL
        router.push(`/admin/content?type=${newType}`);
        setPage(1);
    };

    const handleDelete = async (id: string, deleteType: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

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
                fetchContent(); // Refresh
            } else {
                toast.error('Failed to delete item');
            }
        } catch (error) {
            toast.error('Error deleting item');
        }
    };

    const getColumns = () => {
        switch (type) {
            case 'leaders': return leaderColumns(handleDelete);
            case 'history': return historyColumns(handleDelete);
            case 'fact-checks': return factCheckColumns(handleDelete);
            case 'briefs': return briefColumns(handleDelete);
            case 'election-articles': return electionArticleColumns(handleDelete);
            case 'articles':
            default: return articleColumns(handleDelete);
        }
    };

    // Editorial Theme Classes
    const tabBase = "flex-1 sm:flex-none px-6 py-2 text-sm font-mono uppercase tracking-wider transition-all border-b-2";
    const activeTab = "border-primary text-primary font-bold bg-primary/5";
    const inactiveTab = "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="font-bebas text-4xl text-foreground tracking-wide">Content Management</h1>
                    <p className="text-muted-foreground font-manrope text-sm mt-1">
                        Secure administration for The Leaders archive.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchContent}
                        className="rounded-none font-mono uppercase text-xs h-10 border-border"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    {type !== 'briefs' && type !== 'fact-checks' && type !== 'election-articles' && (
                        <Link
                            href={`/admin/content/${type === 'leaders' ? 'leader' : type === 'history' ? 'history' : 'article'}/new`}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 transition-colors text-sm font-bold font-mono uppercase tracking-wider rounded-none h-10 shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New {type === 'history' ? 'Event' : type.slice(0, -1)}
                        </Link>
                    )}

                    <Link
                        href="/admin/content/import"
                        className="inline-flex items-center gap-2 border border-border bg-background hover:bg-muted text-foreground px-4 py-2.5 transition-colors text-xs font-bold font-mono uppercase tracking-wider rounded-none h-10"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Import Perplexity
                    </Link>
                </div>
            </div>

            {/* Type Switcher Tabs - Minimalist Editorial Style */}
            <div className="flex w-full sm:w-auto border-b border-border overflow-x-auto">
                <button
                    onClick={() => handleTabChange('articles')}
                    className={`${tabBase} ${type === 'articles' ? activeTab : inactiveTab}`}
                >
                    Articles
                </button>
                <button
                    onClick={() => handleTabChange('election-articles')}
                    className={`${tabBase} ${type === 'election-articles' ? activeTab : inactiveTab}`}
                >
                    Election Articles
                </button>
                <button
                    onClick={() => handleTabChange('leaders')}
                    className={`${tabBase} ${type === 'leaders' ? activeTab : inactiveTab}`}
                >
                    Leaders
                </button>
                <button
                    onClick={() => handleTabChange('history')}
                    className={`${tabBase} ${type === 'history' ? activeTab : inactiveTab}`}
                >
                    History
                </button>
                <button
                    onClick={() => handleTabChange('briefs')}
                    className={`${tabBase} ${type === 'briefs' ? activeTab : inactiveTab}`}
                >
                    Briefs
                </button>
                <button
                    onClick={() => handleTabChange('fact-checks')}
                    className={`${tabBase} ${type === 'fact-checks' ? activeTab : inactiveTab}`}
                >
                    Fact Checks
                </button>
            </div>

            {/* Content Table - Clean & Sharp */}
            <div className="bg-card border border-border rounded-none shadow-sm">
                {loading && data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                        <span className="font-mono text-xs uppercase tracking-widest">Loading Records...</span>
                    </div>
                ) : (
                    <DataTable
                        columns={getColumns()}
                        data={data}
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
        </div>
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
