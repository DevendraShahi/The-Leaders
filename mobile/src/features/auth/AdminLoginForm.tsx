import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/ui/PageHeader";
import { AppText } from "@/ui/primitives/AppText";
import { useSessionAuth } from "@/services/AuthProvider";
import { useColors } from "@/theme/Theme";
import { spacing } from "@/theme/tokens";
import { useLanguage } from "@/i18n/language";


export function AdminLoginForm() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
        <PageHeader compact title={language === "ne" ? "एडमिन लगइन" : "Admin sign in"} onBack={() => router.canGoBack() ? router.back() : router.replace("/profile" as never)} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            <LoginFields />
        </ScrollView>
    </KeyboardAvoidingView>;
}

function LoginFields() {
    const auth = useSessionAuth();
    const queryClient = useQueryClient();
    const { language } = useLanguage();
    const t = (en: string, ne: string) => language === "ne" ? ne : en;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [issue, setIssue] = useState("");
    const lock = useRef(false);
    async function run(action: () => Promise<void>) {
        if (lock.current) return;
        lock.current = true; setBusy(true); setIssue("");
        try { await action(); } catch (error) { setIssue(error instanceof Error ? error.message : "Unable to sign in. Please try again."); }
        finally { lock.current = false; setBusy(false); }
    }
    const submit = () => run(async () => {
        await auth.signIn(email, password);
        setPassword("");
        await queryClient.invalidateQueries({ queryKey: ["admin-account"] });
        router.replace("/profile" as never);
    });
    return <View style={styles.form}>
        <View style={styles.intro}>
            <AppText variant="heading2">{t("Newsroom access", "समाचार कक्ष पहुँच")}</AppText>
            <AppText variant="bodySmall" colorToken="textSecondary">{t("Sign in with your approved admin account to manage stories and open Studio.", "समाचार व्यवस्थापन र स्टुडियोका लागि स्वीकृत एडमिन खाताबाट लगइन गर्नुहोस्।")}</AppText>
        </View>
        {issue ? <AppText accessibilityRole="alert" variant="bodySmall" colorToken="brandRed">{issue}</AppText> : null}
        {auth.signedIn ? <>
            <AppText>{t("You're signed in. Your newsroom permissions will be checked in Profile.", "तपाईं लगइन हुनुहुन्छ। प्रोफाइलमा समाचार कक्षको अनुमति जाँच गरिनेछ।")}</AppText>
            <Button onPress={() => router.replace("/profile" as never)}><AppText variant="label" colorToken="onPrimary">{t("Continue to Profile", "प्रोफाइलमा जानुहोस्")}</AppText></Button>
            <Button variant="outline" disabled={busy} onPress={() => { void run(async () => { await auth.signOut(); }); }}><AppText variant="label">{t("Sign out", "लगआउट")}</AppText></Button>
        </> : <>
            <>
                <View style={styles.field}><AppText variant="label">{t("Email address", "इमेल ठेगाना")}</AppText>
                    <Input accessibilityLabel="Email address" value={email} onChangeText={setEmail} placeholder="you@newsroom.com" keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} editable={!busy} /></View>
                <View style={styles.field}><AppText variant="label">{t("Password", "पासवर्ड")}</AppText>
                    <Input accessibilityLabel="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="current-password" autoCapitalize="none" autoCorrect={false} editable={!busy} returnKeyType="go" onSubmitEditing={() => { if (email.trim() && password) void submit(); }} />
                    <Button variant="ghost" onPress={() => setShowPassword(value => !value)}><AppText variant="caption" colorToken="textSecondary">{showPassword ? t("Hide password", "पासवर्ड लुकाउनुहोस्") : t("Show password", "पासवर्ड देखाउनुहोस्")}</AppText></Button></View>
            </>
            <Button disabled={busy || !auth.ready || !email.trim() || !password} onPress={() => { void submit(); }}>
                <AppText variant="label" colorToken="onPrimary">{busy ? t("Signing in…", "लगइन हुँदैछ…") : t("Sign in", "लगइन")}</AppText>
            </Button>
            <AppText variant="caption" colorToken="textSecondary">{t("Admin access is granted by the newsroom. You can read and customize the app without signing in.", "एडमिन पहुँच समाचार कक्षले दिन्छ। लगइन नगरी समाचार पढ्न र एपका सेटिङ्स मिलाउन सकिन्छ।")}</AppText>
        </>}
    </View>;
}
const styles = StyleSheet.create({
    scroll: { flexGrow: 1, padding: spacing.gutter, alignItems: "center" },
    form: { width: "100%", maxWidth: 520, gap: spacing.lg, paddingVertical: spacing.lg },
    intro: { gap: spacing.sm }, field: { gap: spacing.sm },
});
