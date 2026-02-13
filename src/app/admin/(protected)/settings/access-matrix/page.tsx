'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/admin/AuthProvider';
import { toast } from 'sonner';
import { IPermissions } from '@/models/Admin';

type AdminUser = {
    _id: string;
    name?: string;
    username: string;
    email: string;
    role: 'superadmin' | 'cto' | 'editorial' | 'cmo';
    isActive: boolean;
    permissions: IPermissions;
};

const PAGE_KEYS: Array<keyof IPermissions['pageAccess']> = [
    'dashboard',
    'content',
    'media',
    'messages',
    'settings',
    'users',
];

const PAGE_LABELS: Record<keyof IPermissions['pageAccess'], string> = {
    dashboard: 'Dashboard',
    content: 'Content',
    media: 'Media',
    messages: 'Messages',
    settings: 'Settings',
    users: 'Manage Admins',
};

function normalizePageAccess(permissions?: IPermissions) {
    return {
        dashboard: Boolean(permissions?.pageAccess?.dashboard),
        content: Boolean(permissions?.pageAccess?.content),
        media: Boolean(permissions?.pageAccess?.media),
        messages: Boolean(permissions?.pageAccess?.messages),
        settings: Boolean(permissions?.pageAccess?.settings),
        users: Boolean(permissions?.pageAccess?.users),
    };
}

export default function AccessMatrixPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [savingById, setSavingById] = useState<Record<string, boolean>>({});
    const [admins, setAdmins] = useState<AdminUser[]>([]);

    const isSuperAdmin = user?.role === 'superadmin';

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users', { credentials: 'include', cache: 'no-store' });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(data?.error || 'Failed to load admins');
            }
            const rows = (data.data || []) as AdminUser[];
            setAdmins(rows);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load access matrix');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isSuperAdmin) {
            setLoading(false);
            return;
        }
        loadAdmins();
    }, [isSuperAdmin]);

    const updateLocalToggle = (adminId: string, key: keyof IPermissions['pageAccess'], value: boolean) => {
        setAdmins((prev) =>
            prev.map((admin) => {
                if (admin._id !== adminId) return admin;
                return {
                    ...admin,
                    permissions: {
                        ...admin.permissions,
                        pageAccess: {
                            ...normalizePageAccess(admin.permissions),
                            [key]: value,
                        },
                    },
                };
            })
        );
    };

    const saveAdminAccess = async (target: AdminUser) => {
        try {
            setSavingById((prev) => ({ ...prev, [target._id]: true }));
            const payload = {
                permissions: {
                    ...target.permissions,
                    pageAccess: normalizePageAccess(target.permissions),
                },
            };

            const res = await fetch(`/api/admin/users/${target._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data?.success) {
                throw new Error(data?.error || 'Failed to save page access');
            }
            toast.success(`Access updated for ${target.name || target.username}`);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save page access');
        } finally {
            setSavingById((prev) => ({ ...prev, [target._id]: false }));
        }
    };

    const visibleAdmins = useMemo(
        () => admins.filter((admin) => admin.role !== 'superadmin'),
        [admins]
    );

    if (!isSuperAdmin) {
        return (
            <div className="max-w-3xl mx-auto p-4 sm:p-8 border border-border bg-card">
                <h1 className="text-2xl font-bebas uppercase tracking-wide text-foreground">Access Matrix</h1>
                <p className="text-sm text-muted-foreground mt-2">Only super admins can manage page-level access.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border pb-4">
                <div>
                    <Link href="/admin/settings" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-primary mb-2">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Settings
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bebas uppercase tracking-wide text-foreground">Access Matrix</h1>
                    <p className="text-sm text-muted-foreground">Configure which admin pages each account can open.</p>
                </div>
            </div>

            <div className="border border-border bg-card overflow-hidden">
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                    {visibleAdmins.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No manageable admin accounts found.
                        </div>
                    ) : (
                        visibleAdmins.map((admin) => {
                            const pageAccess = normalizePageAccess(admin.permissions);
                            const disabled = !admin.isActive;
                            return (
                                <div key={admin._id} className="p-4 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{admin.name || admin.username}</p>
                                            <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wide bg-muted px-2 py-1 border border-border">
                                            {admin.role}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {PAGE_KEYS.map((key) => (
                                            <label
                                                key={`${admin._id}-${key}`}
                                                className="flex items-center justify-between gap-2 border border-border bg-background px-2 py-2 text-xs"
                                            >
                                                <span className="truncate">{PAGE_LABELS[key]}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={pageAccess[key]}
                                                    disabled={disabled || Boolean(savingById[admin._id])}
                                                    onChange={(e) => updateLocalToggle(admin._id, key, e.target.checked)}
                                                    className="h-4 w-4 accent-primary"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => saveAdminAccess(admin)}
                                        disabled={disabled || Boolean(savingById[admin._id])}
                                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-border hover:bg-muted transition-colors text-xs uppercase tracking-wider font-bold disabled:opacity-50"
                                    >
                                        {savingById[admin._id] ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Save className="h-3.5 w-3.5" />
                                        )}
                                        Save Access
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block w-full overflow-x-auto overscroll-x-contain [touch-action:pan-x] [-webkit-overflow-scrolling:touch]">
                    <table className="w-full min-w-[980px] md:min-w-full">
                        <thead className="bg-muted/20 border-b border-border">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-bold max-md:whitespace-nowrap">Admin</th>
                                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-bold max-md:whitespace-nowrap">Role</th>
                                {PAGE_KEYS.map((key) => (
                                    <th key={key} className="text-center px-3 py-3 text-xs uppercase tracking-wider font-bold max-md:whitespace-nowrap">
                                        {PAGE_LABELS[key]}
                                    </th>
                                ))}
                                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider font-bold max-md:whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleAdmins.map((admin) => {
                                const pageAccess = normalizePageAccess(admin.permissions);
                                const disabled = !admin.isActive;
                                return (
                                    <tr key={admin._id} className="border-t border-border/60">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{admin.name || admin.username}</p>
                                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm uppercase max-md:whitespace-nowrap">{admin.role}</td>
                                        {PAGE_KEYS.map((key) => (
                                            <td key={`${admin._id}-${key}`} className="px-3 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={pageAccess[key]}
                                                    disabled={disabled || Boolean(savingById[admin._id])}
                                                    onChange={(e) => updateLocalToggle(admin._id, key, e.target.checked)}
                                                    className="h-4 w-4 accent-primary"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => saveAdminAccess(admin)}
                                                disabled={disabled || Boolean(savingById[admin._id])}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 border border-border hover:bg-muted transition-colors text-xs uppercase tracking-wider font-bold disabled:opacity-50 max-md:whitespace-nowrap"
                                            >
                                                {savingById[admin._id] ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Save className="h-3.5 w-3.5" />
                                                )}
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {visibleAdmins.length === 0 && (
                                <tr>
                                    <td colSpan={PAGE_KEYS.length + 3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No manageable admin accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="border border-border bg-muted/10 p-4 text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Changes apply immediately after save.
            </div>
        </div>
    );
}
