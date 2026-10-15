import { layout, spacing } from "@/theme/tokens";
import { postExportReferenceWidth, postOutputDimensions, type PostFormat } from "./types";

export function fitPostCanvas(stageWidth: number, stageHeight: number, format: PostFormat) {
    const [outputWidth, outputHeight] = postOutputDimensions[format];
    const referenceHeight = postExportReferenceWidth * outputHeight / outputWidth;
    const availableWidth = Math.max(1, stageWidth - spacing["2xl"]);
    const availableHeight = Math.max(1, stageHeight - spacing["4xl"] - spacing.lg);
    const canvasScale = Math.min(availableWidth / postExportReferenceWidth, availableHeight / referenceHeight, layout.editorPreviewMaxScale);
    return { referenceHeight, canvasScale, cardWidth: postExportReferenceWidth * canvasScale, cardHeight: referenceHeight * canvasScale };
}
