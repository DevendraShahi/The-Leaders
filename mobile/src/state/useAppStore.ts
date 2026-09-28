import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type LanguageCode = "en" | "ne";
export type ThemePreference = "light" | "dark" | "system";
export type ReaderScale = "sm" | "md" | "lg" | "xl";
export type BodyTypeface = "serif" | "sans";

// Safe wrapper to prevent "Native module is null" crashes
const customStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(name);
            }
            return await AsyncStorage.getItem(name);
        } catch (e) {
            console.warn("Storage getItem error", e);
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(name, value);
            } else {
                await AsyncStorage.setItem(name, value);
            }
        } catch (e) {
            console.warn("Storage setItem error", e);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(name);
            } else {
                await AsyncStorage.removeItem(name);
            }
        } catch (e) {
            console.warn("Storage removeItem error", e);
        }
    },
};

interface AppState {
    // Language & Region
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
    bilingualHeadlines: boolean;
    setBilingualHeadlines: (val: boolean) => void;
    regionalDesk: string;
    setRegionalDesk: (desk: string) => void;

    // Theme
    theme: ThemePreference;
    setTheme: (theme: ThemePreference) => void;
    warmPaperHue: boolean;
    setWarmPaperHue: (val: boolean) => void;

    // Reading Preferences
    readerScale: ReaderScale;
    setReaderScale: (scale: ReaderScale) => void;
    bodyTypeface: BodyTypeface;
    setBodyTypeface: (tf: BodyTypeface) => void;
    readingProgressBar: boolean;
    setReadingProgressBar: (val: boolean) => void;
    autoplayAudio: boolean;
    setAutoplayAudio: (val: boolean) => void;

    // Notifications & Alerts
    breakingDispatches: boolean;
    setBreakingDispatches: (val: boolean) => void;
    dailyBriefAlert: boolean;
    setDailyBriefAlert: (val: boolean) => void;
    eveningRoundup: boolean;
    setEveningRoundup: (val: boolean) => void;

    // Offline & Storage
    autoDownloadWifi: boolean;
    setAutoDownloadWifi: (val: boolean) => void;

    // Saved Items
    savedArticleIds: string[];
    toggleSavedArticle: (id: string) => void;

    // Onboarding
    hasCompletedOnboarding: boolean;
    completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            language: "en",
            setLanguage: (language) => set({ language }),
            bilingualHeadlines: true,
            setBilingualHeadlines: (bilingualHeadlines) => set({ bilingualHeadlines }),
            regionalDesk: "Kathmandu (National)",
            setRegionalDesk: (regionalDesk) => set({ regionalDesk }),

            theme: "system",
            setTheme: (theme) => set({ theme }),
            warmPaperHue: true,
            setWarmPaperHue: (warmPaperHue) => set({ warmPaperHue }),

            readerScale: "md",
            setReaderScale: (readerScale) => set({ readerScale }),
            bodyTypeface: "serif",
            setBodyTypeface: (bodyTypeface) => set({ bodyTypeface }),
            readingProgressBar: true,
            setReadingProgressBar: (readingProgressBar) => set({ readingProgressBar }),
            autoplayAudio: false,
            setAutoplayAudio: (autoplayAudio) => set({ autoplayAudio }),

            breakingDispatches: true,
            setBreakingDispatches: (breakingDispatches) => set({ breakingDispatches }),
            dailyBriefAlert: true,
            setDailyBriefAlert: (dailyBriefAlert) => set({ dailyBriefAlert }),
            eveningRoundup: false,
            setEveningRoundup: (eveningRoundup) => set({ eveningRoundup }),

            autoDownloadWifi: true,
            setAutoDownloadWifi: (autoDownloadWifi) => set({ autoDownloadWifi }),

            savedArticleIds: [],
            toggleSavedArticle: (id) =>
                set((state) => ({
                    savedArticleIds: state.savedArticleIds.includes(id)
                        ? state.savedArticleIds.filter((savedId) => savedId !== id)
                        : [...state.savedArticleIds, id],
                })),

            hasCompletedOnboarding: false,
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
        }),
        {
            name: "leaders-app-storage",
            storage: createJSONStorage(() => customStorage),
        }
    )
);
