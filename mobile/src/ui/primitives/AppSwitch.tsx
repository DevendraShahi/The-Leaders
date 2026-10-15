import { Platform, Switch, View, type SwitchProps } from "react-native";
import { useColors } from "@/theme/Theme";
import { layout, spacing } from "@/theme/tokens";

/** Native and browser switches share colors; RN Web uses a separate active-thumb prop. */
export function AppSwitch(props: SwitchProps) {
    const colors = useColors();
    const webColors = Platform.OS === "web" ? { activeThumbColor: colors.onPrimary, activeTrackColor: colors.primary } : {};
    return <View style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, justifyContent: "center", alignItems: "center" }}>
        <Switch {...props} {...webColors} hitSlop={spacing.md} thumbColor={colors.onPrimary} trackColor={{ false: colors.borderStrong, true: colors.primary }} />
    </View>;
}
