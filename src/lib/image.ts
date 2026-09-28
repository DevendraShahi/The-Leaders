import sharp from "sharp";

type OptimizationResult = {
    buffer: Buffer;
    mimeType?: string;
    format?: string;
    width?: number;
    height?: number;
    optimized: boolean;
};

const MAX_EDGE = 4096;
const MIN_OPTIMIZE_BYTES = 1024 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
const MIME_BY_FORMAT: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

export async function optimizeImageForUpload(buffer: Buffer, mimeType?: string): Promise<OptimizationResult> {
    const image = sharp(buffer, { failOnError: true }).rotate();
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const format = metadata.format;

    if (!format || !ALLOWED_FORMATS.has(format) || width < 1 || height < 1) {
        throw new Error("Unsupported or invalid image");
    }

    const detectedMimeType = MIME_BY_FORMAT[format];
    if (mimeType && mimeType !== detectedMimeType && !(format === "jpeg" && mimeType === "image/jpg")) {
        throw new Error("Image content does not match its declared type");
    }

    const maxEdge = Math.max(width, height);
    const shouldResize = maxEdge > MAX_EDGE;
    const shouldOptimize = buffer.byteLength >= MIN_OPTIMIZE_BYTES || shouldResize;

    if (!shouldOptimize) {
        return { buffer, mimeType: detectedMimeType, format, width, height, optimized: false };
    }

    let pipeline = image;
    if (shouldResize) {
        pipeline = pipeline.resize({
            width: MAX_EDGE,
            height: MAX_EDGE,
            fit: "inside",
            withoutEnlargement: true,
        });
    }

    if (format === "png") {
        const out = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
        return { buffer: out, mimeType: "image/png", format: "png", width, height, optimized: true };
    }

    if (format === "webp") {
        const out = await pipeline.webp({ quality: 98, effort: 5, nearLossless: true }).toBuffer();
        return { buffer: out, mimeType: "image/webp", format: "webp", width, height, optimized: true };
    }

    const out = await pipeline.jpeg({
        quality: 98,
        mozjpeg: true,
        progressive: true,
        chromaSubsampling: "4:4:4",
    }).toBuffer();
    return { buffer: out, mimeType: "image/jpeg", format: "jpeg", width, height, optimized: true };
}
