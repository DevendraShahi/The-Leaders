'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import ArticleForm from '@/components/admin/forms/ArticleForm';
import LeaderForm from '@/components/admin/forms/LeaderForm';
import HistoryForm from '@/components/admin/forms/HistoryForm';
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

    const validTypes = ['article', 'leader', 'history'];

    useEffect(() => {
        // If no params yet, wait
        if (!type || !id) return;

        if (!validTypes.includes(type)) {
            // Will be handled by render
            return;
        }

        const fetchData = async () => {
            if (!token || id === 'new') {
                setLoading(false);
                return;
            }

            try {
                const apiType = type === 'history' ? 'history' : type + 's';

                // Construct URL carefully
                const url = `/api/admin/${apiType}/${id}`;

                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const key = type === 'article' ? 'article' : type === 'leader' ? 'leader' : 'history';

                    if (data.data && data.data[key]) {
                        setInitialData(data.data[key]);
                    } else {
                        throw new Error("Data format invalid");
                    }
                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to load data');
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

    // Pass key to force re-mounting if type changes, ensuring clean state
    switch (type) {
        case 'article':
            return <ArticleForm key="article-form" initialData={initialData} id={id} />;
        case 'leader':
            return <LeaderForm key="leader-form" initialData={initialData} id={id} />;
        case 'history':
            return <HistoryForm key="history-form" initialData={initialData} id={id} />;
        default:
            return notFound();
    }
}
