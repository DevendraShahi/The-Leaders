import { useEffect, useState } from "react";
import { View, Animated } from "react-native";
import { useNetworkState } from "expo-network";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function NetworkToast() {
    const network = useNetworkState();
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [translateY] = useState(new Animated.Value(-100));

    const isOffline = network.isConnected === false && network.isInternetReachable === false;

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: isOffline ? 0 : -100,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isOffline, translateY]);

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: [{ translateY }],
                zIndex: 9999,
            }}
        >
            <View
                style={{
                    backgroundColor: colors.brandRed,
                    paddingTop: insets.top + 12,
                    paddingBottom: 12,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                {/* @ts-ignore */}
                <WifiOff color={colors.surface} size={16} />
                <AppText variant="meta" style={{ color: colors.surface }}>
                    Network unavailable. Showing cached data.
                </AppText>
            </View>
        </Animated.View>
    );
}
