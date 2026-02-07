export function slugify(value: string, maxLen: number = 60): string {
    if (!value) return "";
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, maxLen);
}
