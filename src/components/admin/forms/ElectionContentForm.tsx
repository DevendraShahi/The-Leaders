"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/admin/AuthProvider";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BilingualInput from "@/components/admin/BilingualInput";
import ImageUploader from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/slug";

type ElectionContentType = "brief" | "fact-check" | "election-article";

interface ElectionContentFormProps {
    id: string;
    type: ElectionContentType;
    initialData?: any;
}

interface FormValues {
    slug: string;
    date: string;
    image: string;
    tagsText: string;
    isPublished: boolean;
    status: "draft" | "published" | "archived";
    verdict: "true" | "false" | "misleading" | "unverified";
    sourcesText: string;
    editor: string;
    title: { en: string; ne: string };
    summary: { en: string; ne: string };
    content: { en: string; ne: string };
    claim: { en: string; ne: string };
    claimBy: { en: string; ne: string };
    analysis: { en: string; ne: string };
    articleTitle: { en: string; ne: string };
    articleExcerpt: { en: string; ne: string };
    articleContent: { en: string; ne: string };
}

const normalizeLocalized = (value: unknown): { en: string; ne: string } => {
    if (!value) return { en: "", ne: "" };
    if (typeof value === "string") return { en: value, ne: "" };
    if (typeof value === "object") {
        const localized = value as { en?: string; ne?: string };
        return {
            en: typeof localized.en === "string" ? localized.en : "",
            ne: typeof localized.ne === "string" ? localized.ne : "",
        };
    }
    return { en: "", ne: "" };
};

const normalizeString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
        const localized = value as { en?: string; ne?: string };
        return localized.en || localized.ne || "";
    }
    return "";
};

const toDateInputValue = (value: unknown): string => {
    if (!value) return "";
    try {
        const parsed = new Date(String(value));
        if (Number.isNaN(parsed.getTime())) return "";
        return parsed.toISOString().slice(0, 10);
    } catch {
        return "";
    }
};

const getTypeConfig = (type: ElectionContentType) => {
    if (type === "brief") {
        return {
            title: "Edit Daily Brief",
            endpoint: "/api/admin/briefs",
            redirectType: "briefs",
            saveLabel: "Save Brief",
        };
    }

    if (type === "fact-check") {
        return {
            title: "Edit Fact Check",
            endpoint: "/api/admin/fact-checks",
            redirectType: "fact-checks",
            saveLabel: "Save Fact Check",
        };
    }

    return {
        title: "Edit Election Article",
        endpoint: "/api/admin/election-articles",
        redirectType: "election-articles",
        saveLabel: "Save Election Article",
    };
};

export default function ElectionContentForm({ id, type, initialData }: ElectionContentFormProps) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const config = getTypeConfig(type);

    const defaults: FormValues = {
        slug: normalizeString(initialData?.slug),
        date: toDateInputValue(initialData?.date) || toDateInputValue(new Date()),
        image: normalizeString(initialData?.image),
        tagsText: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : "",
        isPublished: Boolean(initialData?.isPublished),
        status: ((initialData?.status as FormValues["status"]) || (
            type === "brief"
                ? (initialData?.isPublished ? "published" : "draft")
                : (initialData ? "published" : "draft")
        )),
        verdict: (initialData?.verdict as FormValues["verdict"]) || "unverified",
        sourcesText: Array.isArray(initialData?.sources) ? initialData.sources.join("\n") : "",
        editor: normalizeString(initialData?.editor),
        title: normalizeLocalized(initialData?.title),
        summary: normalizeLocalized(initialData?.summary),
        content: normalizeLocalized(initialData?.content),
        claim: normalizeLocalized(initialData?.claim),
        claimBy: normalizeLocalized(initialData?.claimBy),
        analysis: normalizeLocalized(initialData?.analysis),
        articleTitle: normalizeLocalized({
            en: initialData?.title_en,
            ne: initialData?.title_ne,
        }),
        articleExcerpt: normalizeLocalized({
            en: initialData?.excerpt_en,
            ne: initialData?.excerpt_ne,
        }),
        articleContent: normalizeLocalized({
            en: initialData?.content_en,
            ne: initialData?.content_ne,
        }),
    };

    const form = useForm<FormValues>({ defaultValues: defaults });
    const { control, handleSubmit, setValue, getValues } = form;
    const lastAutoSlugRef = useRef<string>("");
    const briefTitle = useWatch({ control, name: "title" });
    const factClaim = useWatch({ control, name: "claim" });
    const articleTitle = useWatch({ control, name: "articleTitle" });

    useEffect(() => {
        const sourceText =
            type === "brief"
                ? (briefTitle?.en || briefTitle?.ne || "")
                : type === "fact-check"
                    ? (factClaim?.en || factClaim?.ne || "")
                    : (articleTitle?.en || articleTitle?.ne || "");

        const nextAutoSlug = slugify(sourceText, 90);
        if (!nextAutoSlug) return;

        const currentSlug = getValues("slug") || "";
        const canAutoUpdate = !currentSlug || currentSlug === lastAutoSlugRef.current;

        if (canAutoUpdate) {
            setValue("slug", nextAutoSlug, { shouldDirty: false, shouldTouch: false });
            lastAutoSlugRef.current = nextAutoSlug;
        }
    }, [type, briefTitle, factClaim, articleTitle, getValues, setValue]);

    const onSubmit = async (values: FormValues) => {
        if (!token) {
            toast.error("Missing auth token");
            return;
        }

        setLoading(true);
        try {
            const tags = values.tagsText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            let payload: Record<string, unknown> = {};

            if (type === "brief") {
                payload = {
                    title: values.title,
                    slug: values.slug,
                    date: values.date ? new Date(values.date).toISOString() : undefined,
                    summary: values.summary,
                    content: values.content,
                    tags,
                    status: values.status,
                    isPublished: values.status === "published",
                    image: values.image || undefined,
                };
            } else if (type === "fact-check") {
                payload = {
                    claim: values.claim,
                    claimBy: values.claimBy,
                    slug: values.slug || undefined,
                    verdict: values.verdict,
                    status: values.status,
                    analysis: values.analysis,
                    sources: values.sourcesText
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    date: values.date ? new Date(values.date).toISOString() : undefined,
                    image: values.image || undefined,
                };
            } else {
                payload = {
                    editor: values.editor || "The Leaders Editorial",
                    title_en: values.articleTitle.en,
                    title_ne: values.articleTitle.ne || undefined,
                    excerpt_en: values.articleExcerpt.en,
                    excerpt_ne: values.articleExcerpt.ne || undefined,
                    content_en: values.articleContent.en,
                    content_ne: values.articleContent.ne || undefined,
                    slug: values.slug,
                    tags,
                    status: values.status,
                    image: values.image || undefined,
                };
            }

            const isCreateMode = id === "new";
            const endpoint = isCreateMode ? config.endpoint : `${config.endpoint}/${id}`;
            const res = await fetch(endpoint, {
                method: isCreateMode ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result?.error || "Failed to save");
            }

            toast.success(isCreateMode ? "Created successfully" : "Saved successfully");
            router.push(`/admin/content?type=${config.redirectType}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300 pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-none h-10 w-10 border-border"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="font-bebas text-3xl md:text-4xl tracking-wide">
                                {id === "new" ? config.title.replace("Edit ", "New ") : config.title}
                            </h1>
                            <p className="text-sm text-muted-foreground font-manrope">Full editor with image and localized fields.</p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="rounded-none font-mono uppercase tracking-wider text-xs min-w-[170px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {config.saveLabel}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="rounded-none border-border shadow-sm lg:col-span-2">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                            <CardTitle className="font-bebas text-lg tracking-wide">Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {(type === "brief" || type === "fact-check" || type === "election-article") && (
                                <FormField
                                    control={control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Slug</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="rounded-none border-border" placeholder="content-slug" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {(type === "brief" || type === "fact-check") && (
                                <FormField
                                    control={control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="rounded-none border-border" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {type === "brief" && (
                                <>
                                    <BilingualInput form={form} name="title" label="Title" required />
                                    <BilingualInput form={form} name="summary" label="Summary" type="textarea" />
                                    <BilingualInput form={form} name="content" label="Content" type="textarea" required />
                                </>
                            )}

                            {type === "fact-check" && (
                                <>
                                    <BilingualInput form={form} name="claim" label="Claim" type="textarea" required />
                                    <BilingualInput form={form} name="claimBy" label="Claimed By" />
                                    <FormField
                                        control={control}
                                        name="verdict"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-mono text-xs uppercase">Verdict</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-none border-border">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-none">
                                                        <SelectItem value="true">True</SelectItem>
                                                        <SelectItem value="false">False</SelectItem>
                                                        <SelectItem value="misleading">Misleading</SelectItem>
                                                        <SelectItem value="unverified">Unverified</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <BilingualInput form={form} name="analysis" label="Analysis" type="textarea" />
                                    <FormField
                                        control={control}
                                        name="sourcesText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-mono text-xs uppercase">Sources (one per line)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} className="rounded-none border-border min-h-[120px]" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {type === "election-article" && (
                                <>
                                    <FormField
                                        control={control}
                                        name="editor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-mono text-xs uppercase">Editor</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="rounded-none border-border" placeholder="The Leaders Editorial" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <BilingualInput form={form} name="articleTitle" label="Title" required />
                                    <BilingualInput form={form} name="articleExcerpt" label="Excerpt" type="textarea" />
                                    <BilingualInput form={form} name="articleContent" label="Content" type="textarea" required />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border-border shadow-sm">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                            <CardTitle className="font-bebas text-lg tracking-wide">Meta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <FormField
                                control={control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-mono text-xs uppercase">Cover Image</FormLabel>
                                        <FormControl>
                                            <div className="aspect-video bg-muted/20 border border-border">
                                                <ImageUploader value={field.value} onChange={field.onChange} category="general" />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="tagsText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-mono text-xs uppercase">Tags (comma separated)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="rounded-none border-border min-h-[100px]" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {(type === "brief" || type === "fact-check" || type === "election-article") && (
                                <FormField
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-none border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-none">
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
}
