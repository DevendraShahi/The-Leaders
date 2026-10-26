"use client";

import { useState } from 'react';
import { Check, Copy, Download, ImagePlus, Layers, Search, Shield, Sparkles } from 'lucide-react';
import { cricketBrandAssets, findCricketBrandAssets, type CricketBrandAsset } from '@/lib/post-studio/cricket-catalog';
import styles from './PostStudio.module.css';

interface CricketLogoLibraryProps {
    disabled?: boolean;
    currentImageUri?: string | null;
    onSelectBackground: (url: string, name: string) => void;
    onAddOverlay: (url: string, name: string) => void;
}

export default function CricketLogoLibrary({
    disabled = false,
    currentImageUri,
    onSelectBackground,
    onAddOverlay,
}: CricketLogoLibraryProps) {
    const [category, setCategory] = useState<'all' | 'league' | 'team'>('all');
    const [query, setQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const assets = findCricketBrandAssets(category, query);

    const handleCopy = (url: string, id: string) => {
        void navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <section aria-label="NPL and team logos library" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.row} style={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#DC2626', display: 'grid', placeItems: 'center', color: '#fff' }}>
                        <Shield size={16} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: 13, fontFamily: 'Onest_700Bold, sans-serif' }}>
                            Team & NPL Brand Logos
                        </h4>
                        <p className={styles.subtle} style={{ margin: 0, fontSize: 11 }}>
                            Full HD transparent PNGs. Choose to set as background visual or place as layer overlay.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter pills */}
            <div className={styles.row} style={{ gap: 6, flexWrap: 'wrap' }}>
                {(
                    [
                        { key: 'all', label: `All (${cricketBrandAssets.length})` },
                        { key: 'league', label: 'NPL Official (2)' },
                        { key: 'team', label: 'Franchises (8)' },
                    ] as const
                ).map(item => (
                    <button
                        key={item.key}
                        type="button"
                        className={`${styles.button} ${category === item.key ? styles.active : ''}`}
                        style={{ minHeight: 30, padding: '3px 10px', fontSize: 11 }}
                        disabled={disabled}
                        onClick={() => setCategory(item.key)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Search filter */}
            <div className={styles.search} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Search size={14} color="var(--studio-secondary)" />
                <input
                    aria-label="Filter logos"
                    className={styles.input}
                    style={{ flex: 1, minHeight: 32, fontSize: 12 }}
                    placeholder="Search by team or mark name…"
                    value={query}
                    disabled={disabled}
                    onChange={e => setQuery(e.target.value)}
                />
                {query && (
                    <button
                        type="button"
                        className={styles.button}
                        style={{ minHeight: 28, fontSize: 11, padding: '2px 8px' }}
                        onClick={() => setQuery('')}
                    >
                        Clear
                    </button>
                )}
            </div>

            {assets.length === 0 && (
                <p className={styles.subtle} style={{ textAlign: 'center', padding: '16px 8px', fontSize: 12 }}>
                    No logos matched "{query}". Try a different term or clear the search.
                </p>
            )}

            {/* Logo cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {assets.map(asset => {
                    const isCurrentBackground = currentImageUri === asset.url;
                    return (
                        <div
                            key={asset.id}
                            style={{
                                border: '1px solid var(--studio-border)',
                                borderRadius: 8,
                                background: 'var(--studio-surface)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div className={styles.mediaLogoThumb} style={{ height: 110 }}>
                                <img src={asset.thumbnailUrl} alt={asset.name} loading="lazy" />
                                <span className={styles.mediaSourceBadge} style={{ background: asset.accentColor }}>
                                    {asset.type === 'league' ? 'NPL' : 'TEAM'}
                                </span>
                            </div>
                            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <strong style={{ fontSize: 11, lineHeight: 1.3, color: 'var(--studio-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.name}>
                                    {asset.name}
                                </strong>
                                <span style={{ fontSize: 10, color: 'var(--studio-secondary)' }}>
                                    {asset.nameNe}
                                </span>
                                <span className={styles.mediaResolutionBadge}>
                                    {asset.dimensions}
                                </span>
                            </div>
                            <div style={{ padding: '6px 8px 8px', background: 'var(--studio-muted)', borderTop: '1px solid var(--studio-border)', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <button
                                    type="button"
                                    className={styles.primary}
                                    style={{ minHeight: 28, fontSize: 10, padding: '2px 6px', width: '100%' }}
                                    disabled={disabled}
                                    onClick={() => onSelectBackground(asset.url, asset.name)}
                                >
                                    {isCurrentBackground ? <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> : <ImagePlus size={12} style={{ display: 'inline', marginRight: 4 }} />}
                                    {isCurrentBackground ? 'Active Visual' : 'Set as Visual'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ minHeight: 26, fontSize: 10, padding: '2px 6px', width: '100%', background: 'var(--studio-surface)' }}
                                    disabled={disabled}
                                    onClick={() => onAddOverlay(asset.url, asset.name)}
                                >
                                    <Layers size={12} style={{ display: 'inline', marginRight: 4 }} />
                                    Add as Overlay
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
