import { createHmac, timingSafeEqual } from "crypto";
import { getSettings } from "@/lib/settings";

export type PaystackVerifyData = {
  status: string;
  reference: string;
  amount: number; // kobo
  currency: string;
  paid_at?: string | null;
  customer?: { email?: string; customer_code?: string };
  metadata?: Record<string, unknown> | null;
};

export async function getPaystackSecretKey(): Promise<string> {
  const settings = await getSettings();
  const key = settings.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY || "";
  if (!key.startsWith("sk_")) {
    throw new Error("Paystack secret key is not configured");
  }
  return key;
}

/** Verify a transaction reference with Paystack. */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerifyData> {
  const secret = await getPaystackSecretKey();
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: PaystackVerifyData;
  };

  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || "Paystack verification failed");
  }

  return json.data;
}

/** Validate Paystack webhook HMAC SHA512 signature. */
export function isValidPaystackSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(hash, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
