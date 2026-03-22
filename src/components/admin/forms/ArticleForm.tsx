"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Calendar, Tag, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/admin/AuthProvider";
import ImageUploader from "@/components/admin/ImageUploader";
import BilingualInput from "@/components/admin/BilingualInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ArticleFormProps {
    initialData?: any;
    id: string;
}

export default function ArticleForm({ initialData, id }: ArticleFormProps) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

    // Helper to normalize bilingual fields
    const normalize = (val: any) => {
        if (!val) return { en: "", ne: "" };
        if (typeof val === 'string') return { en: val, ne: "" };
        return {
            en: val.en || "",
            ne: val.ne || ""
        };
    };

    const defaults = initialData ? {
        ...initialData,
        title: normalize(initialData.title),
        excerpt: normalize(initialData.excerpt),
        content: normalize(initialData.content),
        author: normalize(initialData.author),
        category: normalize(initialData.category),
        status: initialData.status || "draft",
    } : {
        title: { en: "", ne: "" },
        excerpt: { en: "", ne: "" },
        content: { en: "", ne: "" },
        author: { en: "Editorial Team", ne: "सम्म्पादकीय समूह" },
        category: { en: "Politics", ne: "राजनीति" },
        slug: "",
        image: "",
        tags: [],
        status: "draft",
        isFeatured: false,
        publishedDate: new Date().toISOString()
    };

    const form = useForm({
        defaultValues: defaults
    });

    const { control, handleSubmit, setValue, watch } = form;

    // Tag management
    const [tagInput, setTagInput] = useState("");
    const tags = watch("tags") || [];

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setValue("tags", [...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue("tags", tags.filter((tag: string) => tag !== tagToRemove));
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        let imageUrl = data.image;

        // Perform deferred image upload if a file was selected locally
        if (selectedImageFile) {
            const formData = new FormData();
            formData.append('file', selectedImageFile);
            formData.append('category', 'article');
            formData.append('folder', 'articles');

            try {
                const uploadRes = await fetch('/api/admin/media/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (!uploadRes.ok) throw new Error('Failed to upload image');
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.data.media.secureUrl;
                data.image = imageUrl;
            } catch (error) {
                console.error("Image upload failed", error);
                toast.error('Failed to upload image.');
                setLoading(false);
                return;
            }
        }

        // Ensure slug exists
        if (!data.slug && data.title?.en) {
            data.slug = data.title.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        } else if (!data.slug) {
            data.slug = 'article-' + Date.now();
        }

        const method = id === "new" ? "POST" : "PUT";
        const endpoint = id === "new" ? "/api/admin/articles" : `/api/admin/articles/${id}`;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                toast.success(id === "new" ? "Article created successfully" : "Article updated successfully");
                router.push("/admin/content?type=articles");
                router.refresh();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to save article");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500 pb-20">
                {/* Header Actions */}
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
                            <h1 className="font-bebas text-3xl md:text-4xl text-foreground tracking-wide">
                                {id === 'new' ? 'New Article' : 'Edit Article'}
                            </h1>
                            <p className="text-muted-foreground font-manrope text-sm">
                                Manage editorial content and translations.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <FormField
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-[140px] h-10 rounded-none border-border font-mono text-xs uppercase bg-card">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={loading}
                            className="font-mono uppercase text-xs font-bold tracking-wider rounded-none h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Article
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Title & Excerpt */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide">Core Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <BilingualInput form={form} name="title" label="Article Title" />

                                <FormField
                                    control={control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel className="font-mono text-xs uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                                                    <Tag className="w-3 h-3" /> URL Slug
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="flex items-center">
                                                    <span className="bg-muted px-3 py-2 border border-r-0 border-border text-xs text-muted-foreground font-mono rounded-l-none">/articles/</span>
                                                    <Input
                                                        {...field}
                                                        placeholder="auto-generated-from-title"
                                                        className="rounded-none rounded-r-sm font-mono text-sm border-border focus-visible:ring-1 bg-background"
                                                    />
                                                </div>
                                            </FormControl>
                                            <p className="text-[10px] text-muted-foreground mt-1">Leave empty to auto-generate from English Title</p>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-6">
                                    <FormField
                                        control={control}
                                        name="excerpt.en"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-mono text-xs uppercase">Excerpt (English)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} className="rounded-none border-border min-h-[100px]" placeholder="Brief summary..." />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="excerpt.ne"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-mono text-xs uppercase">Excerpt (Nepali)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} className="rounded-none border-border min-h-[100px]" placeholder="संक्षिप्त सारांश..." />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rich Text Editor */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Full Article Body
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 p-0">
                                {/* Using Tabs for EN/NE Content Editing if I had tabs, otherwise stack */}
                                <div className="p-4 border-b border-border bg-muted/10 font-mono text-xs uppercase text-muted-foreground">
                                    English Content
                                </div>
                                <div className="p-0 border-b border-border">
                                    <FormField
                                        control={control}
                                        name="content.en"
                                        render={({ field }) => (
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Write article in English..."
                                            />
                                        )}
                                    />
                                </div>
                                <div className="p-4 border-b border-border bg-muted/10 font-mono text-xs uppercase text-muted-foreground">
                                    Nepali Content
                                </div>
                                <div className="p-0">
                                    <FormField
                                        control={control}
                                        name="content.ne"
                                        render={({ field }) => (
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="नेपालीमा लेख लेख्नुहोस्..."
                                            />
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8 lg:col-span-1">

                        {/* Featured Image */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" /> Media
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <FormField
                                    control={control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Featured Image</FormLabel>
                                            <FormControl>
                                                <div className="aspect-video bg-muted/20 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                                                    <ImageUploader
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onFileSelect={setSelectedImageFile}
                                                        folder="articles"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide">Attributes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center space-x-2 border p-3 rounded-none bg-muted/10">
                                    <FormField
                                        control={control}
                                        name="isFeatured"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 rounded-none border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="font-mono text-xs uppercase font-bold cursor-pointer">
                                                        Mark as Featured
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <BilingualInput form={form} name="author" label="Author Name" />
                                <BilingualInput form={form} name="category" label="Category" />

                                <div className="space-y-2">
                                    <label className="font-mono text-xs uppercase font-medium">Tags</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            className="rounded-none border-border h-8 text-sm"
                                            placeholder="Add tag..."
                                        />
                                        <Button
                                            type="button"
                                            onClick={addTag}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-none h-8 font-mono uppercase"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {tags.map((tag: string) => (
                                            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono border border-border bg-muted/50 text-muted-foreground uppercase">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
