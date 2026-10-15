import { StyleSheet, View } from "react-native";
import { Bookmark, Share2 } from "lucide-react-native";
import { ArticleRow } from "./ArticleRow";
import { AppText } from "./primitives/AppText";
import { Button } from "@/components/ui/button";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";
import { storyDate, readingLabel } from "@/utils/editorial";
import { layout, spacing } from "@/theme/tokens";

export function TimelineRow({ category, title, image, publishedAt, readingMinutes, now, recyclingKey, isFlash = false, saved = false, flashLabel, bookmarkLabel, shareLabel, onPress, onBookmark, onShare }: {
    category: string; title: string; image?: string; publishedAt: string; readingMinutes?: number; now: number;
    recyclingKey?: string; isFlash?: boolean; saved?: boolean; flashLabel?: string;
    bookmarkLabel?: string; shareLabel?: string; onPress: () => void; onBookmark: () => void; onShare: () => void;
}) {
    const colors = useColors();
    const { language } = useLanguage();
    const metadata = [storyDate(publishedAt, language, now), readingLabel(readingMinutes, language)].filter(Boolean).join(" · ");
    return <View style={[styles.story, { borderBottomColor: colors.border }]}>
        <ArticleRow layout="home" title={title} image={image} recyclingKey={recyclingKey}
            kicker={isFlash ? flashLabel : category} isBreaking={isFlash} onPress={onPress} />
        <View style={styles.footer}>
            <AppText variant="caption" colorToken="textSecondary" style={styles.metadata}>{metadata}</AppText>
            <View style={styles.actions}>
                <Button variant="ghost" size="icon" accessibilityLabel={shareLabel} onPress={onShare}><Share2 size={layout.iconSmall} color={colors.textSecondary} /></Button>
                <Button variant="ghost" size="icon" accessibilityLabel={bookmarkLabel} accessibilityState={{ selected: saved }} onPress={onBookmark}><Bookmark size={layout.iconSmall} color={saved ? colors.brandRed : colors.textSecondary} fill={saved ? colors.brandRed : "transparent"} /></Button>
            </View>
        </View>
    </View>;
}
const styles = StyleSheet.create({
    story: { borderBottomWidth: layout.ruleWidth, paddingBottom: spacing.sm },
    footer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: -spacing.sm },
    metadata: { flex: 1, minWidth: 0 },
    actions: { flexDirection: "row", flexShrink: 0 },
});
