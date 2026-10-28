import { prepareArtworkSnapshot } from './export-assets';
import { artworkFitIssues } from './artwork-fit';
import { toCanvas } from 'html-to-image';
import { postOutputDimensions, postExportReferenceWidth, type PostFormat } from './types';

const fonts = ['Onest_400Regular', 'Onest_500Medium', 'Onest_600SemiBold', 'Onest_700Bold', 'Hind_400Regular', 'Hind_600SemiBold', 'Hind_700Bold', 'Lora_400Regular', 'Lora_700Bold'];
let embedded: Promise<string> | undefined;
function fontCSS() {
    if (!embedded) embedded = Promise.all(fonts.map(async name => {
        const response = await fetch(`/studio/${name}.ttf`);
        if (!response.ok) throw new Error('Could not load artwork fonts. Retry export.');
        const blob = await response.blob();
        const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Could not embed artwork fonts.'));
            reader.readAsDataURL(blob);
        });
        return `@font-face{font-family:'${name}';src:url('${data}') format('truetype');font-weight:normal;font-style:normal;}`;
    })).then(parts => parts.join('\n')).catch(error => { embedded = undefined; throw error; });
    return embedded;
}
export async function artworkBytes(node: HTMLElement, format: PostFormat, onProgress?: (message: string) => void) {
    onProgress?.('Preparing fonts and images…');
    const embeddedFonts = await fontCSS();
    await document.fonts.ready;
    if (node.dataset.exportError) throw new Error(node.dataset.exportError);
    // Wait for intrinsic image dimensions and font fitting instead of failing during a normal load.
    const pending = '[data-photo-ready="false"],[data-text-ready="false"]';
    if (node.querySelector(pending)) await new Promise<void>((resolve, reject) => {
        const finish = () => { observer.disconnect(); clearTimeout(timeout); resolve(); };
        const observer = new MutationObserver(() => { if (!node.querySelector(pending)) finish(); });
        const timeout = setTimeout(() => { observer.disconnect(); reject(new Error('The artwork is still loading a photo or fitting text. Wait a moment and retry export.')); }, 10000);
        observer.observe(node, { attributes: true, childList: true, subtree: true });
        if (!node.querySelector(pending)) finish();
    });
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    if (artworkFitIssues(node).length) throw new Error('Artwork content is clipped. Shorten the text, reduce the rows, or choose a taller format before exporting.');
    onProgress?.('Embedding background, photos and logos…');
    const snapshot = await prepareArtworkSnapshot(node);
    const [width, height] = postOutputDimensions[format];
    try {
        onProgress?.('Rendering the full-resolution PNG…');
        const background = getComputedStyle(node).backgroundColor;
        const canvas = await toCanvas(snapshot, {
            width: postExportReferenceWidth, height: postExportReferenceWidth * height / width,
            canvasWidth: width, canvasHeight: height, pixelRatio: 1, includeQueryParams: true,
            fontEmbedCSS: embeddedFonts, backgroundColor: background === 'rgba(0, 0, 0, 0)' ? '#111318' : background,
            // Reset both logical and physical offsets copied from the offscreen snapshot.
            style: { position: 'relative', inset: 'auto', insetInline: 'auto', insetBlock: 'auto', left: '0', top: '0', right: 'auto', bottom: 'auto', transform: 'none' },
            onImageErrorHandler: () => { throw new Error('An embedded image could not render. Retry export; no incomplete file was downloaded.'); },
        });
        if (canvas.width !== width || canvas.height !== height) throw new Error('Incorrect PNG dimensions.');
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not create PNG.')), 'image/png'));
        onProgress?.('PNG ready.');
        return new Uint8Array(await blob.arrayBuffer());
    } finally { snapshot.remove(); }
}
export function isMobileDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const touchPoints = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0;
    const narrowScreen = typeof window.innerWidth === 'number' && window.innerWidth <= 820;
    return mobileUA || (narrowScreen && touchPoints);
}

export function canNativeShareFile(file: File): boolean {
    if (typeof navigator === 'undefined') return false;
    if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false;
    try {
        return navigator.canShare({ files: [file] });
    } catch {
        return false;
    }
}

export function bytesToFile(bytes: Uint8Array, filename: string, type = 'image/png'): File {
    return new File([bytes as BlobPart], filename, { type });
}

export function download(bytes: Uint8Array, filename: string, type = 'image/png'): string {
    const blob = new Blob([bytes as BlobPart], { type });
    const url = URL.createObjectURL(blob);
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch {
        if (typeof window !== 'undefined') {
            window.open(url, '_blank');
        }
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return url;
}
