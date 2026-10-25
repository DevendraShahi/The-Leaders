// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import type { PostDesign } from "./types";
export function commitInteraction(before: PostDesign | null, after: PostDesign, undo: PostDesign[]) {
    if (!before || JSON.stringify(before) === JSON.stringify(after)) return undo;
    return [...undo.slice(-39), before];
}
