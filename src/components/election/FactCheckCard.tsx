import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FactCheckCardProps {
    claim: string;
    claimBy: string;
    verdict: "true" | "false" | "misleading" | "unverified";
    analysis: string;
    date: string;
}

export function FactCheckCard({ claim, claimBy, verdict, analysis, date }: FactCheckCardProps) {
    const getVerdictConfig = (v: string) => {
        switch (v) {
            case "true": return { color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle, label: "True" };
            case "false": return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle, label: "False" };
            case "misleading": return { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: AlertTriangle, label: "Misleading" };
            default: return { color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: ShieldCheck, label: "Unverified" };
        }
    };

    const config = getVerdictConfig(verdict);
    const Icon = config.icon;

    return (
        <Card className={cn("hover:shadow-md transition-shadow h-full flex flex-col border-l-4", config.border.replace("/20", "/80"))}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={cn("font-bold uppercase tracking-wider flex items-center gap-1", config.color, config.bg, "border-transparent")}>
                        <Icon className="h-3 w-3" /> {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(date), "MMM d")}</span>
                </div>
                <CardTitle className="bg-muted/30 p-3 rounded-md text-lg font-serif italic border-l-2 border-primary/20">
                    "{claim}"
                </CardTitle>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-bold">
                    Claimed by: {claimBy}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-foreground/80 leading-relaxed font-manrope">
                    {analysis}
                </p>
            </CardContent>
        </Card>
    );
}
