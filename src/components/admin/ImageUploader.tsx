'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/admin/AuthProvider';

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    category?: 'article' | 'leader' | 'history' | 'general';
    folder?: string;
    label?: string;
    className?: string;
}

export default function ImageUploader({
    value,
    onChange,
    category = 'general',
    folder,
    label = "Cover Image",
    className
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        if (folder) formData.append('folder', folder);

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            onChange(data.data.media.secureUrl);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={className}>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {label}
            </label>

            {/* Hidden file input - always present */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            {!value ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-none p-8 text-center cursor-pointer transition-colors
                        ${isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/20'}`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center py-4">
                            <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                            <p className="text-xs font-mono uppercase text-muted-foreground">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="bg-muted p-3 rounded-full mb-3">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-bold font-manrope text-foreground">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">
                                SVM, PNG, JPG (Max 5MB)
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative rounded-none overflow-hidden border border-border bg-muted group">
                    <img
                        src={value}
                        alt="Uploaded preview"
                        className="w-full h-48 object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-background/80 hover:bg-background text-foreground rounded-full backdrop-blur-sm transition-colors border border-border"
                            title="Replace Image"
                        >
                            <Upload className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-2 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full backdrop-blur-sm transition-colors border border-destructive"
                            title="Remove Image"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
