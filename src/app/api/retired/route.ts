import { NextResponse } from "next/server";
export const revalidate = 86400;
function retired() { return NextResponse.json({success:false,error:"This feature has been retired."},{status:410,headers:{"Cache-Control":"public, max-age=3600, s-maxage=86400","Access-Control-Allow-Origin":"*"}}); }
export const GET = retired;
export const POST = retired;
export const PATCH = retired;
export const DELETE = retired;
