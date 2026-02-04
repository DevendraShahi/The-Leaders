"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, ArrowLeft, Plus, Trash, Calendar, MapPin, Link as LinkIcon, AlertCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/admin/AuthProvider";
import ImageUploader from "@/components/admin/ImageUploader";
import BilingualInput from "@/components/admin/BilingualInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface HistoryFormProps {
    initialData?: any;
    id: string;
}

export default function HistoryForm({ initialData, id }: HistoryFormProps) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        defaultValues: initialData || {
            title: { en: "", ne: "" },
            date: new Date().toISOString(),
            content: { en: "", ne: "" },
            image: "",
            location: "",
            significance: "High",
            status: "draft",
            timeline: [] // Sub-events
        }
    });

    const { control, handleSubmit } = form;

    // Sub-events timeline
    const { fields, append, remove } = useFieldArray({
        control,
        name: "timeline"
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        const method = id === "new" ? "POST" : "PUT";
        const endpoint = id === "new" ? "/api/admin/history" : `/api/admin/history/${id}`;

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
                toast.success(id === "new" ? "History event created" : "History event updated");
                router.push("/admin/content?type=history");
                router.refresh();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to save history event");
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
                                {id === 'new' ? 'New Historical Event' : 'Edit Event'}
                            </h1>
                            <p className="text-muted-foreground font-manrope text-sm">
                                Document creating significant political moments.
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
                            Save Event
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Title & Date */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide">Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <BilingualInput form={form} name="title" label="Event Name" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-mono text-xs uppercase">Primary Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                                                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                                                        className="rounded-none border-border"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-mono text-xs uppercase">Location (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="rounded-none border-border" placeholder="e.g. Kathmandu, Narayanhiti" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={control}
                                    name="content.en"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Description (English)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} className="rounded-none border-border min-h-[100px]" placeholder="Detailed description..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="content.ne"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Description (Nepali)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} className="rounded-none border-border min-h-[100px]" placeholder="विस्तृत विवरण..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Sub-Events Timeline */}
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border flex flex-row items-center justify-between">
                                <CardTitle className="font-bebas text-lg tracking-wide">Key Moments / Sub-Events</CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ date: new Date().toISOString(), title: "", description: "" })}
                                    className="h-7 text-xs font-mono uppercase rounded-none border-primary/20 text-primary hover:bg-primary/5"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Sub-Event
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="relative pl-6 border-l-2 border-primary/10 group">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="absolute -left-9 top-0 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent rounded-none"
                                        >
                                            <Trash className="h-3 w-3" />
                                        </Button>
                                        <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary" />

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="col-span-1">
                                                    <Input
                                                        type="date"
                                                        {...form.register(`timeline.${index}.date`)}
                                                        className="rounded-none border-border text-xs"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        {...form.register(`timeline.${index}.title`)}
                                                        placeholder="Sub-event title..."
                                                        className="rounded-none border-border font-bold text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <Textarea
                                                {...form.register(`timeline.${index}.description`)}
                                                placeholder="Brief detail of this moment..."
                                                className="rounded-none border-border min-h-[60px] text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground font-mono text-xs uppercase">
                                        No sub-events added. Use this for multi-stage historical events.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8 lg:col-span-1">
                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" /> Visual Evidence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <FormField
                                    control={control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Historical Photo</FormLabel>
                                            <FormControl>
                                                <div className="aspect-video bg-muted/20 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                                                    <ImageUploader
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        folder="history"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border-border shadow-sm">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                                <CardTitle className="font-bebas text-lg tracking-wide">Classification</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <FormField
                                    control={control}
                                    name="significance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-mono text-xs uppercase">Impact Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-none border-border">
                                                        <SelectValue placeholder="Select impact" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-none">
                                                    <SelectItem value="High">Global / National Shift</SelectItem>
                                                    <SelectItem value="Medium">Major Policy / Reform</SelectItem>
                                                    <SelectItem value="Low">Minor / Regional</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
