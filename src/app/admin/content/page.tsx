'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { articleColumns, leaderColumns, historyColumns } from './columns';
import { useAuth } from '@/components/admin/AuthProvider';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

    const activeTabClass = "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm";
    const inactiveTabClass = "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200";

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
                const key = type === 'history' ? 'history' : type;
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
            // Need to map plural type to single for route if needed? 
            // My API routes are plural: /api/admin/articles/[id]
            // Wait, columns.tsx passes 'article' (singular) for route, but delete API might be plural based path.
            // My API: /api/admin/articles/[id]
            // So if type is 'articles', path is correct.
            // If deleteType is 'article', I need to pluralize it.

            // Let's fix columns.tsx to pass plural or handle mapping here.
            // columns.tsx passes 'article', 'leader', 'history'.

            const mapping: any = {
                'article': 'articles',
                'leader': 'leaders',
                'history': 'history' // history is same plural/singular effectively in my routes
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
            case 'articles':
            default: return articleColumns(handleDelete);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
                    <p className="text-sm text-gray-500">Manage all your website content in one place</p>
                </div>

                <Link
                    href={`/admin/content/${type === 'leaders' ? 'leader' : type === 'history' ? 'history' : 'article'}/new`}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Add New {type === 'history' ? 'Event' : type.slice(0, -1)}
                </Link>
            </div>

            {/* Type Switcher Tabs */}
            <div className="bg-gray-100 dark:bg-gray-900 p-1 rounded-xl inline-flex w-full sm:w-auto">
                <button
                    onClick={() => handleTabChange('articles')}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${type === 'articles' ? activeTabClass : inactiveTabClass}`}
                >
                    Articles
                </button>
                <button
                    onClick={() => handleTabChange('leaders')}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${type === 'leaders' ? activeTabClass : inactiveTabClass}`}
                >
                    Leaders
                </button>
                <button
                    onClick={() => handleTabChange('history')}
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${type === 'history' ? activeTabClass : inactiveTabClass}`}
                >
                    History
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <DataTable
                        columns={getColumns()}
                        data={data}
                        searchKey={type === 'leaders' ? 'name.en' : 'title.en'}
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <ContentList />
        </Suspense>
    );
}
