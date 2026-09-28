import { View, Pressable, ScrollView, Switch, Platform, Alert } from "react-native";
import { useState, useMemo } from "react";
import { router } from "expo-router";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";
import { useAppStore } from "@/state/useAppStore";
import Constants from "expo-constants";
import { 
    Sun, 
    Moon, 
    Settings,
    ChevronRight,
    ExternalLink,
    Clock,
    PenLine
} from "lucide-react-native";
import { listSaved, clearSaved, type SavedArticle } from "@/storage/saved";
import { useColors } from "@/theme/Theme";

function calculateSizeMB(article: SavedArticle) {
    const jsonStr = JSON.stringify(article);
    const bytes = new Blob([jsonStr]).size;
    const mb = bytes / (1024 * 1024);
    return Math.max(0.1, mb + 3.1);
}

export default function ProfileScreen() {
    const { language } = useLanguage();
    const isNe = language === "ne";
    const store = useAppStore();
    const colors = useColors();
    
    // Derived Storage metrics
    const savedIds = useAppStore(state => state.savedArticleIds);
    const { totalMB, percentage } = useMemo(() => {
        const articles = listSaved();
        let total = 0;
        for (const article of articles) {
            total += calculateSizeMB(article);
        }
        return {
            totalMB: total.toFixed(1),
            percentage: Math.min(100, Math.max(2, (total / 250) * 100)).toFixed(1)
        };
    }, [savedIds]); // recompute when savedIds changes

    const handleClearCache = () => {
        Alert.alert(
            "Clear Offline Cache?",
            "This will delete all your downloaded articles.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Clear", 
                    style: "destructive", 
                    onPress: () => {
                        clearSaved();
                        // Also clear the store IDs
                        store.savedArticleIds.forEach(id => store.toggleSavedArticle(id));
                    }
                }
            ]
        );
    };

    const SegmentButton = ({ label, active, onPress, children }: { label?: string, active: boolean, onPress: () => void, children?: React.ReactNode }) => (
        <Pressable 
            onPress={onPress}
            className={`flex-1 py-2 items-center justify-center rounded-sm ${active ? 'bg-primary' : 'bg-transparent'}`}
        >
            {children ? children : (
                <AppText
                    variant="caption"
                    weight={active ? 'bold' : 'medium'}
                    style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    colorToken={active ? 'textInverse' : 'textPrimary'}
                >
                    {label}
                </AppText>
            )}
        </Pressable>
    );

    const SectionHeader = ({ title, subtitle, num }: { title: string, subtitle: string, num: number }) => (
        <View className="flex-row items-center justify-between pb-2 mb-4 bg-surface-secondary px-3 py-2 rounded-lg">
            <AppText variant="caption" weight="bold" colorToken="textPrimary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                {num}. {title}
            </AppText>
            <AppText variant="caption" weight={isNe ? "medium" : "medium"} colorToken="textSecondary">
                {subtitle}
            </AppText>
        </View>
    );

    const CustomSwitch = ({ value, onValueChange }: { value: boolean, onValueChange: (v: boolean) => void }) => (
        <Switch 
            value={value} 
            onValueChange={onValueChange} 
        />
    );

    return (
        <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-16">
            {/* Header Area */}
            <View className="px-5 pt-12 pb-6 bg-card border-b border-border">
                <View className="flex-row items-baseline justify-between">
                    <AppText
                        variant="heading1"
                        weight={isNe ? "bold" : "bold"}
                    >
                        Settings & Preferences
                    </AppText>
                    <AppText variant="caption" weight={isNe ? "semibold" : "semibold"} colorToken="primary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                        सेटिंग्स
                    </AppText>
                </View>
                <View className="flex-row items-center gap-2 mt-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <AppText variant="caption" weight="semibold" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Edition 142 • Kathmandu Dispatches</AppText>
                    <AppText variant="caption" weight="semibold" colorToken="textSecondary">•</AppText>
                    <AppText variant="caption" weight="semibold" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>B.S. 2081 Jestha</AppText>
                </View>
            </View>

            <View className="p-5 gap-6">
                <Pressable
                    onPress={() => router.push("/designer" as never)}
                    className="bg-primary p-4 rounded-xl flex-row items-center gap-3 active:opacity-90"
                >
                    <View className="w-10 h-10 rounded-full bg-primary-foreground/15 items-center justify-center">
                        <PenLine size={19} color={colors.textInverse} />
                    </View>
                    <View className="flex-1">
                        <AppText variant="caption" weight="black" colorToken="textInverse" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>CREATOR STUDIO</AppText>
                        <AppText variant="caption" weight="medium" colorToken="textInverse" style={{ marginTop: 4, opacity: 0.8 }}>Design and share a news post</AppText>
                    </View>
                    <ChevronRight size={20} color={colors.textInverse} />
                </Pressable>
                
                {/* 1. LANGUAGE & REGION */}
                <View className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <SectionHeader num={1} title="Language & Region" subtitle="भाषा र क्षेत्र" />
                    
                    <View className="gap-4">
                        <View>
                            <AppText variant="caption" weight="bold" colorToken="textPrimary" style={{ textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Primary App Language</AppText>
                            <View className="flex-row bg-surface-secondary p-1 rounded-md">
                                <SegmentButton label="English" active={store.language === "en"} onPress={() => store.setLanguage("en")} />
                                <SegmentButton label="नेपाली (Devanagari)" active={store.language === "ne"} onPress={() => store.setLanguage("ne")} />
                            </View>
                        </View>

                        <View className="flex-row items-start justify-between pt-1">
                            <View className="flex-1 pr-4">
                                <AppText variant="body" weight="bold">Bilingual headlines</AppText>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2, lineHeight: 20 }}>Displays both English and Nepali titles on major investigative pieces.</AppText>
                            </View>
                            <CustomSwitch value={store.bilingualHeadlines} onValueChange={store.setBilingualHeadlines} />
                        </View>

                        <View className="bg-surface-secondary p-3 rounded-lg flex-row items-center justify-between mt-2">
                            <View>
                                <AppText variant="caption" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Regional Desk</AppText>
                                <AppText variant="body" weight="bold" style={{ marginTop: 2 }}>{store.regionalDesk}</AppText>
                            </View>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onPress={() => Alert.alert("Coming Soon", "Region selector will be available in the next update.")}
                            >
                                <AppText variant="caption" weight="semibold" colorToken="primary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Switch</AppText>
                            </Button>
                        </View>
                    </View>
                </View>

                {/* 2. READING & TYPOGRAPHY */}
                <View className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <SectionHeader num={2} title="Reading & Typography" subtitle="पठन अनुभव" />
                    
                    <View className="bg-surface-secondary p-4 rounded-lg mb-4">
                        <View className="flex-row items-center justify-between mb-2">
                            <AppText variant="caption" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>SPECIMEN PREVIEW</AppText>
                            <AppText variant="caption" weight="bold" colorToken="primary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {store.readerScale === 'sm' ? '14px' : store.readerScale === 'md' ? '18px' : store.readerScale === 'lg' ? '22px' : '26px'}
                                {" "}{store.bodyTypeface === 'serif' ? 'Editorial' : 'Modern'}
                            </AppText>
                        </View>
                        <View className="bg-card p-3 rounded shadow-sm border border-border">
                            <AppText
                                variant="body"
                                style={{
                                    fontStyle: "italic",
                                    fontFamily: store.bodyTypeface === "serif" ? "Merriweather_400Regular" : "Inter_400Regular",
                                    fontSize: store.readerScale === 'sm' ? 14 : store.readerScale === 'md' ? 18 : store.readerScale === 'lg' ? 22 : 26, 
                                    lineHeight: store.readerScale === 'sm' ? 22 : store.readerScale === 'md' ? 28 : store.readerScale === 'lg' ? 34 : 40, 
                                }}
                            >
                                “Diplomatic accords cannot reset with every ministerial change in Singha Durbar.”
                            </AppText>
                        </View>
                        <AppText variant="caption" weight="semibold" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5, textAlign: "right", marginTop: 8 }}>
                            — Analytical Review, Desk Bureau
                        </AppText>
                    </View>

                    <View className="gap-4">
                        <View>
                            <View className="flex-row justify-between mb-2">
                                <AppText variant="caption" weight="bold" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>FONT SIZE</AppText>
                            </View>
                            <View className="flex-row bg-surface-secondary p-1 rounded-md">
                                <SegmentButton label="Small" active={store.readerScale === "sm"} onPress={() => store.setReaderScale("sm")} />
                                <SegmentButton label="18px" active={store.readerScale === "md"} onPress={() => store.setReaderScale("md")} />
                                <SegmentButton label="Large" active={store.readerScale === "lg"} onPress={() => store.setReaderScale("lg")} />
                                <SegmentButton label="X-Large" active={store.readerScale === "xl"} onPress={() => store.setReaderScale("xl")} />
                            </View>
                        </View>

                        <View>
                            <AppText variant="caption" weight="bold" colorToken="textPrimary" style={{ textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Body Typeface</AppText>
                            <View className="flex-row gap-2">
                                <Pressable onPress={() => store.setBodyTypeface("serif")} className={`flex-1 p-3 rounded-lg border ${store.bodyTypeface === "serif" ? "bg-surface-secondary border-border" : "bg-card border-transparent"}`}>
                                    <AppText variant="body" weight="bold" style={{ fontFamily: "Merriweather_700Bold" }}>Editorial Serif</AppText>
                                    <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Merriweather Pro</AppText>
                                </Pressable>
                                <Pressable onPress={() => store.setBodyTypeface("sans")} className={`flex-1 p-3 rounded-lg border ${store.bodyTypeface === "sans" ? "bg-surface-secondary border-border" : "bg-card border-transparent"}`}>
                                    <AppText variant="body" weight="bold">Modern Sans</AppText>
                                    <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Inter Neutral</AppText>
                                </Pressable>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between pt-1">
                            <View className="flex-1 pr-4">
                                <AppText variant="body" weight="bold">Reading progress bar</AppText>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Subtle indicator under top navigation</AppText>
                            </View>
                            <CustomSwitch value={store.readingProgressBar} onValueChange={store.setReadingProgressBar} />
                        </View>

                        <View className="flex-row items-center justify-between pt-1">
                            <View className="flex-1 pr-4">
                                <AppText variant="body" weight="bold">Auto-play audio briefs</AppText>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Stream correspondent summaries automatically</AppText>
                            </View>
                            <CustomSwitch value={store.autoplayAudio} onValueChange={store.setAutoplayAudio} />
                        </View>
                    </View>
                </View>

                {/* 3. APPEARANCE & CANVAS */}
                <View className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <SectionHeader num={3} title="Appearance & Canvas" subtitle="स्वरूप" />
                    
                    <View className="gap-4">
                        <View>
                            <AppText variant="caption" weight="bold" colorToken="textPrimary" style={{ textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Canvas Theme</AppText>
                            <View className="flex-row bg-surface-secondary p-1 rounded-md">
                                <SegmentButton active={store.theme === "light"} onPress={() => store.setTheme("light")}>
                                    <Sun size={18} color={store.theme === "light" ? colors.textInverse : colors.textPrimary} />
                                    <AppText variant="caption" weight="bold" colorToken={store.theme === "light" ? "textInverse" : "textPrimary"} style={{ marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Paper</AppText>
                                </SegmentButton>
                                <SegmentButton active={store.theme === "dark"} onPress={() => store.setTheme("dark")}>
                                    <Moon size={18} color={store.theme === "dark" ? colors.textInverse : colors.textPrimary} />
                                    <AppText variant="caption" weight="bold" colorToken={store.theme === "dark" ? "textInverse" : "textPrimary"} style={{ marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Ink Night</AppText>
                                </SegmentButton>
                                <SegmentButton active={store.theme === "system"} onPress={() => store.setTheme("system")}>
                                    <Settings size={18} color={store.theme === "system" ? colors.textInverse : colors.textPrimary} />
                                    <AppText variant="caption" weight="bold" colorToken={store.theme === "system" ? "textInverse" : "textPrimary"} style={{ marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>System</AppText>
                                </SegmentButton>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between bg-surface-secondary p-3 rounded-lg">
                            <View className="flex-1 pr-4">
                                <AppText variant="body" weight="bold">Warm paper hue</AppText>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Reduces blue light during late reading</AppText>
                            </View>
                            <CustomSwitch value={store.warmPaperHue} onValueChange={store.setWarmPaperHue} />
                        </View>
                    </View>
                </View>

                {/* 4. NOTIFICATIONS & ALERTS */}
                <View className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <SectionHeader num={4} title="Notifications & Alerts" subtitle="सूचनाहरू" />
                    
                    <View className="gap-4">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-4">
                                <View className="flex-row items-center gap-2">
                                    <AppText variant="body" weight="bold">Breaking dispatches</AppText>
                                    <View className="bg-primary/10 px-1.5 py-0.5 rounded">
                                        <AppText variant="caption" weight="bold" colorToken="primary" style={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 9 }}>Priority</AppText>
                                    </View>
                                </View>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Urgent national alerts only (avg. 1–2 per day).</AppText>
                            </View>
                            <CustomSwitch value={store.breakingDispatches} onValueChange={store.setBreakingDispatches} />
                        </View>

                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-4">
                                <AppText variant="body" weight="bold">The Daily Brief</AppText>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Morning compilation of essential policy news</AppText>
                                <View className="flex-row items-center gap-1 mt-1">
                                    <Clock size={14} className="text-primary" />
                                    <AppText variant="caption" weight="semibold" colorToken="primary">06:00 AM NPT (Nepal Standard Time)</AppText>
                                </View>
                            </View>
                            <CustomSwitch value={store.dailyBriefAlert} onValueChange={store.setDailyBriefAlert} />
                        </View>

                        <View className="bg-surface-secondary p-3 rounded-lg mt-2">
                            <View className="flex-row justify-between items-center mb-2">
                                <AppText variant="caption" weight="bold" colorToken="textPrimary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Topics & Columnists</AppText>
                                <Pressable onPress={() => Alert.alert("Coming Soon", "Topic manager will be available shortly.")}>
                                    <AppText variant="caption" weight="bold" colorToken="primary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Manage (4) →</AppText>
                                </Pressable>
                            </View>
                            <View className="flex-row flex-wrap gap-1.5">
                                {["Politics", "Energy & Hydropower", "Nepal Rastra Bank", "Swarnim Bhattarai"].map(t => (
                                    <View key={t} className="bg-card px-2 py-1 rounded shadow-sm border border-border">
                                        <AppText variant="caption" weight="medium">{t}</AppText>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row items-start justify-between pt-2">
                            <View className="flex-1 pr-4">
                                <AppText variant="body" weight="bold">Evening editorial round-up</AppText>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Curated perspectives at sunset (18:30 NPT)</AppText>
                            </View>
                            <CustomSwitch value={store.eveningRoundup} onValueChange={store.setEveningRoundup} />
                        </View>
                    </View>
                </View>

                {/* 5. OFFLINE & STORAGE */}
                <View className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <SectionHeader num={5} title="Offline & Cache Storage" subtitle="अफलाइन र भण्डारण" />
                    
                    <View className="gap-4">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-4">
                                <AppText variant="body" weight="bold">Auto-download on Wi-Fi</AppText>
                                <AppText variant="caption" colorToken="textSecondary" style={{ marginTop: 2 }}>Downloads unread Top Stories and Daily Brief for commute reading.</AppText>
                            </View>
                            <CustomSwitch value={store.autoDownloadWifi} onValueChange={store.setAutoDownloadWifi} />
                        </View>

                        <View className="bg-surface-secondary p-3 rounded-lg mt-2">
                            <View className="flex-row justify-between items-center mb-1.5">
                                <AppText variant="caption" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>STORAGE ALLOCATION</AppText>
                                <AppText variant="caption" weight="semibold">{totalMB} MB / 250 MB</AppText>
                            </View>
                            <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                                <View className="h-full bg-primary" style={{ width: `${percentage}%` as any }} />
                            </View>
                            <View className="flex-row justify-between items-center mt-3">
                                <AppText variant="caption" weight="medium" colorToken="textSecondary">High-res dispatches cache</AppText>
                                <Pressable onPress={handleClearCache}>
                                    <AppText variant="caption" weight="bold" colorToken="primary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Clear Offline Cache</AppText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 6. EDITORIAL INTEGRITY & ABOUT */}
                <View className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <SectionHeader num={6} title="Editorial Integrity" subtitle="सम्पादकीय प्रतिबद्धता" />
                    
                    <View className="gap-2">
                        <Pressable 
                            onPress={() => Alert.alert("Coming Soon", "Editorial Charter document viewer is under construction.")}
                            className="flex-row items-center justify-between py-2"
                        >
                            <View>
                                <AppText variant="body" weight="bold">The Leaders Editorial Charter</AppText>
                                <AppText variant="caption" weight="medium" colorToken="textSecondary" style={{ marginTop: 2 }}>Code of Ethics & Independent Fact-Checking</AppText>
                            </View>
                            <ChevronRight size={20} className="text-muted-foreground" />
                        </Pressable>
                        <Pressable 
                            onPress={() => Alert.alert("Coming Soon", "Transparency Report viewer is under construction.")}
                            className="flex-row items-center justify-between py-2"
                        >
                            <View>
                                <AppText variant="body" weight="bold">Press Council Compliance</AppText>
                                <AppText variant="caption" weight="medium" colorToken="textSecondary" style={{ marginTop: 2 }}>Annual Transparency Report (2024)</AppText>
                            </View>
                            <ChevronRight size={20} className="text-muted-foreground" />
                        </Pressable>
                        <Pressable 
                            onPress={() => Alert.alert("Contact", "Opening mail client to corrections@theleadersnp.com")}
                            className="flex-row items-center justify-between py-2"
                        >
                            <View>
                                <AppText variant="body" weight="bold">Newsroom Corrections Bureau</AppText>
                                <AppText variant="caption" weight="bold" colorToken="primary" style={{ marginTop: 2, letterSpacing: 0.5 }}>corrections@theleadersnp.com</AppText>
                            </View>
                            <ExternalLink size={18} className="text-muted-foreground" />
                        </Pressable>
                    </View>

                    <View className="mt-6 pt-6 bg-surface-secondary p-3 rounded-lg items-center border border-border">
                        <AppText variant="body" weight="black" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>THE LEADERS</AppText>
                        <AppText variant="caption" weight="semibold" colorToken="textSecondary" style={{ marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>
                            Version {Constants.expoConfig?.version || "2.4.1"} (Build 890) • Kathmandu Digital Desk
                        </AppText>
                        
                        <View className="flex-row items-center gap-4 mt-4">
                            <Pressable onPress={() => Alert.alert("Coming Soon", "Privacy Policy web view.")}><AppText variant="caption" weight="bold" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Privacy Policy</AppText></Pressable>
                            <AppText variant="caption" weight="bold" colorToken="textSecondary">•</AppText>
                            <Pressable onPress={() => Alert.alert("Coming Soon", "Terms of Service web view.")}><AppText variant="caption" weight="bold" colorToken="textSecondary" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Terms of Journalistic Service</AppText></Pressable>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-6">
                        <Button 
                            variant="secondary"
                            className="flex-1 bg-surface-secondary"
                            onPress={() => Alert.alert("Coming Soon", "In-app purchases integration in progress.")}
                        >
                            <AppText variant="caption" weight="bold" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Restore Purchases</AppText>
                        </Button>
                        <Button 
                            variant="destructive"
                            className="flex-1 bg-destructive/10 hover:bg-destructive/20 active:bg-destructive/30"
                            onPress={() => Alert.alert("Sign Out", "Are you sure you want to sign out?", [{ text: "Cancel", style: "cancel" }, { text: "Sign Out", style: "destructive" }])}
                        >
                            <AppText variant="caption" weight="bold" colorToken="error" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Sign Out</AppText>
                        </Button>
                    </View>
                </View>

            </View>
        </ScrollView>
    );
}
