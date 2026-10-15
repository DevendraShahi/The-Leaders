import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Pause, Play, X } from "lucide-react-native";
import { useAudioStore } from "@/state/useAudioStore";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";
import { AppText } from "./primitives/AppText";
import { Button } from "@/components/ui/button";
import { layout, spacing } from "@/theme/tokens";
export function MiniPlayer() {
    const audio = useAudioStore();
    const colors = useColors();
    const { language } = useLanguage();
    if (!audio.currentTrack || !audio.isVisible) return null;
    const ne = language === "ne";
    const status = audio.status === "loading" ? ne ? "जडान हुँदैछ…" : "Connecting…" : audio.status === "error" ? ne ? "जडान असफल" : "Connection failed" : audio.isPlaying ? ne ? "प्रत्यक्ष" : "Live radio" : ne ? "रोकिएको" : "Paused";
    return <View style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Button variant="ghost" onPress={() => router.push("/radio")} style={{ flex: 1, justifyContent: "flex-start" }} accessibilityLabel={`${ne ? "रेडियो खोल्नुहोस्" : "Open radio"}: ${audio.currentTrack.title}`}><View style={{ flex: 1 }}><AppText variant="label" numberOfLines={1}>{audio.currentTrack.title}</AppText><AppText variant="caption" colorToken={audio.status === "error" ? "error" : "textSecondary"}>{status}</AppText></View></Button>
        <Button variant="ghost" size="icon" accessibilityLabel={audio.isPlaying || audio.status === "loading" ? ne ? "रोक्नुहोस्" : "Pause radio" : ne ? "बजाउनुहोस्" : "Play radio"} onPress={() => audio.isPlaying || audio.status === "loading" ? audio.pause() : audio.resume()}>{audio.status === "loading" ? <ActivityIndicator color={colors.brandRed} /> : audio.isPlaying ? <Pause size={layout.iconSize} color={colors.textPrimary} /> : <Play size={layout.iconSize} color={colors.textPrimary} />}</Button>
        <Button variant="ghost" size="icon" accessibilityLabel={ne ? "रेडियो बन्द गर्नुहोस्" : "Stop radio"} onPress={audio.close}><X size={layout.iconSize} color={colors.textSecondary} /></Button>
    </View>;
}
const styles = StyleSheet.create({ bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, borderTopWidth: layout.ruleWidth } });
