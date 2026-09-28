import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type SnapshotPayload } from "@/api/client";
import { PageHeader } from "@/ui/PageHeader";
import { SeatChart } from "@/ui/SeatChart";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export default function ElectionScreen() {
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["snapshot", language],
        queryFn: () => apiGet<SnapshotPayload>("/api/v1/snapshot"),
    });

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <PageHeader title={pick(ui.election, language)} />
            {query.isLoading ? <StateView loading /> : null}
            {query.error ? <StateView error={query.error} onRetry={() => query.refetch()} /> : null}
            {query.data ? (
                <View style={{ gap: 16 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                        {query.data.stats.map((stat) => (
                            <View key={stat.id} style={{ width: "47%", borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 }}>
                                <AppText variant="meta" style={{ color: colors.muted }}>{pick(stat.label, language)}</AppText>
                                <AppText variant="title" style={{ color: colors.foreground }}>{pick(stat.value, language)}</AppText>
                            </View>
                        ))}
                    </View>
                    <SeatChart
                        title={pick(ui.seats, language)}
                        rows={query.data.seats.map((row) => ({ party: row.party, seats: row.seats }))}
                    />
                    <NavLink label={pick(ui.candidates, language)} href="/candidates" />
                    <NavLink label={pick(ui.parties, language)} href="/parties" />
                    <NavLink label={pick(ui.manifestos, language)} href="/manifestos" />
                </View>
            ) : null}
        </ScrollView>
    );
}

function NavLink({ label, href }: { label: string; href: "/candidates" | "/parties" | "/manifestos" }) {
    const colors = useColors();
    return (
        <Pressable
            onPress={() => router.push(href)}
            style={{ minHeight: 48, justifyContent: "center", borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16 }}
        >
            <AppText variant="meta" style={{ color: colors.foreground }}>{label}</AppText>
        </Pressable>
    );
}
