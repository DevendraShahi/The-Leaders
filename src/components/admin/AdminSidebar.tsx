"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import {
    LayoutDashboard,
    FileText,
    Users,
    History,
    Image as ImageIcon,
    Settings,
    LogOut,
    ChevronLeft,
    Sparkles,
    UserCog,
    Mail,
    BarChart3,
    ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AdminPageKey, hasAdminPageAccess } from '@/lib/admin-page-access';

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ isCollapsed, toggleCollapse, mobileOpen, setMobileOpen }: AdminSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { logout, user } = useAuth();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        Analytics: pathname?.startsWith('/admin/analytics') || false,
        Content: pathname?.startsWith('/admin/content') || false,
        Settings: pathname?.startsWith('/admin/settings') || false,
    });

    useEffect(() => {
        if (pathname?.startsWith('/admin/analytics')) setOpenGroups((prev) => ({ ...prev, Analytics: true }));
        if (pathname?.startsWith('/admin/content')) setOpenGroups((prev) => ({ ...prev, Content: true }));
        if (pathname?.startsWith('/admin/settings')) setOpenGroups((prev) => ({ ...prev, Settings: true }));
    }, [pathname]);

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, access: 'dashboard' as AdminPageKey },
        {
            label: 'Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
            access: 'dashboard' as AdminPageKey,
            children: [
                { label: 'Overview', href: '/admin/analytics' },
                { label: 'Content', href: '/admin/analytics/content' },
                { label: 'Election', href: '/admin/analytics/election' },
                { label: 'Audience', href: '/admin/analytics/audience' },
            ],
        },
        {
            label: 'Content',
            href: '/admin/content?type=articles',
            icon: FileText,
            access: 'content' as AdminPageKey,
            children: [
                { label: 'Articles', href: '/admin/content?type=articles' },
                { label: 'Election Articles', href: '/admin/content?type=election-articles' },
                { label: 'Leaders', href: '/admin/content?type=leaders' },
                { label: 'History', href: '/admin/content?type=history' },
                { label: 'Daily Brief', href: '/admin/content?type=briefs' },
                { label: 'Fact Check', href: '/admin/content?type=fact-checks' },
                { label: 'Vote Count', href: '/admin/content/vote-counts' },
            ],
        },
        { label: 'Media', href: '/admin/media', icon: ImageIcon, access: 'media' as AdminPageKey },
        { label: 'Messages', href: '/admin/messages', icon: Mail, access: 'messages' as AdminPageKey },
        {
            label: 'Settings',
            href: '/admin/settings',
            icon: Settings,
            access: 'settings' as AdminPageKey,
            children: [
                { label: 'System Settings', href: '/admin/settings' },
                { label: 'Maintenance', href: '/admin/settings/maintenance' },
                { label: 'Access Matrix', href: '/admin/settings/access-matrix' },
            ],
        },
    ];
    const canAccess = (key: AdminPageKey) => user?.role === 'superadmin' || hasAdminPageAccess(user?.permissions as any, key);
    const filteredNavItems = navItems.filter((item) => canAccess(item.access));

    const isLinkActive = (href: string): boolean => {
        const [targetPath, targetQuery] = href.split('?');
        if (!targetPath) return false;
        if (pathname !== targetPath && !pathname?.startsWith(targetPath)) return false;
        if (!targetQuery) return pathname === targetPath || (targetPath !== '/admin' && pathname?.startsWith(targetPath));
        const query = new URLSearchParams(targetQuery);
        for (const [key, value] of query.entries()) {
            if (searchParams.get(key) !== value) return false;
        }
        return true;
    };

    const sidebarVariants = {
        expanded: { width: '16rem' },
        collapsed: { width: '5rem' },
    };

    return (
        <>
            {/* Sidebar */}
            <motion.aside
                initial="expanded"
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={sidebarVariants}
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-muted/20">
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="font-bebas text-2xl tracking-wide text-foreground">
                                The Leaders
                            </span>
                        </div>
                    )}
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 hover:bg-accent text-muted-foreground hidden md:block rounded-none transition-colors"
                    >
                        <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {/* SuperAdmin Only: Manage Admins */}
                    {user?.role === 'superadmin' && canAccess('users') && (
                        <Link
                            href="/admin/users"
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 transition-all group border-l-2",
                                pathname === '/admin/users'
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                            title={isCollapsed ? 'Manage Admins' : undefined}
                            onClick={() => setMobileOpen(false)}
                        >
                            <UserCog className={cn("h-5 w-5 flex-shrink-0", pathname === '/admin/users' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {!isCollapsed && (
                                <span className="font-mono text-sm uppercase tracking-wider font-medium">Manage Admins</span>
                            )}
                        </Link>
                    )}

                    {filteredNavItems.map((item) => {
                        const isActive = isLinkActive(item.href);
                        const hasChildren = Array.isArray((item as any).children) && (item as any).children.length > 0;
                        if (hasChildren && !isCollapsed) {
                            const children = (item as any).children as Array<{ label: string; href: string }>;
                            const groupKey = item.label;
                            const groupOpen = Boolean(openGroups[groupKey]);
                            return (
                                <div key={item.href} className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-3 transition-all group border-l-2",
                                            isActive
                                                ? "bg-primary/5 border-primary text-primary"
                                                : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                        <span className="font-mono text-sm uppercase tracking-wider font-medium flex-1 text-left">{item.label}</span>
                                        <ChevronDown className={cn("h-4 w-4 transition-transform", groupOpen && "rotate-180")} />
                                    </button>

                                    {groupOpen && (
                                        <div className="ml-8 border-l border-border pl-3 space-y-1">
                                            {children.map((child) => {
                                                const childActive = isLinkActive(child.href);
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cn(
                                                            "block px-2 py-2 text-xs uppercase tracking-wider font-mono border-l-2",
                                                            childActive
                                                                ? "border-primary text-primary bg-primary/5"
                                                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                                                        )}
                                                        onClick={() => setMobileOpen(false)}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 transition-all group border-l-2",
                                    isActive
                                        ? "bg-primary/5 border-primary text-primary"
                                        : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                                title={isCollapsed ? item.label : undefined}
                                onClick={() => setMobileOpen(false)}
                            >
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {!isCollapsed && (
                                    <span className="font-mono text-sm uppercase tracking-wider font-medium">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Quick Action */}
                    {!isCollapsed && (
                        <div className="mt-8 px-3">
                            <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                                Quick Actions
                            </p>
                            <Link
                                href="/admin/content/article/new"
                                className="flex items-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-muted-foreground transition-colors text-sm font-bold font-mono uppercase tracking-wide rounded-none group"
                            >
                                <Sparkles className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                                New Article
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-border bg-muted/20 space-y-4">
                    {/* Theme Toggle Row */}
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                        {!isCollapsed && (
                            <span className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider">
                                Switch Mode
                            </span>
                        )}
                        <ThemeToggle />
                    </div>

                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors uppercase font-mono text-xs font-bold tracking-wider rounded-none",
                            isCollapsed && "justify-center px-0"
                        )}
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}
