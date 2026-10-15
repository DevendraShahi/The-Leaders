import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { radius, spacing } from "@/theme/tokens";

import { TRACK_HEIGHT, THUMB, valueFromVerticalPoint } from "./vertical-slider";

export function StudioVerticalSlider({ label, value, min, max, step, unit, disabled, onStart, onChange, onEnd }: {
    label: string; value: number; min: number; max: number; step: number; unit: string; disabled: boolean;
    onStart: () => void; onChange: (value: number) => void; onEnd: (value: number) => void;
}) {
    const colors = useColors();
    const progress = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const handlers = useRef({ value, onStart, onChange, onEnd });
    useEffect(() => { handlers.current = { value, onStart, onChange, onEnd }; }, [value, onStart, onChange, onEnd]);
    const gesture = useMemo(() => Gesture.Pan().enabled(!disabled).runOnJS(true).minDistance(0)
        // These callbacks are stored by the gesture builder and run after render.
        // eslint-disable-next-line react-hooks/refs
        .onStart(event => { handlers.current.onStart(); handlers.current.onChange(valueFromVerticalPoint(event.y, min, max, step)); })
        // eslint-disable-next-line react-hooks/refs
        .onUpdate(event => handlers.current.onChange(valueFromVerticalPoint(event.y, min, max, step)))
        // eslint-disable-next-line react-hooks/refs
        .onEnd(event => handlers.current.onEnd(valueFromVerticalPoint(event.y, min, max, step)))
        // eslint-disable-next-line react-hooks/refs
        .onFinalize((_event, success) => { if (!success) handlers.current.onEnd(handlers.current.value); }), [disabled, min, max, step]);
    const nudge = (amount: number) => {
        const next = Math.max(min, Math.min(max, value + amount));
        onStart(); onChange(next); onEnd(next);
    };
    return <View style={[styles.control, { opacity: disabled ? 0.45 : 1 }]}>
        <View style={styles.heading}><AppText variant="bodySmall" weight="medium">{label}</AppText><View style={[styles.value, { backgroundColor: colors.surfaceSecondary }]}><AppText variant="caption" weight="semibold" style={{ fontVariant: ["tabular-nums"] }}>{value}{unit}</AppText></View></View>
        <View style={[styles.body, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.labels}><AppText variant="caption" colorToken="textSecondary">Up</AppText><AppText variant="caption" colorToken="textSecondary">Centre</AppText><AppText variant="caption" colorToken="textSecondary">Down</AppText></View>
            <GestureDetector gesture={gesture}>
                <View accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityHint="Move upward to move text up, downward to move it down" accessibilityState={{ disabled }} accessibilityValue={{ min, max, now: value, text: `${value}${unit}` }} accessibilityActions={[{ name: "increment", label: "Move down" }, { name: "decrement", label: "Move up" }]} onAccessibilityAction={event => { if (!disabled) nudge(event.nativeEvent.actionName === "increment" ? step : -step); }} style={styles.touchTrack}>
                    <View pointerEvents="none" style={[styles.rail, { backgroundColor: colors.border }]} />
                    <View pointerEvents="none" style={[styles.fill, { height: (TRACK_HEIGHT - THUMB) * progress, backgroundColor: colors.brandRed }]} />
                    {[0, 0.25, 0.5, 0.75, 1].map(tick => <View pointerEvents="none" key={tick} style={[styles.tick, { top: THUMB / 2 + tick * (TRACK_HEIGHT - THUMB), backgroundColor: colors.textTertiary }]} />)}
                    <View pointerEvents="none" style={[styles.thumb, { top: (TRACK_HEIGHT - THUMB) * progress, backgroundColor: colors.background, borderColor: colors.brandRed }]}><View style={[styles.dot, { backgroundColor: colors.brandRed }]} /></View>
                </View>
            </GestureDetector>
        </View>
    </View>;
}
const styles = StyleSheet.create({
    control: { gap: spacing.sm }, heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    value: { minWidth: 56, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.md, alignItems: "center" },
    body: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, borderRadius: radius.lg },
    labels: { height: TRACK_HEIGHT, justifyContent: "space-between", paddingVertical: THUMB / 2 },
    touchTrack: { width: 64, height: TRACK_HEIGHT }, rail: { position: "absolute", width: 6, top: THUMB / 2, bottom: THUMB / 2, left: 29, borderRadius: radius.full },
    fill: { position: "absolute", width: 6, top: THUMB / 2, left: 29, borderRadius: radius.full },
    tick: { position: "absolute", left: 49, width: 4, height: 1 },
    thumb: { position: "absolute", left: 19, width: THUMB, height: THUMB, borderRadius: radius.full, borderWidth: 3, alignItems: "center", justifyContent: "center" },
    dot: { width: 4, height: 4, borderRadius: radius.full },
});
