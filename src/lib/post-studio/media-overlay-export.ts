import { drawMediaOverlay, overlayDimensions, overlayVideoMime, type OverlaySettings } from './media-overlay';

export async function overlayFontsReady() {
    await Promise.all(['Onest_400Regular', 'Onest_700Bold', 'Hind_400Regular', 'Hind_700Bold'].map(name => document.fonts.load(`24px ${name}`)));
    await document.fonts.ready;
}
export function canvasPng(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create the PNG.')), 'image/png'));
}
function videoReady(video: HTMLVideoElement, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        const cleanup = () => { clearTimeout(timeout); video.onloadeddata = null; video.onerror = null; signal.removeEventListener('abort', aborted); };
        const aborted = () => { cleanup(); reject(new DOMException('Export cancelled.', 'AbortError')); };
        const timeout = setTimeout(() => { cleanup(); reject(new Error('The video could not be decoded. Try an MP4 or WebM file.')); }, 20000);
        video.onloadeddata = () => { cleanup(); resolve(); };
        video.onerror = () => { cleanup(); reject(new Error('This video format is not supported by your browser. Try an MP4 or WebM file.')); };
        signal.addEventListener('abort', aborted, { once: true });
        if (signal.aborted) aborted();
    });
}
/** Records a fresh playback; preview seeking/muting never changes the exported clip or audio. */
export async function exportOverlayVideo(url: string, settings: OverlaySettings, logo: HTMLImageElement, signal: AbortSignal, onProgress: (progress: number) => void): Promise<Blob> {
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) throw new Error('Video export needs a browser with canvas recording support, such as current Chrome or Edge. You can still download a transparent overlay PNG.');
    const mimeType = overlayVideoMime(mime => MediaRecorder.isTypeSupported(mime));
    if (!mimeType) throw new Error('Your browser has no supported video encoder. Download the transparent overlay PNG for your video editor.');
    const video = document.createElement('video'); video.playsInline = true; video.preload = 'auto';
    let audioContext: AudioContext | undefined, stream: MediaStream | undefined, recorder: MediaRecorder | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;
    try {
        const ready = videoReady(video, signal); video.src = url; video.load(); await ready;
        if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('The video has no readable duration. Try another file.');
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = overlayDimensions(settings.format, video.videoWidth, video.videoHeight);
        const paint = () => { drawMediaOverlay(canvas, settings, logo, { source: video, width: video.videoWidth, height: video.videoHeight }); onProgress(Math.min(99, Math.floor(video.currentTime / video.duration * 100))); };
        paint(); stream = canvas.captureStream(30);
        // Route sound to the recording only, so preview volume and speakers do not affect it.
        audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();
        audioContext.createMediaElementSource(video).connect(destination);
        destination.stream.getAudioTracks().forEach(track => stream!.addTrack(track));
        await audioContext.resume();
        if (signal.aborted) throw new DOMException('Export cancelled.', 'AbortError');
        recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
        const activeRecorder = recorder;
        const blob = new Promise<Blob>((resolve, reject) => {
            const chunks: BlobPart[] = [];
            const abort = () => { if (activeRecorder.state !== 'inactive') activeRecorder.stop(); reject(new DOMException('Export cancelled.', 'AbortError')); };
            const cleanup = () => signal.removeEventListener('abort', abort);
            signal.addEventListener('abort', abort, { once: true });
            activeRecorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
            activeRecorder.onerror = () => { cleanup(); reject(new Error('Video recording failed. Try a smaller output size or another browser.')); };
            activeRecorder.onstop = () => { cleanup(); if (signal.aborted) return; if (!chunks.length) reject(new Error('The browser returned an empty video.')); else resolve(new Blob(chunks, { type: activeRecorder.mimeType })); };
            video.onended = () => { paint(); if (activeRecorder.state !== 'inactive') activeRecorder.stop(); };
            video.onerror = () => { cleanup(); reject(new Error('The video stopped decoding during export.')); };
            activeRecorder.start(1000);
            timer = setInterval(paint, 1000 / 30);
            video.play().catch(error => { cleanup(); reject(error); });
        });
        const result = await blob; onProgress(100); return result;
    } finally {
        if (timer) clearInterval(timer);
        video.pause(); video.onended = null; video.onerror = null;
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        stream?.getTracks().forEach(track => track.stop());
        await audioContext?.close();
        video.removeAttribute('src'); video.load();
    }
}
export function downloadOverlay(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
