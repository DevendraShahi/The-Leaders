import { useState, useRef } from "react";
import { View, FlatList, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { spacing } from "@/theme/tokens";
import type { BriefDetail } from "@/api/client";
import { MarkdownBody } from "@/ui/MarkdownBody";
import { useAppStore } from "@/state/useAppStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

const MONTHS = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ne: ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"],
} as const;

function formatBriefDate(iso: string, language: "en" | "ne") {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return { dayName: "", dayNum: "", month: "" };
    
    const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayNamesNe = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार"];
    
    return {
        dayName: language === "ne" ? dayNamesNe[date.getDay()] : dayNamesEn[date.getDay()],
        dayNum: date.getDate().toString(),
        month: MONTHS[language][date.getMonth()]
    };
}

export function BriefReader({ brief }: { brief: BriefDetail }) {
    const colors = useColors();
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

    const dateInfo = formatBriefDate(brief.date, language);
    
    // Add cover slide at index 0
    const slides = ["cover", ...stories];
    
    const renderSlide = ({ item, index }: { item: string | Story, index: number }) => {
        if (item === "cover") {
            return (
                <View style={{ height: SCREEN_HEIGHT, width: "100%", paddingHorizontal: 20, paddingVertical: 24, justifyContent: "center", backgroundColor: colors.background }}>
                    <AppText variant="meta" style={{ color: colors.brandRed, letterSpacing: 2, marginBottom: spacing.xl }}>
                        {language === "en" ? "THE DAILY BRIEF" : "दैनिक ब्रिफिङ"}
                    </AppText>
                    
                    <AppText variant="body" style={{ color: colors.textPrimary, fontFamily: language === "ne" ? "Hind_600SemiBold" : "Manrope_600SemiBold", fontSize: 42, lineHeight: 48 }}>
                        {dateInfo.dayName}
                    </AppText>
                    <AppText variant="body" style={{ color: colors.textSecondary, fontFamily: language === "ne" ? "Hind_400Regular" : "Manrope_400Regular", fontSize: 32, lineHeight: 40, marginTop: spacing.xs }}>
                        {`${dateInfo.dayNum} ${dateInfo.month}`}
                    </AppText>
                    
                    <View style={{ marginTop: spacing["4xl"], paddingTop: spacing.xl, borderTopWidth: 2, borderTopColor: colors.border }}>
                        <AppText variant="meta" style={{ color: colors.textPrimary, fontSize: 16 }}>
                            {language === "en" ? `${stories.length} stories you should know today` : `आज थाहा पाउनुपर्ने ${stories.length} कुराहरू`}
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
            <View style={{ height: SCREEN_HEIGHT, width: "100%", paddingHorizontal: 20, paddingTop: insets.top + 32, paddingBottom: 24, backgroundColor: colors.background }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.xl }}>
                    <AppText variant="body" style={{ color: colors.brandRed, fontFamily: "BebasNeue_400Regular", fontSize: 48, lineHeight: 48, marginRight: spacing.md, marginTop: -4 }}>
                        {String(index).padStart(2, '0')}
                    </AppText>
                    <AppText variant="body" style={{ flex: 1, color: colors.textPrimary, fontFamily: language === "ne" ? "Hind_600SemiBold" : "Manrope_600SemiBold", fontSize: 24, lineHeight: 32 }}>
                        {story.headline}
                    </AppText>
                </View>
                
                <View style={{ flex: 1 }}>
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
                                borderRadius: 8 
                            }}
                        >
                            <AppText variant="meta" style={{ color: colors.textPrimary, fontFamily: language === "ne" ? "Hind_600SemiBold" : "Manrope_600SemiBold" }}>
                                {language === "en" ? "Read full story →" : "पूरा खबर पढ्नुहोस् →"}
                            </AppText>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Pressable 
                onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} 
                style={{ position: "absolute", top: insets.top + 10, left: 20, zIndex: 10, width: 40, height: 40, justifyContent: "center", alignItems: "center", backgroundColor: colors.surfaceSecondary, borderRadius: 20 }}

            >
                <AppText variant="meta" style={{ color: colors.textPrimary, fontSize: 18 }}>✕</AppText>
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
