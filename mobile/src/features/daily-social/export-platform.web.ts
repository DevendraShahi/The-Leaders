import type { RefObject } from 'react';
import type { View } from 'react-native';
import { artworkBytes } from '@/features/post-designer/export-web';
import type { PostFormat } from '@/features/post-designer/types';
export async function captureSlide(ref: RefObject<View | null>, format: PostFormat) {
    if (!ref.current) throw new Error('Artwork is not ready.');
    return artworkBytes(ref.current as unknown as HTMLElement, format);
}
export async function deliverCarousel(bytes: Uint8Array, filename: string) {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/zip' }));
    const link = document.createElement('a'); link.href = url; link.download = `${filename}.zip`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
