import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppText } from '@/ui/primitives/AppText';
import { fontFamilies, spacing } from '@/theme/tokens';
import { useSessionAuth } from '@/services/AuthProvider';
import { useLanguage } from '@/i18n/language';
import { dailyRequest, type DailyEdition } from './api';

export function CaptionEditor({ edition, disabled, onEditing, onSaved }: { edition: DailyEdition; disabled: boolean; onEditing: (editing: boolean) => void; onSaved: () => Promise<unknown> }) {
    const auth = useSessionAuth(); const { language } = useLanguage();
    const t = (en: string, ne: string) => language === 'ne' ? ne : en;
    const [editing, setEditing] = useState(false); const [saving, setSaving] = useState(false);
    const [caption, setCaption] = useState(edition.caption); const version = useRef(edition.updatedAt);
    const lock = useRef(false); const [error, setError] = useState('');
    const finish = () => { setEditing(false); onEditing(false); setError(''); };
    const save = async () => {
        if (lock.current) return; lock.current = true; setSaving(true); setError('');
        try {
            await dailyRequest(await auth.getToken(), { id: edition.id, updatedAt: version.current, caption });
            await onSaved(); finish();
        } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save captions.'); }
        finally { lock.current = false; setSaving(false); }
    };
    return <View style={{ gap: spacing.sm }}>
        {!editing ? <Button variant="outline" disabled={disabled} onPress={() => { setCaption(edition.caption); version.current = edition.updatedAt; setEditing(true); onEditing(true); }}><AppText variant="label">{t('Edit bilingual captions', 'दुवै भाषाका क्याप्सन सम्पादन')}</AppText></Button> : <>
            <AppText variant="caption" colorToken="textSecondary">{t('Changing captions returns this edition to Draft for another review. Slide designs remain in the editor.', 'क्याप्सन परिवर्तन गर्दा यो पोस्ट पुनः समीक्षाका लागि मस्यौदामा फर्किन्छ। स्लाइड डिजाइन सम्पादकमा रहन्छन्।')}</AppText>
            {(['ne', 'en'] as const).map(lang => <View key={lang} style={{ gap: spacing.xs }}>
                <AppText variant="label">{lang === 'ne' ? 'नेपाली क्याप्सन' : 'English caption'}</AppText>
                <Input accessibilityLabel={lang === 'ne' ? 'Edit Nepali caption' : 'Edit English caption'} multiline editable={!saving} value={caption[lang]} maxLength={1800} onChangeText={value => setCaption(current => ({ ...current, [lang]: value }))} style={{ minHeight: 140, textAlignVertical: 'top', fontFamily: fontFamilies.ui[lang].regular, fontSize: 16, lineHeight: lang === 'ne' ? 28 : 24, letterSpacing: 0, includeFontPadding: true }} />
                <AppText variant="meta" colorToken="textSecondary">{caption[lang].length} / 1800</AppText>
            </View>)}
            {error ? <AppText variant="caption" colorToken="brandRed">{error}</AppText> : null}
            <Button disabled={saving || !caption.en.trim() || !caption.ne.trim()} onPress={() => { void save(); }}><AppText variant="label" colorToken="onPrimary">{saving ? t('Saving…', 'सुरक्षित गर्दै…') : t('Save captions', 'क्याप्सन सुरक्षित गर्नुहोस्')}</AppText></Button>
            <Button variant="ghost" disabled={saving} onPress={finish}><AppText variant="label">{t('Cancel edits', 'सम्पादन रद्द गर्नुहोस्')}</AppText></Button>
        </>}
    </View>;
}
