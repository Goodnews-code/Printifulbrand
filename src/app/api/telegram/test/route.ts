import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import {
  getTelegramConfig,
  sendTelegramMessage,
} from "@/lib/notify/telegram";

export const runtime = "nodejs";

/** Admin-only: verify Telegram env on Netlify and send a test message. */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  const config = getTelegramConfig();
  const result = await sendTelegramMessage(
    "Printiful Telegram test from production.\n\nIf you see this, order alerts are connected.",
  );

  return Response.json({
    env: {
      TELEGRAM_BOT_TOKEN: config.tokenSet ? "set" : "missing",
      TELEGRAM_CHAT_ID: config.chatSet ? "set" : "missing",
      chatStartsWithMinus: config.chatStartsWithMinus,
      chatLength: config.chatLength,
      // last 4 digits only — enough to spot typos
      chatIdSuffix: config.chatIdRaw
        ? config.chatIdRaw.slice(-4)
        : null,
    },
    result,
  });
}
