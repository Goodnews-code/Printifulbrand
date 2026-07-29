import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await getSettings();
    const { paystack_secret_key: _secret, ...publicSettings } = settings;
    return Response.json(publicSettings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load settings";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = (await req.json()) as Record<string, string>;
    const settings = await updateSettings(body);
    const { paystack_secret_key: _secret, ...publicSettings } = settings;
    return Response.json(publicSettings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return Response.json({ error: message }, { status: 500 });
  }
}
