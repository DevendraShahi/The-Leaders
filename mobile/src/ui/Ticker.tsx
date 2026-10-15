import { spacing } from "@/theme/tokens";
import { useEffect, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";

export function Ticker({ lines }: { lines: string[] }) {
    const colors = useColors();
    const [index, setIndex] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    }, []);

    useEffect(() => {
        if (reduceMotion || lines.length < 2) return undefined;
        const timer = setInterval(() => {
            setIndex((current) => (current + 1) % lines.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [lines.length, reduceMotion]);

    if (!lines.length) return null;

    return (
        <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, paddingHorizontal: spacing.gutter, marginBottom: 8 }}>
            <AppText variant="meta" style={{ color: colors.foreground }} numberOfLines={2}>
                {lines[index] || lines[0]}
            </AppText>
        </View>
    );
}
