let snapshotSequence = 0;
/** Fail closed: a downloadable image must never silently omit an artwork asset. */
export function cssImageUrls(value: string): string[] {
    return Array.from(value.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g), match => match[1] ?? match[2] ?? match[3]).filter(Boolean);
}
function localReference(uri: string) {
    if (uri.startsWith('#')) return true;
    const url = new URL(uri, document.baseURI), page = new URL(location.href);
    return Boolean(url.hash && url.origin === page.origin && url.pathname === page.pathname && url.search === page.search);
}
function blobDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not prepare an image for export.')); reader.readAsDataURL(blob);
    });
}
async function decodeImage(uri: string) {
    const image = new Image(); image.src = uri;
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Image loading timed out.')), 15000);
        void image.decode().then(() => { clearTimeout(timer); resolve(); }, error => { clearTimeout(timer); reject(error); });
    });
    return image;
}
export async function prepareArtworkSnapshot(node: HTMLElement): Promise<HTMLElement> {
    const snapshot = node.cloneNode(true) as HTMLElement;
    const originals = [node, ...node.querySelectorAll<HTMLElement | SVGElement>('*')];
    const copies = [snapshot, ...snapshot.querySelectorAll<HTMLElement | SVGElement>('*')];
    // Cache exact URLs only, and only for this export. Failed responses never poison later exports.
    const assets = new Map<string, Promise<string>>();
    const asset = (uri: string, role: string): Promise<string> => {
        if (localReference(uri)) return Promise.resolve(uri);
        const resolved = new URL(uri, document.baseURI).href;
        let pending = assets.get(resolved);
        if (!pending) {
            pending = (async () => {
                try {
                    if (resolved.startsWith('data:')) { await decodeImage(resolved); return resolved; }
                    if (!/^(https?:|blob:)/.test(resolved)) throw new Error('Unsupported image source.');
                    for (let attempt = 0; attempt < 2; attempt++) {
                        try {
                            const response = await fetch(resolved, { cache: attempt ? 'reload' : 'no-cache', credentials: 'same-origin', signal: AbortSignal.timeout(15000) });
                            if (!response.ok) throw new Error('Image request failed.');
                            const blob = await response.blob();
                            if (!blob.size || /^(text\/html|application\/json)/i.test(blob.type)) throw new Error('The URL returned a page instead of an image.');
                            const embedded = await blobDataUrl(blob); await decodeImage(embedded); return embedded;
                        } catch (error) { if (attempt) throw error; }
                    }
                    throw new Error('Image unavailable.');
                } catch { throw new Error(`A ${role} could not be loaded for export. Check your connection or replace the image, then retry. No incomplete file was downloaded.`); }
            })();
            assets.set(resolved, pending);
        }
        return pending;
    };
    const embedCss = async (value: string) => {
        const urls = cssImageUrls(value);
        const values = await Promise.all(urls.map(uri => asset(uri, 'background image')));
        let index = 0;
        return value.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g, () => `url("${values[index++]}")`);
    };
    const properties = ['background-image', 'mask-image', '-webkit-mask-image', 'border-image-source', 'list-style-image'];
    const pseudoRules: string[] = [];
    const scope = `export-${++snapshotSequence}`;
    await Promise.all(originals.map(async (original, index) => {
        const copy = copies[index];
        if (original instanceof HTMLImageElement && copy instanceof HTMLImageElement) {
            const uri = original.currentSrc || original.src;
            if (uri) { copy.removeAttribute('srcset'); copy.removeAttribute('sizes'); copy.loading = 'eager'; copy.decoding = 'sync'; copy.src = await asset(uri, 'photo or logo'); }
        } else if (original instanceof SVGElement && ['image', 'feimage'].includes(original.tagName.toLowerCase())) {
            const uri = original.getAttribute('href') || original.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            if (uri) { const embedded = await asset(uri, 'photo or logo'); copy.setAttribute('href', embedded); copy.removeAttributeNS('http://www.w3.org/1999/xlink', 'href'); }
        }
        for (const pseudo of [null, '::before', '::after']) {
            const computed = getComputedStyle(original, pseudo);
            for (const property of properties) {
                const value = computed.getPropertyValue(property);
                if (!cssImageUrls(value).length) continue;
                const embedded = await embedCss(value);
                if (!pseudo) copy.style.setProperty(property, embedded, 'important');
                else {
                    const id = `${scope}-${index}`; copy.setAttribute('data-export-asset', id);
                    pseudoRules.push(`[data-export-asset="${id}"]${pseudo}{${property}:${embedded}!important}`);
                }
            }
        }
    }));
    if (pseudoRules.length) { const style = document.createElement('style'); style.textContent = pseudoRules.join('\n'); snapshot.append(style); }
    Object.assign(snapshot.style, { position: 'fixed', left: '-10000px', top: '0', transform: 'none', pointerEvents: 'none' });
    snapshot.setAttribute('aria-hidden', 'true'); snapshot.dataset.exportSnapshot = 'true';
    if (!node.parentElement) throw new Error('The artwork is no longer open. Reopen the post and retry export.');
    node.after(snapshot);
    try { await Promise.all(Array.from(snapshot.querySelectorAll('img'), image => image.decode())); }
    catch (error) { snapshot.remove(); throw error; }
    return snapshot;
}
