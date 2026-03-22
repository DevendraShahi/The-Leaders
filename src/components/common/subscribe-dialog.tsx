"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SubscribeForm } from "./subscribe-form";

export function SubscribeDialog({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-border bg-background/95 backdrop-blur-xl">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="font-bebas text-4xl tracking-wide text-center uppercase">
                        Join The Inner Circle
                    </DialogTitle>
                    <DialogDescription className="text-center font-manrope text-base">
                        Subscribe to receive exclusive insights, biography updates, and historical archives directly to your inbox.
                    </DialogDescription>
                    <p className="text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Continue with Google for one-click verified subscription
                    </p>
                </DialogHeader>

                <div className="py-6 px-2">
                    <div className="w-full">
                        {/* SubscribeForm has its own margins/widths suited for footer, 
                             but here we constrain it or rely on its fluid width */}
                        <SubscribeForm layout="dialog" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
