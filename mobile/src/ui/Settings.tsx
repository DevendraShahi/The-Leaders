import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { AppText } from "./primitives/AppText";
import { SectionHeader } from "./SectionHeader";
import { useColors } from "@/theme/Theme";
import { layout, spacing, radius } from "@/theme/tokens";

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
    return <View style={styles.group}><SectionHeader title={title} />{children}</View>;
}
export function SettingsRow({ title, description, children, onPress }: { title: string; description?: string; children?: ReactNode; onPress?: () => void }) {
    const colors = useColors();
    const content = <><View style={styles.copy}><AppText variant="body" weight="medium">{title}</AppText>{description ? <AppText variant="caption" colorToken="textSecondary">{description}</AppText> : null}</View>{children ?? (onPress ? <ChevronRight size={layout.iconSize} color={colors.textSecondary} /> : null)}</>;
    if (onPress) return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]}>{content}</Pressable>;
    return <View style={[styles.row, { borderBottomColor: colors.border }]}>{content}</View>;
}
export function SegmentedControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void }) {
    const colors = useColors();
    return <View style={styles.control}>
        <AppText variant="label">{label}</AppText>
        <View style={[styles.segments, { backgroundColor: colors.surfaceSecondary }]}>
            {options.map((option) => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: option.value === value }} onPress={() => onChange(option.value)} style={[styles.segment, { backgroundColor: option.value === value ? colors.surfaceElevated : "transparent", borderColor: option.value === value ? colors.brandRed : "transparent" }]}>
                <AppText variant="meta" weight="semibold" colorToken={option.value === value ? "brandRed" : "textSecondary"} align="center">{option.label}</AppText>
            </Pressable>)}
        </View>
    </View>;
}
const styles = StyleSheet.create({
    group: { gap: spacing.sm }, copy: { flex: 1, minWidth: 0, gap: spacing.xs },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: layout.controlHeight, paddingVertical: spacing.md, borderBottomWidth: layout.ruleWidth },
    control: { gap: spacing.sm }, segments: { padding: spacing.xs, flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, borderRadius: radius.md },
    segment: { flexGrow: 1, flexBasis: 60, minHeight: layout.touchTarget, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, justifyContent: "center", borderRadius: radius.sm, borderWidth: layout.ruleWidth },
});
