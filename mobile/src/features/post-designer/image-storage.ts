import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

const pending = new Map<string, Promise<string>>();
async function preserve(uri: string): Promise<string> {
    if (Platform.OS === "web") {
        if (!uri.startsWith("blob:")) return uri;
        let response: Response;
        try { response = await fetch(uri); } catch { throw new Error("The temporary photo reference has expired. Choose the photo again in Media."); }
        if (!response.ok) throw new Error("The selected photo could not be read.");
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Couldn’t preserve the selected photo."));
            reader.onerror = () => reject(new Error("Couldn’t preserve the selected photo."));
            reader.readAsDataURL(blob);
        });
    }
    if (!/^(file|content):/.test(uri)) return uri;
    const directory = new Directory(Paths.document, "studio-images");
    const source = new File(uri);
    if (!source.exists) throw new Error("This photo is missing. Replace it before exporting.");
    if (uri.startsWith(`${directory.uri.replace(/\/+$/, "")}/`)) return uri;
    directory.create({ intermediates: true, idempotent: true });
    const extension = uri.split(/[?#]/)[0].match(/\.([a-z0-9]{2,5})$/i)?.[1] ?? "jpg";
    const target = new File(directory, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}.${extension}`);
    await source.copy(target);
    if (!target.exists) throw new Error("Couldn’t preserve the selected photo.");
    return target.uri;
}
export async function preserveStudioImage(uri: string) {
    if (!pending.has(uri)) pending.set(uri, preserve(uri));
    try { return await pending.get(uri)!; } finally { pending.delete(uri); }
}
