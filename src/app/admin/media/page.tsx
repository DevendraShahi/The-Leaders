'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import { toast } from 'sonner';
import {
    Loader2,
    Upload,
    Trash2,
    Search,
    Filter,
    MoreVertical,
    Copy,
    Check,
    Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

export default function MediaLibrary() {
    const { token } = useAuth();
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '24',
                search: searchTerm,
            });
            if (categoryFilter) params.append('category', categoryFilter);

            const res = await fetch(`/api/admin/media?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setMedia(data.data.media);
                setTotalPages(data.data.pagination.pages);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load media');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, [token, page, searchTerm, categoryFilter]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const toastId = toast.loading('Uploading images...');
        let successCount = 0;

        try {
            // Upload sequentially or parallel? Parallel is faster.
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', categoryFilter || 'general'); // Default to current filter or general

                const res = await fetch('/api/admin/media/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) successCount++;
                return res;
            });

            await Promise.all(uploadPromises);

            if (successCount > 0) {
                toast.success(`Uploaded ${successCount} images`, { id: toastId });
                fetchMedia();
            } else {
                toast.error('Upload failed', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Error uploading images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} images? This action cannot be undone.`)) return;

        const toastId = toast.loading('Deleting...');
        try {
            // Use bulk delete API
            // Wait, my delete API only accepts body? My DELETE route standard accepts body?
            // Next.js Route Handlers support body in DELETE.

            const res = await fetch('/api/admin/media', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids: selectedIds })
            });

            if (res.ok) {
                toast.success('Images deleted', { id: toastId });
                setSelectedIds([]);
                fetchMedia();
            } else {
                toast.error('Delete failed', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Error deleting images');
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>

                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete ({selectedIds.length})
                        </button>
                    )}

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3">
                    <Search className="h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search filename..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none py-2 text-sm focus:ring-0"
                    />
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2 text-sm focus:ring-0"
                    >
                        <option value="">All Categories</option>
                        <option value="article">Articles</option>
                        <option value="leader">Leaders</option>
                        <option value="history">History</option>
                        <option value="general">General</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : media.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                        <p>No images found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {media.map((item) => (
                            <div
                                key={item._id}
                                className={`
                                    group relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer
                                    ${selectedIds.includes(item._id)
                                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-black'
                                        : 'border-gray-200 dark:border-gray-800 hover:border-blue-300'}
                                `}
                                onClick={() => toggleSelection(item._id)}
                            >
                                <img
                                    src={item.secureUrl}
                                    alt={item.originalFilename}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                    <p className="text-white text-xs truncate font-medium">
                                        {item.originalFilename}
                                    </p>
                                    <p className="text-gray-300 text-[10px]">
                                        {format(new Date(item.createdAt), 'MMM d')} • {(item.size / 1024).toFixed(1)}KB
                                    </p>
                                </div>

                                {/* Checkbox */}
                                {selectedIds.includes(item._id) && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}

                                {/* Quick actions */}
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(item.secureUrl);
                                        }}
                                        className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md backdrop-blur-sm"
                                        title="Copy URL"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
