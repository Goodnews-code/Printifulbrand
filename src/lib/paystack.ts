import { createHmac, timingSafeEqual } from "crypto";
import { getSettings } from "@/lib/settings";

export type PaystackVerifyData = {
  status: string;
  reference: string;
  amount: number; // kobo
  currency: string;
  gateway_response?: string | null;
  channel?: string | null;
  paid_at?: string | null;
  customer?: { email?: string; customer_code?: string };
  metadata?: Record<string, unknown> | null;
};

export async function getPaystackSecretKey(): Promise<string> {
  const settings = await getSettings();
  const key =
    settings.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY || "";
  if (!key.startsWith("sk_")) {
    throw new Error("Paystack secret key is not configured");
  }
  return key;
}

/** Verify a transaction reference with Paystack's servers (source of truth). */
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

const PENDING_STATUSES = new Set([
  "pending",
  "ongoing",
  "processing",
  "queued",
  "abandoned",
]);

/**
 * Poll Paystack until the charge is definitively success/failed.
 * Browser "success" / "I've paid" is not enough — only API status=success counts.
 */
export async function confirmPaystackPayment(
  reference: string,
  options?: {
    expectedAmountKobo?: number;
    expectedCurrency?: string;
    attempts?: number;
    delayMs?: number;
  },
): Promise<PaystackVerifyData> {
  const attempts = options?.attempts ?? 5;
  const delayMs = options?.delayMs ?? 2000;
  let last: PaystackVerifyData | null = null;

  for (let i = 0; i < attempts; i++) {
    last = await verifyPaystackTransaction(reference);
    const status = (last.status || "").toLowerCase();

    if (status === "success") {
      assertSuccessfulPaystackCharge(last, options);
      return last;
    }

    if (status === "failed" || status === "reversed") {
      throw new Error(
        `Paystack reports payment ${status}${
          last.gateway_response ? `: ${last.gateway_response}` : ""
        }`,
      );
    }

    if (!PENDING_STATUSES.has(status) && status !== "success") {
      // Unknown / non-success — keep trying a couple times, then reject
      if (i === attempts - 1) {
        throw new Error(
          `Payment not confirmed by Paystack (status: ${last.status || "unknown"})`,
        );
      }
    }

    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error(
    `Payment not confirmed by Paystack yet (status: ${last?.status || "unknown"}). Try again shortly with the same reference.`,
  );
}

/** Strict checks after Paystack returns status=success. */
export function assertSuccessfulPaystackCharge(
  data: PaystackVerifyData,
  options?: {
    expectedAmountKobo?: number;
    expectedCurrency?: string;
  },
): void {
  if ((data.status || "").toLowerCase() !== "success") {
    throw new Error(`Payment not successful (status: ${data.status})`);
  }

  if (!data.reference) {
    throw new Error("Paystack response missing transaction reference");
  }

  if (!data.amount || data.amount <= 0) {
    throw new Error("Paystack response missing paid amount");
  }

  const currency = (data.currency || "NGN").toUpperCase();
  const expectedCurrency = (options?.expectedCurrency || "NGN").toUpperCase();
  if (currency !== expectedCurrency) {
    throw new Error(
      `Currency mismatch: expected ${expectedCurrency}, got ${currency}`,
    );
  }

  if (
    typeof options?.expectedAmountKobo === "number" &&
    options.expectedAmountKobo > 0
  ) {
    // Allow 0 difference only — amounts must match what checkout charged
    if (data.amount !== options.expectedAmountKobo) {
      throw new Error(
        `Amount mismatch: expected ${options.expectedAmountKobo} kobo, Paystack recorded ${data.amount}`,
      );
    }
  }
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
