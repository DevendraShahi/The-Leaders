import { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { AppText } from "@/ui/AppText";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { useAppStore } from "@/state/useAppStore";

type IonName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, { outline: IonName; filled: IonName; label: { en: string; ne: string } }> = {
    index: { outline: "home-outline", filled: "home", label: ui.home },
    latest: { outline: "time-outline", filled: "time", label: ui.latest },
    explore: { outline: "compass-outline", filled: "compass", label: ui.explore },
    saved: { outline: "bookmark-outline", filled: "bookmark", label: ui.saved },
    profile: { outline: "person-outline", filled: "person", label: ui.profile },
};

import { useColors } from "@/theme/Theme";

const CONTENT_HEIGHT = 60;

function TabGlyph({ name, color, size, active }: { name: IonName; color: string; size: number; active: boolean }) {
    const opacity = useRef(new Animated.Value(1)).current;
    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        opacity.setValue(0.55);
        Animated.timing(opacity, {
            toValue: 1,
            duration: 160,
            useNativeDriver: true,
        }).start();
    }, [active, opacity]);

    return (
        <Animated.View style={{ opacity }}>
            <Ionicons name={name} size={size} color={color} />
        </Animated.View>
    );
}

export function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const colors = useColors();

    return (
        <View
            style={[
                styles.bar,
                {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    height: CONTENT_HEIGHT + insets.bottom,
                    paddingBottom: insets.bottom,
                },
            ]}
        >
            {state.routes.map((route, index) => {
                const item = ICONS[route.name];
                if (!item) return null;
                const active = state.index === index;
                const iconColor = active ? colors.brandRed : colors.textTertiary;
                const labelColor = active ? colors.textPrimary : colors.textTertiary;
                const label = pick(item.label, language);
                const nepali = language === "ne";
                return (
                    <Pressable
                        key={route.key}
                        accessibilityRole="tab"
                        accessibilityLabel={label}
                        accessibilityState={{ selected: active }}
                        onPress={() => {
                            const event = navigation.emit({
                                type: "tabPress",
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (active || event.defaultPrevented) return;
                            if (Platform.OS !== "web") {
                                void Haptics.selectionAsync();
                            }
                            navigation.navigate(route.name);
                        }}
                        style={styles.item}
                    >
                        <TabGlyph
                            name={active ? item.filled : item.outline}
                            color={iconColor}
                            size={active ? 24 : 23}
                            active={active}
                        />
                        <AppText
                            variant="meta"
                            style={{
                                color: labelColor,
                                fontSize: 11,
                                lineHeight: 14,
                                fontFamily: nepali
                                    ? active
                                        ? "Hind_600SemiBold"
                                        : "Hind_400Regular"
                                    : active
                                      ? "Manrope_600SemiBold"
                                      : "Manrope_500Medium",
                            }}
                            numberOfLines={1}
                        >
                            {label}
                        </AppText>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        borderTopWidth: 1,
        paddingTop: 7,
        paddingHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        elevation: Platform.OS === "android" ? 4 : 0,
        shadowOpacity: 0,
    },
    item: {
        flex: 1,
        minWidth: 64,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
});
