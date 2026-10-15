import { AppSwitch } from "@/ui/primitives/AppSwitch";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { PageHeader } from "@/ui/PageHeader";
import { AppText } from "@/ui/primitives/AppText";
import { SettingsGroup, SettingsRow, SegmentedControl } from "@/ui/Settings";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";
import { useAppStore, type ReaderScale, type ThemePreference } from "@/state/useAppStore";
import { listSaved, clearSaved } from "@/storage/saved";
import { useColors } from "@/theme/Theme";
import { fontFor, readerTypography, spacing, radius, layout } from "@/theme/tokens";
import { useAdminAccount } from "@/services/useAdminAccount";
import { LogIn, ShieldCheck } from "lucide-react-native";
import { useSessionAuth } from "@/services/AuthProvider";

export default function ProfileScreen() {
    const { language, setLanguage } = useLanguage();
    const store = useAppStore();
    const colors = useColors();
    const account = useAdminAccount();
    const { isAdmin } = account;
    const auth = useSessionAuth();
    const [signingOut, setSigningOut] = useState(false);
    const signOut = async () => {
        setSigningOut(true);
        try { await auth.signOut(); } catch { Alert.alert(t("Unable to sign out", "लगआउट गर्न सकिएन")); } finally { setSigningOut(false); }
    };
    const refetchAccount = account.refetch;
    useFocusEffect(useCallback(() => { void refetchAccount(); }, [refetchAccount]));
    const [confirmClear, setConfirmClear] = useState(false);
    const ne = language === "ne";
    const t = (en: string, np: string) => ne ? np : en;
    const reader = readerTypography[store.readerScale];
    const saved = listSaved();
    const open = (url: string) => { void Linking.openURL(url).catch(() => Alert.alert(t("Unable to open link", "लिङ्क खोल्न सकिएन"))); };
    const toggle = (label: string, value: boolean, onValueChange: (value: boolean) => void) => <AppSwitch accessibilityLabel={label} value={value} onValueChange={onValueChange} />;
    return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing["3xl"] }}>
        <PageHeader compact title={isAdmin ? t("Profile", "प्रोफाइल") : t("Settings", "सेटिङ्स")} subtitle={isAdmin ? t("Your newsroom account and preferences", "तपाईंको समाचार कक्ष खाता र प्राथमिकताहरू") : t("Make The Leaders work for you", "आफ्नो सुविधाअनुसार एप मिलाउनुहोस्")} />
        <View style={styles.content}>
            {isAdmin ? <View style={[styles.account, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <View style={styles.accountHeading}><ShieldCheck size={layout.iconSize} color={colors.brandRed} /><AppText variant="uiTitle">{account.data?.profile?.name || t("Newsroom admin", "समाचार कक्ष एडमिन")}</AppText></View>
                {account.data?.profile?.role ? <AppText variant="overline" colorToken="brandRed">{account.data.profile.role.replace(/_/g, " ")}</AppText> : null}
                <AppText variant="bodySmall" colorToken="textSecondary">{t("Your approved account has access to Studio. Reader preferences are saved on this device.", "तपाईंको स्वीकृत खाताले स्टुडियो प्रयोग गर्न सक्छ। पठन प्राथमिकताहरू यस उपकरणमा सुरक्षित छन्।")}</AppText>
                <Button onPress={() => router.push("/studio" as never)}><AppText variant="label" colorToken="onPrimary">{t("Open Studio", "स्टुडियो खोल्नुहोस्")}</AppText></Button>
                <Button variant="outline" disabled={signingOut} onPress={() => { void signOut(); }}><AppText variant="label">{signingOut ? t("Signing out…", "लगआउट हुँदैछ…") : t("Sign out", "लगआउट")}</AppText></Button>
            </View> : null}

            {!isAdmin ? <SettingsGroup title={t("Admin access", "एडमिन पहुँच")}>
                <View style={[styles.account, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <View style={styles.accountHeading}><LogIn size={layout.iconSize} color={colors.brandRed} /><AppText variant="uiTitle">{t("Newsroom sign in", "समाचार कक्ष लगइन")}</AppText></View>
                    <AppText variant="bodySmall" colorToken="textSecondary">{t("For approved editors and administrators. You can read, save stories and change settings without an account.", "स्वीकृत सम्पादक र प्रशासकहरूका लागि। खाता बिना समाचार पढ्न, सुरक्षित गर्न र सेटिङ्स बदल्न सकिन्छ।")}</AppText>
                    {auth.signedIn ? <>
                        <AppText variant="bodySmall" colorToken="textSecondary">{t("You're signed in. Studio access requires an active, approved newsroom account.", "तपाईं लगइन हुनुहुन्छ। स्टुडियो पहुँचका लागि सक्रिय, स्वीकृत समाचार कक्ष खाता आवश्यक छ।")}</AppText>
                        <Button variant="outline" disabled={account.isFetching} onPress={() => { void account.refetch(); }}><AppText variant="label">{account.isFetching ? t("Checking access…", "पहुँच जाँच हुँदैछ…") : t("Check admin access", "एडमिन पहुँच जाँच्नुहोस्")}</AppText></Button>
                        <Button variant="ghost" disabled={signingOut} onPress={() => { void signOut(); }}><AppText variant="label">{t("Sign out", "लगआउट")}</AppText></Button>
                    </> : <>
                        <Button accessibilityLabel={t("Admin sign in", "एडमिन लगइन")} onPress={() => router.push("/admin-auth" as never)}><AppText variant="label" colorToken="onPrimary">{t("Admin sign in", "एडमिन लगइन")}</AppText></Button>
                        <AppText variant="caption" colorToken="textSecondary">{t("Sign in here with your approved newsroom account.", "स्वीकृत समाचार कक्ष खाताबाट यहाँ लगइन गर्नुहोस्।")}</AppText>
                    </>}
                    {account.isError ? <AppText variant="caption" colorToken="brandRed">{t("Account access could not be checked. Reader settings remain available.", "खाताको पहुँच जाँच्न सकिएन। पठन सेटिङ्स उपलब्ध छन्।")}</AppText> : null}
                </View>
            </SettingsGroup> : null}
            <SettingsGroup title={t("Language & appearance", "भाषा र स्वरूप")}>
                <SegmentedControl label={t("Reading language", "पढ्ने भाषा")} value={language} onChange={setLanguage} options={[{ value: "en", label: "English" }, { value: "ne", label: "नेपाली" }]} />
                <SegmentedControl<ThemePreference> label={t("Theme", "थिम")} value={store.theme} onChange={store.setTheme} options={[{ value: "light", label: t("Light", "उज्यालो") }, { value: "dark", label: t("Dark", "अँध्यारो") }, { value: "system", label: t("System", "प्रणाली") }]} />
            </SettingsGroup>
            <SettingsGroup title={t("Reading", "पठन")}>
                <SegmentedControl<ReaderScale> label={t("Article text size", "लेखको अक्षर आकार")} value={store.readerScale} onChange={store.setReaderScale} options={[{ value: "sm", label: t("Small", "सानो") }, { value: "md", label: t("Default", "सामान्य") }, { value: "lg", label: t("Large", "ठूलो") }, { value: "xl", label: t("Largest", "अति ठूलो") }]} />
                <View style={[styles.preview, { backgroundColor: colors.surfaceSecondary }]}><AppText variant="body" style={{ fontFamily: fontFor(language, "editorial", "regular"), fontSize: reader.size, lineHeight: reader.lineHeight }}>{t("Clear reporting from Nepal and beyond. Read at your own pace.", "नेपाल र विश्वका स्पष्ट समाचार। आफ्नै गतिमा पढ्नुहोस्।")}</AppText></View>
                <SettingsRow title={t("Reading progress", "पठन प्रगति")} description={t("Show your progress in an article.", "लेख पढ्दाको प्रगति देखाउनुहोस्।")}>{toggle(t("Reading progress", "पठन प्रगति"), store.readingProgressBar, store.setReadingProgressBar)}</SettingsRow>
            </SettingsGroup>
            <SettingsGroup title={t("Alert preferences", "सूचना प्राथमिकता")}>
                <AppText variant="caption" colorToken="textSecondary">{t("Preferences are saved on this device. Push delivery is not connected yet.", "प्राथमिकताहरू यस उपकरणमा सुरक्षित छन्। पुश सूचना सेवा अझै जोडिएको छैन।")}</AppText>
                <SettingsRow title={t("Breaking news", "ब्रेकिङ समाचार")}>{toggle(t("Breaking news", "ब्रेकिङ समाचार"), store.breakingDispatches, store.setBreakingDispatches)}</SettingsRow>
                <SettingsRow title={t("Daily brief", "दैनिक ब्रीफ")}>{toggle(t("Daily brief", "दैनिक ब्रीफ"), store.dailyBriefAlert, store.setDailyBriefAlert)}</SettingsRow>
                <SettingsRow title={t("Evening round-up", "साँझको सारांश")}>{toggle(t("Evening round-up", "साँझको सारांश"), store.eveningRoundup, store.setEveningRoundup)}</SettingsRow>
            </SettingsGroup>
            <SettingsGroup title={t("Saved stories", "सुरक्षित समाचार")}>
                <SettingsRow title={t("Your reading library", "तपाईंको पढाइ संग्रह")} description={t(`${saved.length} stories stored on this device`, `यस उपकरणमा ${saved.length} समाचार सुरक्षित`)} onPress={() => router.push("/saved" as never)} />
                {saved.length ? <Button variant="outline" onPress={() => setConfirmClear(true)}><AppText variant="label" colorToken="brandRed">{t("Clear saved stories", "सुरक्षित समाचार हटाउनुहोस्")}</AppText></Button> : null}
                {confirmClear ? <View style={styles.preview}><AppText variant="bodySmall">{t("Remove all saved copies from this device?", "यस उपकरणबाट सबै सुरक्षित समाचार हटाउने?")}</AppText><Button variant="destructive" onPress={() => { clearSaved(); store.setSavedArticleIds([]); setConfirmClear(false); }}><AppText variant="label" colorToken="onPrimary">{t("Remove all", "सबै हटाउनुहोस्")}</AppText></Button><Button variant="ghost" onPress={() => setConfirmClear(false)}><AppText variant="label">{t("Cancel", "रद्द गर्नुहोस्")}</AppText></Button></View> : null}
            </SettingsGroup>
            <SettingsGroup title={t("Privacy", "गोपनीयता")}>
                <SettingsRow title={t("Share anonymous usage", "नामरहित प्रयोग तथ्याङ्क साझा गर्नुहोस्")} description={t("Send event counts to The Leaders to improve reading and reliability. No names, article titles or search text are sent.", "पढाइ र विश्वसनीयता सुधार्न द लिडर्सलाई प्रयोग सङ्ख्या पठाउनुहोस्। नाम, लेख शीर्षक वा खोज शब्द पठाइँदैन।")}>{toggle(t("Share anonymous usage", "नामरहित प्रयोग तथ्याङ्क"), store.usageSharing, store.setUsageSharing)}</SettingsRow>
            </SettingsGroup>
            <SettingsGroup title={t("About The Leaders", "द लिडर्सबारे")}>
                <SettingsRow title={t("Editorial enquiries & corrections", "सम्पादकीय सोधपुछ र सुधार")} onPress={() => open("mailto:corrections@theleadersnp.com")} />
                <SettingsRow title={t("Privacy policy", "गोपनीयता नीति")} onPress={() => open("https://the-leadersnp.com/privacy-policy")} />
                <SettingsRow title={t("Terms of service", "सेवा सर्तहरू")} onPress={() => open("https://the-leadersnp.com/terms")} />
                <AppText variant="caption" colorToken="textSecondary">The Leaders · {Constants.expoConfig?.version ?? "1.0.0"}</AppText>
            </SettingsGroup>
        </View>
    </ScrollView>;
}
const styles = StyleSheet.create({
    content: { paddingHorizontal: spacing.gutter, paddingTop: spacing.xl, gap: spacing.xl },
    preview: { padding: spacing.card, borderRadius: radius.md, gap: spacing.md },
    account: { padding: spacing.card, borderRadius: radius.md, borderWidth: layout.ruleWidth, gap: spacing.md },
    accountHeading: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
