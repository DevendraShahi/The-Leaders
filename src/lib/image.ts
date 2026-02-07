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

function shouldSkipOptimization(mimeType?: string) {
    if (!mimeType) return true;
    if (mimeType === "image/svg+xml") return true;
    return false;
}

export async function optimizeImageForUpload(buffer: Buffer, mimeType?: string): Promise<OptimizationResult> {
    if (shouldSkipOptimization(mimeType)) {
        return { buffer, mimeType, optimized: false };
    }

    const image = sharp(buffer, { failOnError: false }).rotate();
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const format = metadata.format || (mimeType ? mimeType.split("/")[1] : undefined);

    const maxEdge = Math.max(width, height);
    const shouldResize = maxEdge > MAX_EDGE;
    const shouldOptimize = buffer.byteLength >= MIN_OPTIMIZE_BYTES || shouldResize;

    if (!shouldOptimize) {
        return { buffer, mimeType, format, width, height, optimized: false };
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
