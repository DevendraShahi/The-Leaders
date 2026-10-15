import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { layout, radius, spacing } from "@/theme/tokens";
import { wheelMovement } from "./image-positioning";

export function ImageScrollBall({ x, y, disabled, disabledReason, onStart, onMove, onEnd }: {
    x: number; y: number; disabled: boolean; disabledReason: string;
    onStart: () => void; onMove: (dx: number, dy: number) => void; onEnd: () => void;
}) {
    const colors = useColors();
    const ballRef = useRef<View>(null);
    const handlers = useRef({ onStart, onMove, onEnd });
    const last = useRef({ x: 0, y: 0 });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [rolling, setRolling] = useState(false);
    const [roll, setRoll] = useState({ x: 0, y: 0 });
    useEffect(() => { handlers.current = { onStart, onMove, onEnd }; }, [onStart, onMove, onEnd]);
    useEffect(() => {
        if (Platform.OS !== "web" || disabled) return;
        const node = ballRef.current as unknown as HTMLElement | null;
        if (!node?.addEventListener) return;
        const wheel = (event: WheelEvent) => {
            if (event.ctrlKey || event.metaKey) return;
            event.preventDefault();
            if (!timer.current) handlers.current.onStart();
            else clearTimeout(timer.current);
            const delta = wheelMovement(event.deltaX, event.deltaY, event.deltaMode, event.shiftKey);
            handlers.current.onMove(delta.x, delta.y);
            setRoll(current => ({ x: (current.x + delta.x) % 16, y: (current.y + delta.y) % 16 }));
            setRolling(true);
            timer.current = setTimeout(() => { timer.current = null; handlers.current.onEnd(); setRolling(false); }, 160);
        };
        node.addEventListener("wheel", wheel, { passive: false });
        return () => { node.removeEventListener("wheel", wheel); if (timer.current) { clearTimeout(timer.current); timer.current = null; handlers.current.onEnd(); } };
    }, [disabled]);
    const gesture = useMemo(() => Gesture.Pan().enabled(!disabled).runOnJS(true).minDistance(1)
        // Handlers are stored here and read refs only when the gesture runs.
        // eslint-disable-next-line react-hooks/refs
        .onStart(() => { if (timer.current) { clearTimeout(timer.current); timer.current = null; handlers.current.onEnd(); } last.current = { x: 0, y: 0 }; handlers.current.onStart(); setRolling(true); })
        // eslint-disable-next-line react-hooks/refs
        .onUpdate(event => { const dx = event.translationX - last.current.x, dy = event.translationY - last.current.y; last.current = { x: event.translationX, y: event.translationY }; handlers.current.onMove(dx, dy); setRoll({ x: event.translationX % 16, y: event.translationY % 16 }); })
        // eslint-disable-next-line react-hooks/refs
        .onFinalize(() => { handlers.current.onEnd(); setRolling(false); }), [disabled]);
    const nudge = (dx: number, dy: number) => { onStart(); onMove(dx, dy); onEnd(); };
    return <View style={styles.control}>
        <View style={styles.heading}><AppText variant="label">Image position</AppText><AppText variant="caption" colorToken="textSecondary" style={{ fontVariant: ["tabular-nums"] }}>X {Math.round(x)} · Y {Math.round(y)}</AppText></View>
        <View style={[styles.pad, { backgroundColor: colors.surfaceSecondary, opacity: disabled ? 0.45 : 1 }]}>
            <View style={styles.verticalArrow}><Button variant="ghost" size="icon" disabled={disabled} accessibilityLabel="Move image up" onPress={() => nudge(0, -5)}><ArrowUp size={layout.iconSize} color={colors.textSecondary} /></Button></View>
            <View style={styles.middle}>
                <Button variant="ghost" size="icon" disabled={disabled} accessibilityLabel="Move image left" onPress={() => nudge(-5, 0)}><ArrowLeft size={layout.iconSize} color={colors.textSecondary} /></Button>
                <GestureDetector gesture={gesture}>
                    <View ref={ballRef} collapsable={false} accessible accessibilityRole="adjustable" accessibilityLabel="Image scroll ball" accessibilityHint="Drag or scroll across this fixed ball to move the image in the same direction" accessibilityState={{ disabled }} accessibilityActions={[{ name: "increment", label: "Move image down" }, { name: "decrement", label: "Move image up" }]} onAccessibilityAction={event => { if (!disabled) nudge(0, event.nativeEvent.actionName === "increment" ? 5 : -5); }} style={[styles.ball, { borderColor: rolling ? colors.brandRed : colors.border, backgroundColor: colors.background }]}>
                        <View pointerEvents="none" style={[styles.grid, { transform: [{ translateX: roll.x }, { translateY: roll.y }] }]}>{Array.from({ length: 36 }, (_, index) => <View key={index} style={[styles.dot, { backgroundColor: rolling ? colors.brandRed : colors.textTertiary }]} />)}</View>
                        <View pointerEvents="none" style={[styles.centre, { borderColor: colors.brandRed, backgroundColor: colors.background }]} />
                    </View>
                </GestureDetector>
                <Button variant="ghost" size="icon" disabled={disabled} accessibilityLabel="Move image right" onPress={() => nudge(5, 0)}><ArrowRight size={layout.iconSize} color={colors.textSecondary} /></Button>
            </View>
            <View style={styles.verticalArrow}><Button variant="ghost" size="icon" disabled={disabled} accessibilityLabel="Move image down" onPress={() => nudge(0, 5)}><ArrowDown size={layout.iconSize} color={colors.textSecondary} /></Button></View>
        </View>
        <AppText variant="caption" colorToken="textSecondary">{disabled ? disabledReason : "Drag or scroll the ball in any direction. Shift + scroll moves sideways."}</AppText>
    </View>;
}
const styles = StyleSheet.create({
    control: { gap: spacing.sm }, heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    pad: { alignItems: "center", paddingVertical: spacing.xs, borderRadius: radius.lg }, verticalArrow: { alignItems: "center" },
    middle: { flexDirection: "row", alignItems: "center", gap: spacing.xl },
    ball: { width: 88, height: 88, borderRadius: radius.full, borderWidth: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    grid: { position: "absolute", width: 96, height: 96, flexDirection: "row", flexWrap: "wrap" }, dot: { width: 2, height: 2, margin: 7, borderRadius: radius.full },
    centre: { width: 16, height: 16, borderWidth: 2, borderRadius: radius.full },
});
