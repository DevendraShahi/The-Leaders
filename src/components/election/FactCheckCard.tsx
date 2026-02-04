import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, XCircle, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
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
            case "true":
                return {
                    color: "text-green-600 dark:text-green-500",
                    bg: "bg-green-50 dark:bg-green-950/20",
                    border: "border-green-600/40",
                    icon: CheckCircle,
                    label: "Verified True"
                };
            case "false":
                return {
                    color: "text-primary",
                    bg: "bg-primary/5",
                    border: "border-primary/40",
                    icon: XCircle,
                    label: "Confirmed False"
                };
            case "misleading":
                return {
                    color: "text-orange-600 dark:text-orange-500",
                    bg: "bg-orange-50 dark:bg-orange-950/20",
                    border: "border-orange-600/40",
                    icon: AlertTriangle,
                    label: "Misleading"
                };
            default:
                return {
                    color: "text-muted-foreground",
                    bg: "bg-secondary",
                    border: "border-border",
                    icon: ShieldCheck,
                    label: "Unverified"
                };
        }
    };

    const config = getVerdictConfig(verdict);
    const Icon = config.icon;

    return (
        <Card className={cn("h-full flex flex-col bg-card border-l-4 hover:shadow-md transition-all duration-300 rounded-none", config.border)}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3">
                    <Badge className={cn("font-mono uppercase tracking-wider flex items-center gap-1.5 text-xs border rounded-none", config.color, config.bg, config.border)}>
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(date), "MMM d")}
                    </div>
                </div>

                <CardTitle className="bg-secondary/50 border-l-2 border-primary p-3 text-base font-manrope italic leading-snug rounded-none">
                    "{claim}"
                </CardTitle>

                <div className="text-xs text-muted-foreground mt-2 font-mono uppercase tracking-wide">
                    — {claimBy}
                </div>
            </CardHeader>

            <CardContent className="flex-1 pt-0">
                <div className="pt-4 border-t border-border">
                    <p className="text-sm text-foreground leading-relaxed font-manrope">
                        {analysis}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
