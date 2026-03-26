import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/services/gating";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const status = await getSubscriptionStatus(session.user.id);
  return NextResponse.json(status);
}
