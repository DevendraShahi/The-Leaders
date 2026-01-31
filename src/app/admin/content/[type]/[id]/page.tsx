'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import ArticleForm from '@/components/admin/forms/ArticleForm';
import LeaderForm from '@/components/admin/forms/LeaderForm';
import HistoryForm from '@/components/admin/forms/HistoryForm';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditorPage() {
    const params = useParams();
    const type = params.type as string;
    const id = params.id as string;
    const { token } = useAuth();

    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(id !== 'new');

    const validTypes = ['article', 'leader', 'history']; // singular from route

    useEffect(() => {
        if (!validTypes.includes(type)) {
            // Handled by return null or notFound logic below? 
            // Better redirect or error
        }

        const fetchData = async () => {
            if (!token || id === 'new') return;

            try {
                // Determine API endpoint based on type
                // My API is PLURAL: /api/admin/articles/[id]
                let apiType = type === 'history' ? 'history' : type + 's';

                const res = await fetch(`/api/admin/${apiType}/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    // API returns { data: { article } }, { data: { leader } }, or { data: { history } }
                    const key = type === 'article' ? 'article' : type === 'leader' ? 'leader' : 'history';
                    setInitialData(data.data[key]);
                } else {
                    const errorData = await res.json();
                    toast.error(errorData.error || 'Failed to load data');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id, token]);

    if (!validTypes.includes(type)) {
        return notFound();
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Render appropriate form
    switch (type) {
        case 'article':
            return <ArticleForm initialData={initialData} id={id} />;
        case 'leader':
            return <LeaderForm initialData={initialData} id={id} />;
        case 'history':
            return <HistoryForm initialData={initialData} id={id} />;
        default:
            return notFound();
    }
}
