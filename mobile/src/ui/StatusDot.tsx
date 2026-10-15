import { View } from "react-native";
import { useColors } from "@/theme/Theme";
import { spacing, radius, type AppColors } from "@/theme/tokens";
export function StatusDot({ color = "brandRed" }: { color?: keyof AppColors }) {
    const colors = useColors();
    return <View accessible={false} style={{ width: spacing.sm, height: spacing.sm, borderRadius: radius.full, backgroundColor: colors[color] }} />;
}
