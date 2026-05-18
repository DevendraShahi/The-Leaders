'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/components/admin/AuthProvider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clipboard,
    Download,
    FileJson,
    Languages,
    Layers3,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Upload,
    XCircle,
} from 'lucide-react';

type ContentTypeKey =
    | 'articles'
    | 'leaders'
    | 'history'
    | 'dailyBriefs'
    | 'factChecks'
    | 'electionArticles'
    | 'columnArticles';

type ValidationItem = {
    type: ContentTypeKey;
    index: number;
    path: string;
    title: string;
    slug: string;
    status: string;
    action: 'create' | 'update' | 'skip' | 'error';
    languageCoverage: 'both' | 'en' | 'ne' | 'missing';
    errors: string[];
    warnings: string[];
};

type ValidationResult = {
    ok: boolean;
    meta: Record<string, string>;
    items: ValidationItem[];
    stats: {
        total: number;
        byType: Record<ContentTypeKey, number>;
        actions: Record<'create' | 'update' | 'skip' | 'error', number>;
        languages: Record<'both' | 'enOnly' | 'neOnly' | 'missingEn' | 'missingNe' | 'missing', number>;
        statuses: Record<'draft' | 'published' | 'archived', number>;
        errors: number;
        warnings: number;
    };
};

const contentTypes: { key: ContentTypeKey; label: string; hint: string }[] = [
    { key: 'articles', label: 'Article', hint: 'General editorial article' },
    { key: 'leaders', label: 'Leader', hint: 'Leader profile with stats' },
    { key: 'history', label: 'History', hint: 'Historical event' },
    { key: 'dailyBriefs', label: 'Daily Brief', hint: 'Election brief' },
    { key: 'factChecks', label: 'Fact Check', hint: 'Claim and verdict' },
    { key: 'electionArticles', label: 'Election Article', hint: 'Election analysis' },
    { key: 'columnArticles', label: 'Column Article', hint: 'Opinion column' },
];

const typeLabels = Object.fromEntries(contentTypes.map((type) => [type.key, type.label])) as Record<ContentTypeKey, string>;
const typeOrder = contentTypes.map((type) => type.key);

const metaTemplate = {
    schemaVersion: 'content-import/v1',
    source: 'manual-json',
    updateMode: 'upsert',
    localeMode: 'both',
};

const localized = (en: string, ne: string) => ({ en, ne });

const sampleRows: Record<ContentTypeKey, Record<string, unknown>> = {
    articles: {
        title: localized('Sample article title', 'नमूना लेख शीर्षक'),
        slug: 'sample-article-title',
        excerpt: localized('Short article summary.', 'छोटो लेख सारांश।'),
        content: localized('<p>Full English article body.</p>', '<p>पूरा नेपाली लेख सामग्री।</p>'),
        author: localized('Editorial Team', 'सम्पादकीय समूह'),
        category: localized('Politics', 'राजनीति'),
        image: '',
        tags: ['politics', 'analysis'],
        status: 'draft',
        isFeatured: false,
        publishedDate: '2026-05-05T00:00:00.000Z',
        seoTitle: localized('Sample SEO title', 'नमूना SEO शीर्षक'),
        seoDescription: localized('Sample SEO description.', 'नमूना SEO विवरण।'),
    },
    leaders: {
        name: localized('Sample Leader', 'नमूना नेता'),
        slug: 'sample-leader',
        desc: localized('Short profile line.', 'छोटो परिचय।'),
        bio: localized('Full biography.', 'पूरा जीवनी।'),
        party: localized('Independent', 'स्वतन्त्र'),
        position: localized('Public Figure', 'सार्वजनिक व्यक्तित्व'),
        years: localized('1970 - Present', '१९७० - हाल'),
        image: '',
        cover: '',
        stats: {
            terms: localized('2 terms', '२ कार्यकाल'),
            constituency: localized('Kathmandu', 'काठमाडौं'),
        },
        timeline: [
            {
                year: '2008',
                event: localized('Entered national politics.', 'राष्ट्रिय राजनीतिमा प्रवेश।'),
            },
        ],
        socialLinks: [{ platform: 'x', url: 'https://example.com' }],
        status: 'draft',
        isFeatured: false,
        isActive: true,
        order: 0,
    },
    history: {
        title: localized('Sample historical event', 'नमूना ऐतिहासिक घटना'),
        date: '2026-05-05T00:00:00.000Z',
        content: localized('Event description.', 'घटनाको विवरण।'),
        image: '',
        status: 'draft',
        isFeatured: false,
        order: 0,
    },
    dailyBriefs: {
        title: localized('Sample daily brief', 'नमूना दैनिक ब्रीफ'),
        slug: 'sample-daily-brief',
        date: '2026-05-05T00:00:00.000Z',
        summary: localized('Brief summary.', 'ब्रीफ सारांश।'),
        content: localized('Full brief content.', 'पूरा ब्रीफ सामग्री।'),
        tags: ['election'],
        status: 'draft',
        image: '',
    },
    factChecks: {
        claim: localized('A sample public claim.', 'नमूना सार्वजनिक दाबी।'),
        slug: 'sample-public-claim',
        claimBy: localized('Public figure', 'सार्वजनिक व्यक्ति'),
        verdict: 'unverified',
        analysis: localized('Fact-check analysis.', 'तथ्य-जाँच विश्लेषण।'),
        sources: ['https://example.com/source'],
        date: '2026-05-05T00:00:00.000Z',
        status: 'draft',
        image: '',
    },
    electionArticles: {
        title: localized('Sample election analysis', 'नमूना निर्वाचन विश्लेषण'),
        slug: 'sample-election-analysis',
        excerpt: localized('Short election analysis summary.', 'छोटो निर्वाचन विश्लेषण सारांश।'),
        content: localized('<p>Election analysis body.</p>', '<p>निर्वाचन विश्लेषण सामग्री।</p>'),
        editor: 'The Leaders Editorial',
        tags: ['election', 'analysis'],
        status: 'draft',
        image: '',
    },
    columnArticles: {
        title: localized('Sample column headline', 'नमूना स्तम्भ शीर्षक'),
        slug: 'sample-column-headline',
        excerpt: localized('Short column excerpt.', 'छोटो स्तम्भ सारांश।'),
        content: localized('<p>Column article body.</p>', '<p>स्तम्भ सामग्री।</p>'),
        editor: 'The Leaders Editorial',
        category: 'Opinion',
        tags: ['opinion'],
        status: 'draft',
        image: '',
    },
};

function buildPayload(selectedTypes: ContentTypeKey[], rowCount: number, includeEmptyArrays: boolean) {
    const payload: Record<string, unknown> = { meta: metaTemplate };
    for (const type of typeOrder) {
        if (!selectedTypes.includes(type)) {
            if (includeEmptyArrays) payload[type] = [];
            continue;
        }
        payload[type] = Array.from({ length: rowCount }, (_, index) => ({
            ...sampleRows[type],
            slug: index === 0 ? sampleRows[type].slug : `${sampleRows[type].slug}-${index + 1}`,
        }));
    }
    return payload;
}

function stringify(value: unknown) {
    return JSON.stringify(value, null, 2);
}

function extractJsonObjects(raw: string) {
    const blocks: string[] = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < raw.length; i += 1) {
        const char = raw[i];
        if (inString) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === '"') inString = false;
            continue;
        }
        if (char === '"') inString = true;
        if (char === '{') {
            if (depth === 0) start = i;
            depth += 1;
        }
        if (char === '}') {
            depth -= 1;
            if (depth === 0 && start >= 0) {
                blocks.push(raw.slice(start, i + 1));
                start = -1;
            }
        }
    }

    return blocks;
}

function mergePayloads(payloads: Record<string, unknown>[]) {
    const merged: Record<string, unknown> = { meta: metaTemplate };
    for (const payload of payloads) {
        if (payload.meta && typeof payload.meta === 'object') {
            merged.meta = { ...(merged.meta as Record<string, unknown>), ...(payload.meta as Record<string, unknown>) };
        }
        for (const type of typeOrder) {
            const rows = payload[type];
            if (Array.isArray(rows)) {
                merged[type] = [...((merged[type] as unknown[]) || []), ...rows];
            }
        }
    }
    return merged;
}

function detectMergeCandidate(raw: string) {
    const blocks = extractJsonObjects(raw);
    if (blocks.length < 2) return null;
    try {
        const parsed = blocks.map((block) => JSON.parse(block)).filter((item) => item && typeof item === 'object');
        if (parsed.length < 2) return null;
        return mergePayloads(parsed);
    } catch {
        return null;
    }
}

function getSyntaxError(raw: string) {
    try {
        JSON.parse(raw);
        return null;
    } catch (error: any) {
        return error?.message || 'Invalid JSON';
    }
}

export default function ContentImportPage() {
    const { token } = useAuth();
    const [selectedTypes, setSelectedTypes] = useState<ContentTypeKey[]>(['articles', 'dailyBriefs']);
    const [rowCount, setRowCount] = useState(1);
    const [includeEmptyArrays, setIncludeEmptyArrays] = useState(false);
    const [rawContent, setRawContent] = useState(() => stringify(buildPayload(['articles', 'dailyBriefs'], 1, false)));
    const [syntaxError, setSyntaxError] = useState<string | null>(null);
    const [syntaxOk, setSyntaxOk] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const mergedTemplate = useMemo(
        () => stringify(buildPayload(selectedTypes, rowCount, includeEmptyArrays)),
        [selectedTypes, rowCount, includeEmptyArrays]
    );
    const mergeCandidate = useMemo(() => detectMergeCandidate(rawContent), [rawContent]);

    const selectedLabels = selectedTypes.map((type) => typeLabels[type]).join(', ') || 'No types selected';

    const toggleType = (type: ContentTypeKey) => {
        setSelectedTypes((current) =>
            current.includes(type)
                ? current.filter((item) => item !== type)
                : [...current, typeOrder.find((key) => key === type)!].sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
        );
    };

    const copyText = async (value: string, message: string) => {
        await navigator.clipboard.writeText(value);
        toast.success(message);
    };

    const downloadJson = () => {
        const blob = new Blob([mergedTemplate], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'the-leaders-content-import.json';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const resetTemplate = () => {
        setRawContent(mergedTemplate);
        setSyntaxError(null);
        setSyntaxOk(false);
        setValidation(null);
    };

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        if (!file.name.endsWith('.json')) {
            toast.error('Please upload a .json file');
            return;
        }
        setRawContent(await file.text());
        setSyntaxError(null);
        setSyntaxOk(false);
        setValidation(null);
    };

    const validatePayload = async (payload: unknown) => {
        if (!token) {
            toast.error('You must be logged in as admin');
            return;
        }
        setIsValidating(true);
        try {
            const res = await fetch('/api/admin/content-import/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ payload }),
            });
            const data = await res.json();
            const result = data?.data as ValidationResult;
            setValidation(result);
            if (result?.ok) toast.success('JSON is valid and ready for import');
            else toast.error('Content validation found blocking errors');
        } catch (error) {
            console.error(error);
            toast.error('Validation failed');
        } finally {
            setIsValidating(false);
        }
    };

    const runJsonCheck = async () => {
        const error = getSyntaxError(rawContent);
        setSyntaxError(error);
        setSyntaxOk(!error);
        setValidation(null);
        if (error) return;
        await validatePayload(JSON.parse(rawContent));
    };

    const mergeDetectedPayloads = () => {
        if (!mergeCandidate) return;
        setRawContent(stringify(mergeCandidate));
        setSyntaxError(null);
        setSyntaxOk(false);
        setValidation(null);
        toast.success('Merged JSON payloads into one import file');
    };

    const commitImport = async () => {
        if (!token || !validation?.ok) return;
        setIsImporting(true);
        try {
            const payload = JSON.parse(rawContent);
            const res = await fetch('/api/admin/content-import/commit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ payload }),
            });
            const data = await res.json();
            const result = data?.data as ValidationResult;
            setValidation(result);
            if (!res.ok || !result?.ok) {
                toast.error('Import blocked by validation errors');
                return;
            }
            toast.success('Content imported successfully');
        } catch (error) {
            console.error(error);
            toast.error('Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    const groupedItems = useMemo(() => {
        const groups = new Map<ContentTypeKey, ValidationItem[]>();
        for (const item of validation?.items || []) {
            groups.set(item.type, [...(groups.get(item.type) || []), item]);
        }
        return groups;
    }, [validation]);
    const typeDistribution = useMemo(
        () => contentTypes
            .map((type) => ({ ...type, count: validation?.stats.byType[type.key] || 0 }))
            .filter((type) => type.count > 0),
        [validation]
    );
    const reviewedCount = validation
        ? validation.stats.actions.create + validation.stats.actions.update + validation.stats.actions.skip + validation.stats.actions.error
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl w-full">
            <div className="border-b border-border pb-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="font-bebas text-3xl sm:text-4xl text-foreground tracking-wide">
                            JSON Content Import
                        </h1>
                        <p className="text-muted-foreground font-manrope text-sm mt-1 max-w-3xl">
                            Generate copyable JSON, merge selected content types, check syntax, validate rows, then import clean payloads.
                        </p>
                    </div>
                    <Badge variant={validation?.ok ? 'default' : 'outline'} className="rounded-none font-mono uppercase">
                        {validation?.ok ? 'Ready' : syntaxOk ? 'Checked' : 'Draft'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
                <div className="space-y-6">
                    <Card className="rounded-none border-border shadow-sm">
                        <CardHeader className="border-b border-border py-4">
                            <CardTitle className="font-bebas text-xl tracking-wide">1. Choose Content Types</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <div className="grid grid-cols-1 gap-2">
                                {contentTypes.map((type) => {
                                    const active = selectedTypes.includes(type.key);
                                    return (
                                        <button
                                            key={type.key}
                                            type="button"
                                            onClick={() => toggleType(type.key)}
                                            className={`text-left border px-3 py-3 rounded-none transition-colors ${
                                                active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-xs uppercase font-bold">{type.label}</span>
                                                <span className={`h-4 w-4 border ${active ? 'bg-primary border-primary' : 'border-border'}`} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{type.hint}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="space-y-1">
                                    <span className="font-mono text-[10px] uppercase text-muted-foreground">Sample rows</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={rowCount}
                                        onChange={(e) => setRowCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                                        className="h-10 w-full border border-border bg-background px-3 text-sm rounded-none"
                                    />
                                </label>
                                <label className="flex items-center gap-2 border border-border px-3 py-2 text-xs font-mono uppercase">
                                    <input
                                        type="checkbox"
                                        checked={includeEmptyArrays}
                                        onChange={(e) => setIncludeEmptyArrays(e.target.checked)}
                                    />
                                    Empty arrays
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">Selected: {selectedLabels}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border-border shadow-sm">
                        <CardHeader className="border-b border-border py-4">
                            <CardTitle className="font-bebas text-xl tracking-wide">2. Copy Formats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                                {contentTypes.map((type) => (
                                    <Button
                                        key={type.key}
                                        type="button"
                                        variant="outline"
                                        className="rounded-none justify-start font-mono uppercase text-xs"
                                        onClick={() => copyText(stringify(buildPayload([type.key], rowCount, false)), `${type.label} JSON copied`)}
                                    >
                                        <Clipboard className="h-3.5 w-3.5" />
                                        Copy {type.label}
                                    </Button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border">
                                <Button type="button" className="rounded-none font-mono uppercase text-xs" onClick={() => copyText(mergedTemplate, 'Merged JSON copied')}>
                                    <Clipboard className="h-3.5 w-3.5" />
                                    Copy Merged JSON
                                </Button>
                                <Button type="button" variant="outline" className="rounded-none font-mono uppercase text-xs" onClick={downloadJson}>
                                    <Download className="h-3.5 w-3.5" />
                                    Download Merged JSON
                                </Button>
                                <Button type="button" variant="outline" className="rounded-none font-mono uppercase text-xs" onClick={resetTemplate}>
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Reset Editor From Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-none border-border shadow-sm">
                        <CardHeader className="border-b border-border py-4">
                            <CardTitle className="font-bebas text-xl tracking-wide flex items-center gap-2">
                                <FileJson className="h-5 w-5" />
                                3. Upload, Paste, Fix JSON
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <label className="inline-flex items-center justify-center gap-2 h-10 px-4 border border-border rounded-none font-mono uppercase text-xs cursor-pointer hover:bg-muted">
                                    <Upload className="h-3.5 w-3.5" />
                                    Upload .json
                                    <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                                </label>
                                {mergeCandidate && (
                                    <Button type="button" variant="outline" className="rounded-none font-mono uppercase text-xs" onClick={mergeDetectedPayloads}>
                                        Merge Detected Payloads
                                    </Button>
                                )}
                                <Button type="button" onClick={runJsonCheck} disabled={isValidating} className="rounded-none font-mono uppercase text-xs sm:ml-auto">
                                    {isValidating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                    Check JSON
                                </Button>
                            </div>

                            <Textarea
                                value={rawContent}
                                onChange={(e) => {
                                    setRawContent(e.target.value);
                                    setSyntaxOk(false);
                                    setValidation(null);
                                }}
                                spellCheck={false}
                                className="min-h-[430px] rounded-none font-mono text-xs"
                            />

                            {syntaxError && (
                                <div className="border border-destructive/40 bg-destructive/5 p-4 text-sm">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                        JSON syntax error
                                    </div>
                                    <p className="mt-2 font-mono text-xs text-muted-foreground">{syntaxError}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border-border shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border py-4 bg-muted/20">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="font-bebas text-2xl tracking-wide flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        4. Validate, Review & Import
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Review import health, language coverage, and every row before committing content.
                                    </p>
                                </div>
                                {validation && (
                                    <Badge
                                        variant={validation.ok ? 'default' : 'destructive'}
                                        className="rounded-none font-mono uppercase h-8 px-3 w-fit"
                                    >
                                        {validation.ok ? 'Ready to import' : 'Fix blocking errors'}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-5">
                            {!validation ? (
                                <div className="border border-dashed border-border bg-muted/20 p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center border border-border bg-background">
                                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bebas text-2xl tracking-wide text-foreground">Awaiting validation</p>
                                            <p className="text-sm text-muted-foreground max-w-xl">
                                                Run JSON Check to generate content counts, language coverage, row actions, warnings, and blocking errors.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={`border p-4 ${validation.ok ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-destructive/40 bg-destructive/5'}`}>
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-11 w-11 items-center justify-center border bg-background ${validation.ok ? 'border-emerald-500/40 text-emerald-600' : 'border-destructive/40 text-destructive'}`}>
                                                    {validation.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bebas text-2xl tracking-wide">
                                                        {validation.ok ? 'Clean validation pass' : `${validation.stats.errors} blocking issue${validation.stats.errors === 1 ? '' : 's'} found`}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {reviewedCount} rows reviewed. {validation.stats.warnings} warning{validation.stats.warnings === 1 ? '' : 's'} can be imported, but errors must be fixed first.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={commitImport}
                                                disabled={!validation.ok || isImporting}
                                                className="rounded-none font-mono uppercase text-xs min-w-[190px]"
                                            >
                                                {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                                Import Clean JSON
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <ReviewMetric label="Total Rows" value={validation.stats.total} icon={<Layers3 className="h-4 w-4" />} />
                                        <ReviewMetric label="Create" value={validation.stats.actions.create} accent="emerald" />
                                        <ReviewMetric label="Update" value={validation.stats.actions.update} accent="blue" />
                                        <ReviewMetric label="Errors" value={validation.stats.errors} accent={validation.stats.errors ? 'red' : 'emerald'} />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
                                        <div className="border border-border p-4">
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Languages className="h-4 w-4 text-primary" />
                                                    <p className="font-mono text-xs uppercase font-bold">Language Coverage</p>
                                                </div>
                                                <span className="font-mono text-[10px] uppercase text-muted-foreground">EN / NE readiness</span>
                                            </div>
                                            <div className="space-y-3">
                                                <ProgressStat label="Bilingual" value={validation.stats.languages.both} total={validation.stats.total} tone="emerald" />
                                                <ProgressStat label="EN only" value={validation.stats.languages.enOnly} total={validation.stats.total} tone="blue" />
                                                <ProgressStat label="NE only" value={validation.stats.languages.neOnly} total={validation.stats.total} tone="amber" />
                                                <ProgressStat label="Missing language" value={validation.stats.languages.missing} total={validation.stats.total} tone="red" />
                                            </div>
                                        </div>

                                        <div className="border border-border p-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <BarChart3 className="h-4 w-4 text-primary" />
                                                <p className="font-mono text-xs uppercase font-bold">Import Shape</p>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <MiniStat label="Draft" value={validation.stats.statuses.draft} />
                                                <MiniStat label="Published" value={validation.stats.statuses.published} />
                                                <MiniStat label="Archived" value={validation.stats.statuses.archived} />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {typeDistribution.map((type) => (
                                                    <Badge key={type.key} variant="outline" className="rounded-none font-mono text-[10px] uppercase">
                                                        {type.label}: {type.count}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                                            <div>
                                                <p className="font-bebas text-2xl tracking-wide">Row Review</p>
                                                <p className="text-xs text-muted-foreground">Grouped by content type with action, language coverage, and validation notes.</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className="rounded-none font-mono uppercase">Warnings {validation.stats.warnings}</Badge>
                                                <Badge variant={validation.stats.errors ? 'destructive' : 'outline'} className="rounded-none font-mono uppercase">Errors {validation.stats.errors}</Badge>
                                            </div>
                                        </div>

                                        {Array.from(groupedItems.entries()).map(([type, items]) => (
                                            <div key={type} className="border border-border bg-card">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
                                                    <div>
                                                        <p className="font-mono text-xs uppercase font-bold">{typeLabels[type]}</p>
                                                        <p className="text-xs text-muted-foreground">{items.length} row{items.length === 1 ? '' : 's'} detected</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="rounded-none font-mono uppercase">Create {items.filter((item) => item.action === 'create').length}</Badge>
                                                        <Badge variant="outline" className="rounded-none font-mono uppercase">Update {items.filter((item) => item.action === 'update').length}</Badge>
                                                        <Badge variant={items.some((item) => item.action === 'error') ? 'destructive' : 'outline'} className="rounded-none font-mono uppercase">
                                                            Error {items.filter((item) => item.action === 'error').length}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="divide-y divide-border/70">
                                                    {items.map((item) => (
                                                        <div key={`${item.type}-${item.index}`} className="grid grid-cols-1 xl:grid-cols-[1fr_160px_120px_170px] gap-3 p-4 items-start">
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="font-semibold truncate max-w-full">{item.title || '(Untitled)'}</p>
                                                                    <Badge variant="outline" className="rounded-none font-mono uppercase text-[10px]">{item.status}</Badge>
                                                                </div>
                                                                <p className="font-mono text-xs text-muted-foreground truncate mt-1">{item.slug || 'No slug'}</p>
                                                                {(item.errors.length > 0 || item.warnings.length > 0) && (
                                                                    <div className="mt-2 space-y-1 text-xs">
                                                                        {item.errors.map((error) => (
                                                                            <p key={error} className="text-destructive flex gap-1">
                                                                                <span aria-hidden="true">!</span>
                                                                                <span>{error}</span>
                                                                            </p>
                                                                        ))}
                                                                        {item.warnings.map((warning) => (
                                                                            <p key={warning} className="text-amber-600 flex gap-1">
                                                                                <span aria-hidden="true">?</span>
                                                                                <span>{warning}</span>
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <Badge variant={item.action === 'error' ? 'destructive' : 'outline'} className="rounded-none font-mono uppercase w-fit">
                                                                {item.action}
                                                            </Badge>
                                                            <Badge variant="outline" className="rounded-none font-mono uppercase w-fit">
                                                                {item.languageCoverage}
                                                            </Badge>
                                                            <div className="text-xs text-muted-foreground">
                                                                {item.errors.length === 0 && item.warnings.length === 0 ? (
                                                                    <span className="inline-flex items-center gap-1 text-emerald-600">
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        Clean row
                                                                    </span>
                                                                ) : (
                                                                    `${item.errors.length} error${item.errors.length === 1 ? '' : 's'}, ${item.warnings.length} warning${item.warnings.length === 1 ? '' : 's'}`
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ReviewMetric({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: number;
    icon?: ReactNode;
    accent?: 'emerald' | 'blue' | 'red';
}) {
    const accentClass =
        accent === 'red'
            ? 'border-destructive/40 bg-destructive/5 text-destructive'
            : accent === 'emerald'
                ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600'
                : accent === 'blue'
                    ? 'border-sky-500/40 bg-sky-500/5 text-sky-600'
                    : 'border-border text-foreground';

    return (
        <div className={`border p-3 ${accentClass}`}>
            <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">{label}</p>
                {icon}
            </div>
            <p className="font-bebas text-3xl tracking-wide text-foreground">{value}</p>
        </div>
    );
}

function ProgressStat({ label, value, total, tone }: { label: string; value: number; total: number; tone: 'emerald' | 'blue' | 'amber' | 'red' }) {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    const color =
        tone === 'emerald'
            ? 'bg-emerald-500'
            : tone === 'blue'
                ? 'bg-sky-500'
                : tone === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-destructive';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span>{label}</span>
                <span className="font-mono text-xs text-muted-foreground">{value} / {total}</span>
            </div>
            <div className="h-2 border border-border bg-muted overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="border border-border bg-muted/20 px-3 py-2">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">{label}</p>
            <p className="font-bebas text-2xl tracking-wide">{value}</p>
        </div>
    );
}
