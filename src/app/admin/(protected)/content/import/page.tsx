'use client';

import { useState } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function PerplexityImportPage() {
    const { token } = useAuth();
    const [rawContent, setRawContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error('You must be logged in as admin');
            return;
        }
        if (!rawContent.trim()) {
            toast.error('Please paste the Perplexity response first');
            return;
        }

        setIsSubmitting(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/perplexity-ingest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(rawContent),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error('Failed to ingest content');
            } else {
                toast.success('Content ingested successfully');
                setResult(data.data || null);
            }
        } catch (error) {
            console.error(error);
            toast.error('Unexpected error while ingesting content');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div className="border-b border-border pb-6">
                <h1 className="font-bebas text-4xl text-foreground tracking-wide">
                    Import Perplexity Brief
                </h1>
                <p className="text-muted-foreground font-manrope text-sm mt-1 max-w-2xl">
                    Paste the JSON payload ONLY. The parser is strict and will reject any extra text.
                    We will validate the schema, map fields, and store the data in the election content database.
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
                        Tip: paste the raw JSON object only. The parser will not accept surrounding text.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-none font-mono uppercase text-xs h-10"
                    >
                        {isSubmitting && (
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                        )}
                        Import from Perplexity
                    </Button>
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
                </div>
            )}
        </div>
    );
}
