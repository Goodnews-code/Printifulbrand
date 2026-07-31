"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { formatNaira, cn } from "@/lib/utils";

declare global {
  interface Window {
    PaystackPop?: new () => {
      newTransaction: (config: Record<string, unknown>) => void;
    };
  }
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.PaystackPop) {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v2/inline.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(!!window.PaystackPop));
      existing.addEventListener("error", () => resolve(false));
      if (window.PaystackPop) resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.onload = () => resolve(!!window.PaystackPop);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const publicKey = settings.paystack_public_key;
    if (publicKey && publicKey.startsWith("pk_")) {
      void loadPaystackScript();
    }
  }, [open, settings.paystack_public_key]);

  const goNext = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all required checkout fields.");
      return;
    }
    setStep(2);
  };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all required checkout fields.");
      return;
    }

    setSubmitting(true);
    const txnRef = `PRNTFL-${Date.now()}`;
    const publicKey = settings.paystack_public_key || "";

    if (!publicKey.startsWith("pk_")) {
      alert(
        `Checkout stub: Paystack public key not configured.\n\nAdd pk_test_… in Admin → Settings.\n\nOrder ${txnRef}\n${name} · ${email} · ${phone}\nTotal: ${formatNaira(subtotal)}`,
      );
      setSubmitting(false);
      return;
    }

    const loaded = await loadPaystackScript();
    if (!loaded || !window.PaystackPop) {
      alert(
        "Paystack checkout failed to load. Please check your internet connection.",
      );
      setSubmitting(false);
      return;
    }

    try {
      // Paystack amounts are in kobo (NGN * 100)
      const amountKobo = Math.round(subtotal * 100);
      const cartItems = items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        size: item.size,
        color: item.color,
      }));
      const customerSnapshot = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: publicKey,
        email: customerSnapshot.email,
        amount: amountKobo,
        currency: "NGN",
        ref: txnRef,
        metadata: {
          customer_name: customerSnapshot.name,
          customer_phone: customerSnapshot.phone,
          cart_items: cartItems,
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "name",
              value: customerSnapshot.name,
            },
            {
              display_name: "Phone",
              variable_name: "phone",
              value: customerSnapshot.phone,
            },
          ],
        },
        onSuccess: (response: { reference?: string; status?: string }) => {
          void (async () => {
            const reference = response.reference || txnRef;
            try {
              const res = await fetch("/api/paystack/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reference,
                  customer: customerSnapshot,
                  items: cartItems,
                }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                alert(
                  data.error ||
                    "Payment received, but confirmation failed. Please contact us with your reference: " +
                      reference,
                );
                setSubmitting(false);
                return;
              }
              const notifyBits = [
                data.notified ? "Telegram: sent" : "Telegram: not sent",
                data.receiptSent ? "Email: sent" : "Email: not sent",
              ].join(" · ");
              const extra = data.notifyError
                ? `\n\nNotify detail: ${data.notifyError}`
                : "";
              alert(
                `Payment successful! Ref: ${reference}\n\n${notifyBits}${extra}`,
              );
              clearCart();
              onClose();
            } catch {
              alert(
                "Payment may have succeeded, but we could not confirm it. Please contact us with reference: " +
                  reference,
              );
            } finally {
              setSubmitting(false);
            }
          })();
        },
        onCancel: () => {
          setSubmitting(false);
        },
      });
    } catch {
      alert("Failed to initialize Paystack. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-border bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 id="checkout-title" className="font-heading text-xl italic">
            {step === 1 ? "Checkout Details" : "Confirm Order"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center border border-border"
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-border bg-surface-alt px-5 py-4">
          <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-wider text-muted">
            Order summary
          </p>
          <ul className="space-y-1.5 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="truncate text-muted">
                  {item.name} × {item.qty}
                </span>
                <span className="shrink-0 font-ui">
                  {formatNaira(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-ui font-bold">
            <span>Total</span>
            <span>{formatNaira(subtotal)}</span>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={goNext} className="space-y-4 px-5 py-5">
            <Field
              label="Full Name *"
              value={name}
              onChange={setName}
              placeholder="e.g. Ada Okafor"
              required
            />
            <Field
              label="Email *"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="e.g. ada@email.com"
              required
            />
            <Field
              label="Phone *"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="e.g. 08012345678"
              required
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-brand-purple px-4 py-3 font-ui text-sm font-semibold text-brand-purple dark:border-brand-yellow dark:text-brand-yellow"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-brand-purple px-4 py-3 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={pay} className="space-y-4 px-5 py-5">
            <div className="space-y-2 bg-surface-alt p-4 text-sm">
              <p>
                <span className="text-muted">Name: </span>
                {name}
              </p>
              <p>
                <span className="text-muted">Email: </span>
                {email}
              </p>
              <p>
                <span className="text-muted">Phone: </span>
                {phone}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-border px-4 py-3 font-ui text-sm font-semibold"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "flex-1 bg-brand-purple px-4 py-3 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black disabled:opacity-60",
                )}
              >
                {submitting ? "Processing…" : "Pay with Paystack"}
              </button>
            </div>
          </form>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-ui text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-border bg-surface px-3 py-2.5 font-sans text-sm outline-none transition-colors focus:border-brand-purple dark:focus:border-brand-yellow"
      />
    </label>
  );
}
