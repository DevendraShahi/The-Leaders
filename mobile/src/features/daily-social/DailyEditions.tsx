import { CaptionEditor } from "./CaptionEditor";
import { CarouselExport } from "./CarouselExport";
import { useRef, useState } from 'react';
import { Modal, ScrollView, Share, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, X, ArrowUpRight } from 'lucide-react-native';
import { dailyRequest, type DailyEdition } from './api';
import { editionCaption } from './carousel';
import { useSessionAuth } from '@/services/AuthProvider';
import { useColors } from '@/theme/Theme';
import { useLanguage } from '@/i18n/language';
import { AppText } from '@/ui/primitives/AppText';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/ui/Settings';
import { layout, radius, spacing } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';

export function DailyEditions({ scope, onOpen }: { scope: string; onOpen: (edition: DailyEdition, language: 'en' | 'ne', index: number) => Promise<void> }) {
    const auth = useSessionAuth(); const colors = useColors(); const insets = useSafeAreaInsets(); const { language } = useLanguage();
    const t = (en: string, ne: string) => language === 'ne' ? ne : en;
    const editions = useQuery({ queryKey: ['daily-social', scope], queryFn: async () => dailyRequest(await auth.getToken()), retry: false, refetchInterval: false });
    const [selected, setSelected] = useState<string | null>(null); const [copyLanguage, setCopyLanguage] = useState<'en' | 'ne'>('ne');
    const [editingCaptions, setEditingCaptions] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [busy, setBusy] = useState(false); const lock = useRef(false);
    const edition = editions.data?.find(item => item.id === selected);
    const run = async (operation: () => Promise<void>) => {
        if (lock.current || exporting) return; lock.current = true; setBusy(true);
        try { await operation(); } catch (error) { useAppStore.getState().setNotice(error instanceof Error ? error.message : 'Unable to open this edition.'); }
        finally { lock.current = false; setBusy(false); }
    };
    const openSlide = (item: DailyEdition, index: number) => run(async () => { await onOpen(item, copyLanguage, index); setSelected(null); });
    return <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><AppText variant="heading2" style={{ flex: 1 }}>{t('Daily social editions', 'दैनिक सामाजिक सञ्जाल पोस्ट')}</AppText><Button variant="ghost" disabled={busy || exporting || editingCaptions || editions.isFetching} accessibilityLabel="Refresh daily editions" onPress={() => { void editions.refetch(); }}><AppText variant="caption">{t('Refresh', 'रिफ्रेस')}</AppText></Button></View>
        <AppText variant="caption" colorToken="textSecondary">{t('7 AM morning brief · 9 PM day in review · Nepal time', 'बिहान ७ बजे · राति ९ बजे · नेपालको समय')}</AppText>
        <AppText variant="bodySmall" colorToken="textSecondary">{t('English + Nepali captions and portrait carousel copy. Source-linked drafts for your review.', 'अंग्रेजी र नेपाली क्याप्सन तथा क्यारोसेल सामग्री। समीक्षा गर्न स्रोतसहितका मस्यौदा।')}</AppText>
        {editions.isPending ? <AppText variant="caption">{t('Loading daily drafts…', 'दैनिक मस्यौदा लोड हुँदैछ…')}</AppText> : editions.isError ? <Button variant="outline" onPress={() => { void editions.refetch(); }}><AppText variant="label">{t('Retry daily editions', 'दैनिक पोस्ट फेरि लोड गर्नुहोस्')}</AppText></Button> : !editions.data?.length ? <AppText variant="bodySmall" colorToken="textSecondary">{t('The first researched edition will appear here. Sections without verified sources are omitted.', 'पहिलो अनुसन्धान गरिएको पोस्ट यहाँ आउनेछ। प्रमाणित स्रोत नभएका खण्ड समावेश गरिँदैनन्।')}</AppText> : null}
        {editions.data?.slice(0, 4).map(item => <Button key={item.id} variant="outline" onPress={() => setSelected(item.id)} style={{ height: "auto", minHeight: 100, padding: spacing.card, borderRadius: radius.lg, justifyContent: 'flex-start', gap: spacing.md }}>
            {item.edition === 'morning' ? <Sun size={layout.iconLarge} color={colors.brandRed} /> : <Moon size={layout.iconLarge} color={colors.brandRed} />}
            <View style={{ flex: 1, gap: spacing.xs }}><AppText variant="label">{item.title[language]}</AppText><AppText variant="meta" colorToken="textSecondary">{item.date} · {item.slides.length + 1} {t('slides / language', 'स्लाइड / भाषा')} · EN / नेपाली</AppText><AppText variant="caption" colorToken={item.status === 'ready' ? 'textSecondary' : 'brandRed'}>{item.status === 'ready' ? t('Ready', 'तयार') : item.status === 'in_review' ? t('In review', 'समीक्षा हुँदै') : t('Draft', 'मस्यौदा')}</AppText></View><ArrowUpRight size={layout.iconSmall} color={colors.textSecondary} />
        </Button>)}
        <Modal transparent visible={Boolean(edition)} animationType="slide" onRequestClose={() => { if (!exporting && !editingCaptions) setSelected(null); }}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}><View style={{ maxHeight: '90%', backgroundColor: colors.surfaceElevated, padding: spacing.gutter, paddingBottom: insets.bottom + spacing.lg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}><AppText variant="overline" style={{ flex: 1 }}>INSTAGRAM / FACEBOOK</AppText><Button variant="ghost" size="icon" accessibilityLabel="Close daily edition" disabled={exporting || editingCaptions} onPress={() => setSelected(null)}><X size={layout.iconSize} color={colors.textPrimary} /></Button></View>
                {edition ? <ScrollView automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
                    <AppText variant="heading2" contentLanguage={copyLanguage}>{edition.title[copyLanguage]}</AppText>
                    <AppText variant="caption" colorToken="textSecondary">{edition.date} · {t('Prepared', 'तयार')} {new Date(edition.createdAt).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit' })} NPT</AppText>
                    <SegmentedControl label={t('Preview language', 'सामग्रीको भाषा')} value={copyLanguage} onChange={setCopyLanguage} options={[{ value: 'ne', label: 'नेपाली' }, { value: 'en', label: 'English' }]} />
                    <Button disabled={busy || exporting || editingCaptions} onPress={() => { void openSlide(edition, 0); }}><AppText variant="label" colorToken="onPrimary">{t('Prepare both carousels', 'दुवै भाषाका क्यारोसेल तयार गर्नुहोस्')}</AppText></Button>
                    <AppText variant="caption" colorToken="textSecondary">{t('Creates 1080 × 1350 drafts in both languages. Finish slides in the editor, then export the complete set below.', 'दुवै भाषामा १०८० × १३५० मस्यौदा बन्छन्। सम्पादन र निर्यात गर्न हरेक स्लाइड खोल्नुहोस्।')}</AppText>
                    <CarouselExport disabled={busy || editingCaptions} scope={scope} edition={edition} onBusy={setExporting} />
                    {edition.slides.map((slide, index) => <View key={index} style={{ gap: spacing.sm, borderTopWidth: layout.ruleWidth, borderTopColor: colors.border, paddingTop: spacing.md }}>
                        <AppText variant="overline" colorToken="textSecondary">{index + 2} / {edition.slides.length + 1} · {slide.section}</AppText><AppText variant="heading3" contentLanguage={copyLanguage}>{slide.headline[copyLanguage]}</AppText><AppText variant="bodySmall" contentLanguage={copyLanguage}>{slide.body[copyLanguage]}</AppText>
                        {slide.sourceIds.map(id => { const source = edition.sources.find(value => value.id === id); return source ? <Button key={id} variant="ghost" size="sm" onPress={() => { void run(async () => { await Linking.openURL(source.url); }); }}><AppText variant="caption" colorToken="brandRed">{source.name} ↗</AppText></Button> : null; })}
                        <Button variant="outline" disabled={busy || exporting || editingCaptions} onPress={() => { void openSlide(edition, index + 1); }}><AppText variant="label">{t('Open this slide in editor', 'यो स्लाइड सम्पादकमा खोल्नुहोस्')}</AppText></Button>
                    </View>)}
                    <AppText variant="heading3">{t('Caption', 'क्याप्सन')}</AppText><AppText variant="bodySmall" contentLanguage={copyLanguage} selectable>{edition.caption[copyLanguage]}</AppText>
                    <Button variant="outline" disabled={busy || exporting || editingCaptions} onPress={() => { void run(async () => { await Share.share({ message: editionCaption(edition) }); }); }}><AppText variant="label">{t('Share bilingual caption', 'दुवै भाषाको क्याप्सन सेयर गर्नुहोस्')}</AppText></Button>
                    <CaptionEditor key={edition.id} edition={edition} disabled={busy || exporting} onEditing={setEditingCaptions} onSaved={() => editions.refetch()} />
                    {edition.omissions.map((item, index) => <AppText key={index} variant="caption" contentLanguage={copyLanguage} colorToken="textSecondary">{item[copyLanguage]}</AppText>)}
                    <AppText variant="heading3">{t('Source evidence', 'स्रोतको आधार')}</AppText>
                    {edition.sources.map(source => <View key={source.id} style={{ gap: spacing.xs }}><AppText variant="label">{source.name}</AppText><AppText variant="caption" colorToken="textSecondary">{source.support}</AppText><AppText variant="meta" colorToken="textTertiary">{t('Checked', 'जाँच')} {new Date(source.verifiedAt).toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} NPT</AppText></View>)}
                    <AppText variant="heading3">{t('Editorial status', 'सम्पादकीय स्थिति')}</AppText>
                    <AppText variant="label">{edition.status === 'ready' ? t('Ready', 'तयार') : edition.status === 'in_review' ? t('In review', 'समीक्षा हुँदै') : t('Draft', 'मस्यौदा')}</AppText>
                    {edition.reviewInvalidatedAt ? <AppText variant="caption" colorToken="brandRed">{t('Copy changed after review started. Review the updated captions again.', 'समीक्षा सुरु भएपछि सामग्री परिवर्तन भयो। अद्यावधिक क्याप्सन फेरि समीक्षा गर्नुहोस्।')}</AppText> : null}
                    <AppText variant="caption" colorToken="textSecondary">{t('Check both languages and source links before marking ready. Saved slide designs need a separate visual check.', 'तयार चिन्ह लगाउनुअघि दुवै भाषा र स्रोत जाँच्नुहोस्। सुरक्षित स्लाइड डिजाइन छुट्टै हेर्नुहोस्।')}</AppText>
                    <Button variant="outline" disabled={busy || exporting || editingCaptions} onPress={() => { void run(async () => { await dailyRequest(await auth.getToken(), { id: edition.id, updatedAt: edition.updatedAt, status: edition.status === 'draft' ? 'in_review' : edition.status === 'in_review' ? 'ready' : 'in_review' }); await editions.refetch(); }); }}><AppText variant="label">{edition.status === 'draft' ? t('Send to review', 'समीक्षामा पठाउनुहोस्') : edition.status === 'in_review' ? t('Mark ready', 'तयार चिन्ह लगाउनुहोस्') : t('Return to review', 'समीक्षामा फर्काउनुहोस्')}</AppText></Button>
                    {edition.status !== 'draft' ? <Button variant="ghost" disabled={busy || exporting || editingCaptions} onPress={() => { void run(async () => { await dailyRequest(await auth.getToken(), { id: edition.id, updatedAt: edition.updatedAt, status: 'draft' }); await editions.refetch(); }); }}><AppText variant="label">{t('Return to draft', 'मस्यौदामा फर्काउनुहोस्')}</AppText></Button> : null}
                </ScrollView> : null}
            </View></View>
        </Modal>
    </View>;
}
