import { View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type BriefDetail } from "@/api/client";
import { StateView } from "@/ui/StateView";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";
import { BriefReader } from "@/ui/BriefReader";

export default function BriefScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const colors = useColors();
    const { language } = useLanguage();
    const query = useQuery({
        queryKey: ["brief", language, slug],
        enabled: Boolean(slug),
        queryFn: () => apiGet<BriefDetail>(`/api/v1/briefs/${slug}`),
    });

    if (query.isLoading) return <View style={{ flex: 1, backgroundColor: colors.background }}><StateView loading /></View>;
    if (query.error || !query.data) {
        return <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 }}><StateView error={query.error || new Error("Missing")} onRetry={() => query.refetch()} /></View>;
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ headerShown: false }} />
            <BriefReader brief={query.data} />
        </View>
    );
}
