import { useState, useEffect } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Stack, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { apiGet, type HomePayload } from "@/api/client";
import { Button } from "@/components/ui/button";
import { AppText } from "@/ui/primitives/AppText";
import { ArticleRow } from "@/ui/ArticleRow";
import { StateView } from "@/ui/StateView";
import { SectionHeader } from "@/ui/SectionHeader";
import { useLanguage, pick } from "@/i18n/language";
import { useColors } from "@/theme/Theme";
import { storyDate } from "@/utils/editorial";
import { spacing, layout } from "@/theme/tokens";

export default function NotificationsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const ne = language === "ne";
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
    const query = useQuery({ queryKey: ["home", language], queryFn: () => apiGet<HomePayload>("/api/v1/home") });
    const fresh = (query.data?.articles ?? []).filter(article => { const age = now - Date.parse(article.publishedAt); return age >= 0 && age <= 48 * 3_600_000; });
    const brief = query.data?.leadBrief;
    const freshBrief = brief && now - Date.parse(brief.date) >= 0 && now - Date.parse(brief.date) <= 48 * 3_600_000 ? brief : null;
    return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ paddingHorizontal: spacing.gutter, flexDirection: "row", alignItems: "center", gap: spacing.sm }}><Button variant="ghost" size="icon" accessibilityLabel={ne ? "पछाडि" : "Back"} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}><ChevronLeft size={layout.iconSize} color={colors.textPrimary} /></Button><AppText variant="pageTitle">{ne ? "समाचार अपडेट" : "News updates"}</AppText></View>
        <ScrollView contentContainerStyle={{ padding: spacing.gutter, paddingBottom: insets.bottom + spacing.xl }} refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => { void query.refetch(); }} />}>
            <AppText variant="bodySmall" colorToken="textSecondary" style={{ marginBottom: spacing.xl }}>{ne ? "पछिल्ला ४८ घण्टाका समाचार। पुश सूचना सेवा अझै सक्रिय छैन।" : "Published in the last 48 hours. Push delivery is not enabled yet."}</AppText>
            {query.isLoading ? <StateView loading /> : query.error ? <StateView error={query.error} onRetry={() => { void query.refetch(); }} /> : <>
                {fresh.length || freshBrief ? <SectionHeader title={ne ? "नयाँ समाचार" : "Recent updates"} /> : <View style={{ gap: spacing.lg }}><AppText variant="heading3">{ne ? "हाल नयाँ अपडेट छैन" : "No recent updates"}</AppText><AppText variant="bodySmall" colorToken="textSecondary">{ne ? "पछिल्ला समाचार र विश्लेषण संग्रहमा पढ्नुहोस्।" : "You can still browse the latest available stories and analysis."}</AppText><Button variant="outline" onPress={() => router.push("/latest")}><AppText variant="label">{ne ? "समाचार संग्रह" : "Browse stories"}</AppText></Button></View>}
                {fresh.map(article => <ArticleRow key={`${article.source}-${article.slug}`} title={pick(article.title, language)} meta={storyDate(article.publishedAt, language)} image={article.image} onPress={() => router.push(`/article/${article.slug}`)} />)}
                {freshBrief ? <ArticleRow title={pick(freshBrief.title, language)} kicker={ne ? "दैनिक ब्रीफ" : "Daily brief"} meta={storyDate(freshBrief.date, language)} image={freshBrief.image} onPress={() => router.push(`/brief/${freshBrief.slug}`)} /> : null}
            </>}
        </ScrollView>
    </View>;
}
