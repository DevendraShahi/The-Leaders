"use client";

import { useState, useEffect } from 'react';
import { 
    ArrowRight, 
    BookOpen, 
    Check, 
    Copy, 
    FileText, 
    Globe, 
    Layers, 
    RotateCcw, 
    Sparkles, 
    Wand2, 
    X 
} from 'lucide-react';
import { 
    bookReviewPresets, 
    generateBookReviewCaption, 
    generateBookReviewDrafts, 
    generateBookReviewSummaryDraft, 
    generateBookReviewMasterPrompt, 
    parseBookReviewResponse, 
    BOOK_REVIEW_LENGTH_GUIDE, 
    type BookReviewInput 
} from '@/lib/post-studio/book-review';
import { createDraft, createDraftCollection, type PostDraft } from '@/lib/post-studio/drafts';
import type { PostFormat } from '@/lib/post-studio/types';
import StudioMediaModal from './StudioMediaModal';
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

const quickBookSuggestions = [
    { title: "Why Nations Fail", author: "Daron Acemoglu & James A. Robinson", context: "Extractive syndicates vs inclusive economic growth in Nepal" },
    { title: "Jail Journal (जेल जर्नल)", author: "B.P. Koirala", context: "Moral conscience and national sovereignty under autocratic pressure" },
    { title: "Development as Freedom", author: "Amartya Sen", context: "Substantive democratic freedom as the primary engine of development" },
    { title: "The Prince", author: "Niccolò Machiavelli", context: "Pragmatic statecraft and avoiding reliance on mercenary political alliances" },
    { title: "Democracy in America", author: "Alexis de Tocqueville", context: "Civic associations, decentralization, and the tyranny of the majority" },
];

export default function BookReviewModal({ scope, onClose, onOpenDraft }: BookReviewModalProps) {
    // Workflow Tab: 1. Prompt Generator, 2. JSON/MD Importer, 3. Manual 12-Field Editor
    const [workflowTab, setWorkflowTab] = useState<'prompt' | 'import' | 'manual'>('prompt');

    // Tab 1: Master Prompt Generator State
    const [promptBookName, setPromptBookName] = useState("Why Nations Fail");
    const [promptAuthor, setPromptAuthor] = useState("Daron Acemoglu & James A. Robinson");
    const [promptContext, setPromptContext] = useState("Extractive syndicates, patronage politics, and youth outmigration in Nepal");
    const [promptCopied, setPromptCopied] = useState(false);

    // Tab 2: JSON / Markdown Importer State
    const [rawInputText, setRawInputText] = useState("");
    const [parseStatus, setParseStatus] = useState<{
        success: boolean;
        data?: BookReviewInput;
        detectedCount: number;
        error?: string;
    } | null>(null);

    // Tab 3: Detailed 12-Field Form State
    const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0);
    const [formData, setFormData] = useState<BookReviewInput>({ ...bookReviewPresets[0].data });
    const [activeFormSection, setActiveFormSection] = useState<'details' | 'analysis' | 'verdict'>('details');
    const [format, setFormat] = useState<PostFormat>("portrait");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [captionCopied, setCaptionCopied] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);

    // Update master prompt preview dynamically
    const masterPromptText = generateBookReviewMasterPrompt(promptBookName, promptAuthor, promptContext);

    // Live parse JSON or Markdown in Tab 2
    useEffect(() => {
        if (!rawInputText.trim()) {
            setParseStatus(null);
            return;
        }
        const result = parseBookReviewResponse(rawInputText);
        setParseStatus(result);
        if (result.success && result.data) {
            setFormData(result.data);
            if (result.data.title && !promptBookName) setPromptBookName(result.data.title);
        }
    }, [rawInputText]);

    const handleCopyMasterPrompt = async () => {
        try {
            await navigator.clipboard.writeText(masterPromptText);
            setPromptCopied(true);
            setTimeout(() => setPromptCopied(false), 2500);
        } catch {
            setError("Could not copy prompt to clipboard.");
        }
    };

    const handleSelectSuggestion = (s: typeof quickBookSuggestions[0]) => {
        setPromptBookName(s.title);
        setPromptAuthor(s.author);
        setPromptContext(s.context);
    };

    const handleLoadSampleJson = () => {
        const sample = {
            title: "Why Nations Fail: The Origins of Power, Prosperity, and Poverty",
            author: "Daron Acemoglu & James A. Robinson",
            tag: "POLITICAL ECONOMY",
            rating: "★★★★½ 4.8",
            centralThesis: "Nations thrive under inclusive economic and political institutions that reward innovation, but stagnate under extractive institutions that enrich ruling cartels.",
            purpose: "To dismantle geographic and cultural dogmas of global inequality and establish institutional dynamics as the decisive driver of prosperity.",
            argumentEvidence: "Comparative historical cases: Nogales border divide, the 1688 Glorious Revolution, Venetian monopolies, and post-colonial stagnation across Africa.",
            assumptionIdeology: "Institutional Economics and Pluralist Democracy. Assumes sustained growth requires creative destruction, which extractive elites violently resist.",
            relevanceApplication: "Accurately diagnoses Nepal's syndicate economy and youth outmigration as the direct result of political cartels monopolizing state opportunities.",
            keyTakeaways: "1. Extractive political institutions inevitably strangle innovation.\n2. Sustainable growth requires genuine political pluralism.\n3. Historical critical junctures dictate enduring national trajectories.",
            whyItMatters: "Provides the indispensable conceptual vocabulary to recognize why cosmetic constitutional reforms fail when elite power cartels remain unbroken.",
            criticSays: "“A monumental work that fundamentally transforms our understanding of poverty, power, and democratic development across the modern world.”",
            accent: "#C5A059"
        };
        setRawInputText(JSON.stringify(sample, null, 2));
    };

    const handlePasteFromClipboard = async () => {
        try {
            const clipText = await navigator.clipboard.readText();
            if (clipText) {
                setRawInputText(clipText);
            }
        } catch {
            setError("Clipboard permission not granted. Please paste manually into the text box.");
        }
    };

    const handleSelectPreset = (index: number) => {
        setActivePresetIndex(index);
        setFormData({ ...bookReviewPresets[index].data });
        setPromptBookName(bookReviewPresets[index].data.title);
        setPromptAuthor(bookReviewPresets[index].data.author);
        setError('');
    };

    const handleClearForm = () => {
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

    // Generate 5-Slide Carousel Pack
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

    // Generate Single Summary Card
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
            setCaptionCopied(true);
            setTimeout(() => setCaptionCopied(false), 3000);
        } catch {
            setError('Could not copy caption to clipboard.');
        }
    };

    return (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="book-modal-title">
            <div className={`${styles.dialog} ${styles.bookModalDialog}`} style={{ maxWidth: 900, width: 'min(900px, calc(100vw - 24px))' }}>
                {/* Header */}
                <div className={styles.between} style={{ alignItems: 'flex-start' }}>
                    <div className={styles.row} style={{ gap: 12 }}>
                        <div className={styles.bookIconBadge}><BookOpen size={20} color="#fff" /></div>
                        <div>
                            <h2 id="book-modal-title" style={{ margin: 0, fontSize: 18 }}>Book Review Studio Engine</h2>
                            <p className={styles.subtle} style={{ margin: '2px 0 0', fontSize: 12 }}>
                                Prepare AI master prompts, import generated JSON/MD, and auto-build 5-slide visual carousels.
                            </p>
                        </div>
                    </div>
                    <button className={styles.iconButton} onClick={onClose} disabled={busy} aria-label="Close dialog">
                        <X size={20} />
                    </button>
                </div>

                {/* Primary Workflow Tabs */}
                <div className={styles.bookTabs} style={{ marginTop: 4 }}>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${workflowTab === 'prompt' ? styles.activeBookTab : ''}`}
                        onClick={() => setWorkflowTab('prompt')}
                    >
                        <Wand2 size={14} style={{ display: 'inline', marginRight: 6 }} />
                        1. Master AI Prompt
                    </button>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${workflowTab === 'import' ? styles.activeBookTab : ''}`}
                        onClick={() => setWorkflowTab('import')}
                    >
                        <FileText size={14} style={{ display: 'inline', marginRight: 6 }} />
                        2. Paste JSON / MD & Build
                    </button>
                    <button
                        type="button"
                        className={`${styles.bookTab} ${workflowTab === 'manual' ? styles.activeBookTab : ''}`}
                        onClick={() => setWorkflowTab('manual')}
                    >
                        <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
                        3. Review & Edit Fields (12)
                    </button>
                </div>

                {/* TAB 1: MASTER PROMPT GENERATOR */}
                {workflowTab === 'prompt' && (
                    <div className={styles.masterPromptCard}>
                        {/* 3 Steps Guidance */}
                        <div className={styles.promptStepsRow}>
                            <div className={styles.promptStepBox}>
                                <span className={styles.promptStepNum}>Step 1</span>
                                <strong className={styles.promptStepTitle}>Enter Book Name</strong>
                                <span className={styles.promptStepDesc}>Replace the book name and context below.</span>
                            </div>
                            <div className={styles.promptStepBox}>
                                <span className={styles.promptStepNum}>Step 2</span>
                                <strong className={styles.promptStepTitle}>Copy Master Prompt</strong>
                                <span className={styles.promptStepDesc}>Contains strict character limits so slides fit perfectly.</span>
                            </div>
                            <div className={styles.promptStepBox}>
                                <span className={styles.promptStepNum}>Step 3</span>
                                <strong className={styles.promptStepTitle}>Paste AI Output</strong>
                                <span className={styles.promptStepDesc}>Switch to Tab 2 to auto-generate all 5 slides.</span>
                            </div>
                        </div>

                        {/* Quick Suggestions */}
                        <div className={styles.bookPresetBar}>
                            <span className={styles.subtle} style={{ fontSize: 11, fontWeight: 700 }}>QUICK EXAMPLES:</span>
                            {quickBookSuggestions.map(s => (
                                <button
                                    key={s.title}
                                    type="button"
                                    className={`${styles.presetPill} ${promptBookName === s.title ? styles.activePreset : ''}`}
                                    onClick={() => handleSelectSuggestion(s)}
                                >
                                    {s.title.split('—')[0].trim()}
                                </button>
                            ))}
                        </div>

                        {/* Prompt Customization Inputs */}
                        <div className={styles.bookGrid}>
                            <label className={styles.field}>
                                <span>Book Title *</span>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Why Nations Fail, Jail Journal, Orientalism..."
                                    value={promptBookName}
                                    onChange={e => {
                                        setPromptBookName(e.target.value);
                                        updateField('title', e.target.value);
                                    }}
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Author(s) (Optional)</span>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Daron Acemoglu, B.P. Koirala..."
                                    value={promptAuthor}
                                    onChange={e => {
                                        setPromptAuthor(e.target.value);
                                        updateField('author', e.target.value);
                                    }}
                                />
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>Analytical Context / Civic Lens (Optional)</span>
                            <input
                                className={styles.input}
                                placeholder="e.g. Focus on institutional governance, patronage networks, and youth outmigration in Nepal..."
                                value={promptContext}
                                onChange={e => setPromptContext(e.target.value)}
                            />
                        </label>

                        {/* Exact Length Requirements Info */}
                        <div className={styles.promptLengthGrid}>
                            <div className={styles.promptLengthTag}><strong>Thesis</strong> <span>140–185 chars</span></div>
                            <div className={styles.promptLengthTag}><strong>Purpose</strong> <span>120–175 chars</span></div>
                            <div className={styles.promptLengthTag}><strong>Evidence</strong> <span>130–185 chars</span></div>
                            <div className={styles.promptLengthTag}><strong>Ideology</strong> <span>120–175 chars</span></div>
                            <div className={styles.promptLengthTag}><strong>Relevance</strong> <span>130–185 chars</span></div>
                            <div className={styles.promptLengthTag}><strong>Takeaways</strong> <span>150–210 chars</span></div>
                            <div className={styles.promptLengthTag}><strong>Why Matters</strong> <span>120–175 chars</span></div>
                            <div className={styles.promptLengthTag}><strong>Critic Says</strong> <span>80–150 chars</span></div>
                        </div>

                        {/* Master Prompt Live Preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className={styles.between}>
                                <span className={styles.subtle} style={{ fontSize: 11, fontWeight: 700 }}>
                                    PREPARED MASTER PROMPT (READY FOR CLAUDE / CHATGPT / GEMINI):
                                </span>
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ fontSize: 11, padding: '4px 10px', borderColor: 'var(--studio-red)', color: 'var(--studio-red)' }}
                                    onClick={handleCopyMasterPrompt}
                                >
                                    {promptCopied ? <Check size={13} color="var(--studio-green)" /> : <Copy size={13} />}
                                    {promptCopied ? "Prompt Copied to Clipboard!" : "Copy Master Prompt"}
                                </button>
                            </div>
                            <div className={styles.promptPreviewArea}>
                                {masterPromptText}
                            </div>
                        </div>

                        {/* Prompt Footer Actions */}
                        <div className={styles.between} style={{ paddingTop: 8, borderTop: '1px solid var(--studio-border)' }}>
                            <button
                                type="button"
                                className={styles.button}
                                onClick={handleCopyMasterPrompt}
                            >
                                {promptCopied ? <Check size={15} color="var(--studio-green)" /> : <Copy size={15} />}
                                {promptCopied ? "Copied!" : "1-Click Copy Prompt"}
                            </button>

                            <button
                                type="button"
                                className={styles.primary}
                                onClick={() => setWorkflowTab('import')}
                            >
                                Next: Paste AI Output
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: PASTE JSON / MARKDOWN & AUTO-GENERATE */}
                {workflowTab === 'import' && (
                    <div className={styles.masterPromptCard}>
                        <div className={styles.between}>
                            <div>
                                <strong style={{ fontSize: 14 }}>Paste Generated Review (JSON or Markdown)</strong>
                                <p className={styles.subtle} style={{ fontSize: 11, margin: '2px 0 0' }}>
                                    Paste the exact output returned by your AI agent. Both raw JSON and markdown code blocks are parsed automatically.
                                </p>
                            </div>
                            <div className={styles.row} style={{ gap: 6 }}>
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ fontSize: 11, padding: '4px 8px' }}
                                    onClick={handlePasteFromClipboard}
                                >
                                    Paste Clipboard
                                </button>
                                <button
                                    type="button"
                                    className={styles.button}
                                    style={{ fontSize: 11, padding: '4px 8px' }}
                                    onClick={handleLoadSampleJson}
                                >
                                    Load Sample JSON
                                </button>
                            </div>
                        </div>

                        <textarea
                            className={`${styles.input} ${styles.jsonInputArea}`}
                            placeholder="Paste JSON (e.g. { &quot;title&quot;: &quot;...&quot;, &quot;centralThesis&quot;: &quot;...&quot; }) or Markdown key-value text here..."
                            value={rawInputText}
                            onChange={e => setRawInputText(e.target.value)}
                            rows={8}
                        />

                        {/* Parse Status Indicator */}
                        {parseStatus && (
                            <div className={styles.parseSummaryCard}>
                                <div className={styles.parseStatusRow}>
                                    <div className={styles.row} style={{ gap: 8 }}>
                                        <span className={`${styles.parseBadge} ${parseStatus.success ? styles.parseBadgeSuccess : styles.parseBadgePending}`}>
                                            {parseStatus.success ? `✓ Ready (${parseStatus.detectedCount}/12 Fields)` : `⚠ ${parseStatus.detectedCount}/12 Fields Detected`}
                                        </span>
                                        {parseStatus.data?.title && (
                                            <strong style={{ fontSize: 13, color: 'var(--studio-text)' }}>
                                                {parseStatus.data.title}
                                            </strong>
                                        )}
                                        {parseStatus.data?.author && (
                                            <span className={styles.subtle} style={{ fontSize: 12 }}>
                                                by {parseStatus.data.author}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        style={{ fontSize: 11, padding: '3px 8px' }}
                                        onClick={() => setWorkflowTab('manual')}
                                    >
                                        Edit in Tab 3 →
                                    </button>
                                </div>

                                {parseStatus.data?.centralThesis && (
                                    <p className={styles.subtle} style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: 'var(--studio-text)' }}>
                                        <strong>Thesis:</strong> {parseStatus.data.centralThesis}
                                    </p>
                                )}

                                {parseStatus.error && (
                                    <p className={styles.error} style={{ margin: 0 }}>
                                        {parseStatus.error}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Format & Cover Choice */}
                        <div className={styles.bookGrid}>
                            <div className={styles.field}>
                                <span>Export Format</span>
                                <div className={styles.row}>
                                    <button
                                        type="button"
                                        className={`${styles.button} ${format === 'portrait' ? styles.active : ''}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setFormat('portrait')}
                                    >
                                        Portrait (4:5 · 1080×1350)
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.button} ${format === 'square' ? styles.active : ''}`}
                                        style={{ flex: 1 }}
                                        onClick={() => setFormat('square')}
                                    >
                                        Square (1:1 · 1080×1080)
                                    </button>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <span>Cover Image (Optional)</span>
                                {formData.imageUri ? (
                                    <div className={styles.row} style={{ alignItems: 'center', gap: 8 }}>
                                        <img src={formData.imageUri} alt="" style={{ width: 36, height: 46, objectFit: 'cover', borderRadius: 4 }} />
                                        <button type="button" className={styles.button} style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setMediaModalOpen(true)}>
                                            Change Cover
                                        </button>
                                        <button type="button" className={styles.button} style={{ fontSize: 11, padding: '4px 8px', color: 'var(--studio-red)' }} onClick={() => updateField('imageUri', null as any)}>
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className={styles.button}
                                        style={{ width: '100%', borderColor: 'var(--studio-red)', color: 'var(--studio-red)' }}
                                        onClick={() => setMediaModalOpen(true)}
                                    >
                                        <Globe size={14} />
                                        Search Book Cover on Web
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Primary Auto-Generate Buttons */}
                        <div className={styles.between} style={{ paddingTop: 10, borderTop: '1px solid var(--studio-border)' }}>
                            <button
                                type="button"
                                className={styles.button}
                                disabled={busy || !formData.title.trim()}
                                onClick={handleGenerateSummary}
                            >
                                Single Summary Card
                            </button>

                            <button
                                type="button"
                                className={styles.primary}
                                disabled={busy || !formData.title.trim() || !formData.centralThesis.trim()}
                                onClick={handleGenerateCarousel}
                            >
                                <Layers size={16} />
                                {busy ? 'Generating drafts…' : 'Auto-Generate 5-Slide Carousel Pack'}
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 3: REVIEW & EDIT 12 FIELDS (MANUAL FORM) */}
                {workflowTab === 'manual' && (
                    <div className={styles.masterPromptCard}>
                        {/* Preset Selector */}
                        <div className={styles.bookPresetBar}>
                            <span className={styles.subtle} style={{ fontWeight: 600, fontSize: 11 }}>PRESETS:</span>
                            {bookReviewPresets.map((preset, index) => (
                                <button
                                    key={preset.name}
                                    type="button"
                                    className={`${styles.presetPill} ${activePresetIndex === index ? styles.activePreset : ''}`}
                                    onClick={() => handleSelectPreset(index)}
                                >
                                    <Sparkles size={12} />
                                    {preset.name.split('—')[0].trim()}
                                </button>
                            ))}
                            <button type="button" className={styles.presetPill} onClick={handleClearForm}>
                                <RotateCcw size={12} />
                                Blank Form
                            </button>
                        </div>

                        {/* Sub-Tabs for Form Sections */}
                        <div className={styles.row} style={{ gap: 6 }}>
                            <button
                                type="button"
                                className={`${styles.choice} ${activeFormSection === 'details' ? styles.active : ''}`}
                                onClick={() => setActiveFormSection('details')}
                            >
                                1. Book Details & Rating
                            </button>
                            <button
                                type="button"
                                className={`${styles.choice} ${activeFormSection === 'analysis' ? styles.active : ''}`}
                                onClick={() => setActiveFormSection('analysis')}
                            >
                                2. Thesis & Core Analysis
                            </button>
                            <button
                                type="button"
                                className={`${styles.choice} ${activeFormSection === 'verdict' ? styles.active : ''}`}
                                onClick={() => setActiveFormSection('verdict')}
                            >
                                3. Takeaways & Critic Verdict
                            </button>
                        </div>

                        {/* Section 1: Book Details */}
                        {activeFormSection === 'details' && (
                            <div className={styles.bookGrid}>
                                <label className={styles.field}>
                                    <span>Book Title * (Max 70 chars)</span>
                                    <input
                                        className={styles.input}
                                        value={formData.title}
                                        onChange={e => updateField('title', e.target.value)}
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Author(s) * (Max 50 chars)</span>
                                    <input
                                        className={styles.input}
                                        value={formData.author}
                                        onChange={e => updateField('author', e.target.value)}
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Topic / Category Tag</span>
                                    <input
                                        className={styles.input}
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
                                                style={{ minHeight: 44, padding: '0 8px', fontSize: 11 }}
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
                                                    width: 28,
                                                    height: 28,
                                                }}
                                                title={color.label}
                                                onClick={() => updateField('accent', color.hex)}
                                            />
                                        ))}
                                        <input
                                            className={styles.input}
                                            style={{ width: 100, minHeight: 38, padding: 6 }}
                                            value={formData.accent || '#B71C1C'}
                                            onChange={e => updateField('accent', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <span>Book Cover Artwork</span>
                                    {formData.imageUri ? (
                                        <div className={styles.row} style={{ alignItems: 'center', gap: 10 }}>
                                            <img src={formData.imageUri} alt="" style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 4 }} />
                                            <button type="button" className={styles.button} style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setMediaModalOpen(true)}>
                                                Change
                                            </button>
                                            <button type="button" className={styles.button} style={{ fontSize: 11, padding: '4px 8px', color: 'var(--studio-red)' }} onClick={() => updateField('imageUri', null as any)}>
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.button}
                                            style={{ width: '100%', borderColor: 'var(--studio-red)', color: 'var(--studio-red)' }}
                                            onClick={() => setMediaModalOpen(true)}
                                        >
                                            <Globe size={13} />
                                            Search Book Cover on Web
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Section 2: Thesis & Analysis */}
                        {activeFormSection === 'analysis' && (
                            <div className={styles.bookFormStack}>
                                <label className={styles.field}>
                                    <span>Central Thesis * (Ideal: 140–185 chars · Currently {formData.centralThesis.length})</span>
                                    <textarea
                                        className={styles.input}
                                        style={{ minHeight: 76 }}
                                        rows={3}
                                        value={formData.centralThesis}
                                        onChange={e => updateField('centralThesis', e.target.value)}
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>The Author’s Purpose (Ideal: 120–175 chars · Currently {formData.purpose.length})</span>
                                    <textarea
                                        className={styles.input}
                                        style={{ minHeight: 70 }}
                                        rows={2}
                                        value={formData.purpose}
                                        onChange={e => updateField('purpose', e.target.value)}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Argument & Evidence (Ideal: 130–185 chars · Currently {formData.argumentEvidence.length})</span>
                                    <textarea
                                        className={styles.input}
                                        style={{ minHeight: 70 }}
                                        rows={2}
                                        value={formData.argumentEvidence}
                                        onChange={e => updateField('argumentEvidence', e.target.value)}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Underlying Assumptions & Ideology (Ideal: 120–175 chars · Currently {formData.assumptionIdeology.length})</span>
                                    <textarea
                                        className={styles.input}
                                        style={{ minHeight: 70 }}
                                        rows={2}
                                        value={formData.assumptionIdeology}
                                        onChange={e => updateField('assumptionIdeology', e.target.value)}
                                    />
                                </label>
                            </div>
                        )}

                        {/* Section 3: Takeaways & Verdict */}
                        {activeFormSection === 'verdict' && (
                            <div className={styles.bookFormStack}>
                                <label className={styles.field}>
                                    <span>Relevance & Contemporary Application (Ideal: 130–185 chars · Currently {formData.relevanceApplication.length})</span>
                                    <textarea
                                        className={styles.input}
                                        style={{ minHeight: 70 }}
                                        rows={2}
                                        value={formData.relevanceApplication}
                                        onChange={e => updateField('relevanceApplication', e.target.value)}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Key Takeaways (Ideal: 150–210 chars · Currently {formData.keyTakeaways.length})</span>
                                    <textarea
                                        className={styles.input}
                                        style={{ minHeight: 76 }}
                                        rows={3}
                                        value={formData.keyTakeaways}
                                        onChange={e => updateField('keyTakeaways', e.target.value)}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Why Does It Matter? (Ideal: 120–175 chars · Currently {formData.whyItMatters.length})</span>
                                    <textarea
                                        className={styles.input}
                                        style={{ minHeight: 70 }}
                                        rows={2}
                                        value={formData.whyItMatters}
                                        onChange={e => updateField('whyItMatters', e.target.value)}
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Critic Says / Verdict Quote (Ideal: 80–150 chars · Currently {formData.criticSays.length})</span>
                                    <input
                                        className={styles.input}
                                        value={formData.criticSays}
                                        onChange={e => updateField('criticSays', e.target.value)}
                                    />
                                </label>
                            </div>
                        )}

                        {/* Form Footer */}
                        <div className={styles.between} style={{ paddingTop: 10, borderTop: '1px solid var(--studio-border)' }}>
                            <button
                                type="button"
                                className={styles.button}
                                onClick={handleCopyCaption}
                            >
                                {captionCopied ? <Check size={14} color="var(--studio-green)" /> : <Copy size={14} />}
                                {captionCopied ? "Caption Copied!" : "Copy Caption"}
                            </button>

                            <div className={styles.row} style={{ gap: 8 }}>
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
                )}

                {/* Error Banner */}
                {error && <p className={styles.error} role="alert" style={{ margin: 0 }}>{error}</p>}
            </div>

            {/* Media Search Modal for Book Covers */}
            {mediaModalOpen && (
                <StudioMediaModal
                    onClose={() => setMediaModalOpen(false)}
                    onApplyImage={(uri) => {
                        updateField('imageUri', uri);
                        setMediaModalOpen(false);
                    }}
                    initialQuery={`${formData.title || promptBookName} book cover`.trim()}
                />
            )}
        </div>
    );
}
