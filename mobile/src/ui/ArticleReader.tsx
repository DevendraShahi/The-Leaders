import { useState } from "react";
import { Platform, Pressable, ScrollView, Share, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MarkdownBody } from "@/ui/MarkdownBody";
import { AppText as Text } from "@/ui/primitives/AppText";
import { useLanguage, pick } from "@/i18n/language";
import { ui } from "@/i18n/copy";
import { useAppStore } from "@/state/useAppStore";
import type { ArticleCard, ArticleDetail } from "@/api/client";
import { LucideBookmark, LucideShare, LucideMessageCircle, LucidePlayCircle, LucideLanguages } from "lucide-react-native";
import { Button } from "@/components/ui/button";

const SITE = "https://the-leadersnp.com";
const SIZES: { id: "sm" | "md" | "lg" | "xl"; label: { en: string; ne: string } }[] = [
    { id: "sm", label: ui.sizeSmall },
    { id: "md", label: ui.sizeDefault },
    { id: "lg", label: ui.sizeLarge },
    { id: "xl", label: ui.sizeExtra },
];

const MONTHS = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ne: ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"],
} as const;

function publishedLabel(iso: string, language: "en" | "ne") {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getDate()} ${MONTHS[language][date.getMonth()]} ${date.getFullYear()}`;
}

function readingMinutes(text: string) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export function articleWebUrl(article: Pick<ArticleDetail, "source" | "slug">) {
    if (article.source === "column") return `${SITE}/coverage/columns/${article.slug}`;
    if (article.source === "analysis") return `${SITE}/election-2026/analyses/${article.slug}`;
    return `${SITE}/articles/${article.slug}`;
}

function field(value: { en: string; ne: string }, language: "en" | "ne") {
    return (language === "ne" ? value.ne : value.en).trim();
}

export function ArticleSkeleton() {
    const bar = (width: string | number, height: number) => (
        <View style={{ width: width as any, height }} className="bg-surface-secondary rounded" />
    );
    return (
        <View className="flex-1 bg-background">
            <View className="p-5 gap-6">
                {bar("72%", 12)}
                <View className="gap-2">
                    {bar("100%", 28)}
                    {bar("92%", 28)}
                    {bar("70%", 28)}
                </View>
                <View className="gap-2">
                    {bar("100%", 16)}
                    {bar("80%", 16)}
                </View>
                {bar(120, 12)}
                <View className="w-full aspect-video bg-surface-secondary rounded-lg" />
            </View>
            <View className="flex-1" />
            <View className="h-12 border-t border-border" />
        </View>
    );
}

export function ArticleReader({
    article,
    related,
    saved,
    onToggleSave,
}: {
    article: ArticleDetail;
    related: ArticleCard[];
    saved: boolean;
    onToggleSave: () => void;
}) {
    const insets = useSafeAreaInsets();
    const { language, setLanguage, toggleLanguage } = useLanguage();
    const isNe = language === "ne";
    const scale = useAppStore(state => state.readerScale);
    const setReaderScale = useAppStore(state => state.setReaderScale);
    const leading = "regular"; // default leading
    const [progress, setProgress] = useState(0);
    const [sizesOpen, setSizesOpen] = useState(false);

    const title = field(article.title, language);
    const excerpt = field(article.excerpt, language);
    const body = field(article.content, language);
    const nepaliMissing = language === "ne" && (!article.title.ne.trim() || !article.content.ne.trim());
    const author = pick(article.author, language).trim();
    const date = publishedLabel(article.publishedAt, language);
    const minutes = body ? readingMinutes(body) : 0;
    const readLabel = minutes > 0 ? (language === "ne" ? `${minutes} मिनेट पढाइ` : `${minutes} min read`) : "";
    
    // For kicker, split up category if possible, else use it
    const kicker = article.source === "column"
        ? "OPINION & ANALYSIS"
        : pick(article.category, language).toUpperCase();
        
    const subKicker = article.source === "analysis" ? "SPECIAL REPORT" : "DISPATCH";

    const share = () => {
        const url = articleWebUrl(article);
        const headline = title || article.title.en;
        Share.share(
            Platform.OS === "ios"
                ? { message: headline, url }
                : { message: `${headline}\n${url}` }
        ).catch(() => undefined);
    };

    return (
        <View className="flex-1 bg-background relative">
            {/* Progress Bar */}
            <View className="h-0.5 bg-border z-10 w-full">
                <View className="h-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
            </View>

            {/* Editorial Top Toolbar */}
            <View className="flex-row justify-between items-center px-5 pt-3 pb-2 bg-background z-10">
                <View className="flex-row items-center gap-1.5">
                    <Text className="text-primary font-bold text-xs tracking-widest uppercase">{kicker}</Text>
                    <Text className="text-muted-foreground">•</Text>
                    <Text className="text-muted-foreground font-semibold text-[10px] tracking-widest uppercase">{subKicker}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => setSizesOpen(!sizesOpen)} className={`px-2 py-1 rounded ${sizesOpen ? 'bg-foreground' : 'bg-surface-secondary'}`}>
                        <Text className={`font-bold text-[13px] ${sizesOpen ? 'text-background' : 'text-foreground'}`}>AA</Text>
                    </Pressable>
                    <Pressable onPress={toggleLanguage} className="px-2 py-1 rounded bg-surface-secondary">
                        <Text className="text-primary font-bold text-[13px]">{language === "en" ? "नेपाली" : "English"}</Text>
                    </Pressable>
                </View>
            </View>

            {sizesOpen ? (
                <View className="border-b border-border p-2">
                    <View className="flex-row">
                        {SIZES.map((option) => {
                            const active = scale === option.id;
                            return (
                                <Pressable
                                    key={option.id}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    onPress={() => {
                                        setReaderScale(option.id);
                                        setSizesOpen(false);
                                    }}
                                    className="flex-1 min-h-[48px] items-center justify-center"
                                >
                                    <Text className={`text-center ${active ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>
                                        {pick(option.label, language)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            ) : null}

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
                scrollEventThrottle={16}
                onScroll={(event) => {
                    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                    const max = Math.max(1, contentSize.height - layoutMeasurement.height);
                    setProgress(Math.min(1, Math.max(0, contentOffset.y / max)));
                }}
            >
                {/* Headline */}
                {title ? (
                    <Text
                        accessibilityRole="header"
                        className={`text-foreground tracking-tight mb-3 ${isNe ? 'font-hind-bold text-[28px] leading-9' : 'font-serif-bold text-[34px] leading-10'}`}
                    >
                        {title}
                    </Text>
                ) : null}

                {/* Standfirst */}
                {excerpt && !nepaliMissing ? (
                    <Text className="text-muted-foreground text-[15px] leading-[24px] mb-5 font-medium">
                        {excerpt}
                    </Text>
                ) : null}

                {/* Byline & Metadata Block */}
                <View className="bg-surface-secondary p-3 rounded-lg mb-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2.5 flex-1">
                            <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
                                <Text className="text-primary-foreground font-bold">{author.slice(0, 2).toUpperCase() || "TL"}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-foreground font-bold text-[13px]">{language === "ne" ? author : `By ${author || "The Leaders"}`}</Text>
                                <Text className="text-muted-foreground text-[11px] font-medium" numberOfLines={1}>Chief Correspondent</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-1 bg-background px-2 py-1 rounded">
                            <Text className="text-foreground font-bold text-[10px] tracking-wider uppercase">Peer Reviewed</Text>
                        </View>
                    </View>
                    
                    <View className="flex-row items-center flex-wrap gap-1.5">
                        <Text className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">{date}</Text>
                        <Text className="text-border">•</Text>
                        <Text className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">{readLabel}</Text>
                    </View>

                    <View className="bg-background p-2 rounded mt-3 flex-row items-center gap-2">
                        <Text className="text-muted-foreground text-[10px] flex-1 font-medium leading-4">
                            Reviewed by Editorial Board. Complies with the Press Council code.
                        </Text>
                    </View>
                </View>

                {/* Hero Image */}
                <View className="mb-6">
                    {article.image ? (
                        <View>
                            <Image
                                source={{ uri: article.image }}
                                recyclingKey={article.slug}
                                contentFit="cover"
                                className="w-full aspect-video bg-border rounded-lg"
                                accessibilityLabel={title || article.title.en}
                            />
                            <View className="mt-2 flex-row justify-between">
                                <Text className="text-muted-foreground text-[11px] flex-1 font-medium leading-4">
                                    {title}
                                </Text>
                                <Text className="text-border text-[10px] ml-3 uppercase tracking-wider font-bold">
                                    Photo: The Leaders
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View className="w-full aspect-video bg-border rounded-lg" />
                    )}
                </View>

                {/* Bilingual Prompt */}
                {!nepaliMissing ? (
                    <View className="bg-surface-secondary p-3 rounded-lg mb-6 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                            <LucideLanguages size={20} className="text-primary" />
                            <View>
                                <Text className="text-foreground font-bold text-sm">
                                    {language === "ne" ? "Read in English" : "नेपालीमा पनि पढ्नुहोस्"}
                                </Text>
                                <Text className="text-muted-foreground text-[11px] mt-0.5">
                                    {language === "ne" ? "This article is available in English" : "यो लेख नेपाली भाषामा उपलब्ध छ"}
                                </Text>
                            </View>
                        </View>
                        <Pressable onPress={toggleLanguage} className="bg-primary px-3 py-2 rounded">
                            <Text className="text-primary-foreground font-bold text-[10px] uppercase tracking-widest">
                                {language === "ne" ? "Switch" : "स्विच गर्नुहोस्"}
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View className="my-6 gap-4">
                        <Text className="text-foreground text-base">
                            {pick(ui.nepaliUnavailable, language)}
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => setLanguage("en")}
                            className="min-h-[48px] justify-center"
                        >
                            <Text className="text-primary font-bold text-base">
                                {pick(ui.viewEnglish, language)}
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* Article Body */}
                {!nepaliMissing && body ? (
                    <MarkdownBody source={body} scale={scale} leading={leading} editorial />
                ) : null}

                {/* Tags */}
                {article.tags.length > 0 ? (
                    <View className="flex-row flex-wrap gap-2 mt-8">
                        {article.tags.map(tag => (
                            <View key={tag} className="bg-surface-secondary px-3 py-1.5 rounded-full">
                                <Text className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">#{tag}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Author Bio Card */}
                {author ? (
                    <View className="bg-surface-secondary p-4 rounded-lg mt-6 flex-row items-center gap-3">
                        <View className="w-12 h-12 rounded-full bg-border overflow-hidden">
                            <Image
                                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=random` }}
                                className="w-full h-full"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground font-bold text-[15px]">{author}</Text>
                            <Text className="text-muted-foreground text-xs mt-1 leading-5" numberOfLines={2}>
                                Senior Editor covering {pick(article.category, language).toLowerCase()} and related affairs for The Leaders.
                            </Text>
                        </View>
                    </View>
                ) : null}

                {/* Related Articles */}
                {related.length > 0 ? (
                    <View className="mt-10">
                        <Text className="text-muted-foreground font-bold text-[11px] uppercase tracking-widest mb-4">
                            {pick(ui.related, language)}
                        </Text>
                        {related.map((item) => (
                            <Pressable
                                key={item.slug}
                                accessibilityRole="button"
                                onPress={() => router.push(`/article/${item.slug}` as never)}
                                className="py-4 border-t border-border active:opacity-70"
                            >
                                <Text
                                    className={`text-foreground tracking-tight mb-1 ${isNe ? 'font-hind-semibold text-lg leading-7' : 'font-serif-bold text-xl leading-7'}`}
                                >
                                    {pick(item.title, language)}
                                </Text>
                                <Text className="text-primary text-[11px] font-bold tracking-widest uppercase">
                                    {pick(item.category, language)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                ) : null}
            </ScrollView>

            {/* Sticky Bottom Toolbar */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border flex-row justify-between items-center px-5 py-3 shadow-sm"
                style={{ paddingBottom: Math.max(12, insets.bottom) }}
            >
                <Button variant="secondary" className="rounded-full gap-2 px-4 h-11">
                    <LucidePlayCircle size={18} className="text-primary" />
                    <Text className="text-foreground font-bold text-xs uppercase tracking-widest">Listen (1.0x)</Text>
                </Button>

                <View className="flex-row items-center gap-2">
                    <Button variant="ghost" size="icon" onPress={onToggleSave} className="rounded-full w-11 h-11">
                        <LucideBookmark size={22} className={saved ? 'text-primary' : 'text-muted-foreground'} fill={saved ? 'currentColor' : "transparent"} />
                    </Button>
                    <Button variant="ghost" size="icon" onPress={share} className="rounded-full w-11 h-11">
                        <LucideShare size={22} className="text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="relative rounded-full w-11 h-11">
                        <LucideMessageCircle size={22} className="text-muted-foreground" />
                        <View className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                    </Button>
                </View>
            </View>
        </View>
    );
}
