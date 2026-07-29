import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  const settings = getSettings();
  // Never send secret keys to the browser
  const { paystack_secret_key: _secret, ...publicSettings } = settings;
  return Response.json(publicSettings);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  const body = (await req.json()) as Record<string, string>;
  return Response.json(updateSettings(body));
}
