"use client";

import { useState, useEffect } from "react";
import { IAdmin, IPermissions } from "@/models/Admin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { toast } from "sonner";
import { Trash2, Edit, Plus, Power, PowerOff } from "lucide-react";

interface AdminUser extends Omit<IAdmin, '_id'> {
    _id: string;
}

const PAGE_ACCESS_LABELS: Record<keyof IPermissions['pageAccess'], string> = {
    dashboard: 'Dashboard',
    content: 'Content',
    media: 'Media',
    messages: 'Messages',
    settings: 'Settings',
    users: 'Manage Admins',
};

function getDefaultPageAccess(role: IAdmin['role']): IPermissions['pageAccess'] {
    if (role === 'cto') return { dashboard: true, content: false, media: true, messages: true, settings: true, users: false };
    if (role === 'editorial') return { dashboard: true, content: true, media: true, messages: true, settings: false, users: false };
    if (role === 'cmo') return { dashboard: true, content: false, media: true, messages: true, settings: false, users: false };
    return { dashboard: true, content: true, media: true, messages: true, settings: true, users: true };
}

function normalizePageAccess(admin?: Partial<AdminUser> | null): IPermissions['pageAccess'] {
    const fallbackRole = (admin?.role || 'editorial') as IAdmin['role'];
    return {
        ...getDefaultPageAccess(fallbackRole),
        ...(admin?.permissions?.pageAccess || {}),
    };
}

export default function AdminUsersPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setError(null);
            const res = await fetch('/api/admin/users', {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setAdmins(Array.isArray(data.data) ? data.data : []);
            } else {
                const message = data.error || 'Failed to fetch admins';
                setError(message);
                console.error('Failed to fetch admins:', message);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            setError('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const executeDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                fetchAdmins();
            } else {
                const data = await res.json();
                setError(data?.error || 'Failed to delete admin');
            }
        } catch (error) {
            console.error('Failed to delete admin:', error);
            setError('Failed to delete admin');
        }
    };

    const handleDelete = async (id: string) => {
        setPendingDeleteId(id);
    };

    const handleToggleActive = async (admin: AdminUser) => {
        try {
            const res = await fetch(`/api/admin/users/${admin._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !admin.isActive }),
                credentials: 'include'
            });
            if (res.ok) {
                fetchAdmins();
            } else {
                const data = await res.json();
                setError(data?.error || 'Failed to update admin status');
            }
        } catch (error) {
            console.error('Failed to update admin:', error);
            setError('Failed to update admin status');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        const colors = {
            cto: 'bg-blue-100 text-blue-700',
            editorial: 'bg-green-100 text-green-700',
            cmo: 'bg-purple-100 text-purple-700',
        };
        return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700';
    };

    if (loading) return <div className="p-4 sm:p-6">Loading...</div>;

    return (
        <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bebas uppercase tracking-wide">Admin Management</h1>
                    <p className="text-muted-foreground mt-1">Manage admin users and their permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                    <Plus size={20} />
                    Create Admin
                </button>
            </div>

            <div className="bg-card border border-border overflow-hidden">
                {error && (
                    <div className="px-6 py-4 border-b border-border text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                    {admins.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">No admin users found.</div>
                    ) : (
                        admins.map((admin) => (
                            <div key={admin._id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium truncate">{admin.name || admin.username}</div>
                                        <div className="text-xs text-muted-foreground truncate">@{admin.username}</div>
                                        <div className="text-xs text-muted-foreground truncate mt-1">{admin.email}</div>
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${getRoleBadgeColor(admin.role)}`}>
                                        {admin.role}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-1 font-medium ${admin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {admin.isActive ? <Power size={12} /> : <PowerOff size={12} />}
                                        {admin.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {admin.role !== 'superadmin' ? (
                                        <>
                                            <button
                                                onClick={() => handleToggleActive(admin)}
                                                className="flex-1 px-3 py-2 border border-border text-xs uppercase tracking-wide hover:bg-muted transition-colors"
                                            >
                                                {admin.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setEditingAdmin(admin)}
                                                className="flex-1 px-3 py-2 border border-border text-xs uppercase tracking-wide hover:bg-muted transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin._id)}
                                                className="px-3 py-2 border border-destructive/40 text-destructive text-xs uppercase tracking-wide hover:bg-destructive/10 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">Super Admin</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block w-full overflow-x-auto overscroll-x-contain [touch-action:pan-x] [-webkit-overflow-scrolling:touch]">
                    <table className="w-full min-w-[820px] md:min-w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-6 py-4 font-bebas uppercase tracking-wide max-md:whitespace-nowrap">Name</th>
                                <th className="text-left px-6 py-4 font-bebas uppercase tracking-wide max-md:whitespace-nowrap">Email</th>
                                <th className="text-left px-6 py-4 font-bebas uppercase tracking-wide max-md:whitespace-nowrap">Role</th>
                                <th className="text-left px-6 py-4 font-bebas uppercase tracking-wide max-md:whitespace-nowrap">Status</th>
                                <th className="text-left px-6 py-4 font-bebas uppercase tracking-wide max-md:whitespace-nowrap">Created</th>
                                <th className="text-right px-6 py-4 font-bebas uppercase tracking-wide max-md:whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin) => (
                                <tr key={admin._id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{admin.name || admin.username}</div>
                                        <div className="text-sm text-muted-foreground">@{admin.username}</div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground max-md:whitespace-nowrap">{admin.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${getRoleBadgeColor(admin.role)}`}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-2 w-fit px-3 py-1 text-xs font-medium ${admin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {admin.isActive ? <Power size={14} /> : <PowerOff size={14} />}
                                            {admin.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground text-sm max-md:whitespace-nowrap">
                                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {admin.role !== 'superadmin' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleActive(admin)}
                                                        className="p-2 hover:bg-muted transition-colors"
                                                        title={admin.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {admin.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingAdmin(admin)}
                                                        className="p-2 hover:bg-muted transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin._id)}
                                                        className="p-2 hover:bg-destructive/10 text-destructive transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic px-2 max-md:whitespace-nowrap">
                                                    Super Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreateAdminModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchAdmins}
                />
            )}

            {editingAdmin && (
                <EditAdminModal
                    admin={editingAdmin}
                    onClose={() => setEditingAdmin(null)}
                    onSuccess={fetchAdmins}
                />
            )}

            <ConfirmDialog
                open={!!pendingDeleteId}
                onOpenChange={(open) => {
                    if (!open) setPendingDeleteId(null);
                }}
                title="Delete this admin?"
                description="This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={async () => {
                    if (!pendingDeleteId) return;
                    await executeDelete(pendingDeleteId);
                    setPendingDeleteId(null);
                }}
            />
        </div>
    );
}

// Create Admin Modal Component
function CreateAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        name: '',
        role: 'editorial' as IAdmin['role'],
        pageAccess: getDefaultPageAccess('editorial'),
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const customPermissions = {
                articles: formData.role === 'editorial'
                    ? { create: true, edit: true, delete: true, publish: true }
                    : { create: false, edit: false, delete: false, publish: false },
                settings: formData.role === 'cto'
                    ? { view: true, modify: true }
                    : { view: false, modify: false },
                users: { view: false, manage: false },
                analytics: formData.role === 'cmo'
                    ? { view: true, viewAll: true }
                    : { view: true, viewAll: false },
                pageAccess: formData.pageAccess,
            };
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    role: formData.role,
                    customPermissions,
                }),
                credentials: 'include'
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to create admin');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            toast.error('Failed to create admin');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bebas uppercase tracking-wide mb-6">Create New Admin</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 bg-muted border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-2 bg-muted border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 bg-muted border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Name (Optional)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-muted border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => {
                                const nextRole = e.target.value as IAdmin['role'];
                                setFormData({ ...formData, role: nextRole, pageAccess: getDefaultPageAccess(nextRole) });
                            }}
                            className="w-full px-4 py-2 bg-muted border border-border focus:border-primary outline-none"
                        >
                            <option value="editorial">Editorial</option>
                            <option value="cto">CTO</option>
                            <option value="cmo">CMO</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Page Access</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(PAGE_ACCESS_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={formData.pageAccess[key as keyof IPermissions['pageAccess']]}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                pageAccess: {
                                                    ...prev.pageAccess,
                                                    [key]: e.target.checked,
                                                },
                                            }))
                                        }
                                        className="w-4 h-4"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-primary text-primary-foreground py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Admin'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-border py-2 hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Edit Admin Modal Component (simplified)
function EditAdminModal({ admin, onClose, onSuccess }: { admin: AdminUser; onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: admin.name || '',
        role: admin.role,
        isActive: admin.isActive,
        pageAccess: normalizePageAccess(admin),
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`/api/admin/users/${admin._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    role: formData.role,
                    isActive: formData.isActive,
                    permissions: {
                        ...admin.permissions,
                        pageAccess: formData.pageAccess,
                    },
                }),
                credentials: 'include'
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update admin');
            }
        } catch (error) {
            console.error('Error updating admin:', error);
            toast.error('Failed to update admin');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bebas uppercase tracking-wide mb-6">Edit Admin</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-muted border border-border focus:border-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => {
                                const nextRole = e.target.value as IAdmin['role'];
                                setFormData({
                                    ...formData,
                                    role: nextRole,
                                    pageAccess: {
                                        ...getDefaultPageAccess(nextRole),
                                        ...formData.pageAccess,
                                    },
                                });
                            }}
                            className="w-full px-4 py-2 bg-muted border border-border focus:border-primary outline-none"
                        >
                            <option value="editorial">Editorial</option>
                            <option value="cto">CTO</option>
                            <option value="cmo">CMO</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Page Access</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(PAGE_ACCESS_LABELS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={formData.pageAccess[key as keyof IPermissions['pageAccess']]}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                pageAccess: {
                                                    ...prev.pageAccess,
                                                    [key]: e.target.checked,
                                                },
                                            }))
                                        }
                                        className="w-4 h-4"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-primary text-primary-foreground py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Updating...' : 'Update Admin'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-border py-2 hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
