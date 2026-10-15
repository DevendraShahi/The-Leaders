import type { RefObject } from 'react';
import type { View } from 'react-native';
import { ImageFormat, makeImageFromView, Skia } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { postOutputDimensions, type PostFormat } from '@/features/post-designer/types';

export async function captureSlide(ref: RefObject<View | null>, format: PostFormat) {
    const snapshot = await makeImageFromView(ref);
    if (!snapshot) throw new Error('Artwork is not ready. Retry the export.');
    const [width, height] = postOutputDimensions[format];
    const surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) { snapshot.dispose(); throw new Error('Unable to prepare artwork.'); }
    try {
        surface.getCanvas().drawImageRect(snapshot, Skia.XYWHRect(0, 0, snapshot.width(), snapshot.height()), Skia.XYWHRect(0, 0, width, height), Skia.Paint(), false);
        surface.flush();
        const output = surface.makeImageSnapshot();
        try { return output.encodeToBytes(ImageFormat.PNG, 100); }
        finally { output.dispose(); }
    } finally { snapshot.dispose(); surface.dispose(); }
}

export async function deliverCarousel(bytes: Uint8Array, filename: string) {
    if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device.');
    const file = new File(Paths.cache, `${filename}-${Date.now()}.zip`);
    file.write(bytes);
    try { await Sharing.shareAsync(file.uri, { mimeType: 'application/zip', UTI: 'public.zip-archive', dialogTitle: 'Save carousel package' }); }
    finally { if (file.exists) file.delete(); }
}
