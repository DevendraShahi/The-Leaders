import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Check, RotateCcw } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { fontFamilies, layout, radius, spacing } from "@/theme/tokens";
import { normalizeTextColor, textColorPalette } from "./text-colors";

export function TextColorPicker({ color, disabled, label, title = "Font color", showTitle = true, resetColor = null, onChange }: { color: string | null; disabled: boolean; label: string; title?: string; showTitle?: boolean; resetColor?: string | null; onChange: (color: string | null) => void }) {
    const colors = useColors();
    const [hex, setHex] = useState(color ?? "");
    const validColor = normalizeTextColor(hex);
    return <View style={styles.control}>
        <View style={[styles.heading, !showTitle && { justifyContent: "flex-end" }]}>{showTitle ? <AppText variant="label">{title}</AppText> : null}<Button variant="ghost" accessibilityLabel={`Reset ${label.toLowerCase()} color`} disabled={disabled || color?.toUpperCase() === resetColor?.toUpperCase()} onPress={() => onChange(resetColor)}><RotateCcw size={layout.iconSmall} color={colors.textSecondary} /><AppText variant="caption">Reset</AppText></Button></View>
        <View accessibilityRole="radiogroup" accessibilityLabel={`${label} color palette`} style={[styles.palette, { opacity: disabled ? .45 : 1 }]}>
            {textColorPalette.map(swatch => {
                const selected = color?.toUpperCase() === swatch.value.toUpperCase();
                const dark = ["Ink", "Leaders red"].includes(swatch.name);
                return <Pressable key={swatch.value} disabled={disabled} accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }} accessibilityLabel={`${label} color: ${swatch.name}`} onPress={() => onChange(swatch.value)} style={[styles.swatch, { borderColor: selected ? colors.brandRed : colors.border }]}><View style={[styles.fill, { backgroundColor: swatch.value }]}>{selected ? <Check size={layout.iconSmall} color={dark ? "#FFFFFF" : "#111318"} /> : null}</View></Pressable>;
            })}
        </View>
        <View style={styles.custom}>
            <TextInput accessibilityLabel={`Custom ${label.toLowerCase()} hex color`} editable={!disabled} value={hex} onChangeText={setHex} autoCapitalize="characters" autoCorrect={false} maxLength={7} placeholder="#FFFFFF" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} onSubmitEditing={() => { if (!disabled && validColor) onChange(validColor); }} />
            <Button variant="outline" disabled={disabled || !validColor || validColor === color?.toUpperCase()} onPress={() => { if (validColor) onChange(validColor); }}><AppText variant="label">Apply</AppText></Button>
        </View>
        <AppText variant="caption" colorToken="textSecondary">{hex.trim() && !validColor ? "Enter a valid 3- or 6-digit hex color." : color ? `Selected ${color.toUpperCase()}` : "Template color · choose a swatch or enter a hex code."}</AppText>
    </View>;
}
const styles = StyleSheet.create({
    control: { gap: spacing.sm }, heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    palette: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    swatch: { width: layout.touchTarget, height: layout.touchTarget, borderWidth: 2, borderRadius: radius.full, padding: 3 },
    fill: { flex: 1, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
    custom: { flexDirection: "row", gap: spacing.sm },
    input: { flex: 1, minWidth: 0, minHeight: layout.touchTarget, borderWidth: layout.ruleWidth, borderRadius: radius.md, paddingHorizontal: spacing.md, fontFamily: fontFamilies.ui.en.medium, fontSize: 14 },
});
