"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/admin/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Copy,
    Loader2,
    RefreshCw,
    Save,
    Search,
    Upload,
    Users,
    Vote,
} from "lucide-react";

interface ConstituencySummary {
    constituencyKey: string;
    constituencyLabel: string;
    province: string;
    district: string;
    constituencyNumber: number | null;
    candidateCount: number;
    totalVotes: number;
    leadingCandidate: {
        candidateName: string;
        partyName: string;
        votes: number;
    } | null;
    updatedAt: string | null;
}

interface CandidateVoteRow {
    candidateKey: string;
    candidateId: number | null;
    sourceSerialNo: number;
    candidateName: string;
    partyName: string;
    symbolName: string;
    votes: number;
}

interface ConstituencyDetail {
    constituencyKey: string;
    constituencyLabel: string;
    province: string;
    district: string;
    constituencyNumber: number | null;
    totalVotes: number;
    leadingCandidate: {
        candidateName: string;
        partyName: string;
        votes: number;
    } | null;
    updatedAt: string | null;
    updatedByEmail: string | null;
    candidates: CandidateVoteRow[];
}

interface ElectionResultResource {
    id: string;
    label: string;
    url: string;
    notes: string;
    sourceType?: string;
}

interface RefreshPullTrace {
    source: string;
    sourceType: "url" | "file";
    depth: number;
    rowCount: number;
    discoveredUrls: string[];
    error?: string;
}

function formatDate(value: string | null): string {
    if (!value) return "Not updated";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not updated";
    return date.toLocaleString();
}

function toSafeVoteValue(value: string): number {
    const normalized = value.replace(/,/g, "").trim();
    if (!normalized) return 0;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.floor(parsed);
}

function parseSourceInput(value: string): string[] {
    const tokens = String(value || "")
        .split(/[\n,;]/g)
        .map((token) => token.trim())
        .filter(Boolean);
    return Array.from(new Set(tokens));
}

export default function VoteCountAdminPage() {
    const { token } = useAuth();
    const [search, setSearch] = useState("");
    const [loadingConstituencies, setLoadingConstituencies] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [constituencies, setConstituencies] = useState<ConstituencySummary[]>([]);
    const [selectedKey, setSelectedKey] = useState<string>("");
    const [detail, setDetail] = useState<ConstituencyDetail | null>(null);
    const [editableCandidates, setEditableCandidates] = useState<CandidateVoteRow[]>([]);
    const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importErrors, setImportErrors] = useState<Array<{ rowNumber: number; message: string }>>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [resultResources, setResultResources] = useState<ElectionResultResource[]>([]);
    const [resourcePrompt, setResourcePrompt] = useState("");
    const [refreshingSources, setRefreshingSources] = useState(false);
    const [refreshMode, setRefreshMode] = useState<"merge" | "replace">("merge");
    const [refreshDryRun, setRefreshDryRun] = useState(false);
    const [refreshSourcesInput, setRefreshSourcesInput] = useState("");
    const [refreshPulls, setRefreshPulls] = useState<RefreshPullTrace[]>([]);

    const selectedSummary = useMemo(
        () => constituencies.find((item) => item.constituencyKey === selectedKey) || null,
        [constituencies, selectedKey]
    );

    const fetchConstituencies = async (searchInput: string) => {
        if (!token) return;
        setLoadingConstituencies(true);

        try {
            const params = new URLSearchParams();
            if (searchInput.trim()) params.set("search", searchInput.trim());
            const res = await fetch(`/api/admin/election-vote-counts?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.error || "Failed to load constituencies");
                return;
            }

            const rows = Array.isArray(data?.data?.constituencies)
                ? (data.data.constituencies as ConstituencySummary[])
                : [];
            setConstituencies(rows);

            if (rows.length === 0) {
                setSelectedKey("");
                setDetail(null);
                setEditableCandidates([]);
                return;
            }

            if (!selectedKey || !rows.some((item) => item.constituencyKey === selectedKey)) {
                setSelectedKey(rows[0]!.constituencyKey);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load constituencies");
        } finally {
            setLoadingConstituencies(false);
        }
    };

    const fetchConstituencyDetail = async (constituencyKey: string) => {
        if (!token || !constituencyKey) return;
        setLoadingDetail(true);

        try {
            const res = await fetch(
                `/api/admin/election-vote-counts/${encodeURIComponent(constituencyKey)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                }
            );

            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.error || "Failed to load constituency details");
                return;
            }

            const loadedDetail = data?.data as ConstituencyDetail;
            setDetail(loadedDetail);
            setEditableCandidates(Array.isArray(loadedDetail?.candidates) ? loadedDetail.candidates : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load constituency details");
        } finally {
            setLoadingDetail(false);
        }
    };

    const fetchElectionResultResources = async (discover: boolean = false) => {
        if (!token) return;
        setResourcesLoading(true);

        try {
            const requestedSources = parseSourceInput(refreshSourcesInput);
            const endpoint = discover
                ? `/api/admin/election-results/resources?discover=1${requestedSources.length > 0
                    ? `&sources=${encodeURIComponent(requestedSources.join("\n"))}`
                    : ""
                }`
                : "/api/admin/election-results/resources";
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.error || "Failed to load election resources");
                return;
            }

            const resourceRows = Array.isArray(data?.data?.resources)
                ? (data.data.resources as ElectionResultResource[])
                : [];
            setResultResources(resourceRows);
            setResourcePrompt(String(data?.data?.prompt || ""));

            const configuredSources = Array.isArray(data?.data?.configuredSources)
                ? data.data.configuredSources.filter((value: unknown) => typeof value === "string")
                : [];
            if (configuredSources.length > 0) {
                setRefreshSourcesInput((previous) =>
                    previous.trim() ? previous : configuredSources.join("\n")
                );
            }

            if (discover) {
                const pulls = Array.isArray(data?.data?.discovery?.pulls)
                    ? (data.data.discovery.pulls as RefreshPullTrace[])
                    : [];
                setRefreshPulls(pulls);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load election resources");
        } finally {
            setResourcesLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchConstituencies(search);
        fetchElectionResultResources(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!token || !selectedKey) return;
        fetchConstituencyDetail(selectedKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, selectedKey]);

    const handleSearch = async (event: React.FormEvent) => {
        event.preventDefault();
        await fetchConstituencies(search);
    };

    const handleVoteChange = (candidateKey: string, value: string) => {
        const nextVotes = toSafeVoteValue(value);
        setEditableCandidates((prev) =>
            prev.map((candidate) =>
                candidate.candidateKey === candidateKey
                    ? { ...candidate, votes: nextVotes }
                    : candidate
            )
        );
    };

    const handleSave = async () => {
        if (!token || !selectedKey) return;
        setSaving(true);

        try {
            const payload = {
                mode: "replace",
                candidateVotes: editableCandidates.map((candidate) => ({
                    candidateKey: candidate.candidateKey,
                    votes: candidate.votes,
                })),
            };

            const res = await fetch(
                `/api/admin/election-vote-counts/${encodeURIComponent(selectedKey)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.error || "Failed to save vote counts");
                return;
            }

            toast.success("Vote counts updated");
            await Promise.all([fetchConstituencies(search), fetchConstituencyDetail(selectedKey)]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save vote counts");
        } finally {
            setSaving(false);
        }
    };

    const handleImport = async () => {
        if (!token) return;
        if (!importFile) {
            toast.error("Please select an Excel/CSV file first");
            return;
        }

        setImporting(true);
        setImportErrors([]);

        try {
            const formData = new FormData();
            formData.append("file", importFile);
            formData.append("mode", importMode);

            const res = await fetch("/api/admin/election-vote-counts/import", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                const errors = Array.isArray(data?.details) ? data.details : [];
                setImportErrors(errors);
                toast.error(data?.error || "Import failed");
                return;
            }

            const importResult = data?.data;
            const rejectedRows = Number(importResult?.rejectedRows || 0);
            const acceptedRows = Number(importResult?.acceptedRows || 0);
            const errors = Array.isArray(importResult?.errors) ? importResult.errors : [];
            setImportErrors(errors);

            if (rejectedRows > 0) {
                toast.warning(`Imported ${acceptedRows} rows with ${rejectedRows} rejected rows`);
            } else {
                toast.success(`Imported ${acceptedRows} rows successfully`);
            }

            await Promise.all([
                fetchConstituencies(search),
                selectedKey ? fetchConstituencyDetail(selectedKey) : Promise.resolve(),
            ]);
        } catch (error) {
            console.error(error);
            toast.error("Import failed");
        } finally {
            setImporting(false);
        }
    };

    const handleRefreshFromSources = async () => {
        if (!token) return;
        setRefreshingSources(true);

        try {
            const sources = parseSourceInput(refreshSourcesInput);
            const res = await fetch("/api/admin/election-results/refresh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mode: refreshMode,
                    dryRun: refreshDryRun,
                    sources: sources.length > 0 ? sources : undefined,
                }),
            });

            const data = await res.json();
            const pulls = Array.isArray(data?.data?.pulls)
                ? (data.data.pulls as RefreshPullTrace[])
                : Array.isArray(data?.details?.pulls)
                    ? (data.details.pulls as RefreshPullTrace[])
                    : [];
            setRefreshPulls(pulls);

            if (!res.ok) {
                toast.error(data?.error || "Failed to refresh election sources");
                return;
            }

            const refreshResult = data?.data;
            const acceptedRows = Number(refreshResult?.acceptedRows || 0);
            const rejectedRows = Number(refreshResult?.rejectedRows || 0);

            if (refreshDryRun) {
                toast.success(
                    `Dry-run complete: ${acceptedRows} accepted rows, ${rejectedRows} rejected rows`
                );
            } else if (rejectedRows > 0) {
                toast.warning(
                    `Live refresh imported ${acceptedRows} rows with ${rejectedRows} rejected rows`
                );
            } else {
                toast.success(`Live refresh imported ${acceptedRows} rows`);
            }

            await Promise.all([
                fetchConstituencies(search),
                selectedKey ? fetchConstituencyDetail(selectedKey) : Promise.resolve(),
                fetchElectionResultResources(false),
            ]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to refresh election sources");
        } finally {
            setRefreshingSources(false);
        }
    };

    const handleCopyPrompt = async () => {
        if (!resourcePrompt.trim()) {
            toast.error("No prompt available to copy");
            return;
        }

        try {
            await navigator.clipboard.writeText(resourcePrompt);
            toast.success("Prompt copied");
        } catch (error) {
            console.error(error);
            toast.error("Clipboard copy failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-4">
                <h1 className="text-3xl font-bebas uppercase tracking-wide">Election Vote Count</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Constituency-wise FPTP vote counting with manual updates and Excel import.
                </p>
            </div>

            <Card className="rounded-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bebas uppercase tracking-wide flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Bulk Update (Excel/CSV)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Required columns: <span className="font-mono">votes</span> and candidate identifier (
                        <span className="font-mono">candidate_key</span> or{" "}
                        <span className="font-mono">candidate_id</span> or{" "}
                        <span className="font-mono">source_serial_no</span>) plus constituency (
                        <span className="font-mono">constituency_key</span> OR{" "}
                        <span className="font-mono">province + district + constituency_number</span>).
                    </p>
                    <a
                        href="/election/vote-count-template.csv"
                        className="inline-block text-xs underline text-primary"
                    >
                        Download import template CSV
                    </a>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="file"
                            accept=".xlsx,.xlsm,.csv,.txt"
                            className="block w-full text-sm file:mr-4 file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-wide"
                            onChange={(event) =>
                                setImportFile(event.target.files?.[0] || null)
                            }
                        />

                        <select
                            value={importMode}
                            onChange={(event) =>
                                setImportMode(event.target.value as "merge" | "replace")
                            }
                            className="h-10 border border-input bg-background px-3 text-sm"
                        >
                            <option value="merge">Merge with existing counts</option>
                            <option value="replace">Replace constituency counts</option>
                        </select>

                        <Button
                            onClick={handleImport}
                            disabled={importing}
                            className="rounded-none uppercase text-xs tracking-wider"
                        >
                            {importing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Import File
                        </Button>
                    </div>

                    {importErrors.length > 0 && (
                        <div className="border border-destructive/40 bg-destructive/5 p-3 text-xs space-y-1 max-h-40 overflow-y-auto">
                            {importErrors.map((error, index) => (
                                <p key={`${error.rowNumber}-${index}`}>
                                    Row {error.rowNumber}: {error.message}
                                </p>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bebas uppercase tracking-wide flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Live Source Refresh
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Use API URLs or local JSON file paths. Wrapped payloads (with HTML snapshots) are auto-discovered for candidate JSON endpoints.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                            value={refreshMode}
                            onChange={(event) =>
                                setRefreshMode(event.target.value as "merge" | "replace")
                            }
                            className="h-10 border border-input bg-background px-3 text-sm"
                        >
                            <option value="merge">Merge with existing counts</option>
                            <option value="replace">Replace constituency counts</option>
                        </select>

                        <label className="h-10 flex items-center gap-2 border border-input px-3 text-xs uppercase tracking-wider">
                            <input
                                type="checkbox"
                                checked={refreshDryRun}
                                onChange={(event) => setRefreshDryRun(event.target.checked)}
                            />
                            Dry Run
                        </label>

                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-none uppercase text-xs tracking-wider"
                            onClick={() => fetchElectionResultResources(true)}
                            disabled={resourcesLoading}
                        >
                            {resourcesLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Discover Sources
                        </Button>

                        <Button
                            type="button"
                            className="rounded-none uppercase text-xs tracking-wider"
                            onClick={handleRefreshFromSources}
                            disabled={refreshingSources}
                        >
                            {refreshingSources ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Run Live Refresh
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Source List (one per line)
                        </p>
                        <textarea
                            value={refreshSourcesInput}
                            onChange={(event) => setRefreshSourcesInput(event.target.value)}
                            className="w-full min-h-[110px] border border-input bg-background px-3 py-2 text-xs font-mono"
                            placeholder="https://result.election.gov.np/path/to/results.json"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                Ingest Prompt
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-none text-xs uppercase"
                                onClick={handleCopyPrompt}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Prompt
                            </Button>
                        </div>
                        <textarea
                            value={resourcePrompt}
                            readOnly
                            className="w-full min-h-[150px] border border-input bg-muted/20 px-3 py-2 text-xs font-mono"
                        />
                    </div>

                    {resultResources.length > 0 && (
                        <div className="border border-border p-3 space-y-2">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                Registered Resources
                            </p>
                            {resultResources.map((resource) => (
                                <div key={resource.id} className="text-xs">
                                    <p className="font-semibold">{resource.label}</p>
                                    <p className="font-mono break-all">{resource.url}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {refreshPulls.length > 0 && (
                        <div className="border border-border p-3 space-y-2 max-h-56 overflow-y-auto">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                Last Pull Trace
                            </p>
                            {refreshPulls.map((pull, index) => (
                                <p key={`${pull.source}-${index}`} className="text-xs break-all">
                                    [{pull.sourceType}] depth={pull.depth} rows={pull.rowCount} | {pull.source}
                                    {pull.error ? ` | error: ${pull.error}` : ""}
                                </p>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <Card className="rounded-none xl:col-span-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bebas uppercase tracking-wide flex items-center justify-between gap-2">
                            <span>Constituencies</span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none"
                                onClick={() => fetchConstituencies(search)}
                                disabled={loadingConstituencies}
                            >
                                {loadingConstituencies ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        </CardTitle>
                        <form onSubmit={handleSearch} className="flex gap-2 pt-2">
                            <div className="relative flex-1">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="pl-9 rounded-none"
                                    placeholder="Search constituency"
                                />
                            </div>
                            <Button type="submit" variant="outline" className="rounded-none text-xs uppercase">
                                Go
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[640px] overflow-y-auto">
                        {loadingConstituencies && constituencies.length === 0 ? (
                            <div className="py-10 flex justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : null}

                        {!loadingConstituencies && constituencies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No constituencies found.</p>
                        ) : null}

                        {constituencies.map((constituency) => {
                            const isActive = constituency.constituencyKey === selectedKey;
                            return (
                                <button
                                    key={constituency.constituencyKey}
                                    type="button"
                                    className={`w-full text-left border px-3 py-2 transition-colors ${isActive
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:bg-muted/40"
                                        }`}
                                    onClick={() => setSelectedKey(constituency.constituencyKey)}
                                >
                                    <p className="text-sm font-semibold text-foreground">
                                        {constituency.constituencyLabel}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {constituency.province} | {constituency.candidateCount} candidates
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Total votes: {constituency.totalVotes.toLocaleString()}
                                    </p>
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="rounded-none xl:col-span-8">
                    <CardHeader className="pb-3 space-y-3">
                        <CardTitle className="text-lg font-bebas uppercase tracking-wide flex items-center gap-2">
                            <Vote className="h-4 w-4" />
                            {selectedSummary?.constituencyLabel || "Select a constituency"}
                        </CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div className="border border-border p-2">
                                <p className="text-muted-foreground uppercase">Total Votes</p>
                                <p className="text-base font-semibold">
                                    {(editableCandidates.reduce((sum, item) => sum + item.votes, 0)).toLocaleString()}
                                </p>
                            </div>
                            <div className="border border-border p-2">
                                <p className="text-muted-foreground uppercase">Candidates</p>
                                <p className="text-base font-semibold">{editableCandidates.length}</p>
                            </div>
                            <div className="border border-border p-2">
                                <p className="text-muted-foreground uppercase">Last Updated</p>
                                <p className="text-sm font-medium">{formatDate(detail?.updatedAt || null)}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loadingDetail ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : null}

                        {!loadingDetail && !detail ? (
                            <div className="py-16 text-center text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-3" />
                                Select a constituency to edit votes.
                            </div>
                        ) : null}

                        {!loadingDetail && detail ? (
                            <>
                                <div className="overflow-x-auto border border-border">
                                    <table className="w-full min-w-[680px]">
                                        <thead className="bg-muted/40">
                                            <tr>
                                                <th className="text-left px-3 py-2 text-xs uppercase">Candidate</th>
                                                <th className="text-left px-3 py-2 text-xs uppercase">Party</th>
                                                <th className="text-left px-3 py-2 text-xs uppercase">Symbol</th>
                                                <th className="text-left px-3 py-2 text-xs uppercase w-40">Votes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {editableCandidates.map((candidate) => (
                                                <tr
                                                    key={candidate.candidateKey}
                                                    className="border-t border-border"
                                                >
                                                    <td className="px-3 py-2 text-sm">{candidate.candidateName}</td>
                                                    <td className="px-3 py-2 text-sm text-muted-foreground">
                                                        {candidate.partyName}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-muted-foreground">
                                                        {candidate.symbolName || "-"}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            value={candidate.votes}
                                                            onChange={(event) =>
                                                                handleVoteChange(
                                                                    candidate.candidateKey,
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="rounded-none h-9"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                    <p className="text-xs text-muted-foreground">
                                        Updated by: {detail.updatedByEmail || "N/A"}
                                    </p>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="rounded-none uppercase text-xs tracking-wider"
                                    >
                                        {saving ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save Vote Count
                                    </Button>
                                </div>
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
