import { forwardRef } from "react";
import { View, StyleSheet, type View as ViewType } from "react-native";
import { Image as BrandImage } from "expo-image";
import { AppText } from "@/ui/primitives/AppText";
import { fontFamilies } from "@/theme/tokens";
import { ArtworkImage } from "./ArtworkImage";
import { textPositionStyle } from "./positioning";
import { textColorStyle } from "./text-colors";
import { textTypographyStyle } from "./typography";
import { postExportReferenceWidth, postOutputDimensions, type PostDesign, type PostFormat, type PostLayer, type ImageTone } from "./types";
function imageTint(tone: ImageTone) { return tone === "clear" ? "rgba(7,9,13,0.18)" : tone === "warm" ? "rgba(61,28,14,0.38)" : "rgba(5,7,10,0.52)"; }
const leadersIcon = require("../../../assets/logo-Rbg.png");
export function ArtworkBrand({ format, onLoad }: { format: PostFormat; onLoad?: () => void }) {
  const size = format === "landscape" ? 32 : 40;
  return <BrandImage onLoad={onLoad} source={leadersIcon} accessibilityLabel="The Leaders" loading="eager" contentFit="contain" transition={0} style={{ width: size, height: size }} />;
}

export const ExportArtboard = forwardRef<ViewType, { design: PostDesign; onReady?: () => void; onTextMeasured?: (layer: "headline" | "supporting", lines: number) => void }>(({ design, onReady, onTextMeasured }, ref) => {
  const height = postExportReferenceWidth * postOutputDimensions[design.format][1] / postOutputDimensions[design.format][0];
  const hidden = (layer: PostLayer) => design.hiddenLayers.includes(layer);

  return <View ref={ref} collapsable={false} style={[styles.artboard, { width: postExportReferenceWidth, height, backgroundColor: "#111318" }]}>
    <ArtworkImage design={design} height={height} />
    {!hidden("visual") && <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: imageTint(design.imageTone) }]} />}
    <View pointerEvents="none" style={[styles.artboardAccent, { backgroundColor: design.accent }]} />
    <View style={styles.artboardContent}>
      <View style={styles.artboardTop}>
        <ArtworkBrand format={design.format} onLoad={onReady} />
        {!hidden("kicker") && <AppText variant="meta" style={[styles.categoryText, textColorStyle(design, "kicker"), textTypographyStyle(design, "kicker", design.category)]}>{design.category || "NEWS"}</AppText>}
      </View>
      <View style={[styles.copyGroup, { alignItems: design.textAlign === "center" ? "center" : "flex-start" }]}>
        {!hidden("kicker") && <AppText variant="meta" style={[styles.kicker, { textAlign: design.textAlign }, textPositionStyle(design, "kicker"), textColorStyle(design, "kicker"), textTypographyStyle(design, "kicker")]}>{design.eyebrow || "THE LEADERS"}</AppText>}
        {!hidden("headline") && <AppText variant="body" style={[styles.artHeadline, { fontSize: (design.format === "landscape" ? 20 : 29) * design.headlineScale, lineHeight: (design.format === "landscape" ? 22 : 31) * design.headlineScale, textAlign: design.textAlign }, textPositionStyle(design, "headline"), textColorStyle(design, "headline"), textTypographyStyle(design, "headline")]} testID="export-headline" onTextLayout={event => onTextMeasured?.("headline", event.nativeEvent.lines.length)} numberOfLines={onTextMeasured ? undefined : design.format === "landscape" ? 3 : design.format === "story" ? 6 : 4}>{design.headline || "Your headline belongs here."}</AppText>}
        {!hidden("supporting") && <AppText variant="meta" style={[styles.artSummary, { textAlign: design.textAlign, ...(design.format === "landscape" ? { fontSize: 10, lineHeight: 13, marginTop: 6 } : {}) }, textPositionStyle(design, "supporting"), textColorStyle(design, "supporting"), textTypographyStyle(design, "supporting")]} testID="export-supporting" onTextLayout={event => onTextMeasured?.("supporting", event.nativeEvent.lines.length)} numberOfLines={onTextMeasured ? undefined : design.format === "landscape" ? 2 : design.format === "story" ? 4 : 3}>{design.summary}</AppText>}
      </View>
      {!hidden("footer") && <View style={[styles.artboardBottom, textPositionStyle(design, "footer")]}><AppText variant="meta" style={[styles.artFoot, textColorStyle(design, "footer"), textTypographyStyle(design, "footer")]}>{design.author || "THE LEADERS DESK"}</AppText><AppText variant="meta" style={[styles.artFoot, textColorStyle(design, "footer"), textTypographyStyle(design, "footer")]}>TODAY</AppText></View>}
    </View>
  </View>;
});

ExportArtboard.displayName = "ExportArtboard";
const styles = StyleSheet.create({
  artboard: { overflow: "hidden" },
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
});
