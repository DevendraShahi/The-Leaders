'use client';

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
    Menu,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Articles', href: '/admin/content?type=articles', icon: FileText },
        { label: 'Leaders', href: '/admin/content?type=leaders', icon: Users },
        { label: 'History', href: '/admin/content?type=history', icon: History },
        { label: 'Media', href: '/admin/media', icon: ImageIcon },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const sidebarVariants = {
        expanded: { width: '16rem' },
        collapsed: { width: '5rem' },
    };

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <motion.aside
                initial="expanded"
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                variants={sidebarVariants}
                className={cn(
                    "fixed md:relative z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 flex flex-col transition-all duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
                    {!isCollapsed && (
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            The Leaders
                        </span>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hidden md:block"
                    >
                        {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                </div>

                {/* User Profile (Mini) */}
                {!isCollapsed && user && (
                    <div className="p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.name?.[0] || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500")} />
                                {!isCollapsed && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Unified Content Link Shortcut (Optional) */}
                    {!isCollapsed && (
                        <div className="mt-6 px-3">
                            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                New
                            </p>
                            <Link
                                href="/admin/content/article/new"
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
                            >
                                <Sparkles className="h-4 w-4" />
                                Create Content
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                            isCollapsed && "justify-center px-0"
                        )}
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}
