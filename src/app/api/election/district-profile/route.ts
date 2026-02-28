import { NextRequest, NextResponse } from "next/server";
import { getVerifiedDistrictProfile } from "@/lib/district-verified-profile-service";
import type { DistrictProfileApiResponse } from "@/lib/types/district-profile-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const district = request.nextUrl.searchParams.get("district")?.trim();

    if (!district) {
        return NextResponse.json<DistrictProfileApiResponse>(
            { success: false, data: null, error: "Missing district query parameter" },
            { status: 400 }
        );
    }

    try {
        const profile = await getVerifiedDistrictProfile(district);

        if (!profile) {
            return NextResponse.json<DistrictProfileApiResponse>(
                { success: false, data: null, error: "District not found" },
                { status: 404 }
            );
        }

        return NextResponse.json<DistrictProfileApiResponse>(
            { success: true, data: profile },
            {
                headers: {
                    "Cache-Control": "s-maxage=21600, stale-while-revalidate=86400",
                },
            }
        );
    } catch (error) {
        console.error("Failed to build district profile:", error);
        return NextResponse.json<DistrictProfileApiResponse>(
            { success: false, data: null, error: "Failed to load district profile" },
            { status: 500 }
        );
    }
}
