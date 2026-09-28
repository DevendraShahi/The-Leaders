import { View as RNView, type ViewProps as RNViewProps } from "react-native";
import { spacing, radius, type AppColors } from "@/theme/tokens";
import { useColors } from "@/theme/Theme";

export type AppViewProps = RNViewProps & {
    bgToken?: keyof AppColors;
    p?: keyof typeof spacing;
    px?: keyof typeof spacing;
    py?: keyof typeof spacing;
    m?: keyof typeof spacing;
    mx?: keyof typeof spacing;
    my?: keyof typeof spacing;
    rounded?: keyof typeof radius;
};

export function AppView({
    bgToken,
    p,
    px,
    py,
    m,
    mx,
    my,
    rounded,
    style,
    ...props
}: AppViewProps) {
    const colors = useColors();

    return (
        <RNView
            style={[
                {
                    backgroundColor: bgToken ? colors[bgToken] : undefined,
                    padding: p ? spacing[p] : undefined,
                    paddingHorizontal: px ? spacing[px] : undefined,
                    paddingVertical: py ? spacing[py] : undefined,
                    margin: m ? spacing[m] : undefined,
                    marginHorizontal: mx ? spacing[mx] : undefined,
                    marginVertical: my ? spacing[my] : undefined,
                    borderRadius: rounded ? radius[rounded] : undefined,
                },
                style,
            ]}
            {...props}
        />
    );
}
