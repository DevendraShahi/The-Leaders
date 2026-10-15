import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Bell, Search } from "lucide-react-native";
import { AppText } from "./primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";
import { useColors } from "@/theme/Theme";
import { layout, spacing } from "@/theme/tokens";

export function Masthead() {
    const { language, toggleLanguage } = useLanguage();
    const colors = useColors();
    const date = new Intl.DateTimeFormat(language === "ne" ? "ne-NP" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kathmandu" }).format(new Date());
    return (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.identity}>
                <AppText variant="brandTitle" weight="bold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>THE LEADERS</AppText>
                <AppText variant="overline" colorToken="textSecondary" numberOfLines={1}>{date}</AppText>
            </View>
            <View style={styles.actions}>
                <Button variant="ghost" size="icon" accessibilityLabel={language === "ne" ? "खोज" : "Search"} onPress={() => router.push("/search" as never)}><Search size={layout.iconSize} color={colors.textPrimary} /></Button>
                <Button variant="ghost" size="icon" accessibilityLabel={language === "ne" ? "सूचनाहरू" : "Notifications"} onPress={() => router.push("/notifications" as never)}><Bell size={layout.iconSize} color={colors.textPrimary} /></Button>
                <Button variant="ghost" size="icon" accessibilityLabel={language === "ne" ? "Switch to English" : "नेपालीमा पढ्नुहोस्"} onPress={toggleLanguage}>
                    <AppText variant="label" colorToken="brandRed">{language === "ne" ? "EN" : "ने"}</AppText>
                </Button>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.gutter, paddingVertical: spacing.md, borderBottomWidth: layout.ruleWidth },
    identity: { flex: 1, minWidth: 0, gap: spacing.xs },
    actions: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
});
