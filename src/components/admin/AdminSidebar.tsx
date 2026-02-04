"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    UserCog
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ isCollapsed, toggleCollapse, mobileOpen, setMobileOpen }: AdminSidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    // All possible navigation items with role restrictions
    const allNavItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['superadmin', 'cto', 'editorial', 'cmo'] },
        { label: 'Articles', href: '/admin/content?type=articles', icon: FileText, roles: ['superadmin', 'editorial'] },
        { label: 'Leaders', href: '/admin/content?type=leaders', icon: Users, roles: ['superadmin', 'editorial'] },
        { label: 'History', href: '/admin/content?type=history', icon: History, roles: ['superadmin', 'editorial'] },
        { label: 'Media', href: '/admin/media', icon: ImageIcon, roles: ['superadmin', 'editorial'] },
        { label: 'Manage Admins', href: '/admin/users', icon: UserCog, roles: ['superadmin'] },
        { label: 'Analytics', href: '/admin/analytics', icon: Sparkles, roles: ['superadmin', 'cmo', 'editorial'] },
        { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['superadmin', 'cto'] },
    ];

    // Filter nav items based on user role
    const navItems = allNavItems.filter(item =>
        user?.role && item.roles.includes(user.role)
    );

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
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href.split('?')[0]));
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
