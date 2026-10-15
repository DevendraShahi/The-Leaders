import { StyleSheet, View } from "react-native";
import { AppText } from "./primitives/AppText";
import { spacing } from "@/theme/tokens";

export function SectionHeader({ title, detail }: { title: string; detail?: string }) {
    return <View style={styles.row}>
        <AppText variant="uiTitle" style={{ flex: 1 }}>{title}</AppText>
        {detail ? <AppText variant="caption" colorToken="textSecondary" style={{ flexShrink: 1 }}>{detail}</AppText> : null}
    </View>;
}
const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "baseline", gap: spacing.md, paddingBottom: spacing.sm } });
