import { useEffect, useState } from "react";
import { AccessibilityInfo, View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { ChevronDown, Pause, Play } from "lucide-react-native";
import { useAudioStore, type AudioTrack } from "@/state/useAudioStore";
import { AppText as Text } from "@/ui/primitives/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";

export const NEPALI_STATIONS: AudioTrack[] = [
    {
        id: "kantipur",
        title: "Kantipur FM",
        author: "96.1 MHz",
        artwork: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Kantipur_FM.jpg",
        url: "https://radio-broadcast.ekantipur.com/stream"
    },
    {
        id: "ujyaalo",
        title: "Ujyaalo 90",
        author: "90.0 MHz",
        artwork: "https://ujyaalo.com/assets/images/logo.png",
        url: "https://stream-151.zeno.fm/h527zwd11uquv"
    },
    {
        id: "radionepal",
        title: "Radio Nepal",
        author: "100.0 MHz",
        artwork: "https://radionepal.gov.np/wp-content/uploads/2021/04/Logo.png",
        url: "http://stream1.radionepal.gov.np/live"
    },
    {
        id: "bbc",
        title: "BBC Nepali",
        author: "103.0 MHz",
        artwork: "https://news.bbcimg.co.uk/nol/shared/img/bbc_news_120x60.gif",
        url: "https://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/sbr_low/ak/bbc_nepali_radio.m3u8"
    },
    {
        id: "kalika",
        title: "Kalika FM",
        author: "95.2 MHz",
        artwork: "https://kalikafm.com.np/images/logo.png",
        url: "https://streaming.softnep.net:10828/;stream.nsv&type=mp3&volume=70"
    }
];

const MARKS: Record<string, string> = {
    kantipur: "KA",
    ujyaalo: "UJ",
    radionepal: "RN",
    bbc: "BB",
    kalika: "KL",
};

const DOT_ROWS = 3;
const DOT_COLS = 16;
const BAND_MIN = 88;
const BAND_MAX = 108;
const DIAL = 220;
const TICKS = 17;

function frequencyNumber(author: string) {
    const match = author.match(/[\d.]+/);
    return match?.[0] ?? author;
}

function frequencyValue(author: string) {
    const value = Number.parseFloat(frequencyNumber(author));
    return Number.isFinite(value) ? value : 96.1;
}

function shortName(title: string) {
    return title.replace(" FM", "").replace(" Nepali", "");
}

function arcTurn(t: number) {
    return (0.75 + t * 0.5) % 1;
}

function dotVisible(row: number, column: number) {
    const x = (column + 0.5) / DOT_COLS - 0.5;
    const y = (row + 0.5) / DOT_ROWS - 0.5;
    return (x * x) / 0.22 + (y * y) / 0.2 < 1;
}

function PulseDot({
    color,
    phase,
    strong,
    clock,
}: {
    color: string;
    phase: number;
    strong: boolean;
    clock: { value: number };
}) {
    const style = useAnimatedStyle(() => {
        const wave = 0.5 + 0.5 * Math.sin((clock.value + phase) * Math.PI * 2);
        return {
            opacity: 0.18 + wave * (strong ? 0.82 : 0.42),
            transform: [{ scale: 0.55 + wave * 0.7 }],
        };
    });

    return (
        <Animated.View
            className="h-1.5 w-1.5 rounded-full"
            style={[{ backgroundColor: color }, style]}
        />
    );
}

function SignalBand({ color, playing }: { color: string; playing: boolean }) {
    const clock = useSharedValue(0);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => undefined);
        const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (reduced) {
            clock.value = 0;
            return;
        }
        clock.value = 0;
        clock.value = withRepeat(
            withTiming(1, { duration: playing ? 1100 : 2200, easing: Easing.linear }),
            -1,
            false
        );
    }, [clock, playing, reduced]);

    return (
        <View className="items-center px-8 py-3" accessibilityElementsHidden>
            {Array.from({ length: DOT_ROWS }, (_, row) => (
                <View key={row} className="w-full max-w-[280px] flex-row justify-between">
                    {Array.from({ length: DOT_COLS }, (_, column) => {
                        if (!dotVisible(row, column)) {
                            return <View key={column} className="h-3.5 flex-1" />;
                        }
                        const phase = column / DOT_COLS + row / DOT_ROWS;
                        return (
                            <View key={column} className="h-3.5 flex-1 items-center justify-center">
                                <PulseDot color={color} phase={phase} strong={row === 1} clock={clock} />
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

function TunerDial({
    title,
    frequency,
    mhz,
    playing,
    accent,
    ink,
    inverse,
    onPress,
}: {
    title: string;
    frequency: string;
    mhz: number;
    playing: boolean;
    accent: string;
    ink: string;
    inverse: string;
    onPress: () => void;
}) {
    const clamped = Math.min(BAND_MAX, Math.max(BAND_MIN, mhz));
    const needle = Math.round(((clamped - BAND_MIN) / (BAND_MAX - BAND_MIN)) * (TICKS - 1));

    return (
        <View className="items-center justify-center" style={{ height: DIAL, width: DIAL }}>
            {Array.from({ length: TICKS }, (_, index) => {
                const turn = arcTurn(index / (TICKS - 1));
                const angle = turn * Math.PI * 2 - Math.PI / 2;
                const active = index === needle;
                const major = index % 4 === 0;
                const height = active ? 16 : major ? 10 : 6;
                return (
                    <View
                        key={index}
                        className="absolute rounded-full"
                        style={{
                            width: active ? 2 : 1.5,
                            height,
                            left: DIAL / 2 - 1,
                            top: DIAL / 2 - height / 2,
                            backgroundColor: active ? accent : ink,
                            opacity: active ? 1 : major ? 0.7 : 0.35,
                            transform: [
                                { translateX: Math.cos(angle) * 102 },
                                { translateY: Math.sin(angle) * 102 },
                                { rotate: `${turn * 360}deg` },
                            ],
                        }}
                    />
                );
            })}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={playing ? `Pause ${title}` : `Play ${title}`}
                onPress={onPress}
                className="h-[168px] w-[168px] items-center justify-center rounded-full border border-border bg-background active:opacity-80"
            >
                <Text className="text-[32px] font-bold leading-9 tracking-tight text-foreground">
                    {frequency}
                </Text>
                <Text className="text-xs font-semibold tracking-widest text-primary">FM</Text>
                <View className="mt-2 h-10 w-10 items-center justify-center rounded-full bg-primary">
                    {playing ? (
                        <Pause size={16} color={inverse} fill={inverse} />
                    ) : (
                        <Play size={16} color={inverse} fill={inverse} style={{ marginLeft: 2 }} />
                    )}
                </View>
            </Pressable>
        </View>
    );
}

export default function RadioScreen() {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const { language } = useLanguage();
    const isNe = language === "ne";
    const { currentTrack, isPlaying, play, pause, resume } = useAudioStore();

    const activeTrack = currentTrack || NEPALI_STATIONS[0];
    const dialIsLive = isPlaying && currentTrack?.id === activeTrack.id;
    const frequency = frequencyNumber(activeTrack.author);
    const titleFont = isNe ? "font-hind-bold" : "font-serif-bold";

    const copy = {
        title: isNe ? "रेडियो" : "Radio",
        stations: isNe ? "स्टेशन" : "Stations",
        onAir: isNe ? "प्रसारणमा" : "On air",
        paused: isNe ? "रोकियो" : "Paused",
    };

    const handleClose = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/(tabs)" as never);
        }
    };

    const togglePlay = () => {
        if (isPlaying && activeTrack.id === currentTrack?.id) {
            pause();
        } else if (!isPlaying && activeTrack.id === currentTrack?.id) {
            resume();
        } else {
            play(activeTrack);
        }
    };

    const status = dialIsLive ? copy.onAir : currentTrack ? copy.paused : null;

    return (
        <View className="flex-1 bg-background">
            <View
                className="flex-row items-center justify-between px-3"
                style={{ paddingTop: Math.max(insets.top, 8) }}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    accessibilityLabel="Close"
                    onPress={handleClose}
                >
                    <ChevronDown size={22} color={colors.textPrimary} />
                </Button>
                <Text
                    className={`min-w-0 flex-1 text-[17px] leading-[22px] text-foreground ${
                        isNe ? "font-hind-semibold" : "font-semibold"
                    }`}
                >
                    {copy.title}
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 28), flexGrow: 1 }}
            >
                <SignalBand color={colors.textPrimary} playing={dialIsLive} />

                <View className="items-center">
                    <TunerDial
                        title={shortName(activeTrack.title)}
                        frequency={frequency}
                        mhz={frequencyValue(activeTrack.author)}
                        playing={dialIsLive}
                        accent={colors.brandRed}
                        ink={colors.textPrimary}
                        inverse={colors.textInverse}
                        onPress={togglePlay}
                    />
                    <Text className={`mt-5 px-5 text-center text-[22px] leading-7 text-foreground ${titleFont}`}>
                        {activeTrack.title}
                    </Text>
                    {status ? (
                        <Text className="mt-1 text-center text-[13px] leading-5 text-muted-foreground">
                            {status}
                        </Text>
                    ) : null}
                </View>

                <View className="mt-6 flex-1 px-5">
                    <Text
                        className={`text-[13px] leading-5 text-muted-foreground ${
                            isNe ? "font-hind-semibold" : "font-semibold"
                        }`}
                    >
                        {copy.stations}
                    </Text>
                    <View className="mt-2">
                        {NEPALI_STATIONS.map((station, index) => {
                            const selected = activeTrack.id === station.id;
                            const live = selected && dialIsLive;
                            return (
                                <Pressable
                                    key={station.id}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${station.title}, ${station.author}`}
                                    accessibilityState={{ selected }}
                                    onPress={() => play(station)}
                                    className={`flex-row items-center gap-3 py-3.5 active:opacity-80 ${
                                        index < NEPALI_STATIONS.length - 1 ? "border-b border-border" : ""
                                    }`}
                                >
                                    <View
                                        className={`h-11 w-11 items-center justify-center rounded-full ${
                                            selected ? "bg-primary" : "bg-surface-secondary"
                                        }`}
                                    >
                                        <Text
                                            className={`text-[12px] font-bold tracking-wide ${
                                                selected ? "text-primary-foreground" : "text-foreground"
                                            }`}
                                        >
                                            {MARKS[station.id]}
                                        </Text>
                                    </View>
                                    <View className="min-w-0 flex-1">
                                        <Text numberOfLines={1} className="text-base font-semibold text-foreground">
                                            {station.title}
                                        </Text>
                                        <Text className={`text-[13px] leading-5 ${live ? "text-primary" : "text-muted-foreground"}`}>
                                            {live ? copy.onAir : `${frequencyNumber(station.author)} FM`}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
