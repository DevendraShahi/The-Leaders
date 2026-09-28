import { Text, View, Pressable, type TextStyle } from "react-native";
import { Image } from "expo-image";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";
import type { ReaderLeading, ReaderScale } from "@/storage/prefs";

const BODY_SIZE: Record<ReaderScale, number> = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
};

function htmlToMarkdown(html: string) {
    let md = html;
    // Convert common block elements to double newlines
    md = md.replace(/<p[^>]*>/gi, "\n\n");
    md = md.replace(/<\/p>/gi, "\n\n");
    md = md.replace(/<br\s*\/?>/gi, "\n");
    
    // Convert headings
    md = md.replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (match, level, content) => {
        return "\n\n" + "#".repeat(Number(level)) + " " + content + "\n\n";
    });

    // Convert formatting
    md = md.replace(/<strong[^>]*>/gi, "**");
    md = md.replace(/<\/strong>/gi, "**");
    md = md.replace(/<b[^>]*>/gi, "**");
    md = md.replace(/<\/b>/gi, "**");
    md = md.replace(/<em[^>]*>/gi, "*");
    md = md.replace(/<\/em>/gi, "*");
    md = md.replace(/<i[^>]*>/gi, "*");
    md = md.replace(/<\/i>/gi, "*");

    // Convert images and links
    md = md.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, "\n\n![image]($1)\n\n");
    md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");

    // Strip any remaining html tags safely
    md = md.replace(/<[^>]+>/g, "");

    // Decode HTML entities
    md = md.replace(/&nbsp;/g, " ");
    md = md.replace(/&amp;/g, "&");
    md = md.replace(/&lt;/g, "<");
    md = md.replace(/&gt;/g, ">");
    md = md.replace(/&quot;/g, '"');
    md = md.replace(/&#39;/g, "'");

    // Clean up multiple newlines
    md = md.replace(/\n{3,}/g, "\n\n");
    return md.trim();
}

function inlineText(value: string) {
    return value.replace(/\*\*(.*?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

type InlinePart = { text: string; strong: boolean };

function tokenize(value: string): InlinePart[] {
    const parts: InlinePart[] = [];
    const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\([^)]+\)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value))) {
        if (match.index > last) {
            parts.push({ text: value.slice(last, match.index), strong: false });
        }
        parts.push({
            text: match[1] || match[2] || match[3] || match[4] || "",
            strong: Boolean(match[1]),
        });
        last = match.index + match[0].length;
    }
    if (last < value.length) parts.push({ text: value.slice(last), strong: false });
    return parts.length > 0 ? parts : [{ text: value, strong: false }];
}

function EditorialText({
    text,
    style,
    strongFamily,
}: {
    text: string;
    style: TextStyle;
    strongFamily: string;
}) {
    return (
        <Text style={style}>
            {tokenize(text).map((part, index) => (
                <Text key={index} style={part.strong ? { fontFamily: strongFamily } : undefined}>
                    {part.text}
                </Text>
            ))}
        </Text>
    );
}

function isQuote(block: string) {
    return block.split("\n").every((line) => /^>\s?/.test(line.trim()));
}

function quoteText(block: string) {
    return block
        .split("\n")
        .map((line) => line.trim().replace(/^>\s?/, ""))
        .join(" ")
        .trim();
}

function isList(block: string) {
    return block.split("\n").every((line) => /^([-*]|\d+[.)])\s+/.test(line.trim()));
}

export function MarkdownBody({
    source,
    scale,
    leading,
    editorial = false,
}: {
    source: string;
    scale: ReaderScale;
    leading: ReaderLeading;
    editorial?: boolean;
}) {
    const colors = useColors();
    const { language } = useLanguage();
    const size = BODY_SIZE[scale];
    const multiplier = editorial
        ? language === "ne" ? 1.68 : 1.62
        : leading === "compact" ? 1.5 : leading === "loose" ? 1.75 : language === "ne" ? 1.65 : 1.55;
    const lineHeight = Math.round(size * multiplier);
    
    // Check if the user is using the app's serif setting
    const useSerif = true; // In the future, we can plug `bodyTypeface` here if passed as a prop
    
    const fontFamily = language === "ne" ? "Hind_400Regular" : "Merriweather_400Regular";
    const strongFamily = language === "ne" ? "Hind_600SemiBold" : "Merriweather_700Bold";
    const headingFamily = editorial ? strongFamily : language === "ne" ? "Hind_600SemiBold" : "BebasNeue_400Regular";
    
    // Process HTML to Markdown
    const markdownSource = htmlToMarkdown(source);
    const blocks = markdownSource.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    const bodyStyle: TextStyle = { color: colors.textPrimary, fontFamily, fontSize: size, lineHeight };

    return (
        <View style={{ gap: editorial ? 20 : 14 }}>
            {blocks.map((block, index) => {
                // Check for Image
                const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(block);
                if (imageMatch) {
                    const [, alt, url] = imageMatch;
                    return (
                        <View key={`${index}-img`} style={{ marginVertical: 10 }}>
                            <Image
                                source={{ uri: url }}
                                style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 8, backgroundColor: colors.border }}
                                contentFit="cover"
                            />
                            {alt && alt !== "image" ? (
                                <AppText variant="meta" style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8, fontStyle: "italic", textAlign: "center" }}>
                                    {alt}
                                </AppText>
                            ) : null}
                        </View>
                    );
                }

                // Check for Heading
                const heading = /^(#{1,3})\s+(.*)$/.exec(block);
                if (heading) {
                    const level = heading[1].length;
                    const headingSize = level === 1 ? size + 8 : level === 2 ? size + 4 : size + 2;
                    const headingStyle: TextStyle = {
                        color: colors.textPrimary,
                        fontSize: headingSize,
                        lineHeight: Math.round(headingSize * (language === "ne" ? 1.5 : 1.28)),
                        fontFamily: headingFamily,
                    };
                    if (editorial) {
                        return (
                            <EditorialText
                                key={`${index}-h`}
                                text={heading[2]}
                                style={headingStyle}
                                strongFamily={strongFamily}
                            />
                        );
                    }
                    return (
                        <AppText key={`${index}-h`} style={headingStyle}>
                            {inlineText(heading[2])}
                        </AppText>
                    );
                }

                // Check for Blockquote
                if (editorial && isQuote(block)) {
                    return (
                        <View
                            key={`${index}-q`}
                            style={{
                                borderLeftWidth: 2,
                                borderLeftColor: colors.brandRed,
                                paddingLeft: 16,
                            }}
                        >
                            <EditorialText
                                text={quoteText(block)}
                                style={{ ...bodyStyle, color: colors.textSecondary }}
                                strongFamily={strongFamily}
                            />
                        </View>
                    );
                }

                // Check for List
                if (isList(block)) {
                    return (
                        <View key={`${index}-l`} style={{ gap: 8 }}>
                            {block.split("\n").map((line, lineIndex) => {
                                const item = line.trim().replace(/^([-*]|\d+[.)])\s+/, "");
                                if (editorial) {
                                    return (
                                        <EditorialText
                                            key={lineIndex}
                                            text={`• ${item}`}
                                            style={bodyStyle}
                                            strongFamily={strongFamily}
                                        />
                                    );
                                }
                                return (
                                    <AppText key={lineIndex} style={bodyStyle}>
                                        {`• ${inlineText(item)}`}
                                    </AppText>
                                );
                            })}
                        </View>
                    );
                }

                // Standard Paragraph
                if (editorial) {
                    return (
                        <EditorialText
                            key={`${index}-p`}
                            text={block.replace(/\n/g, " ")}
                            style={bodyStyle}
                            strongFamily={strongFamily}
                        />
                    );
                }

                return (
                    <AppText key={`${index}-p`} style={bodyStyle}>
                        {inlineText(block.replace(/\n/g, " "))}
                    </AppText>
                );
            })}
        </View>
    );
}
