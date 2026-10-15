import { AuthProvider } from "@/services/AuthProvider";
import { QueryConnectivity } from "@/services/QueryConnectivity";
import { recordSession, recordUsage } from "@/services/telemetry";
import { View, Text, Pressable } from "react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { colorsFor, spacing, layout, fontFor } from "@/theme/tokens";
import { NoticeToast } from "@/ui/NoticeToast";
import { Onest_400Regular } from "@expo-google-fonts/onest/400Regular";
import { Onest_500Medium } from "@expo-google-fonts/onest/500Medium";
import { Onest_600SemiBold } from "@expo-google-fonts/onest/600SemiBold";
import { Onest_700Bold } from "@expo-google-fonts/onest/700Bold";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
// Import individual font faces. Package-root imports pull the entire family into
// the web bundle, while the design system only uses the faces listed below.
import { Hind_400Regular } from "@expo-google-fonts/hind/400Regular";
import { Hind_600SemiBold } from "@expo-google-fonts/hind/600SemiBold";
import { Hind_700Bold } from "@expo-google-fonts/hind/700Bold";
import { LanguageProvider, useLanguage } from "@/i18n/language";
import { ThemeProvider, useColors } from "@/theme/Theme";
import { NetworkToast } from "@/ui/NetworkToast";
import { listSaved } from "@/storage/saved";
import { useAppStore } from "@/state/useAppStore";

export const unstable_settings = {
    initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 900_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
        },
    },
});

function RoutedStack() {
    const colors = useColors();
    const { language } = useLanguage();
    return (
        <>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                    title: "The Leaders",
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.foreground,
                    headerTitleStyle: { fontFamily: fontFor(language, "ui", "semibold"), fontSize: 17 },
                    headerBackButtonDisplayMode: "minimal",
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="radio" options={{ headerShown: false, presentation: "fullScreenModal" }} />
                <Stack.Screen name="designer" options={{ headerShown: false, presentation: "card" }} />
                <Stack.Screen name="studio-preview" options={{ headerShown: false, presentation: "card" }} />
                <Stack.Screen name="search/index" options={{ title: language === "ne" ? "खोज" : "Search" }} />
                <Stack.Screen name="author/[name]" options={{ title: language === "ne" ? "लेखक" : "Author" }} />
                <Stack.Screen name="admin-auth" options={{ headerShown: false }} />
                <Stack.Screen name="saved" options={{ headerShown: false }} />
            </Stack>
            <NetworkToast />
            <NoticeToast />
        </>
    );
}

function SavedArticlesHydrator() {
    const setSavedArticleIds = useAppStore((state) => state.setSavedArticleIds);

    useEffect(() => {
        const syncSavedArticles = () => {
            setSavedArticleIds(listSaved().map((article) => article.slug));
            void recordSession();
        };

        if (useAppStore.persist.hasHydrated()) {
            syncSavedArticles();
            return;
        }

        return useAppStore.persist.onFinishHydration(syncSavedArticles);
    }, [setSavedArticleIds]);

    return null;
}

export default function RootLayout() {
    const [loaded] = useFonts({
        Onest_400Regular,
        Onest_500Medium,
        Onest_600SemiBold,
        Onest_700Bold,
        Hind_400Regular,
        Hind_600SemiBold,
        Hind_700Bold,
    });

    useEffect(() => {
        if (loaded) SplashScreen.hideAsync().catch(() => undefined);
    }, [loaded]);

    if (!loaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        <QueryConnectivity />
                        <SavedArticlesHydrator />
                        <RoutedStack />
                        <PortalHost />
                    </ThemeProvider>
                </LanguageProvider>
            </AuthProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
    const colors = colorsFor("light");
    useEffect(() => { recordUsage("render_failure"); }, []);
    return <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: "center", gap: spacing.lg }}><Text style={{ fontSize: 24, color: colors.textPrimary }}>The Leaders could not display this screen.</Text><Text style={{ fontSize: 16, color: colors.textSecondary }}>Try again to return to reading.</Text><Pressable accessibilityRole="button" onPress={retry} style={{ minHeight: layout.touchTarget, backgroundColor: colors.primary, padding: spacing.lg }}><Text style={{ color: colors.onPrimary }}>Try again</Text></Pressable></View>;
}
