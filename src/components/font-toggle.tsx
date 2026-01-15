"use client";

import { useFont, FontOption } from "@/components/font-provider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Type, ChevronDown } from "lucide-react";

const FONT_LABELS: Record<FontOption, string> = {
    bebas: "Default (Propaganda)",
    anton: "Impact (Action)",
    cinzel: "Imperial (Epic)",
    oswald: "Classic (Thriller)",
    "six-caps": "Tall (Crime)",
    fjalla: "Clean (Drama)",
};

export function FontToggle() {
    const { currentFont, setFont } = useFont();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 px-3 hover:bg-primary/10 hover:text-primary gap-2 bg-black/50 border border-transparent hover:border-primary/20">
                    <Type className="h-5 w-5" />
                    <span className="hidden sm:inline font-bebas tracking-wide text-sm">{FONT_LABELS[currentFont]}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-black border-primary/20 text-white">
                <DropdownMenuRadioGroup value={currentFont} onValueChange={(val) => setFont(val as FontOption)}>
                    {Object.entries(FONT_LABELS).map(([key, label]) => (
                        <DropdownMenuRadioItem key={key} value={key} className="font-bebas tracking-wider cursor-pointer focus:bg-primary focus:text-black">
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
