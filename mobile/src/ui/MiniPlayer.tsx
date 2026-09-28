import { useEffect } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence } from "react-native-reanimated";
import { Play, Pause, X } from "lucide-react-native";
import { useAudioStore } from "@/state/useAudioStore";
import { AppText as Text } from "@/ui/primitives/AppText";

function PulsingDot({ isPlaying }: { isPlaying: boolean }) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (isPlaying) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.4, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1
            );
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.3, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1
            );
        } else {
            scale.value = withTiming(1);
            opacity.value = withTiming(0.5);
        }
    }, [isPlaying, scale, opacity]);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            className="w-1.5 h-1.5 rounded-full bg-destructive"
            style={style}
        />
    );
}

export function MiniPlayer() {
    const { currentTrack, isVisible, isPlaying, pause, resume, close } = useAudioStore();

    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(isVisible && currentTrack ? 1 : 0, { duration: 180 });
    }, [isVisible, currentTrack, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!currentTrack && !isVisible) return null;

    return (
        <Animated.View style={animatedStyle} pointerEvents={isVisible ? "auto" : "none"}>
            <View className="px-3 pb-2">
                {/* Shadcn Card style mini player */}
                <Pressable
                    onPress={() => router.push("/radio" as never)}
                    className="bg-card border border-border rounded-lg overflow-hidden shadow-sm active:opacity-90"
                >
                    <View className="flex-row items-center px-4 py-3 gap-3">
                        {/* Artwork */}
                        <View className="w-10 h-10 rounded overflow-hidden border border-border bg-surface-secondary">
                            <Image
                                source={{ uri: currentTrack?.artwork || "" }}
                                className="w-full h-full"
                                contentFit="cover"
                            />
                        </View>

                        {/* Track info */}
                        <View className="flex-1">
                            <View className="flex-row items-center gap-1.5 mb-0.5">
                                <PulsingDot isPlaying={isPlaying} />
                                <Text
                                    className="text-foreground font-semibold text-[13px]"
                                    numberOfLines={1}
                                >
                                    {currentTrack?.title || "Radio"}
                                </Text>
                            </View>
                            <Text
                                className="text-muted-foreground text-[11px] font-medium"
                                numberOfLines={1}
                            >
                                {currentTrack?.author || "Live broadcast"}
                            </Text>
                        </View>

                        {/* Controls */}
                        <View className="flex-row items-center gap-3">
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation();
                                    isPlaying ? pause() : resume();
                                }}
                                hitSlop={12}
                                className="w-8 h-8 rounded border border-border bg-surface items-center justify-center active:bg-accent"
                            >
                                {isPlaying ? (
                                    <Pause size={15} className="text-foreground" fill="currentColor" />
                                ) : (
                                    <Play size={15} className="text-foreground ml-0.5" fill="currentColor" />
                                )}
                            </Pressable>
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation();
                                    close();
                                }}
                                hitSlop={12}
                                className="p-1"
                            >
                                <X size={16} className="text-muted-foreground" />
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </View>
        </Animated.View>
    );
}
