"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type BilingualContent = {
    en?: string | null;
    ne?: string | null;
} | string | null;

interface MarkdownContentProps {
    content: BilingualContent;
    className?: string;
    showLanguageAlert?: boolean;
}

function hasRealMarkdown(text: string): boolean {
    if (!text || text.length < 5) return false;
    
    const patterns = [
        /^#{1,6}\s/m,                    // Headers (#, ##, ###)
        /\*\*.+\*\*/,                      // Bold (**text**)
        /\*.+\*/,                          // Italic (*text*)
        /\[.+\]\(.+\)/,                    // Links [text](url)
        /^[-*+]\s/m,                      // Unordered lists (-, *, +)
        /^\d+\.\s/m,                      // Ordered lists (1., 2.)
        /^>\s/m,                          // Blockquotes (>)
        /`[^`]+`/,                        // Inline code
        /^---+$/m,                        // Horizontal rules (---)
        /\*\*\*+/m,                       // Horizontal rules (***)
    ];
    
    const matchCount = patterns.filter(pattern => pattern.test(text)).length;
    
    return matchCount >= 1;
}

export function MarkdownContent({ content, className, showLanguageAlert = true }: MarkdownContentProps) {
    const { language } = useLanguage();

    const getContent = () => {
        if (!content) return null;

        if (typeof content === "string") {
            return { text: content.trim(), isMissing: false, availableLang: "both" as const };
        }

        const enContent = content.en?.trim() || "";
        const neContent = content.ne?.trim() || "";
        const currentLang = language === "ne" ? "ne" : "en";
        const currentLangLabel = language === "ne" ? "Nepali" : "English";
        const altLangLabel = language === "ne" ? "English" : "Nepali";

        const currentContent = currentLang === "ne" ? neContent : enContent;
        const altContent = currentLang === "ne" ? enContent : neContent;

        const hasEn = !!enContent;
        const hasNe = !!neContent;
        
        if (currentContent) {
            return {
                text: currentContent,
                isMissing: false,
                availableLang: (!hasEn && !hasNe) ? "none" as const : 
                              (hasEn && hasNe) ? "both" as const : 
                              (hasEn ? "en" as const : "ne" as const),
                hasAltLang: !!altContent
            };
        }

        if (altContent) {
            return {
                text: altContent,
                isMissing: true,
                missingLang: currentLangLabel,
                availableLang: (!hasEn && !hasNe) ? "none" as const : 
                              (hasEn && hasNe) ? "both" as const : 
                              (hasEn ? "en" as const : "ne" as const),
            };
        }

        return null;
    };

    const result = getContent();

    if (!result) {
        return (
            <p className={cn("leader-body text-muted-foreground italic", className)}>
                No content available.
            </p>
        );
    }

    const { text, isMissing, missingLang } = result;
    const isMarkdown = hasRealMarkdown(text);

    return (
        <div className={cn("relative", className)}>
            {showLanguageAlert && isMissing && missingLang && (
                <div className="mb-6 flex items-center gap-2.5 rounded-sm border border-amber-500/40 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>
                        This content is available in {missingLang} only.
                    </span>
                </div>
            )}

            {isMarkdown ? (
                <div className="leader-prose">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ children }) => <h1 className="leader-h1">{children}</h1>,
                            h2: ({ children }) => <h2 className="leader-h2">{children}</h2>,
                            h3: ({ children }) => <h3 className="leader-h3">{children}</h3>,
                            h4: ({ children }) => <h4 className="leader-h4">{children}</h4>,
                            p: ({ children }) => <p className="leader-p">{children}</p>,
                            ul: ({ children }) => <ul className="leader-ul">{children}</ul>,
                            ol: ({ children }) => <ol className="leader-ol">{children}</ol>,
                            li: ({ children }) => <li className="leader-li">{children}</li>,
                            blockquote: ({ children }) => <blockquote className="leader-blockquote">{children}</blockquote>,
                            a: ({ href, children }) => <a href={href} className="leader-link" target="_blank" rel="noopener noreferrer">{children}</a>,
                            code: ({ className, children }) => <code className={cn("leader-code", className)}>{children}</code>,
                            pre: ({ children }) => <pre className="leader-pre">{children}</pre>,
                            strong: ({ children }) => <strong className="leader-strong">{children}</strong>,
                            em: ({ children }) => <em className="leader-em">{children}</em>,
                            hr: () => <hr className="leader-hr" />,
                        }}
                    >
                        {text}
                    </ReactMarkdown>
                </div>
            ) : (
                <p className="leader-body whitespace-pre-line">
                    {text}
                </p>
            )}
        </div>
    );
}

interface SimpleMarkdownProps {
    content: string;
    className?: string;
}

export function SimpleMarkdown({ content, className }: SimpleMarkdownProps) {
    if (!content) return null;

    const isMarkdown = hasRealMarkdown(content);

    if (isMarkdown) {
        return (
            <div className={cn("leader-prose", className)}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        );
    }

    return (
        <p className={cn("leader-body whitespace-pre-line", className)}>
            {content}
        </p>
    );
}
