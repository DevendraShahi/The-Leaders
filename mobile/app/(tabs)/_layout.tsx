import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router/js-tabs";
import { AnimatedTabBar } from "@/ui/AnimatedTabBar";
import { useColors } from "@/theme/Theme";

import { View } from "react-native";
import { MiniPlayer } from "@/ui/MiniPlayer";

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function TabLayout() {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            tabBar={(props) => (
                <View>
                    <MiniPlayer />
                    <AnimatedTabBar {...props} />
                </View>
            )}
            screenOptions={{
                headerShown: false,
                sceneStyle: {
                    backgroundColor: colors.background,
                    paddingTop: insets.top,
                },
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="latest" />
            <Tabs.Screen name="explore" />
            <Tabs.Screen name="saved" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}
