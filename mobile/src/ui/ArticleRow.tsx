import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { AppText } from "./primitives/AppText";
import { useColors } from "@/theme/Theme";
import { layout, radius, spacing } from "@/theme/tokens";

/** The single compact story layout used by home, search, categories and authors. */
export function ArticleRow({ kicker, title, meta, image, recyclingKey, onPress, isBreaking, layout: variant = "default" }: {
    kicker?: string; title: string; meta?: string; image?: string;
    recyclingKey?: string; onPress: () => void; isBreaking?: boolean; layout?: "default" | "home";
}) {
    const colors = useColors();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={onPress}
            style={[styles.row, {
                borderTopWidth: variant === "home" ? 0 : layout.ruleWidth,
                borderColor: colors.border,
            }]}
        >
            <View style={styles.copy}>
                {kicker ? <AppText variant="overline" colorToken={isBreaking ? "brandRed" : "textSecondary"}>{kicker}</AppText> : null}
                <AppText variant="storyTitle" weight="semibold">{title}</AppText>
                {meta ? <AppText variant="meta" colorToken="textSecondary">{meta}</AppText> : null}
            </View>
            {image ? <Image source={{ uri: image }} recyclingKey={recyclingKey || image} contentFit="cover" accessibilityIgnoresInvertColors style={[styles.image, { backgroundColor: colors.surfaceSecondary }]} /> : null}
        </Pressable>
    );
}
const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-start", gap: layout.rowGap, paddingVertical: spacing.lg, minHeight: layout.touchTarget },
    copy: { flex: 1, minWidth: 0, gap: spacing.xs },
    image: { width: layout.thumbnailWidth, height: layout.thumbnailHeight, borderRadius: radius.sm, flexShrink: 0 },
});
