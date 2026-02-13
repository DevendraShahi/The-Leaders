"use client";

import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
    content?: string;
    className?: string;
}

const HTML_TAG_REGEX = /<([a-z][\w-]*)\b[^>]*>/i;

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function sanitizeUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return "#";
    if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:") {
            return parsed.toString();
        }
    } catch {
        return "#";
    }

    return "#";
}

function parseInline(text: string): string {
    const codeTokens: string[] = [];
    let output = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
        const token = `__INLINE_CODE_${codeTokens.length}__`;
        codeTokens.push(`<code>${escapeHtml(code)}</code>`);
        return token;
    });

    output = output
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
            const safeHref = sanitizeUrl(url);
            return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        })
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/__([^_]+)__/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/_([^_]+)_/g, "<em>$1</em>")
        .replace(/~~([^~]+)~~/g, "<s>$1</s>");

    codeTokens.forEach((tokenHtml, i) => {
        output = output.replaceAll(`__INLINE_CODE_${i}__`, tokenHtml);
    });

    return output;
}

function markdownToHtml(markdown: string): string {
    const normalized = markdown.replace(/\r\n/g, "\n").trim();
    if (!normalized) return "";

    const blockCode: string[] = [];
    const content = normalized.replace(/```([\s\S]*?)```/g, (_, code) => {
        const token = `__BLOCK_CODE_${blockCode.length}__`;
        blockCode.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
        return token;
    });

    const blocks = content.split(/\n{2,}/);

    const rendered = blocks.map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";

        if (trimmed.startsWith("__BLOCK_CODE_")) return trimmed;

        if (/^#{1,6}\s/.test(trimmed)) {
            const match = trimmed.match(/^(#{1,6})\s+([\s\S]+)$/);
            if (!match) return `<p>${parseInline(trimmed)}</p>`;
            const level = Math.min(match[1].length, 6);
            return `<h${level}>${parseInline(match[2].trim())}</h${level}>`;
        }

        if (trimmed.startsWith(">")) {
            const lines = trimmed
                .split("\n")
                .map((line) => line.replace(/^>\s?/, "").trim())
                .filter(Boolean);
            return `<blockquote>${lines.map(parseInline).join("<br />")}</blockquote>`;
        }

        const unordered = trimmed.split("\n");
        if (unordered.every((line) => /^[-*+]\s+/.test(line.trim()))) {
            const items = unordered
                .map((line) => line.trim().replace(/^[-*+]\s+/, ""))
                .map((line) => `<li>${parseInline(line)}</li>`)
                .join("");
            return `<ul>${items}</ul>`;
        }

        const ordered = trimmed.split("\n");
        if (ordered.every((line) => /^\d+\.\s+/.test(line.trim()))) {
            const items = ordered
                .map((line) => line.trim().replace(/^\d+\.\s+/, ""))
                .map((line) => `<li>${parseInline(line)}</li>`)
                .join("");
            return `<ol>${items}</ol>`;
        }

        return `<p>${trimmed.split("\n").map(parseInline).join("<br />")}</p>`;
    });

    let html = rendered.join("\n");
    blockCode.forEach((codeHtml, index) => {
        html = html.replaceAll(`__BLOCK_CODE_${index}__`, codeHtml);
    });

    return html;
}

function renderPreviewHtml(content: string): string {
    if (!content) return "";
    if (HTML_TAG_REGEX.test(content)) return content;
    return markdownToHtml(content);
}

export function MarkdownPreview({ content = "", className }: MarkdownPreviewProps) {
    const html = renderPreviewHtml(content);

    return (
        <div
            className={cn(
                "article-content prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bebas prose-headings:uppercase prose-headings:tracking-wide prose-p:text-foreground/90 prose-li:text-foreground/90 prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-primary/60",
                className
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
