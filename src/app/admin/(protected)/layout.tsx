"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { useAuth } from '@/components/admin/AuthProvider';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // AuthProvider will redirect
    }

    return (
        <div className="flex min-h-screen bg-muted/10">
            {/* Sidebar */}
            <AdminSidebar
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Content */}
            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                isCollapsed ? "md:ml-[5rem]" : "md:ml-[16rem]"
            )}>
                {/* Navbar */}
                <AdminNavbar onMobileMenuClick={() => setMobileOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
