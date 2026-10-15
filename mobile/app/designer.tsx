import { View } from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { readDraft } from "@/features/post-designer/drafts";
import { PostDesignerEditor } from "@/features/post-designer/PostEditor";
import { useAdminAccount } from "@/services/useAdminAccount";
import { StateView } from "@/ui/StateView";
import { Button } from "@/components/ui/button";
import { AppText } from "@/ui/primitives/AppText";

export default function DesignerScreen() {
  const account = useAdminAccount();
  const { draft: draftId } = useLocalSearchParams<{ draft?: string }>();
  const scope = account.data?.studioScope;
  const draft = useQuery({ queryKey: ["studio-draft", scope, draftId], enabled: Boolean(account.isAdmin && scope && draftId), queryFn: () => readDraft(scope!, draftId!), staleTime: 0, gcTime: 0, refetchOnWindowFocus: false, refetchOnReconnect: false });
  if (account.isPending) return <StateView loading />;
  if (!account.isAdmin || !scope) return <Redirect href="/profile" />;
  if (!draftId) return <Redirect href="/studio" />;
  if (draft.isPending || draft.isFetching) return <StateView loading />;
  if (draft.error || !draft.data) return <View style={{ flex: 1, padding: 20 }}><StateView error={draft.error || new Error("Draft not found")} onRetry={() => draft.refetch()} /><Button onPress={() => router.replace("/studio")}><AppText colorToken="onPrimary">Return to Studio</AppText></Button></View>;
  return <PostDesignerEditor key={`${scope}:${draftId}`} scope={scope} initialDraft={draft.data} />;
}
