"use client";

import { useState } from 'react';
import { BookOpen, Check, Copy, Layers, Sparkles, X, Star } from 'lucide-react';
import { bookReviewPresets, generateBookReviewCaption, generateBookReviewDrafts, generateBookReviewSummaryDraft, type BookReviewInput } from '@/lib/post-studio/book-review';
import { createDraft, createDraftCollection, type PostDraft } from '@/lib/post-studio/drafts';
import type { PostFormat } from '@/lib/post-studio/types';
import styles from './PostStudio.module.css';

interface BookReviewModalProps {
    scope: string;
    onClose: () => void;
    onOpenDraft: (draft: PostDraft) => void;
}

const colorPresets = [
    { label: "Leaders Red", hex: "#B71C1C" },
    { label: "Editorial Gold", hex: "#C5A059" },
    { label: "Deep Sapphire", hex: "#1E3A8A" },
    { label: "Republic Green", hex: "#0D5C3A" },
    { label: "Graphite", hex: "#27272A" },
];

const ratingPresets = ["★★★★★ 5.0", "★★★★½ 4.8", "★★★★☆ 4.5", "★★★★☆ 4.0"];

export default function BookReviewModal({ scope, onClose, onOpenDraft }: BookReviewModalProps) {
    const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0);
    const [formData, setFormData] = useState<BookReviewInput>({ ...bookReviewPresets[0].data });
    const [format, setFormat] = useState<PostFormat>("portrait");
    const [activeTab, setActiveTab] = useState<'details' | 'analysis' | 'impact'>('details');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSelectPreset = (index: number) => {
        setActivePresetIndex(index);
        setFormData({ ...bookReviewPresets[index].data });
        setError('');
    };

    const handleClear = () => {
        setActivePresetIndex(null);
        setFormData({
            title: "",
            author: "",
            tag: "POLITICAL THOUGHT",
            rating: "★★★★★ 5.0",
            centralThesis: "",
            purpose: "",
            argumentEvidence: "",
            assumptionIdeology: "",
            relevanceApplication: "",
            keyTakeaways: "",
            whyItMatters: "",
            criticSays: "",
            accent: "#B71C1C",
        });
        setError('');
    };

    const updateField = (field: keyof BookReviewInput, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateCarousel = async () => {
        if (!formData.title.trim() || !formData.centralThesis.trim()) {
            setError('Please provide at least a Book Title and Central Thesis.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const drafts = generateBookReviewDrafts(formData, format);
            const saved = await createDraftCollection(scope, drafts);
            if (saved.length > 0) {
                onOpenDraft(saved[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create carousel drafts.');
            setBusy(false);
        }
    };

    const handleGenerateSummary = async () => {
        if (!formData.title.trim() || !formData.centralThesis.trim()) {
            setError('Please provide at least a Book Title and Central Thesis.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const item = generateBookReviewSummaryDraft(formData, format);
            const saved = await createDraft(scope, item.name, item.design);
            onOpenDraft(saved);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create summary card.');
            setBusy(false);
        }
    };

    const handleCopyCaption = async () => {
        try {
            const caption = generateBookReviewCaption(formData);
            await navigator.clipboard.writeText(caption);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch {
            setError('Could not copy caption to clipboard.');
        }
    };

    return (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="book-modal-title">
            <div className={`${styles.dialog} ${styles.bookModalDialog}`}>
                {/* Header */}
                <div className={styles.between}>
                    <div className={styles.row}>
                        <div className={styles.bookIconBadge}><BookOpen size={20} color="#fff" /></div>
                        <div>
                            <h2 id="book-modal-title">Book Review Studio Template</h2>
                            <p className={styles.subtle}>Generate a high-impact 5-slide carousel or standalone summary card for social media.</p>
                        </div>
                    </div>
                    <button className={styles.iconButton} onClick={onClose} disabled={busy} aria-label="Close dialog">
                        <X size={20} />
                    </button>
                </div>

                {/* Preset Selector */}
                <div className={styles.bookPresetBar}>
                    <span className={styles.subtle} style={{ fontWeight: 600, fontSize: 12 }}>PRESETS:</span>
                    {bookReviewPresets.map((preset, index) => (
                        <button
                            key={preset.name}
                            type="button"
                            className={`${styles.presetPill} ${activePresetIndex === index ? styles.activePreset : ''}`}
                            onClick={() => handleSelectPreset(index)}
                        >
                            <Sparkles size={13} />
                            {preset.name.split('—')[0].trim()}
                        </button>
                    ))}
                    <button type="button" className={styles.presetPill} onClick={handleClear}>
                        Blank
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className={styles.bookTabs}>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${activeTab === 'details' ? styles.activeBookTab : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        1. Book & Format Details
                    </button>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${activeTab === 'analysis' ? styles.activeBookTab : ''}`}
                        onClick={() => setActiveTab('analysis')}
                    >
                        2. Thesis & Analysis
                    </button>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${activeTab === 'impact' ? styles.activeBookTab : ''}`}
                        onClick={() => setActiveTab('impact')}
                    >
                        3. Takeaways & Verdict
                    </button>
                </div>

                {/* Form Panels */}
                <div className={styles.bookFormPanel}>
                    {activeTab === 'details' && (
                        <div className={styles.bookGrid}>
                            <label className={styles.field}>
                                <span>Book Title *</span>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Why Nations Fail: The Origins of Power..."
                                    value={formData.title}
                                    onChange={e => updateField('title', e.target.value)}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Author(s) *</span>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Daron Acemoglu & James A. Robinson"
                                    value={formData.author}
                                    onChange={e => updateField('author', e.target.value)}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Topic / Category Tag</span>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. POLITICAL ECONOMY, DEMOCRATIC THOUGHT"
                                    value={formData.tag}
                                    onChange={e => updateField('tag', e.target.value.toUpperCase())}
                                />
                            </label>

                            <div className={styles.field}>
                                <span>Rating</span>
                                <div className={styles.row}>
                                    <input
                                        className={styles.input}
                                        style={{ flex: 1 }}
                                        value={formData.rating}
                                        onChange={e => updateField('rating', e.target.value)}
                                    />
                                    {ratingPresets.map(preset => (
                                        <button
                                            key={preset}
                                            type="button"
                                            className={styles.button}
                                            style={{ minHeight: 48, padding: '0 10px', fontSize: 12 }}
                                            onClick={() => updateField('rating', preset)}
                                        >
                                            {preset.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.field}>
                                <span>Accent Color</span>
                                <div className={styles.row}>
                                    {colorPresets.map(color => (
                                        <button
                                            key={color.hex}
                                            type="button"
                                            className={styles.swatch}
                                            style={{
                                                backgroundColor: color.hex,
                                                outline: formData.accent === color.hex ? '2px solid var(--studio-red)' : 'none',
                                                outlineOffset: 2,
                                                width: 32,
                                                height: 32,
                                            }}
                                            title={color.label}
                                            onClick={() => updateField('accent', color.hex)}
                                        />
                                    ))}
                                    <input
                                        className={styles.input}
                                        style={{ width: 110, minHeight: 40, padding: 8 }}
                                        value={formData.accent || '#B71C1C'}
                                        onChange={e => updateField('accent', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <span>Export Format</span>
                                <div className={styles.row}>
                                    <button
                                        type="button"
                                        className={`${styles.button} ${format === 'portrait' ? styles.active : ''}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setFormat('portrait')}
                                    >
                                        Portrait (1080×1350) · Recommended
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.button} ${format === 'square' ? styles.active : ''}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setFormat('square')}
                                    >
                                        Square (1080×1080)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className={styles.bookFormStack}>
                            <label className={styles.field}>
                                <span>Central Thesis *</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 88, resize: 'vertical' }}
                                    placeholder="The fundamental core argument or insight the author presents..."
                                    value={formData.centralThesis}
                                    onChange={e => updateField('centralThesis', e.target.value)}
                                    rows={3}
                                    required
                                />
                                <small className={styles.subtle}>Featured prominently on Slide 1 (Cover & Thesis).</small>
                            </label>

                            <label className={styles.field}>
                                <span>Purpose</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 72, resize: 'vertical' }}
                                    placeholder="Why the author wrote the book, context of the work, problem tackled..."
                                    value={formData.purpose}
                                    onChange={e => updateField('purpose', e.target.value)}
                                    rows={2}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Argument & Evidence</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 80, resize: 'vertical' }}
                                    placeholder="Key empirical evidence, historical case studies, logic chain..."
                                    value={formData.argumentEvidence}
                                    onChange={e => updateField('argumentEvidence', e.target.value)}
                                    rows={3}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Assumption & Ideology</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 72, resize: 'vertical' }}
                                    placeholder="Underlying ideological framework, philosophical assumptions, analytical lens..."
                                    value={formData.assumptionIdeology}
                                    onChange={e => updateField('assumptionIdeology', e.target.value)}
                                    rows={2}
                                />
                            </label>
                        </div>
                    )}

                    {activeTab === 'impact' && (
                        <div className={styles.bookFormStack}>
                            <label className={styles.field}>
                                <span>Relevance & Application</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 76, resize: 'vertical' }}
                                    placeholder="How does this apply to Nepal's democratic landscape, modern institutions, or governance today?"
                                    value={formData.relevanceApplication}
                                    onChange={e => updateField('relevanceApplication', e.target.value)}
                                    rows={2}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Key Takeaways</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 88, resize: 'vertical' }}
                                    placeholder="1. First essential takeaway&#10;2. Second key lesson&#10;3. Third actionable insight"
                                    value={formData.keyTakeaways}
                                    onChange={e => updateField('keyTakeaways', e.target.value)}
                                    rows={3}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Why Does It Matter?</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 72, resize: 'vertical' }}
                                    placeholder="Why this book endures and matters for civic and political leadership..."
                                    value={formData.whyItMatters}
                                    onChange={e => updateField('whyItMatters', e.target.value)}
                                    rows={2}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Critic Says</span>
                                <textarea
                                    className={styles.input}
                                    style={{ minHeight: 72, resize: 'vertical' }}
                                    placeholder="“A searing human testament to conscience over convenience...”"
                                    value={formData.criticSays}
                                    onChange={e => updateField('criticSays', e.target.value)}
                                    rows={2}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Carousel Slide Outline preview */}
                <div className={styles.bookSlidePreviewBar}>
                    <div className={styles.bookSlideChip}>
                        <strong>Slide 1</strong>
                        <span>Cover & Central Thesis</span>
                    </div>
                    <div className={styles.bookSlideChip}>
                        <strong>Slide 2</strong>
                        <span>Purpose & Arguments</span>
                    </div>
                    <div className={styles.bookSlideChip}>
                        <strong>Slide 3</strong>
                        <span>Ideology & Lens</span>
                    </div>
                    <div className={styles.bookSlideChip}>
                        <strong>Slide 4</strong>
                        <span>Relevance & Takeaways</span>
                    </div>
                    <div className={styles.bookSlideChip}>
                        <strong>Slide 5</strong>
                        <span>The Verdict & Critic Quote</span>
                    </div>
                </div>

                {error && <div role="alert" className={styles.error}>{error}</div>}

                {/* Action Buttons */}
                <div className={styles.bookModalActions}>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={handleCopyCaption}
                        title="Copy social media caption text with hashtags to clipboard"
                    >
                        {copied ? <Check size={16} color="#287344" /> : <Copy size={16} />}
                        {copied ? 'Caption Copied!' : 'Copy Caption'}
                    </button>

                    <button
                        type="button"
                        className={styles.button}
                        disabled={busy}
                        onClick={handleGenerateSummary}
                    >
                        Single Summary Card
                    </button>

                    <button
                        type="button"
                        className={styles.primary}
                        disabled={busy}
                        onClick={handleGenerateCarousel}
                    >
                        <Layers size={16} />
                        {busy ? 'Creating drafts…' : 'Generate 5-Slide Carousel Pack'}
                    </button>
                </div>
            </div>
        </div>
    );
}
