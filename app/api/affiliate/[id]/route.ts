import { NextResponse } from "next/server";
import { recordAffiliateClick } from "@/lib/db";
import { isSafeHttpUrl } from "@/lib/sanitize";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.redirect(new URL("/journal", req.url));
  }

  const destination = await recordAffiliateClick(id);
  if (destination && isSafeHttpUrl(destination)) {
    return NextResponse.redirect(destination, { status: 302 });
  }

  return NextResponse.redirect(new URL("/journal", req.url));
}
