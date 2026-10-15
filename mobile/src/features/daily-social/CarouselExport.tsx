import { useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';
import { ExportArtboard } from '@/features/post-designer/ExportArtboard';
import { textLineLimit } from '@/features/post-designer/text-overflow';
import type { PostDesign } from '@/features/post-designer/types';
import { Button } from '@/components/ui/button';
import { AppText } from '@/ui/primitives/AppText';
import { spacing } from '@/theme/tokens';
import type { DailyEdition } from './api';
import { carouselEntries, packageCarousel } from './package';
import { captureSlide, deliverCarousel } from './export-platform';

export function CarouselExport({ scope, edition, onBusy, disabled = false }: { scope: string; edition: DailyEdition; disabled?: boolean; onBusy: (busy: boolean) => void }) {
    const ref = useRef<View>(null);
    const lock = useRef(false);
    const pending = useRef<{ ready: boolean; measured: Set<string>; clipped: boolean; resolve: () => void } | null>(null);
    const [design, setDesign] = useState<PostDesign | null>(null);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const checkReady = () => { const p = pending.current; if (p?.ready && p.measured.size === 2) p.resolve(); };
    const run = async (language: 'ne' | 'en' | 'both') => {
        if (lock.current) return; lock.current = true; setBusy(true); onBusy(true); setError('');
        try {
            const entries = await carouselEntries(scope, edition, language);
            const images: Record<string, Uint8Array> = {};
            for (const [index, entry] of entries.entries()) {
                setProgress(`Rendering ${index + 1} / ${entries.length} · ${entry.path}`);
                const current = entry.draft.design;
                if (current.imageUri && !current.hiddenLayers.includes('visual') && !await Image.prefetch(current.imageUri)) throw new Error(`${entry.path}: photo unavailable. Replace it in the editor.`);
                let timeout: ReturnType<typeof setTimeout>;
                try {
                    await new Promise<void>((resolve, reject) => {
                        timeout = setTimeout(() => reject(new Error(`${entry.path}: artwork did not finish loading.`)), 15000);
                        pending.current = { ready: false, measured: new Set(current.hiddenLayers.filter(layer => layer === 'headline' || layer === 'supporting').map(layer => layer === 'supporting' ? 'supporting' : 'headline')), clipped: false, resolve };
                        setDesign(current);
                    });
                } finally { clearTimeout(timeout!); }
                if (pending.current?.clipped) throw new Error(`${entry.path}: text is too long. Reduce its size or shorten it in the editor.`);
                await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
                images[entry.path] = await captureSlide(ref, current.format);
                setDesign(null); pending.current = null;
            }
            setProgress('Packaging carousel…');
            await deliverCarousel(packageCarousel(edition, images, language), `the-leaders-${edition.date}-${edition.edition}-${language}`);
            setProgress('Package prepared. Choose its destination to save it.');
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Carousel export failed.'); setProgress(''); }
        finally { pending.current = null; setDesign(null); lock.current = false; setBusy(false); onBusy(false); }
    };
    return <View style={{ gap: spacing.sm }}>
        <AppText variant="heading3">Export carousel</AppText>
        <AppText variant="caption" colorToken="textSecondary">Numbered PNGs, captions and sources in one ZIP. Uses your saved edits. Unzip before uploading to Instagram or Facebook.</AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button variant="outline" disabled={busy || disabled} onPress={() => { void run('ne'); }}><AppText variant="label">नेपाली</AppText></Button>
            <Button variant="outline" disabled={busy || disabled} onPress={() => { void run('en'); }}><AppText variant="label">English</AppText></Button>
        </View>
        <Button disabled={busy || disabled} onPress={() => { void run('both'); }}><AppText variant="label" colorToken="onPrimary">{busy ? 'Exporting…' : 'Export both languages'}</AppText></Button>
        {progress ? <AppText variant="caption" accessibilityLiveRegion="polite">{progress}</AppText> : null}
        {error ? <AppText variant="caption" colorToken="brandRed">{error}</AppText> : null}
        {design ? <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.staging}>
            <ExportArtboard key={progress} ref={ref} design={design} onReady={() => {
                if (pending.current) pending.current.ready = true;
                if (Platform.OS === 'web') requestAnimationFrame(() => {
                    const node = ref.current as unknown as HTMLElement;
                    for (const layer of ['headline', 'supporting'] as const) {
                        const text = node?.querySelector<HTMLElement>(`[data-testid="export-${layer}"]`);
                        if (text && pending.current) {
                            const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
                            if (!Number.isFinite(lineHeight) || text.getBoundingClientRect().height > lineHeight * textLineLimit(design.format, layer) + 1) pending.current.clipped = true;
                            pending.current.measured.add(layer);
                        }
                    }
                    checkReady();
                });
                checkReady();
            }} onTextMeasured={(layer, lines) => {
                if (pending.current) { pending.current.measured.add(layer); if (lines > textLineLimit(design.format, layer)) pending.current.clipped = true; } checkReady();
            }} />
        </View> : null}
    </View>;
}
const styles = StyleSheet.create({ staging: { position: 'absolute', left: -10000, top: -10000 } });
