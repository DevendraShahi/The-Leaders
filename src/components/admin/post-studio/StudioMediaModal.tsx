"use client";

import { useEffect, useState, useRef } from "react";
import { Check, Copy, Download, Globe, ImagePlus, Link2, Loader2, Search, Sparkles, Upload, X } from "lucide-react";
import styles from "./PostStudio.module.css";

export interface StudioMediaItem {
    id: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    source: "wikimedia" | "library" | "web";
    width?: number;
    height?: number;
    size?: number;
    author?: string;
    license?: string;
    description?: string;
}

interface StudioMediaModalProps {
    onClose: () => void;
    onApplyImage: (dataUri: string) => void;
    initialQuery?: string;
}

const suggestions = [
    { label: "B.P. Koirala", query: "B.P. Koirala" },
    { label: "Singha Durbar", query: "Singha Durbar Kathmandu" },
    { label: "Nepal Parliament", query: "Parliament of Nepal" },
    { label: "Why Nations Fail", query: "Why Nations Fail book" },
    { label: "Nepal Constitution", query: "Constitution of Nepal 2015" },
    { label: "Jail Journal", query: "Jail Journal Nepal" },
    { label: "Kathmandu History", query: "Kathmandu Durbar Square history" },
    { label: "Himalayas", query: "Nepal Himalayas mountains" },
];

export default function StudioMediaModal({ onClose, onApplyImage, initialQuery = "" }: StudioMediaModalProps) {
    const [tab, setTab] = useState<"search" | "url" | "upload">("search");
    const [query, setQuery] = useState(initialQuery || "Nepal politics history leaders");
    const [source, setSource] = useState<"all" | "wikimedia" | "library">("all");
    const [results, setResults] = useState<StudioMediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [applyingId, setApplyingId] = useState<string | null>(null);

    // Direct URL state
    const [directUrl, setDirectUrl] = useState("");
    const [urlPreview, setUrlPreview] = useState<{ dataUri: string; width: number; height: number; size: number } | null>(null);
    const [urlLoading, setUrlLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const runSearch = async (searchTerm: string, sourceFilter: string) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/studio/media-search?q=${encodeURIComponent(searchTerm)}&source=${sourceFilter}&limit=28`);
            if (!res.ok) throw new Error("Could not search media sources.");
            const data = await res.json();
            setResults(data.results || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load media results.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void runSearch(query, source);
    }, [source]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            void runSearch(query.trim(), source);
        }
    };

    const handleSelectSuggestion = (q: string) => {
        setQuery(q);
        void runSearch(q, source);
    };

    // Download or convert image through server proxy to ensure no CORS canvas tainting
    const handleApplyItem = async (item: StudioMediaItem) => {
        setApplyingId(item.id);
        setError("");
        try {
            const res = await fetch("/api/admin/studio/media-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: item.url }),
            });
            const data = await res.json();
            if (!res.ok || !data.dataUri) {
                throw new Error(data.error || "Failed to process image.");
            }
            onApplyImage(data.dataUri);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not apply image.");
            setApplyingId(null);
        }
    };

    const handleFetchDirectUrl = async () => {
        if (!directUrl.trim()) return;
        setUrlLoading(true);
        setError("");
        setUrlPreview(null);
        try {
            const res = await fetch("/api/admin/studio/media-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: directUrl.trim() }),
            });
            const data = await res.json();
            if (!res.ok || !data.dataUri) {
                throw new Error(data.error || "Failed to fetch image from URL.");
            }
            setUrlPreview({
                dataUri: data.dataUri,
                width: data.width,
                height: data.height,
                size: data.size,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not fetch image from URL.");
        } finally {
            setUrlLoading(false);
        }
    };

    const handleCopyUrl = (url: string, id: string) => {
        void navigator.clipboard.writeText(url);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    const handleDownloadUrl = (url: string, filename: string) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "studio-media";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleFileUpload = (file?: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please upload a raster image (PNG, JPEG, WebP).");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                onApplyImage(reader.result);
                onClose();
            }
        };
        reader.onerror = () => setError("Failed to read file.");
        reader.readAsDataURL(file);
    };

    return (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="media-modal-title">
            <div className={`${styles.dialog} ${styles.mediaModalDialog}`}>
                {/* Header */}
                <div className={styles.between}>
                    <div className={styles.row}>
                        <div className={styles.mediaIconBadge}><Globe size={20} color="#fff" /></div>
                        <div>
                            <h2 id="media-modal-title">Studio Media Browser & Web Search</h2>
                            <p className={styles.subtle}>Search Google, Wikimedia Commons, and Media Library or paste any web image URL.</p>
                        </div>
                    </div>
                    <button className={styles.iconButton} onClick={onClose} aria-label="Close dialog">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.bookTabs}>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${tab === "search" ? styles.activeBookTab : ""}`}
                        onClick={() => setTab("search")}
                    >
                        <Search size={14} style={{ display: "inline", marginRight: 6 }} />
                        Search Web & Archives
                    </button>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${tab === "url" ? styles.activeBookTab : ""}`}
                        onClick={() => setTab("url")}
                    >
                        <Link2 size={14} style={{ display: "inline", marginRight: 6 }} />
                        Google / Paste Image URL
                    </button>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${tab === "upload" ? styles.activeBookTab : ""}`}
                        onClick={() => setTab("upload")}
                    >
                        <Upload size={14} style={{ display: "inline", marginRight: 6 }} />
                        Upload File
                    </button>
                </div>

                {/* TAB 1: Search */}
                {tab === "search" && (
                    <div className={styles.mediaSearchStack}>
                        <form className={styles.mediaSearchBar} onSubmit={handleSearchSubmit}>
                            <input
                                className={styles.input}
                                placeholder="Search by topic, leader, book, event (e.g. B.P. Koirala, Singha Durbar)..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                            <button type="submit" className={styles.primary} disabled={loading} style={{ minWidth: 100 }}>
                                {loading ? <Loader2 className={styles.spin} size={16} /> : <Search size={16} />}
                                Search
                            </button>
                        </form>

                        {/* Suggestion Chips */}
                        <div className={styles.mediaSuggestions}>
                            <span className={styles.subtle} style={{ fontSize: 11, fontWeight: 600 }}>TOPICS:</span>
                            {suggestions.map(s => (
                                <button
                                    key={s.label}
                                    type="button"
                                    className={`${styles.presetPill} ${query === s.query ? styles.activePreset : ""}`}
                                    onClick={() => handleSelectSuggestion(s.query)}
                                >
                                    <Sparkles size={11} />
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Source Filter */}
                        <div className={styles.row} style={{ justifyContent: "space-between", alignItems: "center" }}>
                            <div className={styles.row}>
                                {(["all", "wikimedia", "library"] as const).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`${styles.button} ${source === s ? styles.active : ""}`}
                                        style={{ minHeight: 34, padding: "4px 10px", fontSize: 12 }}
                                        onClick={() => setSource(s)}
                                    >
                                        {s === "all" ? "All Sources" : s === "wikimedia" ? "Wikimedia Commons (Public Domain)" : "Media Library"}
                                    </button>
                                ))}
                            </div>
                            <span className={styles.subtle} style={{ fontSize: 12 }}>
                                {loading ? "Searching..." : `${results.length} images found`}
                            </span>
                        </div>

                        {error && <div role="alert" className={styles.error}>{error}</div>}

                        {/* Results Grid */}
                        <div className={styles.mediaResultsGrid}>
                            {results.map(item => (
                                <div key={item.id} className={styles.mediaCard}>
                                    <div className={styles.mediaCardThumb}>
                                        <img src={item.thumbnailUrl} alt={item.title} loading="lazy" />
                                        <span className={styles.mediaSourceBadge}>
                                            {item.source === "wikimedia" ? "PUBLIC DOMAIN" : "LIBRARY"}
                                        </span>
                                    </div>
                                    <div className={styles.mediaCardBody}>
                                        <strong className={styles.mediaCardTitle} title={item.title}>
                                            {item.title}
                                        </strong>
                                        <span className={styles.mediaCardAuthor} title={item.author}>
                                            {item.author}
                                        </span>
                                        {item.width && item.height && (
                                            <small className={styles.subtle}>
                                                {item.width} × {item.height}
                                            </small>
                                        )}
                                    </div>
                                    <div className={styles.mediaCardActions}>
                                        <button
                                            type="button"
                                            className={styles.primary}
                                            style={{ minHeight: 32, fontSize: 11, padding: "4px 8px", width: "100%" }}
                                            disabled={applyingId === item.id}
                                            onClick={() => handleApplyItem(item)}
                                        >
                                            {applyingId === item.id ? "Loading to Canvas..." : "Apply to Canvas"}
                                        </button>
                                        <div className={styles.row} style={{ width: "100%", justifyContent: "space-between" }}>
                                            <button
                                                type="button"
                                                className={styles.button}
                                                style={{ minHeight: 28, fontSize: 10, padding: "2px 6px", flex: 1 }}
                                                title="Copy Image Address"
                                                onClick={() => handleCopyUrl(item.url, item.id)}
                                            >
                                                {copiedIndex === item.id ? <Check size={12} color="#287344" /> : <Copy size={12} />}
                                                {copiedIndex === item.id ? "Copied" : "Copy Link"}
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.button}
                                                style={{ minHeight: 28, fontSize: 10, padding: "2px 6px", flex: 1 }}
                                                title="Download Image File"
                                                onClick={() => handleDownloadUrl(item.url, `${item.title}.jpg`)}
                                            >
                                                <Download size={12} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!loading && results.length === 0 && (
                                <p className={styles.subtle} style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32 }}>
                                    No images found for "{query}". Try another search term or paste a direct image URL.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: Direct URL */}
                {tab === "url" && (
                    <div className={styles.mediaUrlStack}>
                        <div className={styles.field}>
                            <span>Paste any Image or Google Image URL</span>
                            <p className={styles.subtle}>
                                Right click any image on Google Images or any website &rarr; click <strong>Copy Image Address</strong> &rarr; paste it below.
                            </p>
                            <div className={styles.row}>
                                <input
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                    placeholder="https://example.com/photo.jpg or https://upload.wikimedia.org/..."
                                    value={directUrl}
                                    onChange={e => setDirectUrl(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className={styles.primary}
                                    disabled={urlLoading || !directUrl.trim()}
                                    onClick={handleFetchDirectUrl}
                                >
                                    {urlLoading ? <Loader2 className={styles.spin} size={16} /> : <Download size={16} />}
                                    Fetch & Preview
                                </button>
                            </div>
                        </div>

                        {error && <div role="alert" className={styles.error}>{error}</div>}

                        {urlPreview && (
                            <div className={styles.mediaUrlPreviewCard}>
                                <div className={styles.mediaUrlPreviewThumb}>
                                    <img src={urlPreview.dataUri} alt="Preview" />
                                </div>
                                <div className={styles.mediaUrlPreviewMeta}>
                                    <strong>Ready to use in Studio</strong>
                                    <p className={styles.subtle}>
                                        Dimensions: {urlPreview.width} &times; {urlPreview.height} px · Size: {Math.round(urlPreview.size / 1024)} KB
                                    </p>
                                    <p className={styles.notice}>
                                        ✓ Converted and optimized locally to prevent CORS canvas export issues.
                                    </p>
                                    <div className={styles.row} style={{ marginTop: 12 }}>
                                        <button
                                            type="button"
                                            className={styles.primary}
                                            onClick={() => {
                                                onApplyImage(urlPreview.dataUri);
                                                onClose();
                                            }}
                                        >
                                            <ImagePlus size={16} />
                                            Apply as Post Background
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => handleCopyUrl(urlPreview.dataUri, "preview")}
                                        >
                                            {copiedIndex === "preview" ? <Check size={16} color="#287344" /> : <Copy size={16} />}
                                            {copiedIndex === "preview" ? "Data URI Copied" : "Copy Base64 Data"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: Upload from Device */}
                {tab === "upload" && (
                    <div className={styles.mediaUploadZone} onClick={() => fileInputRef.current?.click()}>
                        <Upload size={36} color="var(--studio-secondary)" />
                        <strong>Choose an image from your computer</strong>
                        <p className={styles.subtle}>Supports PNG, JPEG, WebP, AVIF up to 25 MB</p>
                        <button type="button" className={styles.primary} style={{ marginTop: 8 }}>
                            Browse Local Files
                        </button>
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                            onChange={e => handleFileUpload(e.target.files?.[0])}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
