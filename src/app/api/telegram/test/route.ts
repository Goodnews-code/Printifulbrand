import { NextRequest } from "next/server";
import { isAuthorized, unauthorized } from "@/lib/auth";
import { sendTelegramMessage } from "@/lib/notify/telegram";

export const runtime = "nodejs";

/** Admin-only: verify Telegram env on Netlify and send a test message. */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  const tokenSet = Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim().replace(/^["']|["']$/g, ""),
  );
  const chatSet = Boolean(
    process.env.TELEGRAM_CHAT_ID?.trim().replace(/^["']|["']$/g, ""),
  );

  const result = await sendTelegramMessage(
    "Printiful Telegram test from production.\n\nIf you see this, order alerts are connected.",
  );

  return Response.json({
    env: {
      TELEGRAM_BOT_TOKEN: tokenSet ? "set" : "missing",
      TELEGRAM_CHAT_ID: chatSet ? "set" : "missing",
      chatIdPreview: chatSet
        ? String(process.env.TELEGRAM_CHAT_ID)
            .trim()
            .replace(/^["']|["']$/g, "")
            .replace(/.(?=.{4})/g, "•")
        : null,
    },
    result,
  });
}
