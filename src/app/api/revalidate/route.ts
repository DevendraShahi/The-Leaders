import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
    try {
        let body: any = {};
        if (request.headers.get("content-type")?.includes("application/json")) {
            try {
                body = await request.json();
            } catch (e) {
                // Ignore missing body
            }
        }
        
        const secret = body.secret || request.nextUrl.searchParams.get("secret");
        const path = body.path || request.nextUrl.searchParams.get("path");
        const tag = body.tag || request.nextUrl.searchParams.get("tag");

        if (secret !== process.env.REVALIDATE_SECRET) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }

        if (!path && !tag) {
            return NextResponse.json(
                { message: "Missing path or tag to revalidate" },
                { status: 400 }
            );
        }

        if (path) {
            revalidatePath(path);
        }

        if (tag) {
            // @ts-expect-error - Next.js 16 types randomly require a second 'profile' argument not in standard docs
            revalidateTag(tag);
        }

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            path,
            tag,
        });
    } catch (err) {
        return NextResponse.json(
            { message: "Error revalidating" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get("secret");
    const path = request.nextUrl.searchParams.get("path");
    const tag = request.nextUrl.searchParams.get("tag");

    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!path && !tag) {
        return NextResponse.json(
            { message: "Missing path or tag to revalidate" },
            { status: 400 }
        );
    }

    try {
        if (path) {
            revalidatePath(path);
        }
        if (tag) {
            // @ts-expect-error - Next.js 16 types randomly require a second 'profile' argument not in standard docs
            revalidateTag(tag);
        }

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            path,
            tag,
        });
    } catch (err) {
        return NextResponse.json(
            { message: "Error revalidating" },
            { status: 500 }
        );
    }
}
