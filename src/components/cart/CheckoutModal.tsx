"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import {
  SHIPPING_REGIONS,
  NIGERIA_STATES,
  getShippingRegion,
  getShippingZone,
  formatShippingLines,
  formatBillingLines,
  billingFromShipping,
  type ShippingRegionId,
} from "@/lib/shipping";
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

type CheckoutStep = 1 | "billing" | "billing-form" | "confirm" | "success";

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

function hasCompleteShipping(fields: {
  line1: string;
  regionId: string;
  areaId: string;
  country: string;
}) {
  return Boolean(
    fields.line1.trim() &&
      fields.regionId.trim() &&
      fields.areaId.trim() &&
      fields.country.trim(),
  );
}

function hasCompleteBilling(fields: {
  line1: string;
  city: string;
  state: string;
  country: string;
}) {
  return Boolean(
    fields.line1.trim() &&
      fields.city.trim() &&
      fields.state.trim() &&
      fields.country.trim(),
  );
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const [step, setStep] = useState<CheckoutStep>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [shippingRegionId, setShippingRegionId] = useState<
    ShippingRegionId | ""
  >("");
  const [shippingAreaId, setShippingAreaId] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingLine1, setBillingLine1] = useState("");
  const [billingLine2, setBillingLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("Nigeria");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paidTotal, setPaidTotal] = useState(0);
  const [paidRef, setPaidRef] = useState("");
  const [paidEmail, setPaidEmail] = useState("");
  const [paidName, setPaidName] = useState("");

  const reduce = useReducedMotion();

  const selectedRegion = useMemo(
    () => getShippingRegion(shippingRegionId),
    [shippingRegionId],
  );
  const shippingZone = useMemo(
    () => getShippingZone(shippingRegionId, shippingAreaId),
    [shippingRegionId, shippingAreaId],
  );
  const deliveryFee = shippingZone?.fee ?? 0;
  const orderTotal = subtotal + deliveryFee;

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSubmitting(false);
      setConfirming(false);
      setFormError(null);
      setPaidTotal(0);
      setPaidRef("");
      setPaidEmail("");
      setPaidName("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const publicKey = settings.paystack_public_key;
    if (publicKey && publicKey.startsWith("pk_")) {
      void loadPaystackScript();
    }
  }, [open, settings.paystack_public_key]);

  const handleClose = () => {
    onClose();
  };

  const shippingSnapshot = () => ({
    line1: line1.trim(),
    line2: line2.trim() || undefined,
    city: shippingZone?.city || "",
    state: shippingZone?.state || "",
    postalCode: postalCode.trim() || undefined,
    country: country.trim(),
    shippingRegion: shippingZone?.regionLabel,
    shippingArea: shippingZone?.areaName,
    deliveryZone: shippingZone?.label,
    deliveryFee: shippingZone?.fee,
  });

  const billingSnapshot = () => {
    const shipping = shippingSnapshot();
    if (billingSameAsShipping) {
      return billingFromShipping(shipping);
    }
    return {
      sameAsShipping: false,
      line1: billingLine1.trim(),
      line2: billingLine2.trim() || undefined,
      city: billingCity.trim(),
      state: billingState.trim(),
      postalCode: billingPostalCode.trim() || undefined,
      country: billingCountry.trim(),
    };
  };

  const validateShipping = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !hasCompleteShipping({
        line1,
        regionId: shippingRegionId,
        areaId: shippingAreaId,
        country,
      })
    ) {
      setFormError("Please fill all required checkout and shipping fields.");
      return false;
    }
    if (!shippingZone) {
      setFormError("Select a shipping region and area to continue.");
      return false;
    }
    return true;
  };

  const validateBillingForm = () => {
    if (
      !hasCompleteBilling({
        line1: billingLine1,
        city: billingCity,
        state: billingState,
        country: billingCountry,
      })
    ) {
      setFormError("Please fill all required billing address fields.");
      return false;
    }
    return true;
  };

  const goFromDetails = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateShipping()) return;
    setStep("billing");
  };

  const goFromBillingChoice = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateShipping()) return;
    if (billingSameAsShipping) {
      setStep("confirm");
      return;
    }
    setStep("billing-form");
  };

  const goFromBillingForm = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateShipping()) return;
    if (!validateBillingForm()) return;
    setBillingSameAsShipping(false);
    setStep("confirm");
  };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (items.length === 0) return;
    if (!validateShipping() || !shippingZone) return;
    if (!billingSameAsShipping && !validateBillingForm()) return;

    setSubmitting(true);
    const txnRef = `PRNTFL-${Date.now()}`;
    const publicKey = settings.paystack_public_key || "";
    const amountSnapshot = orderTotal;

    if (!publicKey.startsWith("pk_")) {
      setFormError(
        "Paystack is not configured yet. Add your public key in Admin → Settings.",
      );
      setSubmitting(false);
      return;
    }

    const loaded = await loadPaystackScript();
    if (!loaded || !window.PaystackPop) {
      setFormError(
        "Paystack checkout failed to load. Check your internet connection and try again.",
      );
      setSubmitting(false);
      return;
    }

    try {
      const amountKobo = Math.round(amountSnapshot * 100);
      const cartItems = items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        size: item.size,
        color: item.color,
      }));
      const shipping = shippingSnapshot();
      const billing = billingSnapshot();
      const customerSnapshot = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        shipping,
        billing,
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
          shipping_address: shipping,
          billing_address: billing,
          delivery_fee: deliveryFee,
          delivery_zone: shippingZone.label,
          shipping_region: shippingZone.regionLabel,
          shipping_area: shippingZone.areaName,
          cart_subtotal: subtotal,
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
            {
              display_name: "Shipping Region",
              variable_name: "shipping_region",
              value: shippingZone.regionLabel,
            },
            {
              display_name: "Shipping Area",
              variable_name: "shipping_area",
              value: shippingZone.areaName,
            },
            {
              display_name: "Shipping Fee",
              variable_name: "delivery_fee",
              value: String(deliveryFee),
            },
            {
              display_name: "Billing",
              variable_name: "billing_same",
              value: billing.sameAsShipping ? "Same as shipping" : "Different",
            },
          ],
        },
        onSuccess: (response: { reference?: string; status?: string }) => {
          void (async () => {
            const reference = response.reference || txnRef;
            // Browser callback is not enough — wait for Paystack API confirmation.
            setConfirming(true);
            setFormError(null);
            try {
              const res = await fetch("/api/paystack/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reference,
                  expectedAmountKobo: amountKobo,
                  customer: customerSnapshot,
                  items: cartItems,
                }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                const errText = String(data.error || "");
                // Payment already succeeded — race with webhook must not block thank-you.
                const paidAnyway =
                  /duplicate key|orders_reference_key|unique constraint|already/i.test(
                    errText,
                  );
                if (!paidAnyway) {
                  setFormError(
                    errText ||
                      `Paystack has not confirmed this payment yet. Reference: ${reference}`,
                  );
                  setSubmitting(false);
                  setConfirming(false);
                  return;
                }
              }

              setPaidRef(reference);
              setPaidTotal(amountSnapshot);
              setPaidEmail(customerSnapshot.email);
              setPaidName(customerSnapshot.name);
              clearCart();
              setStep("success");
            } catch {
              setFormError(
                `Could not confirm payment with Paystack. Reference: ${reference}`,
              );
            } finally {
              setSubmitting(false);
              setConfirming(false);
            }
          })();
        },
        onCancel: () => {
          setSubmitting(false);
          setConfirming(false);
        },
      });
    } catch {
      setFormError("Failed to initialize Paystack. Please try again.");
      setSubmitting(false);
      setConfirming(false);
    }
  };

  const title =
    step === "success"
      ? "Order confirmed"
      : step === 1
        ? "Checkout Details"
        : step === "billing"
          ? "Billing address"
          : step === "billing-form"
            ? "Billing address"
            : "Confirm Order";

  const shippingLines = formatShippingLines(shippingSnapshot());
  const billing = billingSnapshot();
  const billingLines = billing.sameAsShipping
    ? ["Same as shipping address"]
    : formatBillingLines(billing);

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
                {title}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex size-9 items-center justify-center border border-border"
                aria-label="Close checkout"
              >
                <X size={18} />
              </button>
            </div>

            {step === "success" ? (
              <SuccessPanel
                name={paidName}
                email={paidEmail}
                reference={paidRef}
                total={paidTotal}
                onDone={handleClose}
                reduce={Boolean(reduce)}
              />
            ) : (
              <>
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
                  <div className="mt-3 space-y-1.5 border-t border-border pt-3 font-ui text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatNaira(subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted">
                        Shipping
                        {shippingZone ? ` (${shippingZone.label})` : ""}
                      </span>
                      <span>
                        {shippingZone
                          ? formatNaira(deliveryFee)
                          : "Select area"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-border pt-2 font-bold">
                      <span>Total</span>
                      <span>{formatNaira(orderTotal)}</span>
                    </div>
                  </div>
                </div>

                {confirming && (
                  <div
                    role="status"
                    className="mx-5 mt-4 border border-brand-purple/30 bg-brand-purple/10 px-3 py-2.5 text-sm text-brand-purple dark:border-brand-yellow/30 dark:bg-brand-yellow/10 dark:text-brand-yellow"
                  >
                    Confirming payment with Paystack before sending your receipt…
                  </div>
                )}

                {formError && (
                  <div
                    role="alert"
                    className="mx-5 mt-4 border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-300"
                  >
                    {formError}
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={goFromDetails} className="space-y-4 px-5 py-5">
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

                    <div className="border-t border-border pt-4">
                      <p className="mb-3 font-ui text-xs font-semibold uppercase tracking-wider text-muted">
                        Shipping address
                      </p>
                      <div className="space-y-4">
                        <label className="block space-y-1.5">
                          <span className="font-ui text-sm font-medium">
                            Shipping region *
                          </span>
                          <select
                            required
                            value={shippingRegionId}
                            onChange={(e) => {
                              setShippingRegionId(
                                e.target.value as ShippingRegionId | "",
                              );
                              setShippingAreaId("");
                            }}
                            className="w-full border border-border bg-surface px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-purple dark:focus:border-brand-yellow"
                          >
                            <option value="">Select region</option>
                            {SHIPPING_REGIONS.map((region) => (
                              <option key={region.id} value={region.id}>
                                {region.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block space-y-1.5">
                          <span className="font-ui text-sm font-medium">
                            Area / town *
                          </span>
                          <select
                            required
                            value={shippingAreaId}
                            disabled={!selectedRegion}
                            onChange={(e) =>
                              setShippingAreaId(e.target.value)
                            }
                            className="w-full border border-border bg-surface px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-purple disabled:opacity-50 dark:focus:border-brand-yellow"
                          >
                            <option value="">
                              {selectedRegion
                                ? "Select area"
                                : "Choose a region first"}
                            </option>
                            {selectedRegion?.areas.map((area) => (
                              <option key={area.id} value={area.id}>
                                {area.name} ({formatNaira(area.fee)})
                              </option>
                            ))}
                          </select>
                          {selectedRegion && (
                            <p className="font-ui text-[11px] leading-relaxed text-muted">
                              {selectedRegion.note}
                            </p>
                          )}
                        </label>

                        {shippingZone && (
                          <div className="border border-border bg-surface-alt px-3 py-2.5 font-ui text-xs leading-relaxed text-muted">
                            <span className="font-semibold text-foreground">
                              Location locked to selection:{" "}
                            </span>
                            {shippingZone.city}, {shippingZone.state}
                          </div>
                        )}

                        <Field
                          label="Street address *"
                          value={line1}
                          onChange={setLine1}
                          placeholder="House number and street"
                          required
                          autoComplete="street-address"
                        />
                        <Field
                          label="Apartment, suite, landmark, etc."
                          value={line2}
                          onChange={setLine2}
                          placeholder="Optional"
                          autoComplete="address-line2"
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Postal / ZIP code"
                            value={postalCode}
                            onChange={setPostalCode}
                            placeholder="Optional"
                            autoComplete="postal-code"
                          />
                          <Field
                            label="Country *"
                            value={country}
                            onChange={setCountry}
                            placeholder="Nigeria"
                            required
                            autoComplete="country-name"
                          />
                        </div>

                        {shippingZone && line1.trim() && (
                          <div className="border border-border bg-surface px-3 py-3 text-sm">
                            <p className="font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
                              Shipping address preview
                            </p>
                            <div className="mt-2 space-y-0.5">
                              {formatShippingLines(shippingSnapshot()).map(
                                (line) => (
                                  <p key={line}>{line}</p>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleClose}
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
                ) : step === "billing" ? (
                  <form
                    onSubmit={goFromBillingChoice}
                    className="space-y-4 px-5 py-5"
                  >
                    <p className="font-ui text-sm text-muted">
                      Is your billing address the same as your shipping address?
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setBillingSameAsShipping(true)}
                        className={cn(
                          "flex w-full items-start gap-3 border px-3 py-3 text-left transition-colors",
                          billingSameAsShipping
                            ? "border-brand-purple bg-brand-purple/5 dark:border-brand-yellow dark:bg-brand-yellow/10"
                            : "border-border bg-surface hover:border-brand-purple/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                            billingSameAsShipping
                              ? "border-brand-purple bg-brand-purple dark:border-brand-yellow dark:bg-brand-yellow"
                              : "border-border",
                          )}
                        >
                          {billingSameAsShipping && (
                            <span className="size-1.5 rounded-full bg-white dark:bg-brand-black" />
                          )}
                        </span>
                        <span>
                          <span className="block font-ui text-sm font-medium">
                            Yes — same as shipping
                          </span>
                          <span className="mt-0.5 block font-ui text-xs text-muted">
                            Use the shipping address for billing
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingSameAsShipping(false)}
                        className={cn(
                          "flex w-full items-start gap-3 border px-3 py-3 text-left transition-colors",
                          !billingSameAsShipping
                            ? "border-brand-purple bg-brand-purple/5 dark:border-brand-yellow dark:bg-brand-yellow/10"
                            : "border-border bg-surface hover:border-brand-purple/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                            !billingSameAsShipping
                              ? "border-brand-purple bg-brand-purple dark:border-brand-yellow dark:bg-brand-yellow"
                              : "border-border",
                          )}
                        >
                          {!billingSameAsShipping && (
                            <span className="size-1.5 rounded-full bg-white dark:bg-brand-black" />
                          )}
                        </span>
                        <span>
                          <span className="block font-ui text-sm font-medium">
                            No — use a different address
                          </span>
                          <span className="mt-0.5 block font-ui text-xs text-muted">
                            Enter a separate billing address next
                          </span>
                        </span>
                      </button>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setStep(1);
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-border px-4 py-3 font-ui text-sm font-semibold"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-brand-purple px-4 py-3 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black"
                      >
                        Continue
                      </button>
                    </div>
                  </form>
                ) : step === "billing-form" ? (
                  <form
                    onSubmit={goFromBillingForm}
                    className="space-y-4 px-5 py-5"
                  >
                    <p className="font-ui text-sm text-muted">
                      Enter the billing address for this order.
                    </p>
                    <Field
                      label="Street address *"
                      value={billingLine1}
                      onChange={setBillingLine1}
                      placeholder="House number and street"
                      required
                      autoComplete="billing street-address"
                    />
                    <Field
                      label="Apartment, suite, landmark, etc."
                      value={billingLine2}
                      onChange={setBillingLine2}
                      placeholder="Optional"
                      autoComplete="billing address-line2"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="City *"
                        value={billingCity}
                        onChange={setBillingCity}
                        placeholder="e.g. Ikeja"
                        required
                        autoComplete="billing address-level2"
                      />
                      <label className="block space-y-1.5">
                        <span className="font-ui text-sm font-medium">
                          State *
                        </span>
                        <select
                          required
                          value={billingState}
                          onChange={(e) => setBillingState(e.target.value)}
                          autoComplete="billing address-level1"
                          className="w-full border border-border bg-surface px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-purple dark:focus:border-brand-yellow"
                        >
                          <option value="">Select state</option>
                          {NIGERIA_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Postal / ZIP code"
                        value={billingPostalCode}
                        onChange={setBillingPostalCode}
                        placeholder="Optional"
                        autoComplete="billing postal-code"
                      />
                      <Field
                        label="Country *"
                        value={billingCountry}
                        onChange={setBillingCountry}
                        placeholder="Nigeria"
                        required
                        autoComplete="billing country-name"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setStep("billing");
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-border px-4 py-3 font-ui text-sm font-semibold"
                      >
                        <ArrowLeft size={16} /> Back
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
                      <div className="border-t border-border pt-2">
                        <p className="text-muted">Shipping address:</p>
                        {shippingLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                        {shippingZone && (
                          <>
                            <p className="mt-2">
                              <span className="text-muted">Shipping fee: </span>
                              {shippingZone.label} — {formatNaira(deliveryFee)}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {shippingZone.note}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="border-t border-border pt-2">
                        <p className="text-muted">Billing address:</p>
                        {billingLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setStep(
                            billingSameAsShipping ? "billing" : "billing-form",
                          );
                        }}
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-border px-4 py-3 font-ui text-sm font-semibold"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || confirming}
                        className={cn(
                          "flex-1 bg-brand-purple px-4 py-3 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black disabled:opacity-60",
                        )}
                      >
                        {confirming
                          ? "Confirming with Paystack…"
                          : submitting
                            ? "Processing…"
                            : "Pay with Paystack"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessPanel({
  name,
  email,
  reference,
  total,
  onDone,
  reduce,
}: {
  name: string;
  email: string;
  reference: string;
  total: number;
  onDone: () => void;
  reduce: boolean;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "there";

  return (
    <div className="relative overflow-hidden px-5 py-8 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(83,0,155,0.14),_transparent_55%)]"
      />
      <motion.div
        className="relative mx-auto mb-5 flex size-16 items-center justify-center bg-brand-purple text-brand-yellow"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
      >
        <Check size={32} strokeWidth={2.5} aria-hidden />
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
      >
        <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-purple dark:text-brand-yellow">
          Payment successful
        </p>
        <h4 className="mt-2 font-heading text-3xl italic leading-tight text-ink">
          Thank you for shopping with us
        </h4>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          {firstName}, your order is confirmed and queued for production. A
          receipt will be sent to{" "}
          <span className="font-medium text-ink">{email}</span>.
        </p>
      </motion.div>

      <motion.div
        className="relative mx-auto mt-6 max-w-sm border border-border bg-surface-alt px-4 py-4 text-left text-sm"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.4 }}
      >
        <div className="flex justify-between gap-3">
          <span className="text-muted">Amount paid</span>
          <span className="font-ui font-bold">{formatNaira(total)}</span>
        </div>
        <div className="mt-2 flex justify-between gap-3 border-t border-border pt-2">
          <span className="text-muted">Reference</span>
          <span className="max-w-[60%] break-all text-right font-ui text-xs font-semibold">
            {reference}
          </span>
        </div>
      </motion.div>

      <p className="relative mt-5 font-heading text-sm italic text-brand-purple dark:text-brand-yellow">
        Be Bold. Be Seen. Be Known.
      </p>

      <button
        type="button"
        onClick={onDone}
        className="relative mt-6 w-full bg-brand-purple px-4 py-3.5 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black"
      >
        Continue shopping
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
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
        autoComplete={autoComplete}
        className="w-full border border-border bg-surface px-3 py-2.5 font-sans text-sm text-foreground outline-none transition-colors focus:border-brand-purple dark:focus:border-brand-yellow"
      />
    </label>
  );
}
