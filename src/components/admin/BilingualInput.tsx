import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BilingualInputProps {
    label: string;
    // Manual props (optional if form/name provided)
    valueEn?: string;
    valueNe?: string;
    onChangeEn?: (value: string) => void;
    onChangeNe?: (value: string) => void;
    errorEn?: string;
    errorNe?: string;
    // RHF props
    form?: UseFormReturn<any>;
    name?: string;
    // Common props
    placeholderEn?: string;
    placeholderNe?: string;
    type?: 'text' | 'textarea';
    required?: boolean;
    className?: string;
}

export default function BilingualInput({
    label,
    valueEn,
    valueNe,
    onChangeEn,
    onChangeNe,
    errorEn,
    errorNe,
    form,
    name,
    placeholderEn,
    placeholderNe,
    type = 'text',
    required = false,
    className
}: BilingualInputProps) {
    const [activeTab, setActiveTab] = useState<'en' | 'ne'>('en');

    const Header = () => (
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                {label}
                {required && <span className="text-destructive">*</span>}
            </label>

            {/* Language Toggler */}
            <div className="flex p-0.5 bg-muted rounded-none border border-border">
                <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none",
                        activeTab === 'en'
                            ? "bg-background text-primary shadow-sm border border-border"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    English
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('ne')}
                    className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none",
                        activeTab === 'ne'
                            ? "bg-background text-primary shadow-sm border border-border"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    नेपाली
                </button>
            </div>
        </div>
    );

    const commonInputClasses = (error: boolean) => cn(
        "rounded-none border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-manrope",
        error ? "border-destructive focus-visible:ring-destructive" : ""
    );

    // React Hook Form Mode
    if (form && name) {
        return (
            <div className={cn("space-y-2", className)}>
                <Header />
                <div className="relative">
                    {/* EN Field */}
                    <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                        <FormField
                            control={form.control}
                            name={`${name}.en`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {type === 'textarea' ? (
                                            <Textarea
                                                {...field}
                                                placeholder={placeholderEn || "Enter content in English"}
                                                className={cn(commonInputClasses(!!(form.formState.errors[name] as any)?.en), "min-h-[120px]")}
                                            />
                                        ) : (
                                            <Input
                                                {...field}
                                                placeholder={placeholderEn || "English text"}
                                                className={cn(commonInputClasses(!!(form.formState.errors[name] as any)?.en), "h-10")}
                                            />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* NE Field */}
                    <div className={activeTab === 'ne' ? 'block' : 'hidden'}>
                        <FormField
                            control={form.control}
                            name={`${name}.ne`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {type === 'textarea' ? (
                                            <Textarea
                                                {...field}
                                                placeholder={placeholderNe || "नेपालीमा सामग्री लेख्नुहोस्"}
                                                className={cn(commonInputClasses(!!(form.formState.errors[name] as any)?.ne), "min-h-[120px]")}
                                            />
                                        ) : (
                                            <Input
                                                {...field}
                                                placeholder={placeholderNe || "नेपाली पाठ"}
                                                className={cn(commonInputClasses(!!(form.formState.errors[name] as any)?.ne), "h-10")}
                                            />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Language Indicator Icon inside input */}
                    <div className="absolute right-3 top-3 text-[10px] font-bold text-muted-foreground/30 pointer-events-none uppercase tracking-widest z-10">
                        {activeTab}
                    </div>
                </div>
            </div>
        );
    }

    // Manual Mode
    return (
        <div className={cn("space-y-2", className)}>
            <Header />

            {/* Input Field */}
            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        value={activeTab === 'en' ? valueEn : valueNe}
                        onChange={(e) => activeTab === 'en' ? onChangeEn?.(e.target.value) : onChangeNe?.(e.target.value)}
                        placeholder={activeTab === 'en' ? (placeholderEn || "Enter content in English") : (placeholderNe || "नेपालीमा सामग्री लेख्नुहोस्")}
                        className={cn(
                            "flex w-full min-h-[120px]",
                            commonInputClasses((activeTab === 'en' && !!errorEn) || (activeTab === 'ne' && !!errorNe))
                        )}
                    />
                ) : (
                    <input
                        type="text"
                        value={activeTab === 'en' ? valueEn : valueNe}
                        onChange={(e) => activeTab === 'en' ? onChangeEn?.(e.target.value) : onChangeNe?.(e.target.value)}
                        placeholder={activeTab === 'en' ? (placeholderEn || "English text") : (placeholderNe || "नेपाली पाठ")}
                        className={cn(
                            "flex w-full h-10",
                            commonInputClasses((activeTab === 'en' && !!errorEn) || (activeTab === 'ne' && !!errorNe))
                        )}
                    />
                )}
                {/* Language Indicator Icon inside input */}
                <div className="absolute right-3 top-3 text-[10px] font-bold text-muted-foreground/30 pointer-events-none uppercase tracking-widest">
                    {activeTab}
                </div>
            </div>

            {/* Errors */}
            {(errorEn || errorNe) && (
                <div className="text-xs space-y-1">
                    {errorEn && <p className="text-destructive font-bold uppercase text-[10px]">EN: {errorEn}</p>}
                    {errorNe && <p className="text-destructive font-bold uppercase text-[10px]">NE: {errorNe}</p>}
                </div>
            )}
        </div>
    );
}
