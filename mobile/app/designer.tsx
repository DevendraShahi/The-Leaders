import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View, useWindowDimensions, type View as ViewType } from "react-native";
import { Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetScrollView, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { ImageFormat, makeImageFromView } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { AlignCenter, AlignLeft, Check, Eye, EyeOff, ImagePlus, Layers3, LayoutTemplate, Lock, LockOpen, Move, Redo2, Share2, Type, Undo2, X } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppText as UiText } from "@/ui/primitives/AppText";
import { AppText } from "@/ui/primitives/AppText";
import { useColors } from "@/theme/Theme";
import { defaultPostDesign, postTemplates, type ImageTone, type PostDesign, type PostFormat, type PostLayer, type TextAlignment } from "@/features/post-designer/types";

type Tool = "text" | "layout" | "media" | "layers";
type DesignUpdater = PostDesign | ((current: PostDesign) => PostDesign);

const DRAFT_KEY = "the-leaders:creator-studio:mobile-draft";
const accents = ["#D3222A", "#2A61A8", "#D86D2A", "#16836D", "#6952A8"];
const formats: Record<PostFormat, { label: string; ratio: number; aspect: [number, number] }> = {
  square: { label: "Square", ratio: 1, aspect: [1, 1] },
  portrait: { label: "Portrait", ratio: 4 / 5, aspect: [4, 5] },
  story: { label: "Story", ratio: 9 / 16, aspect: [9, 16] },
};
const layerItems: Array<{ key: PostLayer; label: string; kind: string }> = [
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

export default function DesignerScreen() {
  const colors = useColors();
  const studio = useMemo(() => ({ ...colors, background: "#0B0C0E", surface: "#15171B", surfaceSecondary: "#202329", textPrimary: "#F4F2EC", textSecondary: "#AFB2BA", textMuted: "#70747D", border: "#353941", brandRed: "#D3222A" }), [colors]);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const previewRef = useRef<ViewType>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const designRef = useRef<PostDesign>(defaultPostDesign);
  const undoRef = useRef<PostDesign[]>([]);
  const redoRef = useRef<PostDesign[]>([]);
  const [design, setDesignState] = useState<PostDesign>(defaultPostDesign);
  const [tool, setTool] = useState<Tool>("text");
  const [selectedLayer, setSelectedLayer] = useState<PostLayer>("headline");
  const [hydrated, setHydrated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const snapPoints = useMemo(() => [224, Math.min(Math.round(height * 0.5), 430)], [height]);

  const applyDesign = useCallback((next: DesignUpdater, record = true) => {
    const current = designRef.current;
    const resolved = typeof next === "function" ? next(current) : next;
    if (JSON.stringify(current) === JSON.stringify(resolved)) return;
    if (record) {
      undoRef.current = [...undoRef.current.slice(-39), current];
      redoRef.current = [];
    }
    designRef.current = resolved;
    setDesignState(resolved);
    setHistoryVersion((value) => value + 1);
  }, []);

  const update = useCallback(<K extends keyof PostDesign>(key: K, value: PostDesign[K]) => {
    applyDesign((current) => ({ ...current, [key]: value }));
  }, [applyDesign]);

  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY)
      .then((stored) => {
        if (!stored) return;
        const restored = { ...defaultPostDesign, ...JSON.parse(stored) } as PostDesign;
        designRef.current = restored;
        setDesignState(restored);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(design)).catch(() => undefined), 380);
    return () => clearTimeout(timer);
  }, [design, hydrated]);

  const isHidden = useCallback((layer: PostLayer) => design.hiddenLayers.includes(layer), [design.hiddenLayers]);
  const isLocked = useCallback((layer: PostLayer) => design.lockedLayers.includes(layer), [design.lockedLayers]);

  const selectLayer = useCallback((layer: PostLayer, nextTool?: Tool) => {
    setSelectedLayer(layer);
    setTool(nextTool ?? (layer === "visual" ? "media" : "text"));
    sheetRef.current?.snapToIndex(0);
    Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const selectTool = useCallback((nextTool: Tool) => {
    setTool(nextTool);
    if (nextTool === "media") setSelectedLayer("visual");
    sheetRef.current?.snapToIndex(0);
    Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const undo = useCallback(() => {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push(designRef.current);
    designRef.current = previous;
    setDesignState(previous);
    setHistoryVersion((value) => value + 1);
    Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(designRef.current);
    designRef.current = next;
    setDesignState(next);
    setHistoryVersion((value) => value + 1);
    Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const nudgeImage = useCallback((x: number, y: number) => {
    applyDesign((current) => ({
      ...current,
      imageOffsetX: Math.max(-90, Math.min(90, current.imageOffsetX + x)),
      imageOffsetY: Math.max(-90, Math.min(90, current.imageOffsetY + y)),
    }));
  }, [applyDesign]);

  const imagePan = useMemo(() => Gesture.Pan()
    .enabled(tool === "media" && selectedLayer === "visual" && !isLocked("visual"))
    .minDistance(5)
    .onBegin(() => runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light))
    .onEnd((event) => runOnJS(nudgeImage)(event.translationX, event.translationY)), [isLocked, nudgeImage, selectedLayer, tool]);

  const maxCanvasHeight = Math.max(260, height - insets.top - 356);
  const maxCanvasWidth = width - 52;
  const ratio = formats[design.format].ratio;
  let cardWidth = Math.min(maxCanvasWidth, design.format === "story" ? 252 : 346);
  if (cardWidth / ratio > maxCanvasHeight) cardWidth = maxCanvasHeight * ratio;
  const cardHeight = Math.round(cardWidth / ratio);

  const chooseImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: formats[design.format].aspect, quality: 1 });
      if (!result.canceled) {
        applyDesign((current) => ({ ...current, imageUri: result.assets[0].uri, imageOffsetX: 0, imageOffsetY: 0 }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      }
    } catch {
      Alert.alert("Couldn’t open photos", "Check photo access in your device settings and try again.");
    }
  }, [applyDesign, design.format]);

  const exportPost = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const snapshot = await makeImageFromView(previewRef);
      if (!snapshot) throw new Error("The artwork is still preparing.");
      const file = new File(Paths.cache, `${safeFilename(design.headline)}.png`);
      file.write(snapshot.encodeToBytes(ImageFormat.PNG, 100));
      if (!await Sharing.isAvailableAsync()) throw new Error("Sharing is not available on this device.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      await Sharing.shareAsync(file.uri, { mimeType: "image/png", dialogTitle: "Share your news post" });
    } catch (error: any) {
      Alert.alert("Couldn’t export", error?.message || "Try again in a moment.");
    } finally {
      setExporting(false);
    }
  }, [design.headline]);

  const toggleLayerState = useCallback((key: "hiddenLayers" | "lockedLayers", layer: PostLayer) => {
    applyDesign((current) => {
      const values = current[key];
      return { ...current, [key]: values.includes(layer) ? values.filter((item) => item !== layer) : [...values, layer] };
    });
    Haptics.selectionAsync().catch(() => undefined);
  }, [applyDesign]);

  const canUndo = historyVersion >= 0 && undoRef.current.length > 0;
  const canRedo = historyVersion >= 0 && redoRef.current.length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: studio.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: studio.border }]}> 
        <Button accessibilityLabel="Close editor" variant="outline" size="icon" onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} className="rounded-none border-border bg-transparent" style={styles.iconButton} hitSlop={8}><X size={20} color={studio.textPrimary} /></Button>

        <View style={styles.headerTitle}>
          <AppText variant="body" style={[styles.screenTitle, { color: studio.textPrimary }]}>POST EDITOR</AppText>
          <View style={styles.saveStatus}><View style={styles.saveMark} /><AppText variant="meta" style={{ color: studio.textMuted }}>SAVED ON DEVICE</AppText></View>
        </View>
        <View style={styles.historyActions}>
          <Button accessibilityLabel="Undo" variant="ghost" size="icon" disabled={!canUndo} onPress={undo} className="rounded-none" style={[styles.iconButton, { opacity: canUndo ? 1 : 0.35 }]}><Undo2 size={18} color={studio.textPrimary} /></Button>
          <Button accessibilityLabel="Redo" variant="ghost" size="icon" disabled={!canRedo} onPress={redo} className="rounded-none" style={[styles.iconButton, { opacity: canRedo ? 1 : 0.35 }]}><Redo2 size={18} color={studio.textPrimary} /></Button>
        </View>
        <Button accessibilityLabel="Export post" disabled={exporting} onPress={exportPost} className="rounded-none" style={[styles.exportButton, { backgroundColor: design.accent, opacity: exporting ? 0.6 : 1 }]}><Share2 size={17} color="#fff" /><UiText className="text-xs font-extrabold tracking-wider text-white">{exporting ? "EXPORTING" : "EXPORT"}</UiText></Button>
      </View>

      <View style={[styles.workspace, { paddingBottom: snapPoints[0] - 8 }]}>
        <View style={styles.canvasMeta}>
          <View><AppText variant="meta" style={{ color: studio.textMuted }}>ARTBOARD</AppText><AppText variant="body" style={{ color: studio.textPrimary, fontWeight: "700" }}>{formats[design.format].label} · {Math.round(cardWidth)} × {Math.round(cardHeight)}</AppText></View>
          <AppText variant="meta" style={{ color: selectedLayer === "visual" ? design.accent : studio.textSecondary }}>{selectedLayer === "visual" ? "DRAG TO REPOSITION" : `${selectedLayer.toUpperCase()} SELECTED`}</AppText>
        </View>

        <View style={[styles.artboardShell, { borderColor: selectedLayer === "visual" && !exporting ? design.accent : studio.border }]}>
          <GestureDetector gesture={imagePan}>
            <View ref={previewRef} collapsable={false} style={[styles.artboard, { width: cardWidth, height: cardHeight, backgroundColor: "#111318" }]}>
              {!isHidden("visual") && design.imageUri && <Image alt="" accessible={false} source={{ uri: design.imageUri }} style={[StyleSheet.absoluteFill, { transform: [{ translateX: design.imageOffsetX }, { translateY: design.imageOffsetY }, { scale: 1.08 }] }]} resizeMode="cover" />}
              <Pressable disabled={isLocked("visual")} onPress={() => selectLayer("visual", "media")} style={StyleSheet.absoluteFill} />
              {!isHidden("visual") && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: imageTint(design.imageTone) }]} />}
              {!design.imageUri && !isHidden("visual") && <Pressable onPress={chooseImage} style={styles.emptyVisual}><ImagePlus size={20} color="rgba(255,255,255,0.38)" /><AppText variant="meta" style={styles.emptyVisualText}>ADD VISUAL</AppText></Pressable>}
              <View pointerEvents="none" style={[styles.artboardAccent, { backgroundColor: design.accent }]} />
              <View style={styles.artboardContent} pointerEvents={exporting ? "none" : "auto"}>
                <View style={styles.artboardTop}>
                  <AppText variant="meta" style={styles.brand}>THE LEADERS <AppText variant="meta" style={{ color: design.accent }}>◆</AppText></AppText>
                  {!isHidden("kicker") && <Pressable disabled={isLocked("kicker")} onPress={() => selectLayer("kicker")} style={selectedLayer === "kicker" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="meta" style={styles.categoryText}>{design.category || "NEWS"}</AppText></Pressable>}
                </View>
                <View style={[styles.copyGroup, { alignItems: design.textAlign === "center" ? "center" : "flex-start" }]}>
                  {!isHidden("kicker") && <Pressable disabled={isLocked("kicker")} onPress={() => selectLayer("kicker")} style={selectedLayer === "kicker" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="meta" style={[styles.kicker, { textAlign: design.textAlign }]}>{design.eyebrow || "THE LEADERS"}</AppText></Pressable>}
                  {!isHidden("headline") && <Pressable disabled={isLocked("headline")} onPress={() => selectLayer("headline")} style={selectedLayer === "headline" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="body" style={[styles.artHeadline, { fontSize: 29 * design.headlineScale, lineHeight: 31 * design.headlineScale, textAlign: design.textAlign }]} numberOfLines={design.format === "story" ? 6 : 4}>{design.headline || "Your headline belongs here."}</AppText></Pressable>}
                  {!isHidden("supporting") && <Pressable disabled={isLocked("supporting")} onPress={() => selectLayer("supporting")} style={selectedLayer === "supporting" && !exporting ? [styles.selectedObject, { borderColor: design.accent }] : undefined}><AppText variant="meta" style={[styles.artSummary, { textAlign: design.textAlign }]} numberOfLines={design.format === "story" ? 4 : 3}>{design.summary}</AppText></Pressable>}
                </View>
                {!isHidden("footer") && <Pressable disabled={isLocked("footer")} onPress={() => selectLayer("footer")} style={selectedLayer === "footer" && !exporting ? [styles.selectedObject, styles.footerSelection, { borderColor: design.accent }] : styles.artboardBottom}><AppText variant="meta" style={styles.artFoot}>{design.author || "THE LEADERS DESK"}</AppText><AppText variant="meta" style={styles.artFoot}>TODAY</AppText></Pressable>}
              </View>
            </View>
          </GestureDetector>
        </View>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={[styles.sheetBackground, { backgroundColor: studio.surface, borderColor: studio.border }]}
        handleStyle={styles.sheetHandle}
        handleIndicatorStyle={[styles.sheetIndicator, { backgroundColor: studio.textMuted }]}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Tabs value={tool} onValueChange={(value) => selectTool(value as Tool)} className="gap-0">
            <TabsList className="mr-0 h-14 w-full rounded-none border-b border-border bg-card p-0">
              <EditorTab value="text" label="Text" active={tool === "text"} accent={design.accent} color={tool === "text" ? design.accent : studio.textSecondary}><Type size={19} color={tool === "text" ? design.accent : studio.textSecondary} /></EditorTab>
              <EditorTab value="layout" label="Layout" active={tool === "layout"} accent={design.accent} color={tool === "layout" ? design.accent : studio.textSecondary}><LayoutTemplate size={19} color={tool === "layout" ? design.accent : studio.textSecondary} /></EditorTab>
              <EditorTab value="media" label="Media" active={tool === "media"} accent={design.accent} color={tool === "media" ? design.accent : studio.textSecondary}><ImagePlus size={19} color={tool === "media" ? design.accent : studio.textSecondary} /></EditorTab>
              <EditorTab value="layers" label="Layers" active={tool === "layers"} accent={design.accent} color={tool === "layers" ? design.accent : studio.textSecondary}><Layers3 size={19} color={tool === "layers" ? design.accent : studio.textSecondary} /></EditorTab>
            </TabsList>
          </Tabs>
          <Inspector tool={tool} design={design} selectedLayer={selectedLayer} colors={studio} update={update} applyDesign={applyDesign} chooseImage={chooseImage} selectLayer={selectLayer} toggleLayerState={toggleLayerState} />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

function Inspector({ tool, design, selectedLayer, colors, update, applyDesign, chooseImage, selectLayer, toggleLayerState }: { tool: Tool; design: PostDesign; selectedLayer: PostLayer; colors: ReturnType<typeof useColors>; update: <K extends keyof PostDesign>(key: K, value: PostDesign[K]) => void; applyDesign: (next: DesignUpdater, record?: boolean) => void; chooseImage: () => void; selectLayer: (layer: PostLayer, tool?: Tool) => void; toggleLayerState: (key: "hiddenLayers" | "lockedLayers", layer: PostLayer) => void }) {
  if (tool === "text") {
    const isHeadline = selectedLayer === "headline";
    const isSummary = selectedLayer === "supporting";
    const isKicker = selectedLayer === "kicker";
    const isFooter = selectedLayer === "footer";
    const key = isHeadline ? "headline" : isSummary ? "summary" : isFooter ? "author" : "eyebrow";
    const label = isHeadline ? "Headline" : isSummary ? "Supporting" : isFooter ? "Byline" : isKicker ? "Kicker" : "Select text on the canvas";
    const editable = isHeadline || isSummary || isKicker || isFooter;
    return <View style={styles.panel}>
      <View style={styles.panelHeader}><View><AppText variant="meta" style={{ color: colors.textMuted }}>TEXT / {label.toUpperCase()}</AppText><AppText variant="body" style={{ color: colors.textPrimary, fontWeight: "700" }}>{editable ? "Edit typography" : label}</AppText></View><View style={styles.alignmentGroup}><Button accessibilityLabel="Align left" variant="outline" size="icon" onPress={() => update("textAlign", "left" as TextAlignment)} className="h-[38px] w-[42px] rounded-none bg-transparent" style={{ borderColor: design.textAlign === "left" ? design.accent : colors.border }}><AlignLeft size={16} color={design.textAlign === "left" ? design.accent : colors.textSecondary} /></Button><Button accessibilityLabel="Align center" variant="outline" size="icon" onPress={() => update("textAlign", "center" as TextAlignment)} className="h-[38px] w-[42px] rounded-none bg-transparent" style={{ borderColor: design.textAlign === "center" ? design.accent : colors.border }}><AlignCenter size={16} color={design.textAlign === "center" ? design.accent : colors.textSecondary} /></Button></View></View>
      <Separator className="mb-3" />
      {editable ? <BottomSheetTextInput value={design[key]} onChangeText={(value) => update(key, key === "eyebrow" ? value.toUpperCase() : value)} multiline={key !== "eyebrow" && key !== "author"} style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }, isHeadline && styles.headlineInput]} placeholderTextColor={colors.textMuted} /> : <View style={[styles.hint, { borderColor: colors.border }]}><Type size={17} color={design.accent} /><AppText variant="meta" style={{ color: colors.textSecondary }}>Tap a text object directly on the artboard.</AppText></View>}
      {isHeadline && <View style={styles.sliderRow}><AppText variant="meta" style={{ color: colors.textSecondary }}>SIZE</AppText><Slider style={styles.slider} minimumValue={0.8} maximumValue={1.3} step={0.05} value={design.headlineScale} onSlidingComplete={(value) => update("headlineScale", value)} minimumTrackTintColor={design.accent} maximumTrackTintColor={colors.border} thumbTintColor={design.accent} /><AppText variant="meta" style={{ color: colors.textPrimary, width: 38, textAlign: "right" }}>{Math.round(design.headlineScale * 100)}%</AppText></View>}
    </View>;
  }

  if (tool === "layout") {
    return <View style={styles.panel}>
      <View style={styles.controlRow}><AppText variant="meta" style={{ color: colors.textMuted, width: 62 }}>FORMAT</AppText><View style={styles.flexControls}>{(Object.keys(formats) as PostFormat[]).map((format) => <Button key={format} variant="outline" size="sm" onPress={() => update("format", format)} className="h-[38px] flex-1 rounded-none bg-transparent px-2" style={{ borderColor: design.format === format ? design.accent : colors.border, backgroundColor: design.format === format ? `${design.accent}15` : "transparent" }}><UiText className="text-[10px] font-extrabold uppercase tracking-wide" style={{ color: design.format === format ? design.accent : colors.textSecondary }}>{formats[format].label}</UiText></Button>)}</View></View>
      <View style={styles.controlRow}><AppText variant="meta" style={{ color: colors.textMuted, width: 62 }}>ACCENT</AppText><View style={styles.colorControls}>{accents.map((accent) => <Pressable accessibilityLabel={`Use ${accent}`} key={accent} onPress={() => update("accent", accent)} style={[styles.colorSwatch, { backgroundColor: accent, borderColor: design.accent === accent ? colors.textPrimary : "transparent" }]}>{design.accent === accent && <Check size={14} color="#fff" />}</Pressable>)}</View></View>
      <Separator className="mb-3" />
      <View style={styles.templateControls}>{postTemplates.map((template) => <Button key={template.key} variant="outline" onPress={() => applyDesign((current) => ({ ...current, template: template.key, ...template.patch }))} className="h-[50px] flex-1 items-start rounded-none bg-transparent px-2" style={{ borderColor: design.template === template.key ? design.accent : colors.border }}><View><UiText className="text-[10px] font-extrabold uppercase tracking-wide" style={{ color: design.template === template.key ? design.accent : colors.textSecondary }}>{template.title}</UiText><UiText numberOfLines={1} className="text-[10px] text-muted-foreground" style={{ color: colors.textMuted }}>{template.subtitle}</UiText></View></Button>)}</View>
    </View>;
  }

  if (tool === "media") {
    return <View style={styles.panel}>
      <View style={styles.panelHeader}><View><AppText variant="meta" style={{ color: colors.textMuted }}>MEDIA / BACKGROUND</AppText><AppText variant="body" style={{ color: colors.textPrimary, fontWeight: "700" }}>{design.imageUri ? "Adjust visual" : "Add a visual"}</AppText></View><Button onPress={chooseImage} className="h-10 rounded-none px-3" style={{ backgroundColor: design.accent }}><ImagePlus size={17} color="#fff" /><UiText className="text-[10px] font-extrabold tracking-wide text-white">{design.imageUri ? "REPLACE" : "CHOOSE"}</UiText></Button></View>
      <Separator className="mb-3" />
      <View style={styles.controlRow}><AppText variant="meta" style={{ color: colors.textMuted, width: 62 }}>TONE</AppText><View style={styles.flexControls}>{(["ink", "clear", "warm"] as ImageTone[]).map((tone) => <Button key={tone} variant="outline" size="sm" onPress={() => update("imageTone", tone)} className="h-[38px] flex-1 rounded-none bg-transparent px-2" style={{ borderColor: design.imageTone === tone ? design.accent : colors.border, backgroundColor: design.imageTone === tone ? `${design.accent}15` : "transparent" }}><UiText className="text-[10px] font-extrabold uppercase tracking-wide" style={{ color: design.imageTone === tone ? design.accent : colors.textSecondary }}>{tone}</UiText></Button>)}</View></View>
      <View style={styles.mediaActions}><Button variant="outline" onPress={() => applyDesign((current) => ({ ...current, imageOffsetX: 0, imageOffsetY: 0 }))} className="h-10 flex-1 rounded-none bg-transparent"><Move size={15} color={colors.textSecondary} /><UiText className="text-[10px] font-bold tracking-wide" style={{ color: colors.textSecondary }}>RESET POSITION</UiText></Button>{design.imageUri && <Button variant="outline" onPress={() => update("imageUri", null)} className="h-10 flex-1 rounded-none bg-transparent"><X size={15} color={design.accent} /><UiText className="text-[10px] font-bold tracking-wide" style={{ color: design.accent }}>REMOVE</UiText></Button>}</View>
    </View>;
  }

  return <View style={styles.panel}>
    <View style={styles.panelHeader}><View><AppText variant="meta" style={{ color: colors.textMuted }}>LAYERS</AppText><AppText variant="body" style={{ color: colors.textPrimary, fontWeight: "700" }}>Visibility and locking</AppText></View><AppText variant="meta" style={{ color: colors.textMuted }}>SWIPE FOR ALL</AppText></View>
    <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layerStrip}>
      {layerItems.map((layer, index) => {
        const hidden = design.hiddenLayers.includes(layer.key);
        const locked = design.lockedLayers.includes(layer.key);
        return <Pressable key={layer.key} onPress={() => selectLayer(layer.key, layer.key === "visual" ? "media" : "text")} style={[styles.layerCard, { borderColor: selectedLayer === layer.key ? design.accent : colors.border, backgroundColor: selectedLayer === layer.key ? `${design.accent}12` : colors.surfaceSecondary }]}>
          <View style={styles.layerCardTop}><AppText variant="meta" style={{ color: colors.textMuted }}>{String(index + 1).padStart(2, "0")} · {layer.kind}</AppText><View style={[styles.layerMark, { backgroundColor: layer.key === "visual" ? colors.textMuted : design.accent }]} /></View>
          <AppText numberOfLines={1} variant="body" style={{ color: hidden ? colors.textMuted : colors.textPrimary, fontWeight: "700" }}>{layer.label}</AppText>
          <View style={styles.layerActions}><Button accessibilityLabel={hidden ? `Show ${layer.label}` : `Hide ${layer.label}`} variant="outline" size="icon" onPress={() => toggleLayerState("hiddenLayers", layer.key)} className="h-7 w-[34px] rounded-none bg-transparent">{hidden ? <EyeOff size={15} color={colors.textMuted} /> : <Eye size={15} color={colors.textSecondary} />}</Button><Button accessibilityLabel={locked ? `Unlock ${layer.label}` : `Lock ${layer.label}`} variant="outline" size="icon" onPress={() => toggleLayerState("lockedLayers", layer.key)} className="h-7 w-[34px] rounded-none bg-transparent">{locked ? <Lock size={14} color={design.accent} /> : <LockOpen size={14} color={colors.textSecondary} />}</Button></View>
        </Pressable>;
      })}
    </BottomSheetScrollView>
  </View>;
}

function EditorTab({ value, label, active, accent, color, children }: { value: Tool; label: string; active: boolean; accent: string; color: string; children: React.ReactNode }) {
  return <TabsTrigger value={value} className="h-14 flex-1 rounded-none border-x-0 border-t-0 bg-transparent px-1" style={{ borderBottomWidth: 2, borderBottomColor: active ? accent : "transparent" }}>{children}<UiText className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</UiText></TabsTrigger>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { minHeight: 70, paddingHorizontal: 14, paddingBottom: 10, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  iconButton: { width: 44, height: 44, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, minWidth: 74 },
  screenTitle: { fontFamily: "BebasNeue_400Regular", fontSize: 22, lineHeight: 23, letterSpacing: 0.7 },
  saveStatus: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  saveMark: { width: 5, height: 5, backgroundColor: "#30A46C" },
  historyActions: { flexDirection: "row", gap: 4 },
  exportButton: { height: 44, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  workspace: { flex: 1, minHeight: 0, paddingHorizontal: 18, paddingTop: 12, justifyContent: "center" },
  canvasMeta: { width: "100%", maxWidth: 382, alignSelf: "center", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 9 },
  artboardShell: { alignSelf: "center", borderWidth: 1, padding: 5, backgroundColor: "#07080A", shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  artboard: { overflow: "hidden" },
  emptyVisual: { position: "absolute", top: 60, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  emptyVisualText: { color: "rgba(255,255,255,0.42)", fontWeight: "800", letterSpacing: 0.7 },
  artboardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 6 },
  artboardContent: { flex: 1, justifyContent: "space-between", padding: 17 },
  artboardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  categoryText: { color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 0.9, borderWidth: 1, borderColor: "rgba(255,255,255,0.66)", paddingHorizontal: 7, paddingVertical: 4 },
  copyGroup: { maxWidth: "100%" },
  kicker: { color: "rgba(255,255,255,0.73)", fontSize: 9, letterSpacing: 1.3, fontWeight: "800", marginBottom: 7 },
  artHeadline: { color: "#fff", fontFamily: "Manrope_600SemiBold", fontWeight: "700", letterSpacing: -0.9 },
  artSummary: { color: "rgba(255,255,255,0.84)", fontSize: 11, lineHeight: 16, marginTop: 10 },
  artboardBottom: { paddingTop: 9, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.32)", flexDirection: "row", justifyContent: "space-between", minWidth: "100%" },
  artFoot: { color: "rgba(255,255,255,0.78)", fontSize: 8, letterSpacing: 0.7, fontWeight: "800" },
  selectedObject: { borderWidth: 1, borderStyle: "dashed", padding: 3, margin: -3 },
  footerSelection: { flexDirection: "row", justifyContent: "space-between", paddingTop: 9, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.32)", minWidth: "100%" },
  sheetBackground: { borderRadius: 0, borderTopWidth: 1 },
  sheetHandle: { height: 18, paddingTop: 8 },
  sheetIndicator: { width: 42, height: 2, borderRadius: 0 },
  sheetContent: { flex: 1 },
  panel: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18 },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  alignmentGroup: { flexDirection: "row", gap: 5 },
  squareControl: { width: 42, height: 38, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  textInput: { minHeight: 42, maxHeight: 74, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8, fontFamily: "Manrope_500Medium", fontSize: 14 },
  headlineInput: { fontFamily: "Manrope_600SemiBold", fontSize: 17, lineHeight: 21 },
  hint: { height: 44, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10 },
  sliderRow: { height: 40, flexDirection: "row", alignItems: "center", gap: 7, marginTop: 5 },
  slider: { flex: 1, height: 36 },
  controlRow: { minHeight: 38, flexDirection: "row", alignItems: "center", marginBottom: 9 },
  flexControls: { flex: 1, flexDirection: "row", gap: 6 },
  choice: { flex: 1, minHeight: 38, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  colorControls: { flex: 1, flexDirection: "row", gap: 7 },
  colorSwatch: { width: 34, height: 34, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  templateControls: { flexDirection: "row", gap: 6 },
  templateChoice: { flex: 1, minHeight: 46, borderWidth: 1, paddingHorizontal: 8, justifyContent: "center" },
  primaryControl: { minWidth: 94, height: 40, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  primaryControlLabel: { color: "#fff", fontWeight: "800" },
  mediaActions: { flexDirection: "row", gap: 7 },
  secondaryAction: { minHeight: 40, flex: 1, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  layerStrip: { gap: 8, paddingRight: 20 },
  layerCard: { width: 132, height: 92, borderWidth: 1, padding: 9, justifyContent: "space-between" },
  layerCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  layerMark: { width: 5, height: 5 },
  layerActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  layerAction: { width: 34, height: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
});
