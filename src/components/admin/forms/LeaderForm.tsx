"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash, ArrowLeft, Save, Calendar, BookOpen, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/admin/AuthProvider";
import ImageUploader from "@/components/admin/ImageUploader";
import BilingualInput from "@/components/admin/BilingualInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface LeaderFormProps {
    initialData?: any;
    id: string;
}

export default function LeaderForm({ initialData, id }: LeaderFormProps) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    // Helper to normalize bilingual fields
    const normalize = (val: any) => {
        if (!val) return { en: "", ne: "" };
        if (typeof val === 'string') return { en: val, ne: "" };
        return {
            en: val.en || "",
            ne: val.ne || ""
        };
    };

    // Helper to normalize stats which might be numbers or strings or objects
    const normalizeStat = (val: any) => {
        if (!val) return { en: "", ne: "" };
        if (typeof val === 'string' || typeof val === 'number') return { en: String(val), ne: "" };
        return {
            en: val.en || "",
            ne: val.ne || ""
        };
    };



    const getInitialStats = () => {
        if (!initialData) return [];

        // If already dynamic array (legacy/transition state)
        if (Array.isArray(initialData.stats) && initialData.stats.length > 0) {
            return initialData.stats.map((s: any) => ({
                label: normalize(s.label),
                value: normalize(s.value)
            }));
        }

        // If Object (Preferred Format): Convert Record<key, value> -> Array<{label: key, value: value}>
        if (initialData.stats && typeof initialData.stats === 'object' && !Array.isArray(initialData.stats)) {
            return Object.entries(initialData.stats).map(([key, value]: [string, any]) => ({
                label: { en: key.replace(/_/g, ' '), ne: key.replace(/_/g, ' ') }, // Default label is the key (formatted)
                value: normalizeStat(value)
            }));
        }

        return [];
    };

    // Normalize initial data
    const defaults = initialData ? {
        ...initialData,
        name: normalize(initialData.name),
        role: normalize(initialData.role || initialData.position),
        party: normalize(initialData.party),
        years: normalize(initialData.years),
        bio: normalize(initialData.bio),
        desc: normalize(initialData.desc),
        stats: getInitialStats(),
        timeline: (initialData.timeline || []).map((t: any) => ({
            year: t.year || "",
            event: normalize(t.event)
        }))
    } : {
        name: { en: "", ne: "" },
        role: { en: "", ne: "" },
        party: { en: "", ne: "" },
        years: { en: "", ne: "" },
        bio: { en: "", ne: "" },
        desc: { en: "", ne: "" },
        image: "",
        cover: "",
        status: "draft",
        slug: "",
        stats: [],
        timeline: []
    };

    const form = useForm({
        defaultValues: defaults
    });

    const { control, handleSubmit, watch, setValue, setError, clearErrors } = form;

    // Timeline Field Array
    const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
        control,
        name: "timeline"
    });

    // Stats Field Array
    const { fields: statsFields, append: appendStat, remove: removeStat } = useFieldArray({
        control,
        name: "stats"
    });

    const validateBilingual = (data: any, path: string, label: string) => {
        const val = data[path] || (path.includes('.') ? path.split('.').reduce((o, i) => o?.[i], data) : undefined);
        if (!val || (!val.en?.trim() && !val.ne?.trim())) {
            toast.error(`${label} requires at least one language (English or Nepali).`);
            return false;
        }
        return true;
    };

    const onSubmit = async (data: any) => {
        // Client-side validation for "At least one language"
        const isValid = [
            validateBilingual(data, 'name', 'Name'),
            validateBilingual(data, 'role', 'Role'),
            validateBilingual(data, 'party', 'Party'),
            validateBilingual(data, 'years', 'Years'),
            validateBilingual(data, 'desc', 'Description'),
        ].every(Boolean);

        if (!isValid) return;

        setLoading(true);
        const method = id === "new" ? "POST" : "PUT";
        const endpoint = id === "new" ? "/api/admin/leaders" : `/api/admin/leaders/${id}`;

        // Transform Stats Array -> Object Record<string, {en, ne}>
        const statsObject: Record<string, { en: string; ne: string }> = {};
        if (Array.isArray(data.stats)) {
            data.stats.forEach((s: any) => {
                // Use English label as the key (snake_case)
                if (s.label?.en) {
                    const key = s.label.en.toLowerCase().trim().replace(/\s+/g, '_');
                    statsObject[key] = {
                        en: s.value.en || "",
                        ne: s.value.ne || ""
                    };
                }
            });
        }

        const payload = {
            ...data,
            position: data.role, // Map form 'role' to schema 'position'
            stats: statsObject // Send Object instead of Array
        };

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(id === "new" ? "Leader created successfully" : "Leader updated successfully");
                router.push("/admin/content?type=leaders");
                router.refresh();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to save leader");
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
                                {id === 'new' ? 'Add New Leader' : 'Edit Leader Profile'}
                            </h1>
                            <p className="text-muted-foreground font-manrope text-sm">
                                Create a comprehensive profile with timeline and stats.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Metadata & Images */}
                    <div className="space-y-8 lg:col-span-1">

                        {/* Profile Image */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-primary" />
                                    Identity Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <FormField
                                    control={control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Profile Portrait</FormLabel>
                                            <FormControl>
                                                <div className="aspect-square bg-muted/20 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                                                    <ImageUploader
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        folder="leaders"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="cover"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Cover Image</FormLabel>
                                            <FormControl>
                                                <div className="aspect-video bg-muted/20 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                                                    <ImageUploader
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        folder="leaders/covers"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Quick Stats (Dynamic Array) */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                <CardTitle className="font-bebas text-lg tracking-wide flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-primary" />
                                    Key Statistics
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => appendStat({ label: { en: "", ne: "" }, value: { en: "", ne: "" } })}
                                    className="h-6 w-6 p-0 rounded-full hover:bg-muted"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                {statsFields.map((field, index) => (
                                    <div key={field.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0 relative group">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeStat(index)}
                                            className="absolute -right-2 -top-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-3 w-3" />
                                        </Button>
                                        <div className="space-y-3">
                                            {/* Label Input */}
                                            <BilingualInput
                                                form={form}
                                                name={`stats.${index}.label`}
                                                label={`Stat ${index + 1} Label`}
                                                placeholderEn="e.g. Terms"
                                                placeholderNe="e.g. कार्यकाल"
                                                className="mb-2"
                                            />
                                            {/* Value Input */}
                                            <BilingualInput
                                                form={form}
                                                name={`stats.${index}.value`}
                                                label=""
                                                placeholderEn="Value"
                                                placeholderNe="मान"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {statsFields.length === 0 && (
                                    <div className="text-center text-xs text-muted-foreground font-mono uppercase">
                                        No stats added.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide">Visibility</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <FormField
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Publishing Status</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-full rounded-none border-border font-mono text-xs uppercase">
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-none">
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="published">Published</SelectItem>
                                                        <SelectItem value="archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="mt-6">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full font-mono uppercase text-sm font-bold tracking-wider rounded-none h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Main Content */}
                    <div className="space-y-8 lg:col-span-2">

                        {/* Basic Info */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide">Core Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Name Input */}
                                <BilingualInput
                                    form={form}
                                    name="name"
                                    label="Full Name"
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <BilingualInput form={form} name="party" label="Party Affiliation" placeholderEn="Nepali Congress" placeholderNe="नेपाली कांग्रेस" required />
                                    <BilingualInput form={form} name="role" label="Primary Role / Title" placeholderEn="The Democratic Spirit" placeholderNe="प्रजातान्त्रिक योद्धा" required />
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <BilingualInput form={form} name="years" label="Lifespan / Active Years" placeholderEn="1914 - 1982" placeholderNe="१९१४ - १९८२" required />
                                </div>

                                <FormField
                                    control={control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">URL Slug</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="rounded-none border-border font-mono text-xs text-muted-foreground" placeholder="auto-generated-if-empty" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <BilingualInput
                                    form={form}
                                    name="desc"
                                    label="Short Description (Excerpt)"
                                    type="textarea"
                                    placeholderEn="Brief summary of their legacy..."
                                    placeholderNe="उहाँको योगदानको संक्षिप्त सारांश..."
                                />
                            </CardContent>
                        </Card>

                        {/* Biography */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide">Detailed Biography</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 p-0">
                                <BilingualInput
                                    form={form}
                                    name="bio"
                                    label="Full Biography (Markdown Supported)"
                                    type="textarea"
                                    className="border-0 p-0"
                                    placeholderEn="# Early Life..."
                                    placeholderNe="# प्रारम्भिक जीवन..."
                                />
                            </CardContent>
                        </Card>

                        {/* Timeline Editor */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                <CardTitle className="font-bebas text-lg tracking-wide">Historical Timeline</CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendTimeline({ year: "", event: { en: "", ne: "" } })}
                                    className="h-7 text-xs font-mono uppercase rounded-none border-primary/20 text-primary hover:bg-primary/5"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Event
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {timelineFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-4 items-start group border-b border-border/50 pb-6 last:border-0 last:pb-0">
                                        <div className="col-span-2">
                                            <Input
                                                {...form.register(`timeline.${index}.year`)}
                                                placeholder="Year"
                                                className="rounded-none border-border font-bebas text-lg"
                                            />
                                        </div>
                                        <div className="col-span-9">
                                            <BilingualInput
                                                form={form}
                                                name={`timeline.${index}.event`}
                                                label=""
                                                type="textarea"
                                                placeholderEn="Event description..."
                                                placeholderNe="घटना विवरण..."
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTimeline(index)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {timelineFields.length === 0 && (
                                    <div className="text-center py-8 border border-dashed border-border/50 text-muted-foreground">
                                        <p className="font-mono text-xs uppercase">No timeline events added yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </form>
        </Form>
    );
}
