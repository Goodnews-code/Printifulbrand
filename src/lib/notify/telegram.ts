/** Clean env values Netlify sometimes stores with quotes/whitespace. */
function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "").trim();
}

export type TelegramSendResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  configured: boolean;
};

/** Send a Telegram message to the shop owner chat. */
export async function sendTelegramMessage(
  text: string,
): Promise<TelegramSendResult> {
  const token = cleanEnv(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanEnv(process.env.TELEGRAM_CHAT_ID);

  if (!token || !chatId) {
    const missing = [
      !token ? "TELEGRAM_BOT_TOKEN" : null,
      !chatId ? "TELEGRAM_CHAT_ID" : null,
    ]
      .filter(Boolean)
      .join(", ");
    console.warn(`[telegram] missing ${missing} — skipping notify`);
    return {
      ok: false,
      skipped: true,
      configured: false,
      error: `Missing ${missing}`,
    };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    );

    const body = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("[telegram] send failed:", res.status, body);
      return {
        ok: false,
        configured: true,
        error: `Telegram API ${res.status}: ${body.slice(0, 300)}`,
      };
    }

    return { ok: true, configured: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Telegram fetch failed";
    console.error("[telegram]", message);
    return { ok: false, configured: true, error: message };
  }
}
