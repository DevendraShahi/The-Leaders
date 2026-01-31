'use client';

import AuthProvider from '@/components/admin/AuthProvider';
import { Toaster } from 'sonner';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
        </AuthProvider>
    );
}
