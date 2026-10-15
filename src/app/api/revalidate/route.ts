import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
const input = z.object({ path: z.string().regex(/^\/(?:articles|leaders|coverage\/daily-brief)(?:\/[a-zA-Z0-9%-]+)?$/).optional(), tag: z.enum(['articles','leaders','daily-briefs','settings']).optional() }).strict().refine(value => Boolean(value.path || value.tag));
export async function POST(request: Request) {
    const expected = process.env.REVALIDATE_SECRET;
    const token = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
    if (!expected || Buffer.byteLength(expected) !== Buffer.byteLength(token) || !timingSafeEqual(Buffer.from(expected),Buffer.from(token))) return NextResponse.json({error:'Unauthorized'}, {status:401});
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({error:'Invalid JSON'}, {status:400}); }
    const parsed = input.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:'Only active content can be invalidated.'}, {status:400});
    if(parsed.data.path) revalidatePath(parsed.data.path);
    if(parsed.data.tag) revalidateTag(parsed.data.tag,'max');
    return NextResponse.json({revalidated:true}, {headers:{'Cache-Control':'no-store'}});
}
