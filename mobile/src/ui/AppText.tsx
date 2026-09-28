import { type AppTextProps as PrimitiveAppTextProps, AppText as PrimitiveAppText } from "@/ui/primitives/AppText";

type LegacyVariant = "display" | "title" | "body" | "meta";

const legacyVariantMap: Record<LegacyVariant, NonNullable<PrimitiveAppTextProps["variant"]>> = {
    display: "display",
    title: "heading1",
    body: "body",
    meta: "meta",
};

/**
 * Compatibility facade for older feature modules.
 *
 * New code should import from `@/ui/primitives/AppText`. Keeping this tiny
 * adapter lets existing routes adopt the same tokens, contrast rules, and
 * editorial type scale without a risky all-at-once screen rewrite.
 */
type AppTextProps = Omit<PrimitiveAppTextProps, "variant"> & {
    variant?: LegacyVariant;
};

export function AppText({ variant = "body", ...props }: AppTextProps) {
    return <PrimitiveAppText variant={legacyVariantMap[variant]} {...props} />;
}
