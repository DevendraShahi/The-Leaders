import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "./primitives/AppText";
import { useColors } from "@/theme/Theme";
import { layout, spacing } from "@/theme/tokens";

/** A persistent, scrollable topic selector with full-sized touch targets. */
export function TopicTabs({ items, selected, onSelect }: {
    items: { key: string; label: string }[];
    selected: string;
    onSelect: (key: string) => void;
}) {
    const colors = useColors();
    const scroll = useRef<ScrollView>(null);
    const firstKey = items[0]?.key;
    useEffect(() => {
        if (selected === firstKey) scroll.current?.scrollTo({ x: 0, animated: true });
    }, [selected, firstKey]);
    return <View style={{ borderBottomWidth: layout.ruleWidth, borderBottomColor: colors.border }}>
        <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
            {items.map(item => {
                const active = item.key === selected;
                return <Pressable key={item.key} accessibilityRole="tab" accessibilityLabel={item.label}
                    accessibilityState={{ selected: active }} onPress={() => onSelect(item.key)}
                    style={[styles.tab, { borderBottomColor: active ? colors.brandRed : "transparent" }]}>
                    <AppText variant="label" weight={active ? "bold" : "medium"} colorToken={active ? "brandRed" : "textSecondary"}>{item.label}</AppText>
                </Pressable>;
            })}
        </ScrollView>
    </View>;
}
const styles = StyleSheet.create({
    content: { paddingHorizontal: spacing.gutter, gap: spacing.lg, alignItems: "center" },
    tab: { minHeight: layout.touchTarget, minWidth: layout.touchTarget, justifyContent: "center", alignItems: "center", borderBottomWidth: 2, paddingHorizontal: spacing.xs },
});
