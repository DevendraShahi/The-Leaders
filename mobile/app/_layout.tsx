import "react-native-gesture-handler";
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
// Import individual font faces. Package-root imports pull the entire family into
// the web bundle, while the design system only uses the faces listed below.
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue/400Regular";
import { Hind_400Regular } from "@expo-google-fonts/hind/400Regular";
import { Hind_600SemiBold } from "@expo-google-fonts/hind/600SemiBold";
import { Hind_700Bold } from "@expo-google-fonts/hind/700Bold";
import { Manrope_400Regular } from "@expo-google-fonts/manrope/400Regular";
import { Manrope_500Medium } from "@expo-google-fonts/manrope/500Medium";
import { Manrope_600SemiBold } from "@expo-google-fonts/manrope/600SemiBold";
import { Manrope_700Bold } from "@expo-google-fonts/manrope/700Bold";
import { Manrope_800ExtraBold } from "@expo-google-fonts/manrope/800ExtraBold";
import { Merriweather_300Light } from "@expo-google-fonts/merriweather/300Light";
import { Merriweather_400Regular } from "@expo-google-fonts/merriweather/400Regular";
import { Merriweather_700Bold } from "@expo-google-fonts/merriweather/700Bold";
import { Merriweather_800ExtraBold } from "@expo-google-fonts/merriweather/800ExtraBold";
import { LanguageProvider } from "@/i18n/language";
import { ThemeProvider, useColors } from "@/theme/Theme";
import { NetworkToast } from "@/ui/NetworkToast";

export const unstable_settings = {
    initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 300_000,
            retry: 1,
        },
    },
});

function RoutedStack() {
    const colors = useColors();
    return (
        <>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.foreground,
                    headerTitleStyle: { fontFamily: "Manrope_600SemiBold", fontSize: 17 },
                    headerBackButtonDisplayMode: "minimal",
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="radio" options={{ headerShown: false, presentation: "formSheet" }} />
                <Stack.Screen name="designer" options={{ headerShown: false, presentation: "card" }} />
            </Stack>
            <NetworkToast />
        </>
    );
}

export default function RootLayout() {
    const [loaded] = useFonts({
        BebasNeue_400Regular,
        Hind_400Regular,
        Hind_600SemiBold,
        Hind_700Bold,
        Manrope_400Regular,
        Manrope_500Medium,
        Manrope_600SemiBold,
        Manrope_700Bold,
        Manrope_800ExtraBold,
        Merriweather_300Light,
        Merriweather_400Regular,
        Merriweather_700Bold,
        Merriweather_800ExtraBold,
    });

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync().catch(() => undefined);
    }, [loaded]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <ThemeProvider>
                        <RoutedStack />
                        <PortalHost />
                    </ThemeProvider>
                </LanguageProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
