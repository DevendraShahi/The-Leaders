import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { AppText } from "./AppText";
import { useColors } from "@/theme/Theme";
import { spacing, radius, layout } from "@/theme/tokens";

export type AppButtonProps = TouchableOpacityProps & {
    label: string;
    variant?: "primary" | "secondary" | "destructive";
};

export function AppButton({
    label,
    variant = "primary",
    style,
    ...props
}: AppButtonProps) {
    const colors = useColors();

    const bgToken = variant === "primary" ? "brandRed" : variant === "destructive" ? "destructive" : "surfaceElevated";
    const colorToken = variant === "secondary" ? "textPrimary" : "textInverse";

    return (
        <TouchableOpacity
            activeOpacity={0.7} // Classic iOS active state
            style={[
                {
                    minHeight: layout.controlHeight,
                    backgroundColor: colors[bgToken],
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderRadius: radius.md,
                    alignItems: "center",
                    justifyContent: "center",
                },
                style,
            ]}
            {...props}
        >
            <AppText variant="label" weight="bold" colorToken={colorToken}>
                {label}
            </AppText>
        </TouchableOpacity>
    );
}
