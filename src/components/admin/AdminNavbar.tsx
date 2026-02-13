"use client";

import { useAuth } from '@/components/admin/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, Settings } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AdminNavbarProps {
    onMobileMenuClick: () => void;
}

export default function AdminNavbar({ onMobileMenuClick }: AdminNavbarProps) {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-30 w-full bg-background border-b border-border shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 gap-2">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={onMobileMenuClick}
                        className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Breadcrumbs Section */}
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex flex-col sm:hidden">
                            <h1 className="font-bebas text-xl tracking-wide leading-none">Admin</h1>
                        </div>
                        <div className="hidden sm:block">
                            <AdminBreadcrumbs />
                        </div>
                    </div>
                </div>

                {/* Mobile Breadcrumbs Row */}
                <div className="sm:hidden w-full mt-3 pt-3 border-t border-border flex">
                    <AdminBreadcrumbs />
                </div>

                {/* Mobile Action Row */}
                <div className="sm:hidden w-full mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold font-manrope leading-none">
                                {user?.name || 'Administrator'}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Verified User
                            </span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-none border-border h-9 w-9 bg-card hover:bg-muted"
                            >
                                <User className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-none border-border">
                            <DropdownMenuLabel className="font-bebas tracking-wide text-lg">My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                                <Link href="/admin/settings" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 rounded-none cursor-pointer"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                    <ThemeToggle />

                    <div className="flex flex-col items-end mr-2">
                        <span className="text-sm font-bold font-manrope leading-none">
                            {user?.name || 'Administrator'}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Verified User
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-none border-border h-9 w-9 bg-card hover:bg-muted"
                            >
                                <User className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-none border-border">
                            <DropdownMenuLabel className="font-bebas tracking-wide text-lg">My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                                <Link href="/admin/settings" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 rounded-none cursor-pointer"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
