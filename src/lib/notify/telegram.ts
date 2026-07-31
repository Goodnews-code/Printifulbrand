/** Clean env values Netlify sometimes stores with quotes/whitespace. */
function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    // Normalize en/em dashes people paste from docs/phones
    .replace(/[\u2010-\u2015\u2212]/g, "-");
}

function parseChatId(raw: string): string | number {
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
}

export type TelegramSendResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  configured: boolean;
};

export function getTelegramConfig() {
  const token = cleanEnv(process.env.TELEGRAM_BOT_TOKEN);
  const chatIdRaw = cleanEnv(process.env.TELEGRAM_CHAT_ID);
  return {
    token,
    chatIdRaw,
    chatId: chatIdRaw ? parseChatId(chatIdRaw) : "",
    tokenSet: Boolean(token),
    chatSet: Boolean(chatIdRaw),
    chatStartsWithMinus: chatIdRaw.startsWith("-"),
    chatLength: chatIdRaw.length,
  };
}

/** Send a Telegram message to the shop owner chat. */
export async function sendTelegramMessage(
  text: string,
): Promise<TelegramSendResult> {
  const { token, chatId, tokenSet, chatSet } = getTelegramConfig();

  if (!tokenSet || !chatSet) {
    const missing = [
      !tokenSet ? "TELEGRAM_BOT_TOKEN" : null,
      !chatSet ? "TELEGRAM_CHAT_ID" : null,
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
