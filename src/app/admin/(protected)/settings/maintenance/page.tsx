'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import { toast } from 'sonner';
import { Save, Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MaintenanceRow } from '@/components/admin/MaintenanceRow';

// Default initial state matching the schema
const INITIAL_MAINTENANCE = {
    global: { isActive: false, reason: '' },
    groups: {
        public: {
            isActive: false, reason: '',
            pages: {
                home: { isActive: false, reason: '' },
                about: { isActive: false, reason: '' },
                contact: { isActive: false, reason: '' },
                articles: { isActive: false, reason: '' },
                leaders: { isActive: false, reason: '' },
                history: { isActive: false, reason: '' },
                accessibility: { isActive: false, reason: '' },
                privacy: { isActive: false, reason: '' },
                terms: { isActive: false, reason: '' }
            }
        },
        election: {
            isActive: false, reason: '',
            pages: {
                dashboard: { isActive: false, reason: '' },
                parties: { isActive: false, reason: '' },
                candidates: { isActive: false, reason: '' },
                dailyBrief: { isActive: false, reason: '' },
                factChecks: { isActive: false, reason: '' },
                map: { isActive: false, reason: '' },
                profiles: { isActive: false, reason: '' }
            }
        }
    }
};

export default function MaintenanceSettingsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);

    // Helper to deeply merge maintenance settings
    const mergeMaintenance = (serverData: any) => {
        if (!serverData) return INITIAL_MAINTENANCE;
        return {
            global: { ...INITIAL_MAINTENANCE.global, ...serverData.global },
            groups: {
                public: {
                    ...INITIAL_MAINTENANCE.groups.public,
                    ...serverData.groups?.public,
                    pages: { ...INITIAL_MAINTENANCE.groups.public?.pages, ...serverData.groups?.public?.pages }
                },
                election: {
                    ...INITIAL_MAINTENANCE.groups.election,
                    ...serverData.groups?.election,
                    pages: { ...INITIAL_MAINTENANCE.groups.election?.pages, ...serverData.groups?.election?.pages }
                }
            }
        };
    };

    useEffect(() => {
        const fetchSettings = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/admin/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok && data.data.settings) {
                    setMaintenance(mergeMaintenance(data.data.settings.maintenance));
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [token]);

    const updateMaintenance = (path: string[], newValue: { isActive: boolean, reason?: string }) => {
        setMaintenance(prev => {
            // Deep clone to avoid mutation
            const newState = JSON.parse(JSON.stringify(prev));

            let current = newState;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = newValue;

            return newState;
        });
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // Fetch current settings to preserve other fields
            const currentRes = await fetch('/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            const currentData = await currentRes.json();
            const currentSettings = currentData.data.settings || {};

            // Sanitize: Remove system fields ensuring we don't send immutable fields back
            const { _id, createdAt, updatedAt, __v, ...editableSettings } = currentSettings;

            // Merge maintenance into current editable settings
            const payload = {
                ...editableSettings,
                maintenance: maintenance
            };

            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Maintenance settings updated successfully');
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground animate-pulse">Loading Config...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20 font-manrope animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-border pb-6">
                <div>
                    <Link href="/admin/settings" className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-bold hover:text-primary transition-colors mb-3 group">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to General Settings
                    </Link>
                    <h1 className="text-4xl font-bebas tracking-wide text-foreground uppercase">
                        Maintenance Mode
                    </h1>
                    <p className="text-muted-foreground font-manrope text-sm mt-1">
                        Control Site Access & Downtime
                    </p>
                </div>
                <button
                    disabled={saving}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm font-bold tracking-wider rounded-none shadow-sm hover:shadow-md active:translate-y-[1px]"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Configuration
                </button>
            </div>

            {/* Emergency Global Lock */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-destructive/5 border border-destructive/20 rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-6 border-b border-destructive/20 bg-destructive/10 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bebas tracking-wide flex items-center gap-2 text-destructive uppercase">
                                <ShieldAlert className="h-6 w-6" /> Emergency Global Lock
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1 font-manrope max-w-2xl">
                                Activating this will lock the <span className="font-bold underline text-destructive">ENTIRE</span> platform. Only admins will be able to access the site. Use this only for critical updates or security emergencies.
                            </p>
                        </div>
                    </div>
                    <div className="p-2">
                        <MaintenanceRow
                            label="Enable Global Site Lockdown"
                            path={['global']}
                            state={maintenance.global}
                            onChange={updateMaintenance}
                            isMain
                        />
                    </div>
                </div>

                {/* Sub Groups Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Public Zone */}
                    <div className="bg-card border border-border hover:border-primary/50 transition-colors shadow-sm rounded-none overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h2 className="text-xl font-bebas tracking-wide text-foreground uppercase">
                                Public Marketing Site
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold">
                                Main Landing Pages
                            </p>
                        </div>

                        <div className="divide-y divide-border">
                            <MaintenanceRow
                                label="Lock Entire Public Group"
                                path={['groups', 'public']}
                                state={maintenance.groups.public}
                                onChange={updateMaintenance}
                                isMain
                            />

                            <div className="p-4 bg-muted/5 flex-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4 pl-2 tracking-widest opacity-70">
                                    Individual Page Controls
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.keys(INITIAL_MAINTENANCE.groups.public.pages).map(pageKey => (
                                        <div key={pageKey} className="bg-background border border-border shadow-sm hover:border-primary/30 transition-colors">
                                            <MaintenanceRow
                                                label={pageKey.charAt(0).toUpperCase() + pageKey.slice(1)}
                                                path={['groups', 'public', 'pages', pageKey]}
                                                state={(maintenance.groups.public.pages as any)[pageKey]}
                                                onChange={updateMaintenance}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Election Zone */}
                    <div className="bg-card border border-border hover:border-primary/50 transition-colors shadow-sm rounded-none overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h2 className="text-xl font-bebas tracking-wide text-foreground uppercase">
                                Election 2026 Hub
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold">
                                Campaign & Data Center
                            </p>
                        </div>

                        <div className="divide-y divide-border">
                            <MaintenanceRow
                                label="Lock Entire Election Hub"
                                path={['groups', 'election']}
                                state={maintenance.groups.election}
                                onChange={updateMaintenance}
                                isMain
                            />

                            <div className="p-4 bg-muted/5 flex-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-4 pl-2 tracking-widest opacity-70">
                                    Individual Page Controls
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.keys(INITIAL_MAINTENANCE.groups.election.pages).map(pageKey => (
                                        <div key={pageKey} className="bg-background border border-border shadow-sm hover:border-primary/30 transition-colors">
                                            <MaintenanceRow
                                                label={pageKey.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                                                path={['groups', 'election', 'pages', pageKey]}
                                                state={(maintenance.groups.election.pages as any)[pageKey]}
                                                onChange={updateMaintenance}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
