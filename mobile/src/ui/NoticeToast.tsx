import { useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./primitives/AppText";
import { useAppStore } from "@/state/useAppStore";
import { useColors } from "@/theme/Theme";
import { layout, spacing, radius } from "@/theme/tokens";
export function NoticeToast() {
    const notice = useAppStore(state => state.notice);
    const setNotice = useAppStore(state => state.setNotice);
    const colors = useColors();
    const insets = useSafeAreaInsets();
    useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 6000); return () => clearTimeout(timer); }, [notice, setNotice]);
    if (!notice) return null;
    return <View pointerEvents="none" accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ position: "absolute", bottom: insets.bottom + layout.tabHeight + spacing.sm, left: spacing.gutter, right: spacing.gutter, backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong, borderWidth: 1, padding: spacing.card, borderRadius: radius.md }}><AppText variant="bodySmall">{notice}</AppText></View>;
}
