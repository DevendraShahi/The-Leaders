"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, Image as ImageIcon, Mail, Newspaper, PenTool, Settings, Users, UserRoundCog } from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";
import type { AdminPageKey } from "@/lib/admin-page-access";

const shortcuts: { label: string; href: string; access: AdminPageKey; icon: typeof FileText; superadminOnly?: boolean }[] = [
    { label: "Articles", href: "/admin/content?type=articles", access: "content", icon: FileText },
    { label: "Leaders", href: "/admin/content?type=leaders", access: "content", icon: Users },
    { label: "Daily briefs", href: "/admin/content?type=briefs", access: "content", icon: Newspaper },
    { label: "Media", href: "/admin/media", access: "media", icon: ImageIcon },
    { label: "Studio", href: "/admin/social", access: "content", icon: PenTool },
    { label: "Messages", href: "/admin/messages", access: "messages", icon: Mail },
    { label: "Settings", href: "/admin/settings", access: "settings", icon: Settings },
    { label: "Admin accounts", href: "/admin/users", access: "users", icon: UserRoundCog, superadminOnly: true },
];

export default function AdminDashboard() {
    const { user } = useAuth();
    const available = shortcuts.filter(item => user?.role === "superadmin"
        || (!item.superadminOnly && user?.permissions?.pageAccess?.[item.access]));

    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-6">
                <h1 className="font-bebas text-4xl tracking-wide text-foreground">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">Choose a workspace to get started.</p>
            </div>
            <nav aria-label="Admin workspaces" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {available.map(({ label, href, icon: Icon }) => (
                    <Link key={href} href={href} prefetch={false}
                        className="flex items-center gap-3 border border-border bg-card p-5 text-foreground transition-colors hover:border-primary hover:bg-muted/30">
                        <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                        <span className="flex-1 font-medium">{label}</span>
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    </Link>
                ))}
            </nav>
        </div>
    );
}
