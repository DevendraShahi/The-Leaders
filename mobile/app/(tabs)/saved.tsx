import { View, Pressable, Platform, UIManager, ScrollView, Animated } from "react-native";
import { useMemo, useState, useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { 
    Trash2, 
    Settings2, 
    Plane, 
    DownloadCloud, 
    CheckCircle2, 
    BookOpen, 
    Share
} from "lucide-react-native";

import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language";
import { listSaved, removeSaved, type SavedArticle } from "@/storage/saved";
import { useAppStore } from "@/state/useAppStore";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

function readingMinutes(text: string) {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function calculateSizeMB(article: SavedArticle) {
    const jsonStr = JSON.stringify(article);
    const bytes = new Blob([jsonStr]).size;
    const mb = bytes / (1024 * 1024);
    return Math.max(0.1, mb + 3.1).toFixed(1);
}

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "recently";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default function SavedScreen() {
    const { language } = useLanguage();
    const isNe = language === "ne";
    const savedIds = useAppStore(state => state.savedArticleIds);
    const toggleSavedArticle = useAppStore(state => state.toggleSavedArticle);

    const savedArticles = useMemo(() => listSaved(), [savedIds]);
    const [activeTab, setActiveTab] = useState<"all" | "offline" | "history">("all");

    const handleDelete = (slug: string) => {
        removeSaved(slug);
        toggleSavedArticle(slug);
    };

    const totalMB = useMemo(() => {
        let total = 0;
        for (const article of savedArticles) {
            total += parseFloat(calculateSizeMB(article));
        }
        return total.toFixed(1);
    }, [savedArticles]);

    const [pulseAnim] = useState(new Animated.Value(1));
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();
    }, [pulseAnim]);

    const renderHeader = () => (
        <View className="bg-background">
            {/* Header Title & Settings */}
            <View className="px-5 pt-12 pb-2">
                <View className="flex-row items-center justify-between mb-4">
                    <AppText
                        variant="heading1"
                        weight={isNe ? "bold" : "black"}
                    >
                        Saved
                    </AppText>
                    <Pressable className="flex-row items-center gap-1.5 bg-surface-secondary px-3 py-2 rounded-full active:opacity-70">
                        <Settings2 size={16} className="text-foreground" />
                        <AppText variant="body" weight="semibold">Storage</AppText>
                    </Pressable>
                </View>

                {/* Storage Status Bar */}
                <View className="flex-row items-center gap-2 bg-surface-secondary px-4 py-2.5 rounded-lg">
                    <Animated.View style={{ opacity: pulseAnim }} className="w-2 h-2 rounded-full bg-success" />
                    <AppText variant="caption" weight="medium" colorToken="textSecondary">
                        <AppText variant="caption" weight="bold">Offline Storage: </AppText>
                        {savedArticles.length} cached ({totalMB} MB used) • Auto-sync on Wi-Fi
                    </AppText>
                </View>
            </View>

            {/* Horizontal Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-5 py-4 gap-2">
                <TabButton 
                    label={`All Saved (${savedArticles.length})`} 
                    active={activeTab === "all"} 
                    onPress={() => setActiveTab("all")} 
                />
                <TabButton 
                    label={`Downloaded Offline (${savedArticles.length})`} 
                    active={activeTab === "offline"} 
                    onPress={() => setActiveTab("offline")} 
                />
                <TabButton 
                    label="Reading History" 
                    active={activeTab === "history"} 
                    onPress={() => setActiveTab("history")} 
                />
            </ScrollView>

            {/* Airplane Mode Banner */}
            <View className="mx-5 my-2 p-4 bg-primary/10 rounded-xl flex-row items-start gap-4">
                <Plane size={24} className="text-primary mt-0.5" />
                <View className="flex-1">
                    <AppText variant="overline" weight="black" colorToken="primary">Airplane Mode Ready</AppText>
                    <AppText variant="caption" weight="medium" colorToken="primary" style={{ marginTop: 4, lineHeight: 20 }}>
                        Downloaded dispatches include complete uncompressed text, full-bleed charts, archival context, and translations.
                    </AppText>
                </View>
            </View>

            {/* Download All Row */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-6">
                <Pressable className="flex-row items-center gap-2">
                    <DownloadCloud size={20} className="text-foreground" />
                    <AppText variant="overline" weight="bold">
                        Download All For Flight
                    </AppText>
                </Pressable>
                <AppText variant="caption" weight="semibold" colorToken="textSecondary">8 pending</AppText>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View className="p-5 bg-surface-secondary mt-5 mx-5 rounded-xl gap-4">
            <View className="flex-row items-center justify-between">
                <AppText variant="overline" weight="black">Storage Breakdown</AppText>
                <AppText variant="caption" weight="semibold" colorToken="textSecondary">{totalMB} MB of 250 MB</AppText>
            </View>
            
            <View className="w-full h-2 rounded-full bg-border overflow-hidden flex-row">
                <View className="h-full bg-primary w-[15%]" />
                <View className="h-full bg-secondary w-[5%]" />
                <View className="h-full bg-muted-foreground w-[2%]" />
            </View>

            <View className="flex-row items-center justify-between pt-1">
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-primary" />
                    <AppText variant="caption" weight="medium" colorToken="textSecondary">Story</AppText>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-secondary" />
                    <AppText variant="caption" weight="medium" colorToken="textSecondary">Media</AppText>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <AppText variant="caption" weight="medium" colorToken="textSecondary">Glossary</AppText>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            <FlashList
                data={savedArticles}
                contentContainerStyle={{ paddingBottom: 80 }}
                keyExtractor={(item) => item.slug}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={savedArticles.length > 0 ? renderFooter : null}
                ListEmptyComponent={<StateView empty />}
                ItemSeparatorComponent={() => <View className="h-[1px] bg-border mx-5" />}
                renderItem={({ item }) => {
                    const title = language === "en" ? item.titleEn : item.titleNe || item.titleEn;
                    const mins = readingMinutes(item.contentEn || item.contentNe);
                    const sizeMB = calculateSizeMB(item);
                    
                    return (
                        <View className="px-5 py-6 bg-background">
                            <View className="flex-row items-start gap-4">
                                <View className="flex-1">
                                    {/* Badges and Metadata */}
                                    <View className="flex-row items-center gap-2 mb-2 flex-wrap">
                                        <View className="flex-row items-center bg-success/20 px-1.5 py-0.5 rounded">
                                            <CheckCircle2 size={12} className="text-success mr-1" />
                                            <AppText variant="caption" weight="bold" colorToken="success" style={{ fontSize: 10 }}>READY OFFLINE</AppText>
                                        </View>
                                        <AppText variant="overline" weight="bold" colorToken="textSecondary">
                                            {item.source === "column" ? "Opinion" : "Story"}
                                        </AppText>
                                        <AppText variant="caption" colorToken="textSecondary">•</AppText>
                                        <AppText variant="caption" weight="semibold" colorToken="textSecondary">{mins} min read</AppText>
                                    </View>

                                    {/* Headline */}
                                    <AppText
                                        variant="heading2"
                                        weight={isNe ? "semibold" : "bold"}
                                        numberOfLines={3}
                                    >
                                        {title}
                                    </AppText>

                                    {/* Footer info */}
                                    <View className="flex-row items-center gap-2 mt-3">
                                        <AppText variant="caption" weight="medium" colorToken="textSecondary">Saved {formatDate(item.savedAt)}</AppText>
                                        <View className="w-1 h-1 rounded-full bg-border" />
                                        <AppText variant="caption" weight="medium" colorToken="textSecondary">{sizeMB} MB cached</AppText>
                                    </View>
                                </View>

                                {/* Thumbnail placeholder */}
                                <View className="w-22 h-22 rounded-md bg-surface-secondary overflow-hidden shrink-0" />
                            </View>

                            {/* Action Row */}
                            <View className="flex-row items-center justify-between mt-5">
                                <Button 
                                    onPress={() => router.push(`/article/${item.slug}`)}
                                    className="rounded-full gap-2 px-4"
                                >
                                    <BookOpen size={16} className="text-primary-foreground" />
                                    <AppText variant="body" weight="bold" colorToken="textInverse">Read Offline</AppText>
                                </Button>

                                <View className="flex-row items-center gap-2">
                                    <Button variant="secondary" size="icon" className="rounded-full">
                                        <Share size={18} className="text-muted-foreground" />
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="icon" 
                                        className="rounded-full"
                                        onPress={() => handleDelete(item.slug)}
                                    >
                                        <Trash2 size={18} className="text-muted-foreground" />
                                    </Button>
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <Pressable 
            onPress={onPress}
            className={`px-4 py-2.5 rounded-full ${active ? 'bg-foreground' : 'bg-surface-secondary'}`}
        >
            <AppText 
                variant="body"
                weight={active ? 'bold' : 'semibold'}
                colorToken={active ? 'textInverse' : 'textSecondary'}
            >
                {label}
            </AppText>
        </Pressable>
    );
}
