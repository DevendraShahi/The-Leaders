"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft, ArrowUpRight, Check, Clipboard, Download, ImagePlus,
  Loader2, Monitor, Newspaper, Palette, RotateCcw, Save, Share2, Smartphone,
  Sparkles, Type, X
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/admin/AuthProvider";
import { cn } from "@/lib/utils";

type TemplateKey = "breaking" | "explainer" | "quote";
type FormatKey = "square" | "portrait" | "landscape";

type Design = {
  template: TemplateKey;
  format: FormatKey;
  category: string;
  eyebrow: string;
  headline: string;
  summary: string;
  author: string;
  date: string;
  imageUrl: string;
  accent: string;
};

const templates: Array<{ key: TemplateKey; label: string; caption: string; icon: typeof Newspaper }> = [
  { key: "breaking", label: "Breaking", caption: "Fast, clear updates", icon: Newspaper },
  { key: "explainer", label: "Explainer", caption: "Context worth saving", icon: AlignLeft },
  { key: "quote", label: "Quote card", caption: "Put a voice forward", icon: Type },
];

const defaultDesign: Design = {
  template: "breaking",
  format: "square",
  category: "POLITICS",
  eyebrow: "DEVELOPING STORY",
  headline: "A clearer way to share the story that matters.",
  summary: "Give your readers the essential context before they open the full report.",
  author: "The Leaders Desk",
  date: "TODAY",
  imageUrl: "",
  accent: "#b71c1c",
};

const dimensions: Record<FormatKey, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[16/10]",
};

const DESIGNER_DRAFT_KEY = "the-leaders:news-post-designer:draft";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character] || character));
}

export default function NewsPostDesigner() {
  const { token } = useAuth();
  const router = useRouter();
  const [design, setDesign] = useState<Design>(defaultDesign);
  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [projectName, setProjectName] = useState("Untitled post");
  const [handoffNotes, setHandoffNotes] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DESIGNER_DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as { design?: Design; projectName?: string; handoffNotes?: string; showSummary?: boolean; savedAt?: string };
        if (draft.design) setDesign({ ...defaultDesign, ...draft.design });
        if (draft.projectName) setProjectName(draft.projectName);
        if (typeof draft.handoffNotes === "string") setHandoffNotes(draft.handoffNotes);
        if (typeof draft.showSummary === "boolean") setShowSummary(draft.showSummary);
        if (draft.savedAt) setLastSaved(draft.savedAt);
      }
    } catch {
      // Local draft storage is a convenience; a malformed old draft should not block the studio.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const save = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(DESIGNER_DRAFT_KEY, JSON.stringify({ design, projectName, handoffNotes, showSummary, savedAt }));
      setLastSaved(savedAt);
    }, 700);
    return () => window.clearTimeout(save);
  }, [design, handoffNotes, hydrated, projectName, showSummary]);

  useEffect(() => () => {
    if (previewImage.startsWith("blob:")) URL.revokeObjectURL(previewImage);
  }, [previewImage]);

  const image = previewImage || design.imageUrl;
  const characterCount = design.headline.length;
  const readability = useMemo(() => {
    if (characterCount < 36) return "Needs a little more detail";
    if (characterCount > 92) return "May be too long for cards";
    return "Strong card length";
  }, [characterCount]);

  const update = <K extends keyof Design>(key: K, value: Design[K]) => setDesign((current) => ({ ...current, [key]: value }));

  const chooseTemplate = (template: TemplateKey) => {
    const examples: Record<TemplateKey, Partial<Design>> = {
      breaking: { eyebrow: "DEVELOPING STORY", category: "POLITICS", headline: "A clearer way to share the story that matters.", summary: "Give your readers the essential context before they open the full report." },
      explainer: { eyebrow: "WHAT YOU NEED TO KNOW", category: "EXPLAINER", headline: "The five details behind today’s biggest decision.", summary: "A quick, plain-language guide to the names, numbers and next steps." },
      quote: { eyebrow: "IN THEIR WORDS", category: "VOICES", headline: "“The public deserves a conversation built on facts.”", summary: "A moment from today’s conversation, with the full context linked in the post." },
    };
    setDesign((current) => ({ ...current, template, ...examples[template] }));
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (previewImage.startsWith("blob:")) URL.revokeObjectURL(previewImage);
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (previewImage.startsWith("blob:")) URL.revokeObjectURL(previewImage);
    setPreviewImage("");
    setImageFile(null);
    update("imageUrl", "");
  };

  const resetDraft = () => {
    if (previewImage.startsWith("blob:")) URL.revokeObjectURL(previewImage);
    setDesign(defaultDesign);
    setPreviewImage("");
    setImageFile(null);
    setProjectName("Untitled post");
    setHandoffNotes("");
    setShowSummary(true);
    window.localStorage.removeItem(DESIGNER_DRAFT_KEY);
    setLastSaved(null);
    toast.success("Started a fresh post.");
  };

  const copyCaption = async () => {
    const caption = `${design.headline}\n\n${design.summary}\n\nRead more at The Leaders.\n\n#${slugify(design.category)}`;
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Caption copied — ready to paste.");
    } catch {
      toast.error("Couldn’t copy the caption. Please try again.");
    }
  };

  const downloadBrief = () => {
    const file = new Blob([JSON.stringify({ projectName, design, handoffNotes, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${slugify(design.headline || "news-post")}-brief.json`;
    anchor.click();
    URL.revokeObjectURL(href);
    toast.success("Design brief downloaded.");
  };

  const downloadGraphic = async () => {
    const size: Record<FormatKey, [number, number]> = {
      square: [1080, 1080], portrait: [1080, 1350], landscape: [1200, 750],
    };
    const [width, height] = size[design.format];
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    const padding = Math.round(width * 0.075);
    context.fillStyle = "#121212";
    context.fillRect(0, 0, width, height);
    const glow = context.createRadialGradient(width * 0.94, height * 0.03, 0, width * 0.94, height * 0.03, width * 0.75);
    glow.addColorStop(0, design.accent);
    glow.addColorStop(1, "#121212");
    context.globalAlpha = 0.72;
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    context.globalAlpha = 1;

    if (image) {
      try {
        const source = new Image();
        source.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          source.onload = () => resolve();
          source.onerror = () => reject(new Error("image unavailable"));
          source.src = image;
        });
        const scale = Math.max(width / source.width, height / source.height);
        const drawWidth = source.width * scale;
        const drawHeight = source.height * scale;
        context.globalAlpha = 0.72;
        context.drawImage(source, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
        context.globalAlpha = 1;
        const shade = context.createLinearGradient(0, 0, 0, height);
        shade.addColorStop(0, "rgba(0,0,0,0.04)");
        shade.addColorStop(0.55, "rgba(0,0,0,0.52)");
        shade.addColorStop(1, "rgba(0,0,0,0.96)");
        context.fillStyle = shade;
        context.fillRect(0, 0, width, height);
      } catch {
        // A remote image without CORS support is intentionally skipped for export.
      }
    }

    const wrap = (text: string, maxWidth: number) => {
      const words = text.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (context.measureText(next).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else line = next;
      }
      if (line) lines.push(line);
      return lines;
    };

    context.fillStyle = design.accent;
    context.fillRect(0, 0, width, Math.round(width * 0.012));
    context.fillStyle = "#ffffff";
    context.font = `700 ${Math.round(width * 0.022)}px ui-monospace, monospace`;
    context.fillText("■  THE LEADERS", padding, padding + Math.round(width * 0.025));
    context.textAlign = "right";
    context.fillStyle = "rgba(255,255,255,0.75)";
    context.fillText(design.category || "NEWS", width - padding, padding + Math.round(width * 0.025));
    context.textAlign = "left";

    const titleSize = Math.round(width * (design.format === "portrait" ? 0.068 : 0.063));
    context.font = `600 ${Math.round(width * 0.021)}px ui-monospace, monospace`;
    context.fillStyle = "rgba(255,255,255,0.72)";
    context.fillText(design.eyebrow || "THE LEADERS", padding, height * 0.57);
    context.font = `600 ${titleSize}px Georgia, serif`;
    context.fillStyle = "#ffffff";
    const titleLines = wrap(design.headline || "Your headline belongs here.", width - padding * 2).slice(0, 4);
    const titleLineHeight = Math.round(titleSize * 1.02);
    let y = height * 0.57 + Math.round(width * 0.043);
    titleLines.forEach((line) => { context.fillText(line, padding, y); y += titleLineHeight; });

    if (showSummary) {
      context.font = `400 ${Math.round(width * 0.022)}px Arial, sans-serif`;
      context.fillStyle = "rgba(255,255,255,0.8)";
      const summaryLines = wrap(design.summary, width - padding * 2).slice(0, 3);
      y += Math.round(width * 0.022);
      summaryLines.forEach((line) => { context.fillText(line, padding, y); y += Math.round(width * 0.032); });
    }
    context.strokeStyle = "rgba(255,255,255,0.35)";
    context.beginPath(); context.moveTo(padding, height - padding * 1.45); context.lineTo(width - padding, height - padding * 1.45); context.stroke();
    context.font = `500 ${Math.round(width * 0.017)}px ui-monospace, monospace`;
    context.fillStyle = "rgba(255,255,255,0.78)";
    context.fillText(design.author || "THE LEADERS DESK", padding, height - padding * 0.85);
    context.textAlign = "right";
    context.fillText(design.date || "TODAY", width - padding, height - padding * 0.85);
    context.textAlign = "left";
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `${slugify(design.headline || "the-leaders-post")}-${design.format}.png`;
    anchor.click();
    toast.success("Social card downloaded as a PNG.");
  };

  const createDraft = async () => {
    if (!design.headline.trim()) {
      toast.error("Add a headline before creating a draft.");
      return;
    }
    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = design.imageUrl;
      if (imageFile) {
        const body = new FormData();
        body.append("file", imageFile);
        body.append("category", "article");
        body.append("folder", "articles");
        const media = await fetch("/api/admin/media/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
        const payload = await media.json();
        if (!media.ok) throw new Error(payload?.error || "Image upload failed");
        imageUrl = payload?.data?.media?.secureUrl || "";
      }
      const post = {
        title: { en: design.headline, ne: "" },
        excerpt: { en: design.summary, ne: "" },
        content: { en: `<p>${escapeHtml(design.summary)}</p><p><strong>${escapeHtml(design.eyebrow)}</strong></p>${handoffNotes ? `<hr><p><em>Studio handoff: ${escapeHtml(handoffNotes)}</em></p>` : ""}`, ne: "" },
        author: { en: design.author || "The Leaders Desk", ne: "" },
        category: { en: design.category, ne: "" },
        image: imageUrl,
        tags: [design.category.toLowerCase(), "news"],
        slug: `${slugify(design.headline)}-${Date.now().toString().slice(-5)}`,
        status: "draft",
        isFeatured: false,
        publishedDate: new Date().toISOString(),
      };
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(post),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Couldn’t create draft");
      toast.success("Article draft created from your design.");
      router.push("/admin/content?type=articles");
    } catch (error: any) {
      toast.error(error?.message || "Couldn’t create draft");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] pb-10 text-foreground">
      <header className="relative overflow-hidden border border-border bg-card px-5 py-7 sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.24em] text-primary"><Sparkles className="h-3.5 w-3.5" /> THE LEADERS / STUDIO</div>
            <h1 className="font-bebas text-4xl leading-none tracking-wide sm:text-5xl">News post designer</h1>
            <p className="mt-3 max-w-xl font-manrope text-sm leading-6 text-muted-foreground">Turn a story idea into a polished post, then save the editorial draft when it is ready for a proper review.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved on this device</span>{lastSaved && <span>{new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(lastSaved))}</span>}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadGraphic} className="inline-flex h-10 items-center gap-2 border border-border px-4 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-muted"><Download className="h-3.5 w-3.5" /> Download card</button>
            <button onClick={downloadBrief} className="hidden h-10 items-center gap-2 border border-border px-4 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-muted sm:inline-flex"><ArrowUpRight className="h-3.5 w-3.5" /> Export brief</button>
            <button onClick={createDraft} disabled={saving} className="inline-flex h-10 items-center gap-2 bg-primary px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"><Save className="h-3.5 w-3.5" /> {saving ? "Creating…" : "Create article draft"}</button>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.94fr)_minmax(420px,1.06fr)]">
        <section className="space-y-5">
          <div className="grid gap-px border border-border bg-border sm:grid-cols-[1fr_1.1fr_auto]">
            <label className="bg-card p-4"><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Working title</span><input value={projectName} onChange={(event) => setProjectName(event.target.value)} className="w-full bg-transparent font-editorial text-lg outline-none placeholder:text-muted-foreground/50" placeholder="Name this post" /></label>
            <div className="bg-card p-4"><span className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Shared workflow</span><p className="mt-2 font-manrope text-xs leading-5 text-muted-foreground">Your copy, style choices and handoff notes are saved automatically in this browser.</p></div>
            <button type="button" onClick={resetDraft} className="flex items-center justify-center gap-2 bg-card px-5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"><RotateCcw className="h-3.5 w-3.5" /> Start fresh</button>
          </div>
          <div className="border border-border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> 01 / Start with a format</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {templates.map((item) => {
                const Icon = item.icon;
                const active = design.template === item.key;
                return <button key={item.key} onClick={() => chooseTemplate(item.key)} className={cn("group border p-4 text-left transition-all", active ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--color-primary)]" : "border-border hover:border-primary/50 hover:bg-muted/60")}>
                  <Icon className={cn("mb-6 h-5 w-5", active ? "text-primary-foreground" : "text-primary")} />
                  <div className="font-bebas text-xl tracking-wide">{item.label}</div><div className={cn("mt-1 font-manrope text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>{item.caption}</div>
                </button>;
              })}
            </div>
          </div>

          <div className="border border-border bg-card p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><Type className="h-3.5 w-3.5 text-primary" /> 02 / Write the essentials</div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Section" value={design.category} onChange={(value) => update("category", value)} placeholder="POLITICS" />
                <Field label="Kicker" value={design.eyebrow} onChange={(value) => update("eyebrow", value)} placeholder="WHAT YOU NEED TO KNOW" />
              </div>
              <label className="block"><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Headline <span className="float-right normal-case tracking-normal">{characterCount}/92</span></span><textarea value={design.headline} onChange={(event) => update("headline", event.target.value)} rows={3} className="w-full resize-none border border-border bg-background px-4 py-3 font-editorial text-xl leading-tight outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[3px_3px_0_0_var(--color-primary-soft)]" placeholder="The story in one clear sentence" /></label>
              <div className="flex items-center gap-2 font-manrope text-xs"><span className={cn("h-1.5 w-1.5 rounded-full", characterCount >= 36 && characterCount <= 92 ? "bg-emerald-500" : "bg-amber-500")} /> <span className="text-muted-foreground">{readability}</span></div>
              <label className="block"><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">The takeaway</span><textarea value={design.summary} onChange={(event) => update("summary", event.target.value)} rows={3} className="w-full resize-none border border-border bg-background px-4 py-3 font-manrope text-sm leading-6 outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[3px_3px_0_0_var(--color-primary-soft)]" placeholder="Give people the useful context in two sentences." /></label>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Byline" value={design.author} onChange={(value) => update("author", value)} placeholder="The Leaders Desk" /><Field label="Date line" value={design.date} onChange={(value) => update("date", value)} placeholder="TODAY" /></div>
            </div>
          </div>

          <div className="border border-border bg-card p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><Palette className="h-3.5 w-3.5 text-primary" /> 03 / Set the visual direction</div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Canvas</span><div className="flex gap-2">{(["square", "portrait", "landscape"] as FormatKey[]).map((format) => <button key={format} onClick={() => update("format", format)} className={cn("flex-1 border px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-wider", design.format === format ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted")}>{format}</button>)}</div></div>
              <div><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Accent</span><div className="flex gap-2">{["#b71c1c", "#1e3a5f", "#a04b16", "#175f51"].map((color) => <button key={color} onClick={() => update("accent", color)} aria-label={`Use ${color}`} className={cn("h-9 flex-1 border-2 border-transparent", design.accent === color && "border-foreground")} style={{ backgroundColor: color }} />)}</div></div>
            </div>
            <div className="mt-5"><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Hero image</span>{image ? <div className="flex items-center gap-3 border border-border bg-muted/40 p-2"><img src={image} alt="Selected post visual" className="h-16 w-20 object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-manrope text-xs">{imageFile?.name || "Image URL selected"}</p><button onClick={clearImage} className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase text-primary"><X className="h-3 w-3" /> Remove</button></div></div> : <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border bg-muted/30 px-4 py-5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hover:border-primary hover:bg-primary/5"><ImagePlus className="h-4 w-4 text-primary" /> Upload image<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>}</div>
            <div className="mt-3"><input value={design.imageUrl} onChange={(event) => { update("imageUrl", event.target.value); if (event.target.value) { setImageFile(null); setPreviewImage(""); } }} className="w-full border-b border-border bg-transparent py-2 font-mono text-[11px] outline-none placeholder:text-muted-foreground/60 focus:border-primary" placeholder="…or paste an image URL" /></div>
          </div>

          <div className="border border-border bg-card p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><Share2 className="h-3.5 w-3.5 text-primary" /> 04 / Leave a handoff note</div>
            <textarea value={handoffNotes} onChange={(event) => setHandoffNotes(event.target.value)} rows={3} className="w-full resize-none border border-border bg-background px-4 py-3 font-manrope text-sm leading-6 outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[3px_3px_0_0_var(--color-primary-soft)]" placeholder="What should the next person double-check? Add source links, approval notes, or the publishing plan." />
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-4rem)] xl:min-h-[680px]">
          <div className="flex h-full flex-col border border-border bg-[#ebe7df] p-3 dark:bg-[#0b0b0b] sm:p-5">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><Monitor className="h-3.5 w-3.5 text-primary" /> Live social preview</div><div className="inline-flex items-center gap-1 border border-black/10 bg-white/70 px-2 py-1 font-mono text-[9px] uppercase text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/50"><Smartphone className="h-3 w-3" /> {design.format}</div></div>
            <div className="flex flex-1 items-center justify-center overflow-hidden py-4">
              <article className={cn("relative w-full max-w-[520px] overflow-hidden bg-[#151515] text-white shadow-[12px_12px_0_rgba(0,0,0,0.14)]", dimensions[design.format])}>
                {image && <><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" /></>}
                {!image && <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 94% 4%, ${design.accent} 0, transparent 33%), linear-gradient(135deg, #1c1c1c 0%, #090909 70%)` }} />}
                <div className="absolute left-0 top-0 h-2 w-full" style={{ backgroundColor: design.accent }} />
                <div className="relative flex h-full flex-col justify-between p-5 sm:p-8">
                  <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.18em]"><span className="inline-block h-2 w-2" style={{ backgroundColor: design.accent }} /> THE LEADERS</div><span className="border border-white/30 px-2 py-1 font-mono text-[8px] font-bold tracking-[0.13em]">{design.category || "NEWS"}</span></div>
                  <div><div className="mb-3 font-mono text-[9px] font-bold tracking-[0.15em] text-white/70">{design.eyebrow || "THE LEADERS"}</div><h2 className="font-editorial text-[clamp(1.7rem,5.3vw,3.6rem)] font-medium leading-[0.95] tracking-tight">{design.headline || "Your headline belongs here."}</h2>{showSummary && <p className="mt-4 max-w-md font-manrope text-xs leading-5 text-white/80 sm:text-sm">{design.summary}</p>}</div>
                  <div className="flex items-center justify-between border-t border-white/25 pt-3 font-mono text-[8px] tracking-[0.14em] text-white/75"><span>{design.author || "THE LEADERS DESK"}</span><span>{design.date || "TODAY"}</span></div>
                </div>
              </article>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10"><button onClick={() => setShowSummary((value) => !value)} className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"><span className={cn("flex h-4 w-4 items-center justify-center border", showSummary ? "border-primary bg-primary text-white" : "border-current")}>{showSummary && <Check className="h-3 w-3" />}</span> Include takeaway</button><button onClick={copyCaption} className="inline-flex h-9 items-center gap-2 border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hover:border-primary"><Clipboard className="h-3.5 w-3.5 text-primary" /> Copy caption</button></div>
          </div>
          <div className="mt-3 flex items-start gap-2 border border-primary/20 bg-primary/5 p-3 font-manrope text-xs leading-5 text-muted-foreground"><Share2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Download a ready-to-share PNG, copy the caption, or create the article draft for editorial review. Images from hosts that block browser export are replaced with the branded graphic background.</div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block"><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full border border-border bg-background px-3 py-2.5 font-mono text-xs uppercase outline-none transition-shadow placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[3px_3px_0_0_var(--color-primary-soft)]" /></label>;
}
