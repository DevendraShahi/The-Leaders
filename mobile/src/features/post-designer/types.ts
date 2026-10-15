import { brand } from "@/theme/tokens";
export type PostFormat = "square" | "portrait" | "story" | "landscape";
export type PostTemplate = "breaking" | "explainer" | "quote";
export type TextAlignment = "left" | "center";
export type ImageTone = "ink" | "clear" | "warm";
export type PostLayer = "visual" | "kicker" | "headline" | "supporting" | "footer";
export type PostTextLayer = Exclude<PostLayer, "visual">;
export type TextPositions = Record<PostTextLayer, { x: number; y: number }>;
export const defaultTextPositions = (): TextPositions => ({ kicker: { x: 0, y: 0 }, headline: { x: 0, y: 0 }, supporting: { x: 0, y: 0 }, footer: { x: 0, y: 0 } });
export type TextTypography = { font: "auto" | "onest" | "hind"; size: number; lineSpacing: number; shadow: number };
export const defaultTextTypography = (): Record<PostTextLayer, TextTypography> => Object.fromEntries(["headline", "supporting", "kicker", "footer"].map(layer => [layer, { font: "auto", size: 100, lineSpacing: 100, shadow: 0 }])) as Record<PostTextLayer, TextTypography>;
export type TextColors = Record<PostTextLayer, string | null>;
export const defaultTextColors = (): TextColors => ({ kicker: null, headline: null, supporting: null, footer: null });

export const postOutputDimensions: Record<PostFormat, readonly [number, number]> = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  story: [1080, 1920],
  landscape: [1920, 1080],
};

export const postExportReferenceWidth = 360;

export type PostDesign = {
  template: PostTemplate;
  format: PostFormat;
  category: string;
  eyebrow: string;
  headline: string;
  summary: string;
  author: string;
  imageUri: string | null;
  accent: string;
  headlineScale: number;
  textAlign: TextAlignment;
  imageTone: ImageTone;
  imageOffsetX: number;
  imageOffsetY: number;
  imageZoom: number;
  imageFit: "cover" | "contain";
  imageBlur: number;
  imageVintage: number;
  imageFeather: number;
  hiddenLayers: PostLayer[];
  lockedLayers: PostLayer[];
  textPositions: TextPositions;
  textColors: TextColors;
  textTypography: Record<PostTextLayer, TextTypography>;
};

export const defaultPostDesign: PostDesign = {
  template: "breaking",
  format: "square",
  category: "POLITICS",
  eyebrow: "DEVELOPING STORY",
  headline: "A clearer way to share the story that matters.",
  summary: "Give readers the useful context before they open the full report.",
  author: "The Leaders Desk",
  imageUri: null,
  accent: brand.red,
  headlineScale: 1,
  textAlign: "left",
  imageTone: "ink",
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageZoom: 1.08,
  imageFit: "cover",
  imageBlur: 0,
  imageVintage: 0,
  imageFeather: 0,
  hiddenLayers: [],
  lockedLayers: [],
  textPositions: defaultTextPositions(),
  textColors: defaultTextColors(),
  textTypography: defaultTextTypography(),
};

export const postTemplates: { key: PostTemplate; title: string; subtitle: string; patch: Partial<PostDesign> }[] = [
  {
    key: "breaking",
    title: "Breaking",
    subtitle: "Fast & clear",
    patch: { category: "POLITICS", eyebrow: "DEVELOPING STORY", headline: "A clearer way to share the story that matters.", summary: "Give readers the useful context before they open the full report." },
  },
  {
    key: "explainer",
    title: "Explainer",
    subtitle: "Add context",
    patch: { category: "EXPLAINER", eyebrow: "WHAT YOU NEED TO KNOW", headline: "The five details behind today’s biggest decision.", summary: "A plain-language guide to the names, numbers, and next steps." },
  },
  {
    key: "quote",
    title: "Quote",
    subtitle: "Put voices forward",
    patch: { category: "VOICES", eyebrow: "IN THEIR WORDS", headline: "“The public deserves a conversation built on facts.”", summary: "A moment from today’s conversation, with the full context in the caption." },
  },
];
