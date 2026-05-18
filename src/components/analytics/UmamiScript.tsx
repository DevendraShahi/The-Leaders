import Script from "next/script";

export default function UmamiScript() {
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";
    const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

    if (!websiteId || websiteId === "dummy-umami-website-id") {
        return null;
    }

    return (
        <Script
            src={scriptUrl}
            data-website-id={websiteId}
            data-domains={domains || undefined}
            data-do-not-track="true"
            data-exclude-search="true"
            strategy="afterInteractive"
        />
    );
}
