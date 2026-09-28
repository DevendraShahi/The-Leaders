import { View } from "react-native";
import { Image } from "expo-image";
import { AppText } from "./primitives/AppText";
import { useLanguage } from "@/i18n/language";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Pressable } from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ArticleRow({
    kicker,
    title,
    meta,
    image,
    recyclingKey,
    onPress,
    isBreaking,
    layout = "default",
}: {
    kicker?: string;
    title: string;
    meta?: string;
    image?: string;
    recyclingKey?: string;
    onPress: () => void;
    isBreaking?: boolean;
    layout?: "default" | "home";
}) {
    const { language } = useLanguage();
    const isNe = language === "ne";

    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    if (layout === "home") {
        return (
            <AnimatedPressable
                accessibilityRole="button"
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.98, { damping: 22, stiffness: 300 }); }}
                onPressOut={() => { scale.value = withSpring(1, { damping: 22, stiffness: 300 }); }}
                style={animStyle}
                className="flex-row items-start gap-4 py-3"
            >
                <View className="min-w-0 flex-1 gap-1">
                    {kicker ? (
                        <AppText variant="overline" colorToken="primary">
                            {kicker}
                        </AppText>
                    ) : null}
                    <AppText
                        variant={isNe ? "heading3" : "body"}
                        weight={isNe ? "bold" : "bold"}
                        numberOfLines={3}
                    >
                        {title}
                    </AppText>
                    {meta ? (
                        <AppText variant="caption" colorToken="textSecondary" numberOfLines={1}>
                            {meta}
                        </AppText>
                    ) : null}
                </View>
                {image ? (
                    <View className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-secondary">
                        <Image
                            source={{ uri: image }}
                            recyclingKey={recyclingKey || image}
                            contentFit="cover"
                            className="h-full w-full"
                        />
                    </View>
                ) : null}
            </AnimatedPressable>
        );
    }

    return (
        <AnimatedPressable
            accessibilityRole="button"
            onPress={onPress}
            onPressIn={() => { scale.value = withSpring(0.98, { damping: 22, stiffness: 300 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 22, stiffness: 300 }); }}
            style={animStyle}
            className="flex-row gap-4 items-start py-4 border-t border-border"
        >
            <View className="flex-1 gap-1.5">
                {kicker ? (
                    <AppText
                        variant="overline"
                        colorToken={isBreaking ? "accent" : "textTertiary"}
                    >
                        {kicker}
                    </AppText>
                ) : null}
                <AppText
                    variant={isNe ? "body" : "heading3"}
                    weight="semibold"
                    numberOfLines={3}
                >
                    {title}
                </AppText>
                {meta ? (
                    <AppText
                        variant="caption"
                        colorToken="textSecondary"
                        numberOfLines={2}
                    >
                        {meta}
                    </AppText>
                ) : null}
            </View>
            {image ? (
                <Image
                    source={{ uri: image }}
                    recyclingKey={recyclingKey || image}
                    contentFit="cover"
                    className="w-22 h-16 rounded-sm bg-surface-secondary shrink-0"
                />
            ) : null}
        </AnimatedPressable>
    );
}
