import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useCallback, useRef } from "react";
import { Stack, router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { ChevronDown, Pause, Play, Radio, Volume1, Volume2, Check, X } from "lucide-react-native";
import { NEPALI_STATIONS } from "@/data/radio";
import { useAudioStore } from "@/state/useAudioStore";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/ui/SectionHeader";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";
import { layout, spacing, radius } from "@/theme/tokens";

export default function RadioScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const audio = useAudioStore();
    const keepPlayingOnBlur = useRef(false);
    useFocusEffect(useCallback(() => {
        keepPlayingOnBlur.current = false;
        return () => {
            if (!keepPlayingOnBlur.current) useAudioStore.getState().close();
        };
    }, []));
    const leave = () => router.canGoBack() ? router.back() : router.replace("/(tabs)");
    const station = audio.currentTrack ?? NEPALI_STATIONS[0];
    const ne = language === "ne";
    const t = (en: string, np: string) => ne ? np : en;
    const status = audio.status === "playing" ? t("Playing live", "प्रत्यक्ष बज्दैछ") : audio.status === "loading" ? t("Connecting…", "जडान हुँदैछ…") : audio.status === "error" ? t("Connection failed", "जडान असफल") : audio.currentTrack ? t("Paused", "रोकिएको") : t("Ready to listen", "सुन्न तयार");
    const toggle = () => audio.isPlaying || audio.status === "loading" ? audio.pause() : void audio.play(station);
    return <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ minHeight: layout.controlHeight + spacing.sm * 2, flexShrink: 0, paddingHorizontal: spacing.gutter, paddingVertical: spacing.sm, flexDirection: "row", alignItems: "center" }}>
            <AppText variant="pageTitle" style={{ flex: 1 }}>{t("Radio", "रेडियो")}</AppText>
            <Button variant="ghost" size="icon" accessibilityLabel={t("Minimize radio and keep playing", "रेडियो सानो बनाएर बजाइराख्नुहोस्")} onPress={() => { keepPlayingOnBlur.current = true; leave(); }}><ChevronDown size={layout.iconSize} color={colors.textPrimary} /></Button>
            <Button variant="ghost" size="icon" accessibilityLabel={t("Close and stop radio", "रेडियो बन्द गरेर रोक्नुहोस्")} onPress={() => { keepPlayingOnBlur.current = false; audio.close(); leave(); }}><X size={layout.iconSize} color={colors.textPrimary} /></Button>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: insets.bottom + spacing.xl }}>
            <View style={[{ borderTopWidth: layout.ruleWidth, borderBottomWidth: layout.ruleWidth, paddingVertical: spacing.xl, marginBottom: spacing.xl, gap: spacing.xl }, { borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
                    <View style={[{ width: layout.touchTarget + spacing.lg, height: layout.touchTarget + spacing.lg, borderRadius: radius.md, alignItems: "center", justifyContent: "center" }, { backgroundColor: colors.surfaceSecondary }]}><Radio size={layout.iconLarge} color={colors.brandRed} /></View>
                    <View style={{ flex: 1, gap: spacing.xs }}><AppText variant="overline" colorToken="textSecondary">{t("NEPALI RADIO", "नेपाली रेडियो")}</AppText><AppText variant="heading1">{station.title}</AppText><AppText variant="bodySmall" colorToken="textSecondary">{station.author}</AppText></View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
                    <View style={{ flex: 1, gap: spacing.xs }}><AppText variant="label" colorToken={audio.status === "error" ? "error" : "textPrimary"}>{status}</AppText><AppText variant="caption" colorToken="textSecondary">{t("Live broadcast", "प्रत्यक्ष प्रसारण")}</AppText></View>
                    <Button size="player" accessibilityLabel={t(audio.isPlaying || audio.status === "loading" ? "Pause station" : "Play station", audio.isPlaying || audio.status === "loading" ? "रोक्नुहोस्" : "बजाउनुहोस्")} onPress={toggle}>
                        {audio.status === "loading" ? <ActivityIndicator color={colors.onPrimary} /> : audio.isPlaying ? <Pause size={layout.iconLarge} color={colors.onPrimary} fill={colors.onPrimary} /> : <Play size={layout.iconLarge} color={colors.onPrimary} fill={colors.onPrimary} />}
                    </Button>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}><Volume1 size={layout.iconSmall} color={colors.textSecondary} /><Slider accessibilityLabel={t("Radio volume", "रेडियो आवाज")} minimumValue={0} maximumValue={1} value={audio.volume} onValueChange={audio.setVolume} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.borderStrong} thumbTintColor={colors.primary} style={{ flex: 1, height: layout.touchTarget }} /><Volume2 size={layout.iconSmall} color={colors.textSecondary} /></View>
                {audio.error ? <View accessibilityRole="alert" style={{ gap: spacing.sm }}><AppText variant="bodySmall" colorToken="error">{t(audio.error, "स्टेशनमा जडान हुन सकेन। फेरि प्रयास गर्नुहोस् वा अर्को स्टेशन छान्नुहोस्।")}</AppText><Button variant="outline" onPress={() => { void audio.play(station); }}><AppText variant="label">{t("Try again", "फेरि प्रयास")}</AppText></Button></View> : null}
            </View>
            <SectionHeader title={t("Stations", "स्टेशनहरू")} detail={`${NEPALI_STATIONS.length}`} />
            {NEPALI_STATIONS.map(item => {
                const selected = station.id === item.id;
                return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${t("Listen to", "सुन्नुहोस्")} ${item.title}`} accessibilityState={{ selected }} onPress={() => { void audio.play(item); }} style={({ pressed }) => [{ minHeight: layout.controlHeight, paddingVertical: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.lg }, { borderBottomColor: colors.border, backgroundColor: pressed ? colors.surfaceSecondary : "transparent" }]}>
                    <View style={{ flex: 1, gap: spacing.xs }}><AppText variant="body" weight={selected ? "semibold" : "medium"}>{item.title}</AppText><AppText variant="meta" colorToken="textSecondary">{item.author}</AppText></View>
                    {selected ? <Check size={layout.iconSize} color={colors.brandRed} /> : <Play size={layout.iconSmall} color={colors.textSecondary} />}
                </Pressable>;
            })}
            <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: spacing.xl }}>{t("Broadcasts are provided by each station. Availability depends on the broadcaster and your connection.", "प्रसारण सम्बन्धित स्टेशनले उपलब्ध गराउँछन्। उपलब्धता स्टेशन र तपाईंको जडानमा निर्भर हुन्छ।")}</AppText>
        </ScrollView>
    </View>;
}
