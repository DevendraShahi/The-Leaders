'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/components/admin/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // AuthProvider will redirect
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
            <AdminSidebar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {/* Top padding for mobile header interaction if needed */}
                <div className="md:p-8 p-4 pt-16 md:pt-8 w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
