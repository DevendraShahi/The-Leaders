import { View } from "react-native";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";

const INK_STEPS = ["#B71C1C", "#3A3A3A", "#5C5C5C", "#7A7A7A", "#9A9A9A", "#B5B5B5"];

export function SeatChart({
    title,
    rows,
}: {
    title: string;
    rows: { party: string; seats: number }[];
}) {
    const colors = useColors();
    const max = Math.max(1, ...rows.map((row) => row.seats));

    return (
        <View style={{ borderWidth: 1, borderColor: colors.border, padding: 16, gap: 14 }}>
            <AppText variant="title" style={{ color: colors.foreground }}>{title}</AppText>
            {rows.map((row, index) => (
                <View key={row.party} style={{ gap: 6 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                        <AppText variant="meta" style={{ color: colors.foreground, flex: 1 }} numberOfLines={1}>
                            {row.party}
                        </AppText>
                        <AppText variant="meta" style={{ color: colors.muted }}>{String(row.seats)}</AppText>
                    </View>
                    <View style={{ height: 10, backgroundColor: colors.border }}>
                        <View
                            style={{
                                height: 10,
                                width: `${Math.max(4, Math.round((row.seats / max) * 100))}%`,
                                backgroundColor: index === 0 ? colors.brandRed : INK_STEPS[Math.min(index, INK_STEPS.length - 1)],
                            }}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
}
