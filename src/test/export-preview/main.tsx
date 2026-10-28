import { toSvg } from 'html-to-image';
import '@/components/admin/post-studio/PostStudio.module.css';
import { artworkBytes } from '@/lib/post-studio/export';
import { prepareArtworkSnapshot } from '@/lib/post-studio/export-assets';
const stage = document.getElementById('root')!;
Object.assign(window, {
    exportAssetCase: async (kind: 'css' | 'image' | 'svg' | 'pseudo', uri: string) => {
        stage.replaceChildren();
        const node = document.createElement('div');
        Object.assign(node.style, { width: '360px', height: '450px', position: 'relative', backgroundColor: '#ffffff' });
        if (kind === 'css') { node.style.backgroundImage = `linear-gradient(transparent,transparent),url("${uri}")`; node.style.backgroundSize = 'cover'; }
        if (kind === 'image') { const image = new Image(); image.src = uri; image.style.width = '100%'; image.style.height = '100%'; node.append(image); await image.decode(); }
        if (kind === 'svg') node.innerHTML = `<svg width="360" height="450"><image href="${uri}" width="360" height="450" /></svg>`;
        if (kind === 'pseudo') { node.className = 'asset-test-pseudo'; const style = document.createElement('style'); style.textContent = `.asset-test-pseudo::before{content:"";position:absolute;inset:0;background-image:url("${uri}");background-size:cover}`; node.append(style); }
        stage.append(node);
        const progress: string[] = [];
        const bytes = await artworkBytes(node, 'portrait', message => progress.push(message));
        return { bytes: Array.from(bytes), progress, snapshots: document.querySelectorAll('[data-export-snapshot]').length, originalBackground: node.style.backgroundImage };
    },
    checkAssetSnapshot: prepareArtworkSnapshot,
    debugSnapshot: async () => { const node = stage.firstElementChild as HTMLElement; const snap = await prepareArtworkSnapshot(node); const result = { html: snap.outerHTML, background: getComputedStyle(snap).backgroundImage, svg: await toSvg(snap, { width: 360, height: 450, skipFonts: true, style: { position: 'relative', left: '0', top: '0', transform: 'none' } }) }; snap.remove(); return result; },
});
