"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { useAuth } from '@/components/admin/AuthProvider';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { firstAllowedAdminPage, hasAdminPageAccess, resolveRequiredAdminPage } from '@/lib/admin-page-access';


export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const requiredPage = useMemo(() => resolveRequiredAdminPage(pathname || ''), [pathname]);
    const hasAccess = useMemo(() => {
        if (user?.role === 'superadmin') return true;
        if (!requiredPage) return true;
        return hasAdminPageAccess(user?.permissions as any, requiredPage);
    }, [requiredPage, user]);

    useEffect(() => {
        if (isLoading || !isAuthenticated || !user) return;
        if (hasAccess) return;
        const fallback = firstAllowedAdminPage(user.permissions as any);
        if (fallback) {
            router.replace(fallback);
        } else {
            router.replace('/admin/login');
        }
    }, [hasAccess, isAuthenticated, isLoading, router, user]);

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
    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
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
                "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out",
                isCollapsed ? "md:ml-[5rem]" : "md:ml-[16rem]"
            )}>
                {/* Navbar */}
                <AdminNavbar onMobileMenuClick={() => setMobileOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
                    <div className="max-w-[1600px] min-w-0 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
