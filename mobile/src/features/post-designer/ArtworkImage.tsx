import { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, Filter, FeColorMatrix, FeGaussianBlur, G, Image, LinearGradient, Mask, Rect, Stop } from "react-native-svg";
import { vintageMatrix } from "./image-effects";
import { postExportReferenceWidth, type PostDesign } from "./types";

/** Shared photo renderer: effects never blur the text or branding above it. */
export function ArtworkImage({ design, height }: { design: PostDesign; height: number }) {
    const id = useId().replace(/[^a-zA-Z0-9]/g, "");
    if (!design.imageUri || design.hiddenLayers.includes("visual")) return null;
    const width = postExportReferenceWidth;
    const zoom = design.imageZoom ?? 1.08;
    const blur = (design.imageBlur ?? 0) * .16;
    const vintage = design.imageVintage ?? 0;
    const feather = (design.imageFeather ?? 0) * .0045;
    const filtered = blur > 0 || vintage > 0;
    const transform = `translate(${design.imageOffsetX + width / 2} ${design.imageOffsetY + height / 2}) scale(${zoom}) translate(${-width / 2} ${-height / 2})`;
    return <Svg pointerEvents="none" accessible={false} width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill}>
        <Defs>
            {filtered ? <Filter id={`${id}filter`} x="-25%" y="-25%" width="150%" height="150%">
                {vintage > 0 ? <FeColorMatrix type="matrix" values={vintageMatrix(vintage)} /> : null}
                {blur > 0 ? <FeGaussianBlur stdDeviation={blur} /> : null}
            </Filter> : null}
            {feather > 0 ? <>
                <LinearGradient id={`${id}horizontal`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0" stopColor="white" stopOpacity={0} /><Stop offset={feather} stopColor="white" /><Stop offset={1 - feather} stopColor="white" /><Stop offset="1" stopColor="white" stopOpacity={0} />
                </LinearGradient>
                <LinearGradient id={`${id}vertical`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0" stopColor="white" stopOpacity={0} /><Stop offset={feather} stopColor="white" /><Stop offset={1 - feather} stopColor="white" /><Stop offset="1" stopColor="white" stopOpacity={0} />
                </LinearGradient>
                <Mask id={`${id}maskX`} x={0} y={0} width={width} height={height} maskUnits="userSpaceOnUse"><Rect width={width} height={height} fill={`url(#${id}horizontal)`} /></Mask>
                <Mask id={`${id}maskY`} x={0} y={0} width={width} height={height} maskUnits="userSpaceOnUse"><Rect width={width} height={height} fill={`url(#${id}vertical)`} /></Mask>
            </> : null}
        </Defs>
        <G transform={transform}>
            <G mask={feather > 0 ? `url(#${id}maskX)` : undefined}>
                <G mask={feather > 0 ? `url(#${id}maskY)` : undefined}>
                    <Image href={{ uri: design.imageUri }} width={width} height={height} preserveAspectRatio={design.imageFit === "contain" ? "xMidYMid meet" : "xMidYMid slice"} filter={filtered ? `url(#${id}filter)` : undefined} />
                </G>
            </G>
        </G>
    </Svg>;
}
