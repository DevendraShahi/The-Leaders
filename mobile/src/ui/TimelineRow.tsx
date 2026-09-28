import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Share2, Star } from "lucide-react-native";
import { AppText } from "./primitives/AppText";
import { useLanguage } from "@/i18n/language";

import { useColors } from "@/theme/Theme";

function relativeShort(iso: string, now: number, language: "en" | "ne") {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const minutes = Math.max(0, Math.round((now - then) / 60000));
    if (language === "ne") {
        if (minutes < 1) return "अहिले";
        if (minutes < 60) return `${minutes} मि`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `${hours} घ`;
        return `${Math.round(hours / 24)} दि`;
    }
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
}

function initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    const first = parts[0].slice(0, 1);
    const second = parts.length > 1 ? parts[1].slice(0, 1) : "";
    return `${first}${second}`.toUpperCase();
}

export function TimelineRow({
    author,
    title,
    excerpt,
    image,
    publishedAt,
    now,
    recyclingKey,
    isFlash = false,
    saved = false,
    flashLabel,
    bookmarkLabel,
    shareLabel,
    onPress,
    onBookmark,
    onShare,
}: {
    author: string;
    title: string;
    excerpt?: string;
    image?: string;
    publishedAt: string;
    now: number;
    recyclingKey?: string;
    isFlash?: boolean;
    saved?: boolean;
    flashLabel?: string;
    bookmarkLabel?: string;
    shareLabel?: string;
    onPress: () => void;
    onBookmark: () => void;
    onShare: () => void;
}) {
    const { language } = useLanguage();
    const colors = useColors();
    const isNe = language === "ne";
    const when = relativeShort(publishedAt, now, language);
    const mark = initials(author);

    return (
        <View className="border-b border-border py-4">
            <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
                    <AppText variant="caption" weight="bold" colorToken="textPrimary">{mark}</AppText>
                </View>
                <View className="min-w-0 flex-1">
                    <AppText variant="body" weight="bold" numberOfLines={1}>
                        {author}
                    </AppText>
                    {when ? (
                        <AppText variant="caption" colorToken="textSecondary">{when}</AppText>
                    ) : null}
                </View>
            </View>

            <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-80">
                {image ? (
                    <Image
                        source={{ uri: image }}
                        recyclingKey={recyclingKey || image}
                        contentFit="cover"
                        className="mt-3 aspect-[16/10] w-full rounded-lg bg-surface-secondary"
                    />
                ) : null}
                {isFlash && flashLabel ? (
                    <AppText variant="overline" weight="bold" colorToken="primary" style={{ marginTop: 12 }}>
                        {flashLabel}
                    </AppText>
                ) : null}
                <AppText
                    variant={isNe ? "heading3" : "body"}
                    weight="bold"
                    style={{ marginTop: 8 }}
                >
                    {title}
                </AppText>
                {excerpt ? (
                    <AppText variant="caption" colorToken="textSecondary" numberOfLines={3} style={{ marginTop: 4 }}>
                        {excerpt}
                    </AppText>
                ) : null}
            </Pressable>

            <View className="mt-1 flex-row items-center">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={shareLabel}
                    onPress={onShare}
                    className="h-11 w-11 items-center justify-center"
                >
                    <Share2 size={18} color={colors.textPrimary} />
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={bookmarkLabel}
                    onPress={onBookmark}
                    className="h-11 w-11 items-center justify-center"
                >
                    <Star
                        size={18}
                        color={saved ? colors.brandRed : colors.textSecondary}
                        fill={saved ? colors.brandRed : "transparent"}
                    />
                </Pressable>
            </View>
        </View>
    );
}
