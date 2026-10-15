"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft, ArrowUpRight, Check, Clipboard, Download, ImagePlus,
  Loader2, Monitor, Newspaper, Palette, RotateCcw, Save, Share2, Smartphone,
  Sparkles, Type, X
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/admin/AuthProvider";
import {
  drawNewsPostGraphic,
  postGraphicDimensions,
  type FormatKey,
  type NewsPostDesign,
  type TemplateKey } from "@/components/admin/news-post-graphic";
import { cn } from "@/lib/utils";

type Design = NewsPostDesign;

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
  accent: "#b71c1c" };

const DESIGNER_DRAFT_KEY = "the-leaders:news-post-designer:draft";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}

export default function NewsPostDesigner() {
  const { isAuthenticated } = useAuth();
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
  const [graphicIssue, setGraphicIssue] = useState<string | null>(null);
  const graphicRef = useRef<HTMLCanvasElement>(null);
  const graphicRenderVersion = useRef(0);

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
  const [graphicWidth, graphicHeight] = postGraphicDimensions[design.format];

  useEffect(() => {
    const canvas = graphicRef.current;
    if (!canvas) return;

    const renderVersion = graphicRenderVersion.current + 1;
    graphicRenderVersion.current = renderVersion;
    const isCurrentRender = () => graphicRenderVersion.current === renderVersion;

    void drawNewsPostGraphic(canvas, { design, imageUrl: image, showSummary, shouldCommit: isCurrentRender })
      .then((result) => {
        if (isCurrentRender()) setGraphicIssue(result.issue || null);
      })
      .catch(() => {
        if (isCurrentRender()) {
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
          setGraphicIssue("The card preview could not be rendered. Refresh and try again.");
        }
      });

    return () => {
      if (isCurrentRender()) graphicRenderVersion.current += 1;
    };
  }, [design, image, showSummary]);

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
      quote: { eyebrow: "IN THEIR WORDS", category: "VOICES", headline: "“The public deserves a conversation built on facts.”", summary: "A moment from today’s conversation, with the full context linked in the post." } };
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
    const canvas = graphicRef.current;
    if (!canvas) return;

    try {
      const result = await drawNewsPostGraphic(canvas, { design, imageUrl: image, showSummary });
      if (!result.canExport) throw new Error(result.issue || "The card cannot be exported in its current state.");
      const file = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!file) throw new Error("The graphic could not be prepared for download.");

      const href = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${slugify(design.headline || "the-leaders-post")}-${design.format}.png`;
      anchor.click();
      URL.revokeObjectURL(href);
      toast.success("Social card downloaded as a PNG.");
    } catch (error: any) {
      toast.error(error?.message || "Couldn’t prepare the social card.");
    }
  };

  const createDraft = async () => {
    if (!design.headline.trim()) {
      toast.error("Add a headline before creating a draft.");
      return;
    }
    if (!isAuthenticated) {
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
        const media = await fetch("/api/admin/media/upload", { method: "POST", headers: {  }, body });
        const payload = await media.json();
        if (!media.ok) throw new Error(payload?.error || "Image upload failed");
        imageUrl = payload?.data?.media?.secureUrl || "";
      }
      const post = {
        title: { en: design.headline, ne: "" },
        excerpt: { en: design.summary, ne: "" },
        content: { en: `<p>${escapeHtml(design.summary)}</p><p><strong>${escapeHtml(design.eyebrow)}</strong></p>`, ne: "" },
        author: { en: design.author || "The Leaders Desk", ne: "" },
        category: { en: design.category, ne: "" },
        image: imageUrl,
        tags: [design.category.toLowerCase(), "news"],
        slug: `${slugify(design.headline)}-${Date.now().toString().slice(-5)}`,
        status: "draft",
        isFeatured: false,
        publishedDate: new Date().toISOString(),
        editorialWorkflow: {
          projectName: projectName.trim() || "Untitled post",
          handoffNotes: handoffNotes.trim(),
          source: "news-post-designer" } };
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post) });
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
            <button onClick={downloadGraphic} disabled={Boolean(graphicIssue)} className="inline-flex h-10 items-center gap-2 border border-border px-4 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-3.5 w-3.5" /> Download card</button>
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
            <p className="mt-2 font-manrope text-xs text-muted-foreground">Private to authenticated content editors. This note is never added to the public article body.</p>
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-4rem)] xl:min-h-[680px]">
          <div className="flex h-full flex-col border border-border bg-[#ebe7df] p-3 dark:bg-[#0b0b0b] sm:p-5">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><Monitor className="h-3.5 w-3.5 text-primary" /> Live social preview</div><div className="inline-flex items-center gap-1 border border-black/10 bg-white/70 px-2 py-1 font-mono text-[9px] uppercase text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/50"><Smartphone className="h-3 w-3" /> {design.format}</div></div>
            <div className="flex flex-1 items-center justify-center overflow-hidden py-4">
              <canvas
                ref={graphicRef}
                width={graphicWidth}
                height={graphicHeight}
                aria-label={`Exact ${design.format} social-card output`}
                className="block h-auto max-h-[62vh] max-w-full border border-black/30 bg-[#0d0d0d] shadow-[12px_12px_0_rgba(0,0,0,0.14)] dark:border-white/10"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 dark:border-white/10"><button onClick={() => setShowSummary((value) => !value)} className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"><span className={cn("flex h-4 w-4 items-center justify-center border", showSummary ? "border-primary bg-primary text-white" : "border-current")}>{showSummary && <Check className="h-3 w-3" />}</span> Include takeaway</button><button onClick={copyCaption} className="inline-flex h-9 items-center gap-2 border border-border bg-card px-3 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors hover:border-primary"><Clipboard className="h-3.5 w-3.5 text-primary" /> Copy caption</button></div>
          </div>
          {graphicIssue && <p role="alert" className="mt-3 border border-primary/35 bg-primary/10 p-3 font-manrope text-xs leading-5 text-foreground">{graphicIssue}</p>}
          <div className="mt-3 flex items-start gap-2 border border-primary/20 bg-primary/5 p-3 font-manrope text-xs leading-5 text-muted-foreground"><Share2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> This artboard is the exact PNG you download. If an image host blocks browser use, both preview and export retain the branded graphic background.</div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block"><span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full border border-border bg-background px-3 py-2.5 font-mono text-xs uppercase outline-none transition-shadow placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[3px_3px_0_0_var(--color-primary-soft)]" /></label>;
}
