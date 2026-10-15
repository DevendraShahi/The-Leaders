import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { layout, spacing } from "@/theme/tokens";

export function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const colors = useColors();
    const Icon = open ? ChevronDown : ChevronRight;
    return <View style={[styles.section, { borderColor: colors.border }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${open ? "Collapse" : "Expand"} ${title}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={styles.heading}><AppText variant="label">{title}</AppText><Icon size={layout.iconSmall} color={colors.textSecondary} /></Pressable>
        {open ? <View style={styles.content}>{children}</View> : null}
    </View>;
}
const styles = StyleSheet.create({ section: { borderTopWidth: layout.ruleWidth }, heading: { minHeight: layout.touchTarget, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, content: { gap: spacing.md, paddingBottom: spacing.sm } });
