export type TemplateKey = 'breaking' | 'explainer' | 'quote';
export type FormatKey = 'square' | 'portrait' | 'landscape';

export type NewsPostDesign = {
    template: TemplateKey;
    format: FormatKey;
    category: string;
    eyebrow: string;
    headline: string;
    summary: string;
    author: string;
    date: string;
    imageUrl: string;
    accent: string;
};

export const postGraphicDimensions: Record<FormatKey, readonly [number, number]> = {
    square: [1080, 1080],
    portrait: [1080, 1350],
    landscape: [1200, 750],
};

type DrawOptions = {
    design: NewsPostDesign;
    imageUrl: string;
    showSummary: boolean;
    shouldCommit?: () => boolean;
};

export type NewsPostGraphicRenderResult = {
    canExport: boolean;
    issue?: string;
};

type TextBlock = {
    fontSize: number;
    lineHeight: number;
    lines: string[];
    y: number;
};

type TextLayout = {
    canFit: boolean;
    issue?: string;
    kickerY: number;
    headline?: TextBlock;
    summary?: TextBlock;
    footerRuleY: number;
    footerY: number;
};

function canvasFont(weight: number, size: number, variable: string, fallback: string): string {
    const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
    return `${weight} ${size}px ${family}`;
}

function loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('The selected image could not be used in the graphic.'));
        image.src = source;
    });
}

function drawCover(context: CanvasRenderingContext2D, image: CanvasImageSource, sourceWidth: number, sourceHeight: number, width: number, height: number) {
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export function wrapPostGraphicText(
    text: string,
    maxWidth: number,
    measureWidth: (value: string) => number,
): string[] {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';

    const addLongWord = (word: string) => {
        let fragment = '';
        for (const glyph of Array.from(word)) {
            const candidate = `${fragment}${glyph}`;
            if (fragment && measureWidth(candidate) > maxWidth) {
                lines.push(fragment);
                fragment = glyph;
            } else {
                fragment = candidate;
            }
        }
        if (fragment) lines.push(fragment);
    };

    for (const word of words) {
        if (measureWidth(word) > maxWidth) {
            if (line) lines.push(line);
            line = '';
            addLongWord(word);
            continue;
        }

        const candidate = line ? `${line} ${word}` : word;
        if (line && measureWidth(candidate) > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = candidate;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function measureWithLetterSpacing(context: CanvasRenderingContext2D, value: string, letterSpacing = 0): number {
    return context.measureText(value).width + Math.max(0, Array.from(value).length - 1) * letterSpacing;
}

function drawTextLines(
    context: CanvasRenderingContext2D,
    lines: string[],
    x: number,
    y: number,
    lineHeight: number,
): number {
    for (const item of lines) {
        context.fillText(item, x, y);
        y += lineHeight;
    }
    return y;
}

function createTextLayout(context: CanvasRenderingContext2D, design: NewsPostDesign, showSummary: boolean, width: number, height: number, inset: number): TextLayout {
    const footerY = height - inset;
    const footerRuleY = footerY - Math.round(width * 0.04);
    const contentTop = Math.round(height * (design.format === 'landscape' ? 0.37 : 0.43));
    const contentBottom = footerRuleY - Math.round(width * 0.065);
    const kickerY = contentTop;
    const headlineY = kickerY + Math.round(width * 0.043);
    const maxWidth = width - inset * 2;
    const headlineMax = Math.round(width * (design.format === 'portrait' ? 0.071 : design.format === 'landscape' ? 0.058 : 0.066));
    const headlineMin = Math.round(width * 0.042);
    const summaryMax = Math.round(width * 0.021);
    const summaryMin = Math.round(width * 0.016);
    const summaryText = showSummary ? design.summary.trim() : '';

    for (let headlineSize = headlineMax; headlineSize >= headlineMin; headlineSize -= 1) {
        const headlineLineHeight = Math.round(headlineSize * 1.04);
        context.font = canvasFont(600, headlineSize, '--font-lora', 'serif');
        const headline = wrapPostGraphicText(
            design.headline.trim() || 'Your headline belongs here.',
            maxWidth,
            (value) => measureWithLetterSpacing(context, value),
        );

        if (headline.some((line) => measureWithLetterSpacing(context, line) > maxWidth)) continue;
        const headlineEnd = headlineY + headline.length * headlineLineHeight + Math.round(headlineSize * 0.22);

        if (!summaryText) {
            if (headlineEnd <= contentBottom) {
                return {
                    canFit: true,
                    kickerY,
                    headline: { fontSize: headlineSize, lineHeight: headlineLineHeight, lines: headline, y: headlineY },
                    footerRuleY,
                    footerY,
                };
            }
            continue;
        }

        for (let summarySize = summaryMax; summarySize >= summaryMin; summarySize -= 1) {
            const summaryLineHeight = Math.round(summarySize * 1.42);
            context.font = canvasFont(500, summarySize, '--font-manrope', 'sans-serif');
            const summary = wrapPostGraphicText(summaryText, maxWidth, (value) => measureWithLetterSpacing(context, value));
            if (summary.some((line) => measureWithLetterSpacing(context, line) > maxWidth)) continue;

            const summaryY = headlineY + headline.length * headlineLineHeight + Math.round(width * 0.017);
            const summaryEnd = summaryY + summary.length * summaryLineHeight + Math.round(summarySize * 0.28);
            if (summaryEnd <= contentBottom) {
                return {
                    canFit: true,
                    kickerY,
                    headline: { fontSize: headlineSize, lineHeight: headlineLineHeight, lines: headline, y: headlineY },
                    summary: { fontSize: summarySize, lineHeight: summaryLineHeight, lines: summary, y: summaryY },
                    footerRuleY,
                    footerY,
                };
            }
        }
    }

    return {
        canFit: false,
        issue: `This copy does not fit the ${design.format} card within approved type sizes. Shorten the headline or takeaway, or choose a taller format.`,
        kickerY,
        footerRuleY,
        footerY,
    };
}

function drawPreflightIssue(context: CanvasRenderingContext2D, width: number, height: number, inset: number) {
    const panelTop = Math.round(height * 0.44);
    context.fillStyle = 'rgba(13,13,13,0.82)';
    context.fillRect(inset, panelTop, width - inset * 2, Math.round(width * 0.19));
    context.strokeStyle = 'rgba(255,255,255,0.38)';
    context.lineWidth = Math.max(1, Math.round(width * 0.001));
    context.strokeRect(inset, panelTop, width - inset * 2, Math.round(width * 0.19));
    context.font = canvasFont(700, Math.round(width * 0.018), '--font-manrope', 'sans-serif');
    context.fillStyle = '#ffffff';
    context.fillText('COPY NEEDS SHORTENING', inset + Math.round(width * 0.027), panelTop + Math.round(width * 0.065));
    context.font = canvasFont(500, Math.round(width * 0.015), '--font-manrope', 'sans-serif');
    context.fillStyle = 'rgba(255,255,255,0.78)';
    context.fillText('Export is paused until every word fits above the footer.', inset + Math.round(width * 0.027), panelTop + Math.round(width * 0.11));
}

export async function drawNewsPostGraphic(canvas: HTMLCanvasElement, { design, imageUrl, showSummary, shouldCommit }: DrawOptions): Promise<NewsPostGraphicRenderResult> {
    const [width, height] = postGraphicDimensions[design.format];

    if (document.fonts) await document.fonts.ready;

    let image: HTMLImageElement | null = null;
    if (imageUrl) {
        try {
            image = await loadImage(imageUrl);
        } catch {
            // The artboard intentionally retains its branded background when a remote image blocks canvas use.
        }
    }

    if (shouldCommit && !shouldCommit()) return { canExport: false };

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser cannot render this graphic.');

    const inset = Math.round(width * 0.073);
    const topInset = Math.round(width * 0.052);
    const layout = createTextLayout(context, design, showSummary, width, height, inset);

    context.fillStyle = '#0d0d0d';
    context.fillRect(0, 0, width, height);

    if (image) {
        drawCover(context, image, image.naturalWidth, image.naturalHeight, width, height);
    }

    const ink = context.createLinearGradient(0, 0, 0, height);
    ink.addColorStop(0, 'rgba(8, 8, 8, 0.12)');
    ink.addColorStop(0.46, 'rgba(8, 8, 8, 0.36)');
    ink.addColorStop(1, 'rgba(8, 8, 8, 0.96)');
    context.fillStyle = ink;
    context.fillRect(0, 0, width, height);

    const redGlow = context.createRadialGradient(width * 0.92, height * 0.04, 0, width * 0.92, height * 0.04, width * 0.75);
    redGlow.addColorStop(0, `${design.accent}aa`);
    redGlow.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = redGlow;
    context.fillRect(0, 0, width, height);

    context.fillStyle = design.accent;
    context.fillRect(0, 0, width, Math.max(10, Math.round(width * 0.011)));

    context.font = canvasFont(700, Math.round(width * 0.021), '--font-manrope', 'sans-serif');
    context.fillStyle = '#ffffff';
    context.letterSpacing = `${Math.round(width * 0.002)}px`;
    context.fillText('THE LEADERS', inset, topInset + Math.round(width * 0.018));

    context.textAlign = 'right';
    context.font = canvasFont(700, Math.round(width * 0.016), '--font-manrope', 'sans-serif');
    context.fillStyle = 'rgba(255,255,255,0.83)';
    context.fillText((design.category || 'NEWS').toUpperCase(), width - inset, topInset + Math.round(width * 0.017));
    context.textAlign = 'left';
    context.letterSpacing = '0px';

    if (!layout.canFit || !layout.headline) {
        drawPreflightIssue(context, width, height, inset);
        return { canExport: false, issue: layout.issue };
    }

    context.font = canvasFont(700, Math.round(width * 0.017), '--font-manrope', 'sans-serif');
    context.fillStyle = 'rgba(255,255,255,0.76)';
    context.letterSpacing = `${Math.round(width * 0.0016)}px`;
    context.fillText((design.eyebrow || 'THE LEADERS').toUpperCase(), inset, layout.kickerY);

    context.font = canvasFont(600, layout.headline.fontSize, '--font-lora', 'serif');
    context.fillStyle = '#ffffff';
    context.letterSpacing = `${Math.round(-width * 0.0005)}px`;
    drawTextLines(
        context,
        layout.headline.lines,
        inset,
        layout.headline.y,
        layout.headline.lineHeight,
    );

    if (layout.summary) {
        context.font = canvasFont(500, layout.summary.fontSize, '--font-manrope', 'sans-serif');
        context.fillStyle = 'rgba(255,255,255,0.84)';
        context.letterSpacing = '0px';
        drawTextLines(context, layout.summary.lines, inset, layout.summary.y, layout.summary.lineHeight);
    }

    context.strokeStyle = 'rgba(255,255,255,0.34)';
    context.lineWidth = Math.max(1, Math.round(width * 0.001));
    context.beginPath();
    context.moveTo(inset, layout.footerRuleY);
    context.lineTo(width - inset, layout.footerRuleY);
    context.stroke();

    context.font = canvasFont(700, Math.round(width * 0.015), '--font-manrope', 'sans-serif');
    context.fillStyle = 'rgba(255,255,255,0.78)';
    context.letterSpacing = `${Math.round(width * 0.0014)}px`;
    context.fillText((design.author || 'THE LEADERS DESK').toUpperCase(), inset, layout.footerY);
    context.textAlign = 'right';
    context.fillText((design.date || 'TODAY').toUpperCase(), width - inset, layout.footerY);
    context.textAlign = 'left';
    context.letterSpacing = '0px';
    return { canExport: true };
}
