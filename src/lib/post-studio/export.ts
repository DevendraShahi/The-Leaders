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
    await Promise.all(Array.from(node.querySelectorAll('img')).map(image => image.decode()));
    await Promise.all(Array.from(node.querySelectorAll('svg image')).map(async photo => {
        const uri = photo.getAttribute('href');
        if (!uri) return;
        const image = new Image(); image.src = uri;
        try { await image.decode(); }
        catch { throw new Error('A photo is unavailable. Replace it in the editor before exporting.'); }
    }));
    for (const text of node.querySelectorAll<HTMLElement>('[data-line-limit]')) {
        if (text.scrollHeight > parseFloat(getComputedStyle(text).lineHeight) * Number(text.dataset.lineLimit) + 1) {
            throw new Error('Text is clipped. Shorten it or reduce its size/spacing before exporting.');
        }
    }
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
export function download(bytes: Uint8Array, filename: string, type = 'image/png') {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
