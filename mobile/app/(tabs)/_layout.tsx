import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router/js-tabs";
import { AnimatedTabBar } from "@/ui/AnimatedTabBar";
import { useColors } from "@/theme/Theme";
import { useAdminAccount } from "@/services/useAdminAccount";

import { View } from "react-native";
import { MiniPlayer } from "@/ui/MiniPlayer";

export const unstable_settings = {
    initialRouteName: 'index',
};

export default function TabLayout() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { isAdmin, isPending } = useAdminAccount();

    return (
        <Tabs
            tabBar={(props) => (
                <View>
                    <MiniPlayer />
                    <AnimatedTabBar {...props} showStudio={isAdmin} />
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
            <Tabs.Protected guard={isPending || isAdmin}>
                <Tabs.Screen name="studio" />
            </Tabs.Protected>
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}
