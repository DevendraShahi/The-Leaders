import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Bookmark } from "lucide-react-native";
import { AppText } from "./primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

import { useColors } from "@/theme/Theme";

export function StoryCard({
    kicker,
    title,
    summary,
    meta,
    image,
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
    recyclingKey?: string;
    saved?: boolean;
    bookmarkLabel?: string;
    onPress: () => void;
    onBookmark?: () => void;
}) {
    const { language } = useLanguage();
    const colors = useColors();
    const isNe = language === "ne";

    const scale = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <View className="mx-5">
            <AnimatedPressable
                style={style}
                onPressIn={() => { scale.value = withSpring(0.975, { damping: 20, stiffness: 300 }); }}
                onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
                onPress={onPress}
                accessibilityRole="button"
            >
                {image ? (
                    <View className="overflow-hidden rounded-lg bg-surface-secondary">
                        <Image
                            source={{ uri: image }}
                            recyclingKey={recyclingKey || image}
                            contentFit="cover"
                            className="aspect-video w-full"
                        />
                    </View>
                ) : null}

                {kicker ? (
                    <View className="mt-3 flex-row items-center gap-1.5">
                        <View className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <AppText variant="overline" colorToken="primary">
                            {kicker}
                        </AppText>
                    </View>
                ) : null}

                <AppText
                    variant={isNe ? "heading1" : "heading2"}
                    weight="bold"
                    style={{ marginTop: 4 }}
                >
                    {title}
                </AppText>

                {summary ? (
                    <AppText
                        variant="body"
                        colorToken="textSecondary"
                        style={{ marginTop: 8 }}
                    >
                        {summary}
                    </AppText>
                ) : null}
            </AnimatedPressable>

            {meta || onBookmark ? (
                <View className="mt-1 flex-row items-center justify-between gap-3">
                    <Pressable accessibilityRole="button" onPress={onPress} className="min-h-11 min-w-0 flex-1 justify-center">
                        {meta ? (
                            <AppText variant="caption" colorToken="textTertiary" numberOfLines={1}>
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
                            className="h-11 w-11 rounded-lg"
                        >
                            <Bookmark
                                size={16}
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
