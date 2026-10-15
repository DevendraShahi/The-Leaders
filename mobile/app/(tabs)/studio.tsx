import { DailyEditions } from "@/features/daily-social/DailyEditions";
import { editionDrafts } from "@/features/daily-social/carousel";

import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react-native";
import { useAdminAccount } from "@/services/useAdminAccount";
import { useLanguage } from "@/i18n/language";
import { PageHeader } from "@/ui/PageHeader";
import { StateView } from "@/ui/StateView";
import { AppText } from "@/ui/primitives/AppText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/state/useAppStore";
import { layout, radius, spacing } from "@/theme/tokens";
import { useColors } from "@/theme/Theme";
import { createDraft, createDraftCollection, duplicateDraft, listDrafts, readPreviousLocalDesign, setDraftTrashed, updateDraft, type PostDraft } from "@/features/post-designer/drafts";
import { defaultPostDesign, postTemplates, type PostTemplate } from "@/features/post-designer/types";

export default function StudioScreen() {
    const account = useAdminAccount();
    const scope = account.data?.studioScope;
    const { language } = useLanguage();
    const colors = useColors();
    const t = (en: string, ne: string) => language === "ne" ? ne : en;
    const [section] = useState("edit");
    const [search, setSearch] = useState("");
    const [trash, setTrash] = useState(false);
    const [template, setTemplate] = useState<PostTemplate>("breaking");
    const [busy, setBusy] = useState(false);
    const [renaming, setRenaming] = useState<PostDraft | null>(null);
    const [name, setName] = useState("");
    const drafts = useQuery({ queryKey: ["studio-drafts", scope], enabled: Boolean(account.isAdmin && scope), queryFn: () => listDrafts(scope!), staleTime: 0 });
    const { refetch } = drafts;
    const previousDesign = useQuery({ queryKey: ["previous-local-design", scope], enabled: Boolean(account.isAdmin && scope), queryFn: readPreviousLocalDesign });
    useFocusEffect(useCallback(() => { if (account.isAdmin && scope) void refetch(); }, [account.isAdmin, scope, refetch]));
    const run = async (operation: () => Promise<unknown>) => {
        if (busy) return;
        setBusy(true);
        try { await operation(); await drafts.refetch(); }
        catch (error) { useAppStore.getState().setNotice(error instanceof Error ? error.message : t("Unable to save changes. Try again.", "परिवर्तन सुरक्षित गर्न सकिएन। फेरि प्रयास गर्नुहोस्।")); }
        finally { setBusy(false); }
    };
    const open = (draft: PostDraft) => router.push({ pathname: "/designer", params: { draft: draft.id } });
    if (account.isPending) return <StateView loading />;
    if (!account.isAdmin || !scope) return <Redirect href="/explore" />;
    const active = (drafts.data ?? []).filter(item => !item.trashedAt);
    const discarded = (drafts.data ?? []).filter(item => item.trashedAt);
    const visible = (trash ? discarded : active).filter(item => `${item.name} ${item.design.headline}`.toLowerCase().includes(search.toLowerCase().trim()));
    return <View style={{ flex: 1, backgroundColor: colors.background }}>
        <PageHeader compact title={t("Studio", "स्टुडियो")} />
        <ScrollView style={{ flex: 1, display: section === "edit" ? "flex" : "none" }} contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing["3xl"] }} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
            <DailyEditions scope={scope} onOpen={async (edition, language, index) => {
                const collection = await createDraftCollection(scope, editionDrafts(edition));
                await drafts.refetch();
                const chosen = collection.find(item => item.id === `daily-${edition.id}-${language}-${index}`);
                if (!chosen) throw new Error("This carousel slide is unavailable.");
                open(chosen);
            }} />
            <AppText variant="heading2">{t("Your post drafts", "तपाईंका पोस्ट मस्यौदा")}</AppText>
            <AppText variant="bodySmall" colorToken="textSecondary">{t("Design, save and export. Drafts stay on this device for your admin account.", "डिजाइन, सुरक्षित र निर्यात गर्नुहोस्। मस्यौदा यस उपकरणमा तपाईंको एडमिन खाताका लागि सुरक्षित हुन्छन्।")}</AppText>
            <View style={styles.row}>
                {postTemplates.map(item => <Button key={item.key} size="sm" variant={template === item.key ? "default" : "outline"} accessibilityState={{ selected: template === item.key }} onPress={() => setTemplate(item.key)}><AppText variant="caption" colorToken={template === item.key ? "onPrimary" : "textPrimary"}>{item.title}</AppText></Button>)}
            </View>
            <Button disabled={busy || drafts.isPending || drafts.isError} onPress={() => { void run(async () => {
                const selected = postTemplates.find(item => item.key === template)!;
                open(await createDraft(scope, t(`Untitled ${selected.title.toLowerCase()}`, `नयाँ ${selected.title}`), { ...defaultPostDesign, ...selected.patch, template }));
            }); }}><Plus size={layout.iconSize} color={colors.onPrimary} /><AppText variant="label" colorToken="onPrimary">{t("New post", "नयाँ पोस्ट")}</AppText></Button>
            {previousDesign.data ? <Button variant="outline" disabled={busy} onPress={() => { void run(async () => { open(await createDraft(scope, t("Previous local design", "अघिल्लो स्थानीय डिजाइन"), previousDesign.data!)); }); }}><AppText variant="caption">{t("Import previous local design", "अघिल्लो स्थानीय डिजाइन ल्याउनुहोस्")}</AppText></Button> : null}
            {previousDesign.isError ? <AppText variant="caption" colorToken="textSecondary">{t("The previous local design could not be read. Its saved data is preserved.", "अघिल्लो स्थानीय डिजाइन पढ्न सकिएन। सुरक्षित डेटा यथावत छ।")}</AppText> : null}
            <View style={styles.row}>
                <Button variant={trash ? "ghost" : "secondary"} onPress={() => setTrash(false)}><AppText variant="label">{t("Drafts", "मस्यौदा")} · {active.length}</AppText></Button>
                <Button variant={trash ? "secondary" : "ghost"} onPress={() => setTrash(true)}><AppText variant="label">{t("Trash", "हटाइएका")} · {discarded.length}</AppText></Button>
            </View>
            <Input accessibilityLabel={t("Search drafts", "मस्यौदा खोज्नुहोस्")} placeholder={t("Search drafts", "मस्यौदा खोज्नुहोस्")} value={search} onChangeText={setSearch} />
            {drafts.isPending ? <StateView loading /> : drafts.error ? <StateView error={drafts.error} onRetry={() => drafts.refetch()} /> : visible.length === 0 ? <AppText variant="bodySmall" colorToken="textSecondary">{search ? t("No matching drafts.", "मिल्ने मस्यौदा भेटिएन।") : trash ? t("Trash is empty. Removed drafts can be restored here.", "हटाइएको मस्यौदा छैन। यहाँबाट मस्यौदा पुनःस्थापना गर्न सकिन्छ।") : t("Create your first post using a template above.", "माथिको ढाँचा प्रयोग गरेर पहिलो पोस्ट बनाउनुहोस्।")}</AppText> : null}
            {visible.map(draft => <View key={draft.id} style={[styles.draft, { borderColor: colors.border }]}>
                <Pressable disabled={trash || busy} accessibilityRole="button" accessibilityLabel={`${t("Open", "खोल्नुहोस्")} ${draft.name}`} onPress={() => open(draft)} style={styles.row}>
                    <View style={[styles.thumbnail, { backgroundColor: colors.surfaceSecondary }]}>{draft.design.imageUri ? <Image source={{ uri: draft.design.imageUri }} contentFit="cover" style={{ width: "100%", height: "100%" }} /> : <Pencil size={layout.iconSize} color={draft.design.accent} />}</View>
                    <View style={styles.copy}><AppText variant="body" weight="semibold" numberOfLines={2}>{draft.name}</AppText><AppText variant="caption" colorToken="textSecondary" numberOfLines={2}>{draft.design.headline}</AppText><AppText variant="meta" colorToken="textSecondary">{draft.design.format} · {new Date(draft.updatedAt).toLocaleDateString(language === "ne" ? "ne-NP" : "en-GB")}</AppText></View>
                </Pressable>
                <View style={styles.row}>
                    {trash ? <Button variant="outline" disabled={busy} onPress={() => { void run(() => setDraftTrashed(scope, draft.id, false)); }}><RotateCcw size={layout.iconSmall} color={colors.textPrimary} /><AppText variant="caption">{t("Restore", "पुनःस्थापना")}</AppText></Button> : <>
                        <Button variant="ghost" disabled={busy} accessibilityLabel={t(`Rename ${draft.name}`, "नाम परिवर्तन गर्नुहोस्")} onPress={() => { setRenaming(draft); setName(draft.name); }}><Pencil size={layout.iconSmall} color={colors.textPrimary} /><AppText variant="caption">{t("Rename", "नाम")}</AppText></Button>
                        <Button variant="ghost" disabled={busy} accessibilityLabel={t(`Duplicate ${draft.name}`, "प्रतिलिपि बनाउनुहोस्")} onPress={() => { void run(() => duplicateDraft(scope, draft.id)); }}><Copy size={layout.iconSmall} color={colors.textPrimary} /><AppText variant="caption">{t("Duplicate", "प्रतिलिपि")}</AppText></Button>
                        <Button variant="ghost" size="icon" disabled={busy} accessibilityLabel={t(`Move ${draft.name} to Trash`, "मस्यौदा हटाइएकोमा सार्नुहोस्")} onPress={() => { void run(() => setDraftTrashed(scope, draft.id, true)); }}><Trash2 size={layout.iconSmall} color={colors.brandRed} /></Button>
                    </>}
                </View>
            </View>)}
        </View>
        <Modal visible={Boolean(renaming)} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
            <View style={styles.overlay}><View style={[styles.dialog, { backgroundColor: colors.background }]}>
                <AppText variant="heading3">{t("Rename draft", "मस्यौदाको नाम परिवर्तन")}</AppText>
                <Input accessibilityLabel={t("Draft name", "मस्यौदाको नाम")} value={name} onChangeText={setName} maxLength={100} autoFocus />
                <Button disabled={busy || !name.trim()} onPress={() => { if (renaming) void run(async () => { await updateDraft(scope, renaming.id, { name: name.trim() }); setRenaming(null); }); }}><AppText variant="label" colorToken="onPrimary">{t("Save name", "नाम सुरक्षित")}</AppText></Button>
                <Button variant="ghost" disabled={busy} onPress={() => setRenaming(null)}><AppText variant="label">{t("Cancel", "रद्द गर्नुहोस्")}</AppText></Button>
            </View></View>
        </Modal>
        </ScrollView>
    </View>;
}
const styles = StyleSheet.create({ content: { paddingHorizontal: spacing.gutter, gap: spacing.md }, row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm }, copy: { flex: 1, minWidth: 0, gap: spacing.xs }, draft: { borderTopWidth: layout.ruleWidth, paddingTop: spacing.md, gap: spacing.sm }, thumbnail: { width: 64, height: 80, borderRadius: radius.sm, overflow: "hidden", alignItems: "center", justifyContent: "center" }, overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: spacing.gutter }, dialog: { width: "100%", maxWidth: layout.contentMaxWidth, borderRadius: radius.md, padding: spacing.card, gap: spacing.md } });
