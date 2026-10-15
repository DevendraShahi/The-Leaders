import { View, FlatList, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { spacing, radius, layout } from "@/theme/tokens";
import type { BriefDetail } from "@/api/client";
import { MarkdownBody } from "@/ui/MarkdownBody";
import { useAppStore } from "@/state/useAppStore";



type Story = {
    id: string;
    headline: string;
    body: string;
    link?: string;
};

function parseStories(markdown: string): Story[] {
    const lines = markdown.split('\n');
    const stories: Story[] = [];
    let currentStory: Story | null = null;
    let currentBody: string[] = [];

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,3})\s+(?:(\d+)[.)]?\s+)?(.*)$/);
        if (headingMatch) {
            if (currentStory) {
                currentStory.body = currentBody.join('\n').trim();
                stories.push(currentStory);
            }
            currentStory = {
                id: headingMatch[2] || String(stories.length + 1),
                headline: headingMatch[3].trim(),
                body: "",
            };
            currentBody = [];
        } else if (currentStory) {
            const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch && (linkMatch[1].toLowerCase().includes('read') || linkMatch[1].includes('पूरा'))) {
                currentStory.link = linkMatch[2];
            } else {
                currentBody.push(line);
            }
        }
    }
    if (currentStory) {
        currentStory.body = currentBody.join('\n').trim();
        stories.push(currentStory);
    }
    return stories;
}

export function BriefReader({ brief }: { brief: BriefDetail }) {
    const colors = useColors();
    const { height: SCREEN_HEIGHT } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const scale = useAppStore(state => state.readerScale);
    
    const content = pick(brief.content, language) || pick(brief.summary, language);
    let stories = parseStories(content);
    
    // Fallback if parsing fails to find headings
    if (stories.length === 0) {
        stories = [{
            id: "1",
            headline: pick(brief.title, language),
            body: content
        }];
    }

    const date = new Date(brief.date);
    const dateLabel = Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(language === "ne" ? "ne-NP" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kathmandu" }).format(date) : "";
    
    // Add cover slide at index 0
    const slides = ["cover", ...stories];
    
    const renderSlide = ({ item, index }: { item: string | Story, index: number }) => {
        if (item === "cover") {
            return (
                <View style={{ height: SCREEN_HEIGHT, width: "100%", paddingHorizontal: spacing.gutter, paddingVertical: 24, justifyContent: "center", backgroundColor: colors.background }}>
                    <AppText variant="overline" style={{ color: colors.brandRed, marginBottom: spacing.xl, textTransform: "uppercase" }}>
                        {language === "en" ? "THE DAILY BRIEF" : "दैनिक ब्रिफिङ"}
                    </AppText>
                    
                    <AppText variant="display" style={{ color: colors.textPrimary }}>
                        {pick(brief.title, language)}
                    </AppText>
                    <AppText variant="heading1" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
                        {dateLabel}
                    </AppText>
                    
                    <View style={{ marginTop: spacing["4xl"], paddingTop: spacing.xl, borderTopWidth: 2, borderTopColor: colors.border }}>
                        <AppText variant="bodySmall" weight="semibold" style={{ color: colors.textPrimary }}>
                            {language === "en" ? `${stories.length} stories in this brief` : `यस ब्रिफिङमा ${stories.length} सामग्री`}
                        </AppText>
                    </View>
                    
                    <View style={{ position: "absolute", bottom: insets.bottom + 100, width: "100%", alignItems: "center", alignSelf: "center" }}>
                        <AppText variant="meta" style={{ color: colors.textMuted }}>
                            {language === "en" ? "Swipe up to begin" : "सुरु गर्न माथि तान्नुहोस्"}
                        </AppText>
                    </View>
                </View>
            );
        }
        
        const story = item as Story;
        return (
            <View style={{ height: SCREEN_HEIGHT, width: "100%", paddingHorizontal: spacing.gutter, paddingTop: insets.top + 32, paddingBottom: spacing.xl, backgroundColor: colors.background }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.xl }}>
                    <AppText variant="display" style={{ color: colors.brandRed, marginRight: spacing.md, marginTop: -4, fontVariant: ["tabular-nums"] }}>
                        {String(index).padStart(2, '0')}
                    </AppText>
                    <AppText variant="heading1" style={{ flex: 1, color: colors.textPrimary }}>
                        {story.headline}
                    </AppText>
                </View>
                
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
                    <MarkdownBody source={story.body} scale={scale} leading="loose" editorial />
                    
                    {story.link && (
                        <Pressable 
                            onPress={() => {
                                if (story.link!.startsWith('http')) {
                                    WebBrowser.openBrowserAsync(story.link!);
                                } else {
                                    router.push(story.link! as any);
                                }
                            }}
                            style={{ 
                                marginTop: spacing.xl, 
                                paddingVertical: spacing.md, 
                                paddingHorizontal: spacing.lg, 
                                backgroundColor: colors.surfaceSecondary, 
                                alignSelf: "flex-start", 
                                borderRadius: radius.md
                            }}
                        >
                            <AppText variant="label" style={{ color: colors.textPrimary }}>
                                {language === "en" ? "Read full story →" : "पूरा खबर पढ्नुहोस् →"}
                            </AppText>
                        </Pressable>
                    )}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Pressable 
                accessibilityRole="button"
                accessibilityLabel={language === "ne" ? "ब्रिफिङ बन्द गर्नुहोस्" : "Close brief"}
                onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} 
                style={{ position: "absolute", top: insets.top + 10, left: 20, zIndex: 10, width: layout.touchTarget, height: layout.touchTarget, justifyContent: "center", alignItems: "center", backgroundColor: colors.surfaceSecondary, borderRadius: 20 }}

            >
                <AppText variant="uiTitle" style={{ color: colors.textPrimary }}>✕</AppText>
            </Pressable>
            
            <FlatList
                data={slides}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderSlide}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={false}
            />
        </View>
    );
}
