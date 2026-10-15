import { Pressable, StyleSheet, View } from "react-native";
import { layout, radius, spacing } from "@/theme/tokens";
import { Image } from "expo-image";
import { Bookmark } from "lucide-react-native";
import { AppText } from "./primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";
import { useColors } from "@/theme/Theme";

export function StoryCard({
    kicker,
    title,
    summary,
    meta,
    image,
    variant = "standard",
    recyclingKey,
    saved = false,
    bookmarkLabel,
    onPress,
    onBookmark,
}: {
    kicker?: string;
    title: string;
    summary?: string;
    meta?: string;
    image?: string;
    variant?: "standard" | "lead";
    recyclingKey?: string;
    saved?: boolean;
    bookmarkLabel?: string;
    onPress: () => void;
    onBookmark?: () => void;
}) {
    const { language } = useLanguage();
    const colors = useColors();
    const isNe = language === "ne";
    const isLead = variant === "lead";


    return (
        <View style={{ marginHorizontal: spacing.gutter }}>
            <Pressable
                style={styles.story}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={title}
            >
                {image ? (
                    <View className="overflow-hidden rounded-sm bg-surface-secondary">
                        <Image
                            source={{ uri: image }}
                            recyclingKey={recyclingKey || image}
                            contentFit="cover"
                            className="w-full"
                            style={{ width: "100%", aspectRatio: layout.leadImageRatio, borderRadius: radius.sm }}
                        />
                    </View>
                ) : null}

                {kicker ? (
                    <View style={{ marginTop: spacing.md }}>
                        <AppText variant="overline" colorToken="brandRed">
                            {kicker}
                        </AppText>
                    </View>
                ) : null}

                <AppText
                    variant={isLead ? "leadTitle" : isNe ? "heading1" : "heading2"}
                    weight="semibold"
                    style={{ marginTop: spacing.sm }}
                >
                    {title}
                </AppText>

                {summary ? (
                    <AppText
                        variant="bodySmall"
                        colorToken="textSecondary"
                        numberOfLines={2}
                        style={{ marginTop: spacing.sm }}
                    >
                        {summary}
                    </AppText>
                ) : null}
            </Pressable>

            {meta || onBookmark ? (
                <View style={styles.footer}>
                    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={styles.metadata}>
                        {meta ? (
                            <AppText variant="meta" colorToken="textTertiary" numberOfLines={2}>
                                {meta}
                            </AppText>
                        ) : null}
                    </Pressable>
                    {onBookmark ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            accessibilityLabel={bookmarkLabel}
                            onPress={onBookmark}
                            className="h-touch w-touch"
                        >
                            <Bookmark
                                size={layout.iconSmall}
                                color={saved ? colors.brandRed : colors.textSecondary}
                                fill={saved ? colors.brandRed : "transparent"}
                            />
                        </Button>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    story: { width: "100%" },
    footer: { marginTop: spacing.xs, flexDirection: "row", alignItems: "center", gap: spacing.sm },
    metadata: { flex: 1, minWidth: 0, minHeight: layout.touchTarget, justifyContent: "center" },
});
