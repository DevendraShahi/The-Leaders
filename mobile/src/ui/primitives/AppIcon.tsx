import { type LucideIcon } from "lucide-react-native";
import { useColors } from "@/theme/Theme";
import { type AppColors } from "@/theme/tokens";

export type AppIconProps = {
    icon: LucideIcon;
    size?: "sm" | "md" | "lg" | "xl";
    colorToken?: keyof AppColors;
};

const ICON_SIZES = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
};

export function AppIcon({ icon: Icon, size = "md", colorToken = "textPrimary" }: AppIconProps) {
    const colors = useColors();
    return <Icon size={ICON_SIZES[size]} color={colors[colorToken] as string} />;
}
