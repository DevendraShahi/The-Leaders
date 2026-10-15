import { View, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { useColors } from "@/theme/Theme";
import { AppText } from "@/ui/primitives/AppText";
import { layout, radius, spacing } from "@/theme/tokens";
import { StudioVerticalSlider } from "./StudioVerticalSlider";

export function StudioSlider({ label, value, min, max, step = 1, unit = "%", disabled = false, orientation = "horizontal", onStart, onChange, onEnd }: {
    label: string; value: number; min: number; max: number; step?: number; unit?: string; disabled?: boolean;
    orientation?: "horizontal" | "vertical";
    onStart: () => void; onChange: (value: number) => void; onEnd: (value: number) => void;
}) {
    const colors = useColors();
    if (orientation === "vertical") return <StudioVerticalSlider label={label} value={value} min={min} max={max} step={step} unit={unit} disabled={disabled} onStart={onStart} onChange={onChange} onEnd={onEnd} />;
    const progress = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return <View style={[styles.control, { opacity: disabled ? 0.45 : 1 }]}>
        <View style={styles.heading}><AppText variant="bodySmall" weight="medium">{label}</AppText><View style={[styles.value, { backgroundColor: colors.surfaceSecondary }]}><AppText variant="caption" weight="semibold" style={{ fontVariant: ["tabular-nums"] }}>{Math.round(value * 100) / 100}{unit}</AppText></View></View>
        <View style={styles.slider}>
            <View pointerEvents="none" style={styles.visual}>
                <View style={[styles.rail, { backgroundColor: colors.border }]} />
                <View style={[styles.rail, { backgroundColor: colors.brandRed, width: `${progress * 100}%` }]} />
                {[0, 0.25, 0.5, 0.75, 1].map(tick => <View key={tick} style={[styles.tick, { left: `${tick * 100}%`, backgroundColor: colors.textTertiary }]} />)}
                <View style={[styles.thumb, { left: `${progress * 100}%`, borderColor: colors.brandRed, backgroundColor: colors.background }]}><View style={[styles.dot, { backgroundColor: colors.brandRed }]} /></View>
            </View>
            <Slider accessibilityLabel={label} accessibilityValue={{ min, max, now: value, text: `${value}${unit}` }} disabled={disabled} style={styles.native} minimumTrackTintColor="transparent" maximumTrackTintColor="transparent" thumbTintColor="transparent" minimumValue={0} maximumValue={max - min} step={step} value={value - min} onSlidingStart={onStart} onValueChange={next => onChange(next + min)} onSlidingComplete={next => onEnd(next + min)} />
        </View>
    </View>;
}
const styles = StyleSheet.create({
    control: { gap: spacing.xs }, heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    value: { minWidth: 56, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.md, alignItems: "center" },
    slider: { height: layout.controlHeight, justifyContent: "center" }, visual: { position: "absolute", left: spacing.md, right: spacing.md, height: 28, justifyContent: "center" },
    rail: { position: "absolute", height: 6, left: 0, right: 0, borderRadius: radius.full },
    tick: { position: "absolute", width: 1, height: 4, top: 25 },
    thumb: { position: "absolute", width: 26, height: 26, marginLeft: -13, borderWidth: 3, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
    dot: { width: 4, height: 4, borderRadius: radius.full }, native: { width: "100%", height: layout.controlHeight },
});
