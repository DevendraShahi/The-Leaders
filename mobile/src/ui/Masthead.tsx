import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Bell, Search, User } from "lucide-react-native";
import { AppText } from "./primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";

import { useColors } from "@/theme/Theme";

const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NE_DAYS = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];
const NE_MONTHS = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"];

const T_SEARCH = { en: "Search", ne: "खोज" };
const T_NOTIFICATIONS = { en: "Notifications", ne: "सूचनाहरू" };
const T_PROFILE = { en: "Profile", ne: "प्रोफाइल" };

function getTodayString(lang: "en" | "ne") {
    const d = new Date();
    if (lang === "ne") {
        return `${NE_DAYS[d.getDay()]}, ${d.getDate()} ${NE_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
    return `${EN_DAYS[d.getDay()]}, ${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getEditionNumber() {
    const launchDate = new Date("2026-05-01T00:00:00Z");
    const diff = Math.max(0, new Date().getTime() - launchDate.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function Masthead() {
    const { language, setLanguage } = useLanguage();
    const colors = useColors();
    const isNe = language === "ne";
    const edition = getEditionNumber();

    return (
        <View className="bg-background px-5 pb-3 pt-4">
            <View className="flex-row items-center justify-between gap-2">
                <View className="min-w-0 flex-1 flex-row items-center gap-1">
                    <AppText
                        numberOfLines={1}
                        variant="heading2"
                        weight="bold"
                        style={{ textTransform: "uppercase" }}
                    >
                        The Leaders
                    </AppText>
                    <View className="h-1.5 w-1.5 rounded-full bg-primary" />
                </View>
                <View className="shrink-0 flex-row items-center">
                    <View className="mr-0.5 h-11 flex-row items-center rounded-lg bg-surface-secondary px-1">
                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: language === "en" }}
                            onPress={() => setLanguage("en")}
                            className="h-11 justify-center px-1.5"
                        >
                            <AppText variant="caption" weight={language === "en" ? "bold" : "medium"} colorToken={language === "en" ? "primary" : "textSecondary"}>
                                EN
                            </AppText>
                        </Pressable>
                        <AppText variant="caption" colorToken="border">|</AppText>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: language === "ne" }}
                            onPress={() => setLanguage("ne")}
                            className="h-11 justify-center px-1.5"
                        >
                            <AppText variant="caption" weight={language === "ne" ? "bold" : "medium"} colorToken={language === "ne" ? "primary" : "textSecondary"}>
                                ने
                            </AppText>
                        </Pressable>
                    </View>
                    <Button
                        variant="ghost"
                        size="icon"
                        accessibilityLabel={T_SEARCH[language]}
                        onPress={() => router.push("/search" as never)}
                        className="h-11 w-11 rounded-lg"
                    >
                        <Search size={20} color={colors.textPrimary} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        accessibilityLabel={T_NOTIFICATIONS[language]}
                        onPress={() => router.push("/notifications" as never)}
                        className="h-11 w-11 rounded-lg"
                    >
                        <Bell size={20} color={colors.textPrimary} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        accessibilityLabel={T_PROFILE[language]}
                        onPress={() => router.push("/profile" as never)}
                        className="h-11 w-11 rounded-lg"
                    >
                        <User size={20} color={colors.textPrimary} />
                    </Button>
                </View>
            </View>
            <View className="mt-1 flex-row items-center justify-between gap-3">
                <AppText variant="caption" colorToken="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
                    {getTodayString(language)}
                </AppText>
                <AppText variant="overline" weight="bold" colorToken="primary" style={{ flexShrink: 0 }}>
                    {isNe ? `संस्करण ${edition}` : `Edition ${edition}`}
                </AppText>
            </View>
        </View>
    );
}
