import { artworkFitIssues } from './artwork-fit';
import { toCanvas } from 'html-to-image';
import { postOutputDimensions, postExportReferenceWidth, type PostFormat } from './types';

const fonts = ['Onest_400Regular', 'Onest_500Medium', 'Onest_600SemiBold', 'Onest_700Bold', 'Hind_400Regular', 'Hind_600SemiBold', 'Hind_700Bold'];
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
export async function artworkBytes(node: HTMLElement, format: PostFormat) {
    await document.fonts.ready;
    if (node.dataset.exportError) throw new Error(node.dataset.exportError);
    await Promise.all(Array.from(node.querySelectorAll('img')).map(image => image.decode()));
    await Promise.all(Array.from(node.querySelectorAll('svg image')).map(async photo => {
        const uri = photo.getAttribute('href');
        if (!uri) return;
        const image = new Image(); image.src = uri;
        try { await image.decode(); }
        catch { throw new Error('A photo is unavailable. Replace it in the editor before exporting.'); }
    }));
    // Intrinsic photo bounds must finish updating before capturing the SVG.
    if (node.querySelector('[data-photo-ready="false"]')) await new Promise<void>((resolve, reject) => {
        const observer = new MutationObserver(() => {
            if (!node.querySelector('[data-photo-ready="false"]')) { observer.disconnect(); clearTimeout(timeout); resolve(); }
        });
        const timeout = setTimeout(() => { observer.disconnect(); reject(new Error('Photo is still preparing. Retry export.')); }, 5000);
        observer.observe(node, { attributes: true, childList: true, subtree: true });
    });
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    if (node.querySelector('[data-text-ready="false"]')) throw new Error('Text is still preparing. Retry export.');
    if (artworkFitIssues(node).length) throw new Error('Artwork content is clipped. Shorten the text, reduce the rows, or choose a taller format before exporting.');
    const [width, height] = postOutputDimensions[format];
    const canvas = await toCanvas(node, {
        width: postExportReferenceWidth, height: postExportReferenceWidth * height / width,
        canvasWidth: width, canvasHeight: height, pixelRatio: 1,
        fontEmbedCSS: await fontCSS(), backgroundColor: '#111318',
        style: { position: 'relative', left: '0', top: '0', transform: 'none' },
        onImageErrorHandler: () => { throw new Error('A photo or logo could not load. Replace the photo and retry.'); },
    });
    if (canvas.width !== width || canvas.height !== height) throw new Error('Incorrect PNG dimensions.');
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not create PNG.')), 'image/png'));
    return new Uint8Array(await blob.arrayBuffer());
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
