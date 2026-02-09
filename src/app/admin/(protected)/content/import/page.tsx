'use client';

import { useState } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CircleHelp, Loader2 } from 'lucide-react';

export default function PerplexityImportPage() {
    const { token } = useAuth();
    const [rawContent, setRawContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [errors, setErrors] = useState<Array<{ path: string; message: string }>>([]);
    const [warnings, setWarnings] = useState<Array<{ path: string; message: string }>>([]);
    const [snapshotId, setSnapshotId] = useState<string | null>(null);
    const [confirmRollbackOpen, setConfirmRollbackOpen] = useState(false);
    const [localeMode, setLocaleMode] = useState<'auto' | 'en' | 'ne' | 'both'>('auto');
    const [updateMode, setUpdateMode] = useState<'auto' | 'merge' | 'replace'>('auto');

    const parseRequestBody = () => {
        let requestBody: unknown = rawContent;
        try {
            requestBody = JSON.parse(rawContent);
        } catch {
            requestBody = rawContent;
        }
        return requestBody;
    };

    const runImport = async (dryRun: boolean) => {
        if (!token) {
            toast.error('You must be logged in as admin');
            return;
        }
        if (!rawContent.trim()) {
            toast.error('Please paste the Perplexity response first');
            return;
        }

        if (dryRun) setIsValidating(true);
        else setIsSubmitting(true);
        setResult(null);
        setErrors([]);
        setWarnings([]);
        if (!dryRun) setSnapshotId(null);

        try {
            const requestBody = parseRequestBody();
            const params = new URLSearchParams();
            if (dryRun) params.set('dryRun', 'true');
            if (localeMode !== 'auto') params.set('localeMode', localeMode);
            if (updateMode !== 'auto') params.set('updateMode', updateMode);

            const queryString = params.toString();
            const endpoint = `/api/admin/perplexity-ingest${queryString ? `?${queryString}` : ''}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();

            if (!res.ok) {
                const apiErrors = Array.isArray(data?.errors) ? data.errors : [];
                setErrors(apiErrors);
                const firstError = apiErrors[0];
                toast.error(
                    firstError
                        ? `${firstError.path}: ${firstError.message}`
                        : 'Failed to ingest content'
                );
            } else {
                toast.success(dryRun ? 'Validation completed' : 'Content ingested successfully');
                setResult(data.data || null);
                setErrors(Array.isArray(data?.errors) ? data.errors : []);
                setWarnings(Array.isArray(data?.warnings) ? data.warnings : []);
                setSnapshotId(typeof data?.snapshotId === 'string' ? data.snapshotId : null);
            }
        } catch (error) {
            console.error(error);
            toast.error('Unexpected error while ingesting content');
        } finally {
            if (dryRun) setIsValidating(false);
            else setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await runImport(false);
    };

    const handleValidate = async () => {
        await runImport(true);
    };

    const handleRollback = async () => {
        if (!token || !snapshotId) return;

        setIsRollingBack(true);
        try {
            const res = await fetch('/api/admin/perplexity-ingest/rollback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ snapshotId }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.error || 'Rollback failed');
            } else {
                toast.success('Rollback completed');
                setSnapshotId(null);
            }
        } catch (error) {
            console.error(error);
            toast.error('Unexpected error while rolling back');
        } finally {
            setIsRollingBack(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div className="border-b border-border pb-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h1 className="font-bebas text-4xl text-foreground tracking-wide">
                        Import Perplexity Brief
                    </h1>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-none font-mono uppercase text-xs h-10"
                            >
                                <CircleHelp className="h-3.5 w-3.5 mr-2" />
                                How to use
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-none max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="font-bebas text-3xl tracking-wide">
                                    Import Instructions
                                </DialogTitle>
                                <DialogDescription className="font-manrope text-sm text-muted-foreground">
                                    Use this flow to avoid partial language updates and safely recover from mistakes.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 font-manrope text-sm">
                                <div className="border border-border p-3 rounded-none">
                                    <p className="font-semibold text-foreground mb-2">Recommended flow</p>
                                    <p className="text-muted-foreground">1. Paste one full JSON object (meta + dailyBriefs + factChecks + articles).</p>
                                    <p className="text-muted-foreground">2. Select mode overrides only if you want to force behavior.</p>
                                    <p className="text-muted-foreground">3. Click Validate Only and fix parser errors first.</p>
                                    <p className="text-muted-foreground">4. Review warnings (missing EN/NE fields) before import.</p>
                                    <p className="text-muted-foreground">5. Click Import from Perplexity when clean.</p>
                                </div>

                                <div className="border border-border p-3 rounded-none">
                                    <p className="font-semibold text-foreground mb-2">Mode options</p>
                                    <p className="text-muted-foreground"><span className="font-mono">Locale mode</span>: Auto reads payload meta. Use EN/NE/Both to force localized merge.</p>
                                    <p className="text-muted-foreground"><span className="font-mono">Update mode</span>: Merge keeps existing locale fields; Replace overwrites targeted locale fields.</p>
                                </div>

                                <div className="border border-border p-3 rounded-none">
                                    <p className="font-semibold text-foreground mb-2">Rollback</p>
                                    <p className="text-muted-foreground">Every successful import creates a snapshot ID. Use Rollback Last Import to restore previous DB state for affected slugs.</p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-muted-foreground font-manrope text-sm mt-1 max-w-2xl">
                    Paste JSON payload. Use Validate Only first to catch parser errors and missing locale fields.
                    Import creates a rollback snapshot for one-click revert.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium font-manrope">
                        Perplexity Output
                    </label>
                    <Textarea
                        value={rawContent}
                        onChange={(e) => setRawContent(e.target.value)}
                        placeholder="Paste the JSON payload here (no extra text)..."
                        className="min-h-[320px] font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground font-manrope">
                        Tip: raw JSON object or fenced json block only.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium font-manrope">
                            Locale mode override
                        </label>
                        <select
                            value={localeMode}
                            onChange={(e) => setLocaleMode(e.target.value as 'auto' | 'en' | 'ne' | 'both')}
                            className="w-full h-10 px-3 border border-border bg-background text-foreground text-sm font-manrope rounded-none"
                        >
                            <option value="auto">Auto (use payload meta)</option>
                            <option value="both">Both (EN + NE)</option>
                            <option value="en">English only</option>
                            <option value="ne">Nepali only</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium font-manrope">
                            Update mode override
                        </label>
                        <select
                            value={updateMode}
                            onChange={(e) => setUpdateMode(e.target.value as 'auto' | 'merge' | 'replace')}
                            className="w-full h-10 px-3 border border-border bg-background text-foreground text-sm font-manrope rounded-none"
                        >
                            <option value="auto">Auto (use payload meta)</option>
                            <option value="merge">Merge (recommended)</option>
                            <option value="replace">Replace targeted locale fields</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidate}
                        disabled={isValidating || isSubmitting}
                        className="rounded-none font-mono uppercase text-xs h-10"
                    >
                        {isValidating && (
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                        )}
                        Validate Only
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || isValidating}
                        className="rounded-none font-mono uppercase text-xs h-10"
                    >
                        {isSubmitting && (
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                        )}
                        Import from Perplexity
                    </Button>
                    {snapshotId && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setConfirmRollbackOpen(true)}
                            disabled={isRollingBack}
                            className="rounded-none font-mono uppercase text-xs h-10"
                        >
                            {isRollingBack && (
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                            )}
                            Rollback Last Import
                        </Button>
                    )}
                </div>
            </form>

            {result && (
                <div className="border border-border bg-card p-4 text-sm font-manrope space-y-2">
                    <p className="font-semibold text-foreground">
                        Import summary
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                            <div className="font-semibold text-foreground">Election Articles</div>
                            <div>Mapped: {result.articles?.length ?? 0}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-foreground">Daily Brief</div>
                            <div>Mapped: {result.dailyBriefs?.length ?? 0}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-foreground">Fact Checks</div>
                            <div>Mapped: {result.factChecks?.length ?? 0}</div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Mode used: locale=<span className="font-mono">{result?.meta?.locale_mode || 'n/a'}</span>, update=<span className="font-mono">{result?.meta?.update_mode || 'n/a'}</span>
                    </p>
                    {snapshotId && (
                        <p className="text-xs text-muted-foreground font-mono">Snapshot: {snapshotId}</p>
                    )}
                </div>
            )}

            <ConfirmDialog
                open={confirmRollbackOpen}
                onOpenChange={setConfirmRollbackOpen}
                title="Rollback last import?"
                description="This restores previous DB state for all affected slugs."
                confirmLabel="Rollback"
                variant="destructive"
                isLoading={isRollingBack}
                onConfirm={async () => {
                    await handleRollback();
                    setConfirmRollbackOpen(false);
                }}
            />

            {errors.length > 0 && (
                <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm font-manrope space-y-2">
                    <p className="font-semibold text-foreground">
                        Parser errors
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                        {errors.slice(0, 15).map((error, index) => (
                            <p key={`${error.path}-${index}`}>
                                {error.path}: {error.message}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {warnings.length > 0 && (
                <div className="border border-amber-500/40 bg-amber-500/5 p-4 text-sm font-manrope space-y-2">
                    <p className="font-semibold text-foreground">
                        Warnings (non-blocking)
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                        {warnings.slice(0, 25).map((warning, index) => (
                            <p key={`${warning.path}-${index}`}>
                                {warning.path}: {warning.message}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
