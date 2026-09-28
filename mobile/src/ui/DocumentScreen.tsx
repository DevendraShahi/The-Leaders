import { useEffect, useState, type ReactNode } from "react";
import { AppState, Pressable, ScrollView, View } from "react-native";
import { useAudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";
import { AppText } from "@/ui/AppText";
import { MarkdownBody } from "@/ui/MarkdownBody";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { apiBase } from "@/api/client";
import {
    readMelody,
    readReaderLeading,
    readReaderScale,
    writeMelody,
    writeReaderLeading,
    writeReaderScale,
    type ReaderLeading,
    type ReaderScale,
} from "@/storage/prefs";

const SCALES: ReaderScale[] = ["sm", "md", "lg"];
const LEADINGS: ReaderLeading[] = ["compact", "regular", "loose"];
const MELODIES = ["off", "1", "2", "3", "4"] as const;

export function DocumentScreen({
    kicker,
    title,
    body,
    englishBody,
    footer,
}: {
    kicker?: string;
    title: string;
    body: string;
    englishBody: string;
    footer?: ReactNode;
}) {
    const colors = useColors();
    const { language } = useLanguage();
    const [scale, setScale] = useState(readReaderScale);
    const [leading, setLeading] = useState(readReaderLeading);
    const [melody, setMelody] = useState(readMelody);
    const [speaking, setSpeaking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [controlsOpen, setControlsOpen] = useState(false);
    const player = useAudioPlayer(
        melody === "off" ? null : `${apiBase()}/reader-melody/melody${melody}.mp3`
    );

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => {
            if (state !== "active") {
                player.pause();
                Speech.stop();
                setSpeaking(false);
            }
        });
        return () => subscription.remove();
    }, [player]);

    useEffect(() => {
        if (melody === "off") {
            player.pause();
            return;
        }
        player.play();
    }, [melody, player]);

    useEffect(() => () => {
        Speech.stop();
        player.pause();
    }, [player]);

    const choose = (active: boolean) => ({
        minHeight: 48,
        justifyContent: "center" as const,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : "transparent",
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ height: 3, backgroundColor: colors.border }}>
                <View style={{ height: 3, width: `${Math.round(progress * 100)}%`, backgroundColor: colors.primary }} />
            </View>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                scrollEventThrottle={16}
                onScroll={(event) => {
                    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                    const max = Math.max(1, contentSize.height - layoutMeasurement.height);
                    setProgress(Math.min(1, Math.max(0, contentOffset.y / max)));
                }}
            >
                {kicker ? <AppText variant="meta" style={{ color: colors.primary, marginBottom: 8 }}>{kicker}</AppText> : null}
                <AppText variant="display" style={{ color: colors.foreground, marginBottom: 20 }}>{title}</AppText>
                <MarkdownBody source={body} scale={scale} leading={leading} />
                {footer}
            </ScrollView>
            {controlsOpen ? (
                <View style={{ borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16, gap: 12 }}>
                    <AppText variant="meta" style={{ color: colors.muted }}>{pick(ui.type, language)}</AppText>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {SCALES.map((option) => (
                            <Pressable
                                key={option}
                                onPress={() => {
                                    writeReaderScale(option);
                                    setScale(option);
                                }}
                                style={choose(scale === option)}
                            >
                                <AppText variant="meta" style={{ color: scale === option ? colors.onPrimary : colors.foreground }}>
                                    {option.toUpperCase()}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {LEADINGS.map((option) => (
                            <Pressable
                                key={option}
                                onPress={() => {
                                    writeReaderLeading(option);
                                    setLeading(option);
                                }}
                                style={choose(leading === option)}
                            >
                                <AppText variant="meta" style={{ color: leading === option ? colors.onPrimary : colors.foreground }}>
                                    {option}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                    <AppText variant="meta" style={{ color: colors.muted }}>{pick(ui.melody, language)}</AppText>
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {MELODIES.map((option) => (
                            <Pressable
                                key={option}
                                onPress={() => {
                                    writeMelody(option);
                                    setMelody(option);
                                }}
                                style={choose(melody === option)}
                            >
                                <AppText variant="meta" style={{ color: melody === option ? colors.onPrimary : colors.foreground }}>
                                    {option === "off" ? pick(ui.off, language) : option}
                                </AppText>
                            </Pressable>
                        ))}
                    </View>
                </View>
            ) : null}
            <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: colors.border }}>
                <Pressable onPress={() => setControlsOpen((open) => !open)} style={{ flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center" }}>
                    <AppText variant="meta" style={{ color: colors.foreground }}>{pick(ui.type, language)}</AppText>
                </Pressable>
                <Pressable
                    onPress={() => {
                        if (speaking) {
                            Speech.stop();
                            setSpeaking(false);
                            return;
                        }
                        if (!englishBody.trim()) return;
                        setSpeaking(true);
                        Speech.speak(englishBody, {
                            language: "en-US",
                            onDone: () => setSpeaking(false),
                            onStopped: () => setSpeaking(false),
                        });
                    }}
                    style={{ flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center" }}
                >
                    <AppText variant="meta" style={{ color: colors.primary }}>
                        {pick(speaking ? ui.stop : ui.listen, language)}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
