import { Redirect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { createDraft, listDrafts } from "@/features/post-designer/drafts";
import { defaultPostDesign } from "@/features/post-designer/types";
import { PostDesignerEditor } from "@/features/post-designer/PostEditor";
import { StateView } from "@/ui/StateView";

const PREVIEW_SCOPE = "development-editor-preview";
export default function EditorPreviewRoute() {
    if (!__DEV__) return <Redirect href="/profile" />;
    return <DevelopmentEditorPreview />;
}
function DevelopmentEditorPreview() {
    const query = useQuery({
        queryKey: ["development-editor-preview"],
        queryFn: async () => {
            const drafts = await listDrafts(PREVIEW_SCOPE);
            return drafts.find(draft => !draft.trashedAt) ?? createDraft(PREVIEW_SCOPE, "Sample editor draft", {
                ...defaultPostDesign, eyebrow: "DESIGN PREVIEW", headline: "A clearer way to tell the story.",
                summary: "Edit this sample headline, adjust the layout and try the post formats.",
            });
        },
    });
    if (query.isPending) return <StateView loading />;
    if (query.error) return <StateView error={query.error} onRetry={() => query.refetch()} />;
    return <PostDesignerEditor scope={PREVIEW_SCOPE} initialDraft={query.data} preview />;
}
