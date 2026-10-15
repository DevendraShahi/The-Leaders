import { Asset } from "expo-asset";
import { toCanvas } from "html-to-image";
import { postExportReferenceWidth, postOutputDimensions, type PostFormat } from "./types";

const fonts: Record<string, number> = {
    Onest_400Regular: require("@expo-google-fonts/onest/400Regular/Onest_400Regular.ttf"),
    Onest_600SemiBold: require("@expo-google-fonts/onest/600SemiBold/Onest_600SemiBold.ttf"),
    Onest_700Bold: require("@expo-google-fonts/onest/700Bold/Onest_700Bold.ttf"),
    Hind_400Regular: require("@expo-google-fonts/hind/400Regular/Hind_400Regular.ttf"),
    Hind_600SemiBold: require("@expo-google-fonts/hind/600SemiBold/Hind_600SemiBold.ttf"),
    Hind_700Bold: require("@expo-google-fonts/hind/700Bold/Hind_700Bold.ttf"),
};
const embeddedFonts = new Map<string, Promise<string>>();
async function fontCSS(node: HTMLElement) {
    const families = new Set([node, ...Array.from(node.querySelectorAll("*"))].flatMap(element => getComputedStyle(element).fontFamily.split(",").map(name => name.trim().replace(/["']/g, ""))));
    return (await Promise.all([...families].filter(name => name in fonts).map(name => {
        if (!embeddedFonts.has(name)) embeddedFonts.set(name, (async () => {
            const response = await fetch(Asset.fromModule(fonts[name]).uri);
            if (!response.ok) throw new Error(`Couldn’t load ${name} for export.`);
            const blob = await response.blob();
            const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Couldn’t embed the artwork font.")); reader.readAsDataURL(blob); });
            return `@font-face { font-family: '${name}'; src: url('${data}') format('truetype'); font-weight: normal; font-style: normal; }`;
        })().catch(error => { embeddedFonts.delete(name); throw error; }));
        return embeddedFonts.get(name)!;
    }))).join("\n");
}

export async function artworkBytes(node: HTMLElement, format: PostFormat) {
    await document.fonts.ready;
    await Promise.all(Array.from(node.querySelectorAll<HTMLImageElement>('img[src]')).filter(image => Boolean(image.getAttribute("src"))).map(image => { image.loading = "eager"; return image.decode(); }));
    const fontEmbedCSS = await fontCSS(node);
    const [width, height] = postOutputDimensions[format];
    const canvas = await toCanvas(node, {
        width: postExportReferenceWidth, height: postExportReferenceWidth * height / width,
        canvasWidth: width, canvasHeight: height, pixelRatio: 1,
        fontEmbedCSS, includeQueryParams: true, backgroundColor: "#111318",
        style: { position: "relative", left: "0", top: "0", transform: "none" },
        onImageErrorHandler: () => { throw new Error("A photo or logo could not be loaded. Replace the photo and retry."); },
    });
    if (canvas.width !== width || canvas.height !== height) throw new Error("The exported image has incorrect dimensions.");
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Couldn’t create the PNG.")), "image/png"));
    return new Uint8Array(await blob.arrayBuffer());
}

export async function downloadArtwork(node: HTMLElement, format: PostFormat, filename: string) {
    const bytes = await artworkBytes(node, format);
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "image/png" }));
    const link = document.createElement("a");
    link.href = url; link.download = `${filename}.png`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
