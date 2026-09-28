import { Pressable, type PressableProps, View } from "react-native";
import { AppText } from "./AppText";
import { useColors } from "@/theme/Theme";
import { spacing, radius } from "@/theme/tokens";

export type AppButtonProps = PressableProps & {
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
        <View style={{ borderRadius: radius.full, overflow: "hidden" }}>
            <Pressable
                android_ripple={{ color: colors.pressedOverlay, borderless: false }} // Classic Android ripple
                style={[
                    {
                        backgroundColor: colors[bgToken],
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.lg,
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    // @ts-ignore - style can be an array
                    style,
                ]}
                {...props}
            >
                <AppText variant="label" weight="medium" colorToken={colorToken}>
                    {label.toUpperCase() /* Material often uses all-caps for buttons */}
                </AppText>
            </Pressable>
        </View>
    );
}
