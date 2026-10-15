import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, StyleSheet, View, useWindowDimensions, type View as ViewType } from "react-native";
import { ExportArtboard, ArtworkBrand } from "./ExportArtboard";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { positionText, textPositionStyle, snapTextPosition } from "./positioning";
import { fitPostCanvas } from "./layout";
import { updateDraft, type PostDraft } from "@/features/post-designer/drafts";
import { useAppStore } from "@/state/useAppStore";
import { downloadArtwork } from "./export-artwork";
import { InspectorSection } from "./InspectorSection";
import { preserveStudioImage } from "./image-storage";
import { exceedsTextLines, textLineLimit } from "./text-overflow";
import { hasDevanagari, setTextTypography, textTypographyStyle } from "./typography";
import { defaultTextTypography } from "./types";
import { TextColorPicker } from "./TextColorPicker";
import { setTextColor, textColorStyle } from "./text-colors";
import { ArtworkImage } from "./ArtworkImage";
import { imageEffectControls, setImageEffect } from "./image-effects";
import { ImageScrollBall } from "./ImageScrollBall";
import { moveImage, resetImageAdjustments, replaceImage, setImageFit } from "./image-positioning";
import { StudioSlider } from "./StudioSlider";
import { commitInteraction } from "./history";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { ImageFormat, makeImageFromView, Skia } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { AlignCenter, AlignLeft, Check, Eye, EyeOff, ImagePlus, Layers3, LayoutTemplate, Lock, LockOpen, Move, Redo2, RotateCcw, Share2, Trash2, Type, Undo2, X } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { fontFamilies, brand, layout, radius, spacing } from "@/theme/tokens";
import { postExportReferenceWidth, postOutputDimensions, postTemplates, type ImageTone, type PostDesign, type PostFormat, type PostLayer, type TextAlignment } from "@/features/post-designer/types";


type Tool = "text" | "layout" | "media" | "layers";
type DesignUpdater = PostDesign | ((current: PostDesign) => PostDesign);


const formats: Record<PostFormat, { label: string; ratio: number; aspect: [number, number] }> = {
  square: { label: "Square", ratio: 1, aspect: [1, 1] },
  portrait: { label: "Portrait", ratio: 4 / 5, aspect: [4, 5] },
  story: { label: "Story", ratio: 9 / 16, aspect: [9, 16] },
  landscape: { label: "Landscape", ratio: 16 / 9, aspect: [16, 9] },
};
const layerItems: { key: PostLayer; label: string; kind: string }[] = [
  { key: "visual", label: "Visual", kind: "MEDIA" },
  { key: "kicker", label: "Kicker", kind: "TEXT" },
  { key: "headline", label: "Headline", kind: "TEXT" },
  { key: "supporting", label: "Supporting", kind: "TEXT" },
  { key: "footer", label: "Byline", kind: "TEXT" },
];

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 42) || "the-leaders-post";
}

function imageTint(tone: ImageTone) {
  if (tone === "clear") return "rgba(7,9,13,0.18)";
  if (tone === "warm") return "rgba(61,28,14,0.38)";
  return "rgba(5,7,10,0.52)";
}

export function PostDesignerEditor({ scope, initialDraft, preview = false }: { scope: string; initialDraft: PostDraft; preview?: boolean }) {
  const queryClient = useQueryClient();
  const colors = useColors();
  const studio = colors;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const previewRef = useRef<ViewType>(null);
  const exportRef = useRef<ViewType>(null);
  const designRef = useRef<PostDesign>(initialDraft.design);
  const undoRef = useRef<PostDesign[]>([]);
  const redoRef = useRef<PostDesign[]>([]);
  const interactionRef = useRef<PostDesign | null>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const [keepImageAdjustments, setKeepImageAdjustments] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [repositioning, setRepositioning] = useState(false);
  const [design, setDesignState] = useState<PostDesign>(initialDraft.design);
  const [tool, setTool] = useState<Tool>("text");
  const [selectedLayer, setSelectedLayer] = useState<PostLayer>("headline");
  const [overflow, setOverflow] = useState({ headline: false, supporting: false });
  const [exportIssue, setExportIssue] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [imageIssue, setImageIssue] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const mounted = useRef(true);
  const [exporting, setExporting] = useState(false);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const wide = width >= layout.editorWideBreakpoint;
  const inspectorHeight = Math.min(layout.editorInspectorMaxHeight, Math.max(layout.editorInspectorMinHeight, height * layout.editorInspectorHeightRatio));

  const applyDesign = useCallback((next: DesignUpdater, record = true) => {
    const current = designRef.current;
    const resolved = typeof next === "function" ? next(current) : next;
    if (JSON.stringify(current) === JSON.stringify(resolved)) return;
    if (record) {
      undoRef.current = [...undoRef.current.slice(-39), current];
      redoRef.current = [];
    }
    setSaveStatus("saving");
    designRef.current = resolved;
    setDesignState(resolved);
    setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
  }, []);

  const beginInteraction = useCallback(() => { interactionRef.current = designRef.current; }, []);
  const liveApplyDesign = useCallback((next: DesignUpdater) => {
    applyDesign(next, interactionRef.current === null);
  }, [applyDesign]);
  const endInteraction = useCallback(() => {
    const nextUndo = commitInteraction(interactionRef.current, designRef.current, undoRef.current);
    if (nextUndo !== undoRef.current) { undoRef.current = nextUndo; redoRef.current = []; }
    interactionRef.current = null;
    setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
  }, []);

  useEffect(() => {
    const uri = initialDraft.design.imageUri;
    if (!uri) return;
    let active = true;
    void preserveStudioImage(uri).then(next => {
      if (active) setImageIssue(null);
      if (active && next !== uri) applyDesign(current => current.imageUri === uri ? { ...current, imageUri: next } : current, false);
    }).catch((error: Error) => { if (active) setImageIssue(error.message); });
    return () => { active = false; };
  }, [initialDraft.design.imageUri, applyDesign]);

  const update = useCallback(<K extends keyof PostDesign>(key: K, value: PostDesign[K]) => {
    applyDesign((current) => ({ ...current, [key]: value }));
  }, [applyDesign]);

  const persistDesign = useCallback(async () => {
    const snapshot = designRef.current;
    try {
      const saved = await updateDraft(scope, initialDraft.id, { design: snapshot });
      queryClient.setQueryData(["studio-draft", scope, initialDraft.id], saved);
      if (preview) queryClient.setQueryData(["development-editor-preview"], saved);
      if (mounted.current && snapshot === designRef.current) setSaveStatus("saved");
      return true;
    } catch {
      if (mounted.current) setSaveStatus("error");
      useAppStore.getState().setNotice("Draft could not be saved. Keep the editor open and retry.");
      return false;
    }
  }, [scope, initialDraft.id, queryClient, preview]);

  useEffect(() => {
    const timer = setTimeout(() => { void persistDesign(); }, 380);
    return () => clearTimeout(timer);
  }, [design, persistDesign]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; void persistDesign(); };
  }, [persistDesign]);
  const closeEditor = async () => {
    if (await persistDesign()) router.replace(preview ? "/profile" : "/studio");
  };

  const isHidden = useCallback((layer: PostLayer) => design.hiddenLayers.includes(layer), [design.hiddenLayers]);
  const isLocked = useCallback((layer: PostLayer) => design.lockedLayers.includes(layer), [design.lockedLayers]);

  const selectLayer = useCallback((layer: PostLayer, nextTool?: Tool) => {
    setSelectedLayer(layer);
    setRepositioning(false);
    setTool(nextTool ?? (layer === "visual" ? "media" : "text"));
    Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const selectTool = useCallback((nextTool: Tool) => {
    setTool(nextTool);
    setRepositioning(false);
    if (nextTool === "media") setSelectedLayer("visual");
    if (nextTool === "text" && selectedLayer === "visual") setSelectedLayer("headline");
    Haptics.selectionAsync().catch(() => undefined);
  }, [selectedLayer]);

  const undo = useCallback(() => {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push(designRef.current);
    setSaveStatus("saving");
    designRef.current = previous;
    setDesignState(previous);
    setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
    Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(designRef.current);
    setSaveStatus("saving");
    designRef.current = next;
    setDesignState(next);
    setHistory({ undo: undoRef.current.length, redo: redoRef.current.length });
    Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const { referenceHeight, canvasScale, cardWidth, cardHeight } = fitPostCanvas(stage.width, stage.height, design.format);
  const beginCanvasDrag = useCallback(() => {
    beginInteraction();
    const current = designRef.current;
    dragOrigin.current = selectedLayer === "visual" ? { x: current.imageOffsetX, y: current.imageOffsetY } : current.textPositions?.[selectedLayer] ?? { x: 0, y: 0 };
  }, [beginInteraction, selectedLayer]);
  const moveCanvasDrag = useCallback((x: number, y: number) => {
    const start = dragOrigin.current;
    if (selectedLayer === "visual") {
      liveApplyDesign(current => current.lockedLayers.includes("visual") ? current : { ...current, imageOffsetX: Math.max(-90, Math.min(90, start.x + x / canvasScale)), imageOffsetY: Math.max(-90, Math.min(90, start.y + y / canvasScale)) });
    } else {
      liveApplyDesign(current => positionText(current, selectedLayer, { x: snapTextPosition(start.x + x / canvasScale / postExportReferenceWidth * 100, snapEnabled), y: snapTextPosition(start.y + y / canvasScale / referenceHeight * 100, snapEnabled) }));
    }
  }, [canvasScale, referenceHeight, liveApplyDesign, selectedLayer, snapEnabled]);
  const canvasPan = useMemo(() => Gesture.Pan()
    .enabled((repositioning || (tool === "media" && selectedLayer === "visual")) && !isLocked(selectedLayer) && !isHidden(selectedLayer))
    .runOnJS(true).minDistance(2)
    // The gesture builder stores handlers; refs are read only during interaction.
    .onStart(beginCanvasDrag)
    .onUpdate(event => moveCanvasDrag(event.translationX, event.translationY))
    .onFinalize(endInteraction), [repositioning, tool, selectedLayer, isLocked, isHidden, beginCanvasDrag, moveCanvasDrag, endInteraction]);

  const chooseImage = useCallback(async () => {
    if (designRef.current.lockedLayers.includes("visual")) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 1 });
      if (!result.canceled) {
        const uri = await preserveStudioImage(result.assets[0].uri);
        applyDesign(current => replaceImage(current, uri, keepImageAdjustments));
        setImageIssue(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      }
    } catch (error) {
      Alert.alert("Couldn’t add photo", error instanceof Error ? error.message : "Check photo access and try again.");
    }
  }, [applyDesign, keepImageAdjustments]);

  const exportPost = useCallback(async function performExport(allowClipping = false) {
    if (!exportRef.current) return;
    if (design.imageUri && !design.hiddenLayers.includes("visual") && imageIssue) { Alert.alert("Replace missing photo", imageIssue); return; }
    const clipped = [!design.hiddenLayers.includes("headline") && overflow.headline ? "headline" : null, !design.hiddenLayers.includes("supporting") && overflow.supporting ? "summary" : null].filter(Boolean);
    if (!allowClipping && clipped.length && Platform.OS === "web") { setExportIssue("Text is clipped. Shorten it or reduce its size/spacing before exporting."); return; }
    if (!allowClipping && clipped.length) {
      Alert.alert("Text may be clipped", `The ${clipped.join(" and ")} exceeds the format’s line limit. Shorten it or reduce its size or spacing.`, [{ text: "Review text", style: "cancel" }, { text: "Export anyway", onPress: () => { void performExport(true); } }]);
      return;
    }
    setExporting(true);
    setExportIssue(null); setExportNotice(null);
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (Platform.OS === "web") {
        await downloadArtwork(exportRef.current as unknown as HTMLElement, design.format, safeFilename(design.headline));
        setExportNotice("PNG downloaded");
        return;
      }
      const snapshot = await makeImageFromView(exportRef);
      if (!snapshot) throw new Error("The artwork is still preparing.");
      const [outputWidth, outputHeight] = postOutputDimensions[design.format];
      const surface = Skia.Surface.MakeOffscreen(outputWidth, outputHeight);
      if (!surface) throw new Error("Couldn’t prepare the fixed-size export surface.");
      const paint = Skia.Paint();
      surface.getCanvas().drawImageRect(
        snapshot,
        Skia.XYWHRect(0, 0, snapshot.width(), snapshot.height()),
        Skia.XYWHRect(0, 0, outputWidth, outputHeight),
        paint,
        false,
      );
      surface.flush();
      const output = surface.makeImageSnapshot();
      if (output.width() !== outputWidth || output.height() !== outputHeight) {
        throw new Error("The exported image did not reach the required dimensions.");
      }
      const file = new File(Paths.cache, `${safeFilename(design.headline)}.png`);
      file.write(output.encodeToBytes(ImageFormat.PNG, 100));
      if (!await Sharing.isAvailableAsync()) throw new Error("Sharing is not available on this device.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      await Sharing.shareAsync(file.uri, { mimeType: "image/png", dialogTitle: "Share your news post" });
    } catch (error: any) {
      const message = error?.message || "Try again in a moment.";
      setExportIssue(message);
      if (Platform.OS !== "web") Alert.alert("Couldn’t export", message);
    } finally {
      setExporting(false);
    }
  }, [design.format, design.headline, design.imageUri, design.hiddenLayers, overflow, imageIssue]);

  const toggleLayerState = useCallback((key: "hiddenLayers" | "lockedLayers", layer: PostLayer) => {
    applyDesign((current) => {
      const values = current[key];
      return { ...current, [key]: values.includes(layer) ? values.filter((item) => item !== layer) : [...values, layer] };
    });
    Haptics.selectionAsync().catch(() => undefined);
  }, [applyDesign]);

  const canUndo = history.undo > 0;
  const canRedo = history.redo > 0;

  return (
    <View style={[styles.screen, { backgroundColor: studio.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderBottomColor: studio.border }]}>
        <View style={styles.headerMain}>
          <Button accessibilityLabel="Close editor" variant="ghost" size="icon" onPress={() => { void closeEditor(); }}><X size={layout.iconSize} color={studio.textPrimary} /></Button>
          <View style={styles.headerTitle}><AppText variant="heading3" numberOfLines={1}>{preview ? "Post editor" : initialDraft.name}</AppText></View>
          <Button accessibilityLabel="Export post" disabled={exporting || Boolean(design.imageUri && !design.hiddenLayers.includes("visual") && imageIssue)} onPress={() => { void exportPost(); }} style={styles.exportButton}><Share2 size={layout.iconSmall} color={studio.onPrimary} /><AppText variant="label" colorToken="onPrimary">{exporting ? "Exporting…" : "Export"}</AppText></Button>
        </View>
        <View style={styles.headerSub}>
          <Pressable accessibilityRole="button" accessibilityLabel={saveStatus === "error" ? "Retry saving draft" : "Save draft"} onPress={() => { void persistDesign(); }} style={styles.saveStatus}>
            <View style={[styles.saveMark, { backgroundColor: saveStatus === "saved" ? colors.success : saveStatus === "error" ? colors.brandRed : colors.warning }]} />
            <AppText variant="caption" colorToken={saveStatus === "error" ? "brandRed" : "textSecondary"}>{saveStatus === "saved" ? preview ? "Sample draft · saved locally" : "All changes saved" : saveStatus === "saving" ? "Saving changes…" : "Save failed · tap to retry"}</AppText>
          </Pressable>
          <View style={styles.historyActions}>
            <Button accessibilityLabel="Undo" variant="ghost" size="icon" disabled={!canUndo} onPress={undo}><Undo2 size={layout.iconSmall} color={studio.textSecondary} /></Button>
            <Button accessibilityLabel="Redo" variant="ghost" size="icon" disabled={!canRedo} onPress={redo}><Redo2 size={layout.iconSmall} color={studio.textSecondary} /></Button>
          </View>
        </View>
        {exportIssue ? <AppText variant="caption" colorToken="brandRed">Export failed: {exportIssue}</AppText> : exportNotice ? <AppText variant="caption" colorToken="success">{exportNotice}</AppText> : null}
        {imageIssue && design.imageUri ? <AppText variant="caption" colorToken="brandRed">Photo needs replacement: {imageIssue}</AppText> : null}
        {(!design.hiddenLayers.includes("headline") && overflow.headline) || (!design.hiddenLayers.includes("supporting") && overflow.supporting) ? <AppText variant="caption" colorToken="brandRed">Text exceeds this format’s line limit. Shorten it or reduce size/spacing before export.</AppText> : null}
      </View>
      <KeyboardAvoidingView style={[styles.editorBody, { flexDirection: wide ? "row" : "column" }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.workspace, { backgroundColor: studio.surfaceSecondary }]} onLayout={event => { const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout; setStage(current => current.width === nextWidth && current.height === nextHeight ? current : { width: nextWidth, height: nextHeight }); }}>
        <View style={styles.canvasMeta}>
          <AppText variant="caption" weight="semibold">{imageIssue && design.imageUri ? "Replace photo" : (!design.hiddenLayers.includes("headline") && overflow.headline) || (!design.hiddenLayers.includes("supporting") && overflow.supporting) ? "Check text fit" : repositioning ? "Drag selected text" : formats[design.format].label}</AppText>
          <AppText variant="caption" colorToken="textSecondary">{postOutputDimensions[design.format][0]} × {postOutputDimensions[design.format][1]}</AppText>
        </View>
        <View style={[styles.artboardShell, { width: cardWidth, height: cardHeight, borderColor: studio.border }]}>
          <GestureDetector gesture={canvasPan}>
            <View ref={previewRef} collapsable={false} style={[styles.artboard, { width: postExportReferenceWidth, height: referenceHeight, backgroundColor: "#111318", left: (cardWidth - postExportReferenceWidth) / 2, top: (cardHeight - referenceHeight) / 2, transform: [{ scale: canvasScale }] }]}>
              <ArtworkImage design={design} height={referenceHeight} />
              <Pressable disabled={repositioning || isLocked("visual")} onPress={() => selectLayer("visual", "media")} style={StyleSheet.absoluteFill} />
              {!isHidden("visual") && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: imageTint(design.imageTone) }]} />}
              {!design.imageUri && !isHidden("visual") && <Pressable onPress={chooseImage} style={styles.emptyVisual}><ImagePlus size={20} color="rgba(255,255,255,0.38)" /><AppText variant="meta" style={styles.emptyVisualText}>ADD VISUAL</AppText></Pressable>}
              <View pointerEvents="none" style={[styles.artboardAccent, { backgroundColor: design.accent }]} />
              <View style={styles.artboardContent} pointerEvents={exporting ? "none" : "auto"}>
                <View style={styles.artboardTop}>
                  <ArtworkBrand format={design.format} />
                  {!isHidden("kicker") && <Pressable disabled={repositioning || isLocked("kicker")} onPress={() => selectLayer("kicker")} style={selectedLayer === "kicker" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="meta" style={[styles.categoryText, textColorStyle(design, "kicker"), textTypographyStyle(design, "kicker", design.category)]}>{design.category || "NEWS"}</AppText></Pressable>}
                </View>
                <View style={[styles.copyGroup, { alignItems: design.textAlign === "center" ? "center" : "flex-start" }]}>
                  {!isHidden("kicker") && <Pressable disabled={repositioning || isLocked("kicker")} onPress={() => selectLayer("kicker")} style={selectedLayer === "kicker" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="meta" style={[styles.kicker, { textAlign: design.textAlign }, textPositionStyle(design, "kicker"), textColorStyle(design, "kicker"), textTypographyStyle(design, "kicker")]}>{design.eyebrow || "THE LEADERS"}</AppText></Pressable>}
                  {!isHidden("headline") && <Pressable disabled={repositioning || isLocked("headline")} onPress={() => selectLayer("headline")} style={selectedLayer === "headline" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="body" style={[styles.artHeadline, { fontSize: (design.format === "landscape" ? 20 : 29) * design.headlineScale, lineHeight: (design.format === "landscape" ? 22 : 31) * design.headlineScale, textAlign: design.textAlign }, textPositionStyle(design, "headline"), textColorStyle(design, "headline"), textTypographyStyle(design, "headline")]} numberOfLines={design.format === "landscape" ? 3 : design.format === "story" ? 6 : 4}>{design.headline || "Your headline belongs here."}</AppText></Pressable>}
                  {!isHidden("supporting") && <Pressable disabled={repositioning || isLocked("supporting")} onPress={() => selectLayer("supporting")} style={selectedLayer === "supporting" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="meta" style={[styles.artSummary, { textAlign: design.textAlign, ...(design.format === "landscape" ? { fontSize: 10, lineHeight: 13, marginTop: 6 } : {}) }, textPositionStyle(design, "supporting"), textColorStyle(design, "supporting"), textTypographyStyle(design, "supporting")]} numberOfLines={design.format === "landscape" ? 2 : design.format === "story" ? 4 : 3}>{design.summary}</AppText></Pressable>}
                </View>
                {!isHidden("footer") && <Pressable disabled={repositioning || isLocked("footer")} onPress={() => selectLayer("footer")} style={[selectedLayer === "footer" && !exporting ? styles.selectedObject : undefined, styles.artboardBottom, textPositionStyle(design, "footer")]}><AppText variant="meta" style={[styles.artFoot, textColorStyle(design, "footer"), textTypographyStyle(design, "footer")]}>{design.author || "THE LEADERS DESK"}</AppText><AppText variant="meta" style={[styles.artFoot, textColorStyle(design, "footer"), textTypographyStyle(design, "footer")]}>TODAY</AppText></Pressable>}
              </View>
              {repositioning && !exporting ? <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <View style={styles.safeGuide} /><View style={styles.horizontalGuide} /><View style={styles.verticalGuide} />
              </View> : null}
            </View>
          </GestureDetector>
        </View>
      </View>

      <View style={[styles.inspector, { height: wide ? "100%" : inspectorHeight + insets.bottom, width: wide ? layout.editorInspectorWidth : "100%", backgroundColor: studio.background, borderColor: studio.border, paddingBottom: insets.bottom }]}>
        <View style={[styles.toolTabs, { borderBottomColor: studio.border }]}>
          {([{ value: "text", label: "Text", Icon: Type }, { value: "layout", label: "Layout", Icon: LayoutTemplate }, { value: "media", label: "Media", Icon: ImagePlus }, { value: "layers", label: "Layers", Icon: Layers3 }] as const).map(({ value, label, Icon }) => <Pressable key={value} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: tool === value }} onPress={() => selectTool(value)} style={[styles.toolTab, { borderBottomColor: tool === value ? studio.brandRed : "transparent" }]}><Icon size={layout.iconSize} color={tool === value ? studio.brandRed : studio.textSecondary} /><AppText variant="caption" weight="semibold" colorToken={tool === value ? "brandRed" : "textSecondary"}>{label}</AppText></Pressable>)}
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.inspectorScroll}>
          <Inspector tool={tool} design={design} selectedLayer={selectedLayer} colors={studio} update={update} applyDesign={applyDesign} chooseImage={chooseImage} selectLayer={selectLayer} toggleLayerState={toggleLayerState} beginInteraction={beginInteraction} endInteraction={endInteraction} liveApplyDesign={liveApplyDesign} repositioning={repositioning} setRepositioning={setRepositioning} snapEnabled={snapEnabled} setSnapEnabled={setSnapEnabled} keepImageAdjustments={keepImageAdjustments} setKeepImageAdjustments={setKeepImageAdjustments} />
        </ScrollView>
      </View>
      </KeyboardAvoidingView>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" collapsable={false} style={styles.exportStaging}>
        <ExportArtboard ref={exportRef} design={design} />
        {(["headline", "supporting"] as const).map(layer => {
          const typeStyle = textTypographyStyle(design, layer);
          const content = layer === "headline" ? design.headline || "Your headline belongs here." : design.summary;
          return <AppText key={`${layer}-${content}-${JSON.stringify(typeStyle)}-${design.format}`} variant={layer === "headline" ? "body" : "meta"} style={[layer === "headline" ? styles.artHeadline : styles.artSummary, typeStyle, { width: postExportReferenceWidth - 34, marginTop: 0 }]} onLayout={event => { const clipped = exceedsTextLines(event.nativeEvent.layout.height, typeStyle.lineHeight, textLineLimit(design.format, layer)); setOverflow(current => current[layer] === clipped ? current : { ...current, [layer]: clipped }); }}>{content}</AppText>;
        })}
      </View>
    </View>
  );
}



function Inspector({ tool, design, selectedLayer, colors, update, applyDesign, chooseImage, selectLayer, toggleLayerState, beginInteraction, endInteraction, liveApplyDesign, repositioning, setRepositioning, snapEnabled, setSnapEnabled, keepImageAdjustments, setKeepImageAdjustments }: { tool: Tool; design: PostDesign; selectedLayer: PostLayer; colors: ReturnType<typeof useColors>; update: <K extends keyof PostDesign>(key: K, value: PostDesign[K]) => void; applyDesign: (next: DesignUpdater, record?: boolean) => void; chooseImage: () => void; selectLayer: (layer: PostLayer, tool?: Tool) => void; toggleLayerState: (key: "hiddenLayers" | "lockedLayers", layer: PostLayer) => void; beginInteraction: () => void; endInteraction: () => void; liveApplyDesign: (next: DesignUpdater) => void; repositioning: boolean; setRepositioning: (value: boolean) => void; snapEnabled: boolean; setSnapEnabled: (value: boolean) => void; keepImageAdjustments: boolean; setKeepImageAdjustments: (value: boolean) => void }) {
  const choice = (label: string, active: boolean, onPress: () => void) => <Button key={label} variant={active ? "secondary" : "outline"} accessibilityState={{ selected: active }} onPress={onPress} style={{ flex: 1, borderColor: active ? colors.brandRed : colors.border }}><AppText variant="caption" weight="semibold" colorToken={active ? "brandRed" : "textPrimary"}>{label}</AppText></Button>;
  if (tool === "text") {
    const fields = [{ layer: "headline", key: "headline", label: "Headline" }, { layer: "supporting", key: "summary", label: "Summary" }, { layer: "kicker", key: "eyebrow", label: "Kicker" }, { layer: "footer", key: "author", label: "Byline" }] as const;
    const field = fields.find(item => item.layer === selectedLayer) ?? fields[0];
    const locked = design.lockedLayers.includes(field.layer);
    const typography = design.textTypography?.[field.layer] ?? defaultTextTypography()[field.layer];
    return <View style={styles.panel}>
      <View style={styles.flexControls}>{fields.map(item => choice(item.label, field.layer === item.layer, () => selectLayer(item.layer, "text")))}</View>
      <View style={styles.field}>
        <AppText variant="label">{field.label}{locked ? " · locked" : ""}</AppText>
        <TextInput accessibilityLabel={`Edit ${field.label.toLowerCase()}`} value={design[field.key]} editable={!locked} onChangeText={value => update(field.key, field.key === "eyebrow" ? value.toUpperCase() : value)} multiline={field.key === "headline" || field.key === "summary"} textAlignVertical="top" placeholder={`Enter ${field.label.toLowerCase()}`} placeholderTextColor={colors.textMuted} style={[styles.textInput, { fontFamily: hasDevanagari(design[field.key]) ? fontFamilies.ui.ne.regular : fontFamilies.ui.en.medium, letterSpacing: 0, includeFontPadding: true, lineHeight: hasDevanagari(design[field.key]) ? 28 : 24, color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]} />
      </View>
      <InspectorSection key={`${field.layer}-type`} title="Typography">
        <View style={styles.flexControls}>{(["auto", "onest", "hind"] as const).map(font => <Button key={font} disabled={locked} accessibilityLabel={`${field.label} font: ${font}`} accessibilityState={{ selected: typography.font === font }} variant={typography.font === font ? "secondary" : "outline"} style={{ flex: 1 }} onPress={() => applyDesign(current => setTextTypography(current, field.layer, { font }))}><AppText variant="caption">{font === "auto" ? "Auto" : font === "onest" ? "Onest" : "Hind"}</AppText></Button>)}</View>
        <AppText variant="caption" colorToken="textSecondary">English uses your chosen font. Nepali uses Hind to keep vowel marks and joined letters intact.</AppText>
        {([{ key: "size", label: "size", min: 60, max: 160 }, { key: "lineSpacing", label: "line spacing", min: 90, max: 180 }, { key: "shadow", label: "shadow", min: 0, max: 100 }] as const).map(setting => <StudioSlider key={`${field.layer}-${setting.key}`} label={`${field.label} ${setting.label}`} min={setting.min} max={setting.max} value={setting.key === "size" && field.layer === "headline" ? Math.round(design.headlineScale * 100) : typography[setting.key]} disabled={locked} onStart={beginInteraction} onChange={value => liveApplyDesign(current => setTextTypography(current, field.layer, { [setting.key]: value }))} onEnd={value => { liveApplyDesign(current => setTextTypography(current, field.layer, { [setting.key]: value })); endInteraction(); }} />)}
      </InspectorSection>
      <InspectorSection key={`${field.layer}-color`} title="Font color"><TextColorPicker showTitle={false} key={`${field.layer}-${design.textColors?.[field.layer] ?? "default"}`} label={field.label} color={design.textColors?.[field.layer] ?? null} disabled={locked} onChange={color => applyDesign(current => setTextColor(current, field.layer, color))} /></InspectorSection>
      <InspectorSection key={`${field.layer}-position`} title="Position">
        <View style={[styles.settingRow, { justifyContent: "flex-end" }]}><Button variant="ghost" disabled={locked} accessibilityLabel={`Reset ${field.label.toLowerCase()} position`} onPress={() => applyDesign(current => positionText(current, field.layer, { x: 0, y: 0 }))}><RotateCcw size={layout.iconSmall} color={colors.textSecondary} /><AppText variant="caption">Reset</AppText></Button></View>
        <AppText variant="caption" colorToken="textSecondary">Move this text from its template position.</AppText>
        <Button variant="outline" accessibilityRole="switch" accessibilityLabel="Snap to template position" accessibilityState={{ checked: snapEnabled }} onPress={() => setSnapEnabled(!snapEnabled)}><AppText variant="caption">Snap to template position · {snapEnabled ? "On" : "Off"}</AppText></Button>
        <AppText variant="caption" colorToken="textSecondary">Reposition shows centre guides and safe margins. Snapping returns near-zero offsets to the template position.</AppText>
        <Button variant={repositioning ? "default" : "outline"} disabled={locked || design.hiddenLayers.includes(field.layer)} accessibilityState={{ selected: repositioning }} onPress={() => { if (field.layer !== selectedLayer) selectLayer(field.layer, "text"); setRepositioning(!repositioning); }}><Move size={layout.iconSize} color={repositioning ? colors.onPrimary : colors.textPrimary} /><AppText variant="label" colorToken={repositioning ? "onPrimary" : "textPrimary"}>{repositioning ? "Done repositioning" : "Reposition on canvas"}</AppText></Button>
        {(["x", "y"] as const).map(axis => <StudioSlider key={`${field.layer}-${axis}`} orientation={axis === "y" ? "vertical" : "horizontal"} label={`${field.label} ${axis === "x" ? "horizontal" : "vertical"} position`} min={-50} max={50} disabled={locked} value={design.textPositions?.[field.layer]?.[axis] ?? 0} onStart={beginInteraction} onChange={value => liveApplyDesign(current => positionText(current, field.layer, { [axis]: value }))} onEnd={value => { liveApplyDesign(current => positionText(current, field.layer, { [axis]: value })); endInteraction(); }} />)}
      </InspectorSection>
      <View style={styles.settingRow}><AppText variant="bodySmall">Alignment</AppText><View style={styles.alignmentGroup}>{(["left", "center"] as TextAlignment[]).map(alignment => <Button key={alignment} accessibilityLabel={`Align ${alignment}`} accessibilityState={{ selected: design.textAlign === alignment }} variant={design.textAlign === alignment ? "secondary" : "ghost"} size="icon" onPress={() => update("textAlign", alignment)}>{alignment === "left" ? <AlignLeft size={layout.iconSize} color={colors.textPrimary} /> : <AlignCenter size={layout.iconSize} color={colors.textPrimary} />}</Button>)}</View></View>
    </View>;
  }
  if (tool === "layout") return <View style={styles.panel}>
    <View style={styles.field}><AppText variant="label">Post format</AppText><View style={styles.formatControls}>{(Object.keys(formats) as PostFormat[]).map(format => <Button key={format} variant={design.format === format ? "secondary" : "outline"} accessibilityState={{ selected: design.format === format }} onPress={() => update("format", format)} style={[styles.formatChoice, { borderColor: design.format === format ? colors.brandRed : colors.border }]}><AppText variant="caption" weight="semibold" colorToken={design.format === format ? "brandRed" : "textPrimary"}>{formats[format].label}</AppText></Button>)}</View><AppText variant="caption" colorToken="textSecondary">{postOutputDimensions[design.format][0]} × {postOutputDimensions[design.format][1]} px</AppText></View>
    <TextColorPicker key={`accent-${design.accent}`} title="Artwork accent" label="Artwork accent" color={design.accent} resetColor={brand.red} disabled={false} onChange={color => update("accent", color ?? brand.red)} />
    <View style={styles.field}><AppText variant="label">Template</AppText>{postTemplates.map(template => <Pressable accessibilityRole="radio" accessibilityState={{ checked: design.template === template.key }} key={template.key} onPress={() => applyDesign(current => ({ ...current, template: template.key, ...template.patch }))} style={[styles.templateChoice, { borderColor: design.template === template.key ? colors.brandRed : colors.border, backgroundColor: colors.surfaceSecondary }]}><View style={{ flex: 1 }}><AppText variant="bodySmall" weight="semibold">{template.title}</AppText><AppText variant="caption" colorToken="textSecondary">{template.subtitle}</AppText></View>{design.template === template.key ? <Check size={layout.iconSize} color={colors.brandRed} /> : null}</Pressable>)}</View>
  </View>;
  if (tool === "media") return <View style={styles.panel}>
    <AppText variant="heading3">{design.imageUri ? "Background image" : "Add a background"}</AppText>
    <AppText variant="bodySmall" colorToken="textSecondary">{design.imageUri ? "Drag the image on the canvas to position it." : "Choose a photo from your device for this post."}</AppText>
    <Button disabled={design.lockedLayers.includes("visual")} onPress={chooseImage}><ImagePlus size={layout.iconSize} color={colors.onPrimary} /><AppText variant="label" colorToken="onPrimary">{design.imageUri ? "Replace image" : "Choose image"}</AppText></Button>
    {design.imageUri ? <Button variant="outline" disabled={design.lockedLayers.includes("visual")} accessibilityRole="switch" accessibilityLabel="Keep adjustments when replacing image" accessibilityState={{ checked: keepImageAdjustments }} onPress={() => setKeepImageAdjustments(!keepImageAdjustments)}><AppText variant="caption">Keep adjustments on replace · {keepImageAdjustments ? "On" : "Off"}</AppText></Button> : null}
    <View style={styles.field}>
      <AppText variant="label">Image crop</AppText>
      <View style={styles.flexControls}>{([{ value: "cover", label: "Fill canvas" }, { value: "contain", label: "Fit whole photo" }] as const).map(fit => <Button key={fit.value} variant={(design.imageFit ?? "cover") === fit.value ? "secondary" : "outline"} disabled={!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual")} accessibilityState={{ selected: (design.imageFit ?? "cover") === fit.value }} style={{ flex: 1 }} onPress={() => applyDesign(current => setImageFit(current, fit.value))}><AppText variant="caption">{fit.label}</AppText></Button>)}</View>
      <AppText variant="caption" colorToken="textSecondary">Fill crops to the format. Fit shows the whole photo. Use zoom and the ball to refine the crop.</AppText>
    </View>
    <ImageScrollBall x={design.imageOffsetX} y={design.imageOffsetY} disabled={!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual")} disabledReason={!design.imageUri ? "Choose an image to enable positioning." : design.lockedLayers.includes("visual") ? "Unlock the image layer to reposition it." : "Show the image layer to reposition it."} onStart={beginInteraction} onMove={(dx, dy) => liveApplyDesign(current => moveImage(current, dx, dy))} onEnd={endInteraction} />
    <StudioSlider label="Image zoom" min={100} max={300} step={1} disabled={!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual")} value={Math.round((design.imageZoom ?? 1.08) * 100)} onStart={beginInteraction} onChange={value => liveApplyDesign(current => current.lockedLayers.includes("visual") ? current : { ...current, imageZoom: value / 100 })} onEnd={value => { liveApplyDesign(current => current.lockedLayers.includes("visual") ? current : { ...current, imageZoom: value / 100 }); endInteraction(); }} />
    <InspectorSection title="Image effects">
      <View style={[styles.settingRow, { justifyContent: "flex-end" }]}><Button variant="ghost" accessibilityLabel="Reset image effects" disabled={!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual") || !(design.imageBlur || design.imageVintage || design.imageFeather)} onPress={() => applyDesign(current => imageEffectControls.reduce((next, effect) => setImageEffect(next, effect.key, 0), current))}><RotateCcw size={layout.iconSmall} color={colors.textSecondary} /><AppText variant="caption">Reset</AppText></Button></View>
      <AppText variant="caption" colorToken="textSecondary">Soften the photo, add a faded sepia finish, or blend its edges.</AppText>
      {imageEffectControls.map(effect => <StudioSlider key={effect.key} label={effect.label} min={0} max={100} value={design[effect.key] ?? 0} disabled={!design.imageUri || design.lockedLayers.includes("visual") || design.hiddenLayers.includes("visual")} onStart={beginInteraction} onChange={value => liveApplyDesign(current => setImageEffect(current, effect.key, value))} onEnd={value => { liveApplyDesign(current => setImageEffect(current, effect.key, value)); endInteraction(); }} />)}
    </InspectorSection>
    <View style={styles.field}><AppText variant="label">Image tone</AppText><View style={styles.flexControls}>{(["ink", "clear", "warm"] as ImageTone[]).map(tone => choice(tone[0].toUpperCase() + tone.slice(1), design.imageTone === tone, () => applyDesign(current => current.lockedLayers.includes("visual") ? current : { ...current, imageTone: tone })))}</View></View>
    <Button variant="outline" disabled={!design.imageUri || design.lockedLayers.includes("visual")} onPress={() => applyDesign(resetImageAdjustments)}><RotateCcw size={layout.iconSmall} color={colors.textPrimary} /><AppText variant="caption">Reset all image adjustments</AppText></Button>
    <View style={styles.flexControls}><Button variant="outline" disabled={!design.imageUri || design.lockedLayers.includes("visual")} style={{ flex: 1 }} onPress={() => applyDesign(current => current.lockedLayers.includes("visual") ? current : { ...current, imageOffsetX: 0, imageOffsetY: 0 })}><Move size={layout.iconSmall} color={colors.textPrimary} /><AppText variant="caption">Reset position</AppText></Button>{design.imageUri ? <Button variant="ghost" disabled={design.lockedLayers.includes("visual")} style={{ flex: 1 }} onPress={() => applyDesign(current => current.lockedLayers.includes("visual") ? current : { ...current, imageUri: null })}><Trash2 size={layout.iconSmall} color={colors.brandRed} /><AppText variant="caption" colorToken="brandRed">Remove</AppText></Button> : null}</View>
  </View>;
  return <View style={styles.panel}>
    <AppText variant="heading3">Layers</AppText><AppText variant="bodySmall" colorToken="textSecondary">Select a layer, or control its visibility and lock.</AppText>
    {layerItems.map(layer => {
      const hidden = design.hiddenLayers.includes(layer.key), locked = design.lockedLayers.includes(layer.key);
      return <View key={layer.key} style={[styles.layerRow, { borderBottomColor: colors.border }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Select ${layer.label}`} onPress={() => selectLayer(layer.key, layer.key === "visual" ? "media" : "text")} style={styles.layerName}><AppText variant="bodySmall" weight="semibold" colorToken={selectedLayer === layer.key ? "brandRed" : "textPrimary"}>{layer.label}</AppText><AppText variant="caption" colorToken="textSecondary">{hidden ? "Hidden" : "Visible"}{locked ? " · locked" : ""}</AppText></Pressable>
        <Button accessibilityLabel={hidden ? `Show ${layer.label}` : `Hide ${layer.label}`} variant="ghost" size="icon" onPress={() => toggleLayerState("hiddenLayers", layer.key)}>{hidden ? <EyeOff size={layout.iconSize} color={colors.textSecondary} /> : <Eye size={layout.iconSize} color={colors.textPrimary} />}</Button>
        <Button accessibilityLabel={locked ? `Unlock ${layer.label}` : `Lock ${layer.label}`} variant="ghost" size="icon" onPress={() => toggleLayerState("lockedLayers", layer.key)}>{locked ? <Lock size={layout.iconSize} color={colors.brandRed} /> : <LockOpen size={layout.iconSize} color={colors.textSecondary} />}</Button>
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xs, borderBottomWidth: layout.ruleWidth },
  headerMain: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerTitle: { flex: 1, minWidth: 0 },
  headerSub: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  saveStatus: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: layout.touchTarget, flex: 1 },
  saveMark: { width: 6, height: 6, borderRadius: radius.full },
  historyActions: { flexDirection: "row" },
  exportButton: { paddingHorizontal: spacing.lg, borderRadius: radius.md },
  editorBody: { flex: 1, minHeight: 0 },
  workspace: { flex: 1, minHeight: 0, padding: spacing.lg, justifyContent: "center", alignItems: "center", gap: spacing.md },
  canvasMeta: { width: "100%", maxWidth: 420, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  artboardShell: { overflow: "hidden", borderRadius: radius.xs, borderWidth: StyleSheet.hairlineWidth, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  inspector: { borderTopWidth: layout.ruleWidth, borderLeftWidth: StyleSheet.hairlineWidth },
  toolTabs: { flexDirection: "row", borderBottomWidth: layout.ruleWidth },
  toolTab: { flex: 1, minHeight: layout.tabHeight, alignItems: "center", justifyContent: "center", gap: spacing.xs, borderBottomWidth: 2 },
  inspectorScroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  panel: { gap: spacing.lg },
  field: { gap: spacing.sm },
  flexControls: { flexDirection: "row", gap: spacing.xs },
  formatControls: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  formatChoice: { flexBasis: "47%", flexGrow: 1 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  alignmentGroup: { flexDirection: "row", gap: spacing.xs },
  textInput: { minHeight: 96, borderWidth: layout.ruleWidth, borderRadius: radius.md, padding: spacing.md, fontFamily: fontFamilies.ui.en.medium, fontSize: 16, lineHeight: 24 },
  slider: { height: layout.touchTarget, width: "100%" },
  colorControls: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  colorSwatch: { width: layout.touchTarget, height: layout.touchTarget, borderWidth: 3, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  templateChoice: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderWidth: layout.ruleWidth, borderRadius: radius.md, gap: spacing.md },
  layerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderBottomWidth: layout.ruleWidth, paddingBottom: spacing.sm },
  layerName: { flex: 1, minHeight: layout.touchTarget, justifyContent: "center", gap: spacing.xs },
  artboard: { overflow: "hidden" },
  safeGuide: { position: "absolute", top: 17, bottom: 17, left: 17, right: 17, borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.65)" },
  verticalGuide: { position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, backgroundColor: "rgba(88,204,238,0.75)" },
  horizontalGuide: { position: "absolute", left: 0, right: 0, top: "50%", height: 1, backgroundColor: "rgba(88,204,238,0.75)" },
  exportStaging: { position: "absolute", left: -10000, top: -10000 },
  emptyVisual: { position: "absolute", top: 60, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  emptyVisualText: { color: "rgba(255,255,255,0.42)", fontWeight: "800", letterSpacing: 0.7 },
  artboardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 6 },
  artboardContent: { flex: 1, justifyContent: "space-between", padding: 17 },
  artboardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryText: { color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 0.9, borderWidth: 1, borderColor: "rgba(255,255,255,0.66)", paddingHorizontal: 7, paddingVertical: 4 },
  copyGroup: { maxWidth: "100%" },
  kicker: { color: "rgba(255,255,255,0.73)", fontSize: 9, letterSpacing: 1.3, fontWeight: "800", marginBottom: 7 },
  artHeadline: { color: "#fff", fontFamily: fontFamilies.ui.en.semibold, letterSpacing: -0.9 },
  artSummary: { color: "rgba(255,255,255,0.84)", fontSize: 11, lineHeight: 16, marginTop: 10 },
  artboardBottom: { paddingTop: 9, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.32)", flexDirection: "row", justifyContent: "space-between", minWidth: "100%" },
  artFoot: { color: "rgba(255,255,255,0.78)", fontSize: 8, letterSpacing: 0.7, fontWeight: "800" },
  selectedObject: { backgroundColor: "rgba(183,28,28,0.12)", borderRadius: radius.xs },
  footerSelection: { flexDirection: "row", justifyContent: "space-between", paddingTop: 9, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.32)", minWidth: "100%" },
});
