"use client";

import { useState } from "react";
import { Frown, Minus, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/utils";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { SmartImage } from "@/components/ui/SmartImage";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const {
    items,
    subtotal,
    isOpen,
    closeCart,
    removeItem,
    updateQty,
  } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 z-[60] bg-brand-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={closeCart}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="cart-panel"
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
            initial={reduce ? { x: 0 } : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.48, ease: EASE }}
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-heading text-2xl italic">Shopping Cart</h3>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex size-9 items-center justify-center border border-border"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <motion.div
                className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
              >
                <Frown className="size-12 text-muted" strokeWidth={1.25} />
                <p className="font-ui text-muted">Your shopping cart is empty!</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="bg-brand-purple px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black"
                >
                  Browse Products
                </button>
              </motion.div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout={!reduce}
                        initial={reduce ? false : { opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={
                          reduce
                            ? undefined
                            : { opacity: 0, x: 40, height: 0, marginBottom: 0 }
                        }
                        transition={{ duration: 0.38, ease: EASE }}
                        className="flex gap-3 border-b border-border pb-4"
                      >
                        <div className="relative size-20 shrink-0 overflow-hidden bg-surface-alt">
                          <SmartImage
                            src={item.image || "/assets/tshirt_base.svg"}
                            alt={item.name}
                            fillCover
                            sizes="80px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="truncate font-ui text-sm font-semibold">
                                {item.name}
                              </p>
                              <p className="mt-0.5 text-xs text-muted">
                                {[
                                  item.color !== "—" && item.color !== "Default"
                                    ? item.color
                                    : null,
                                  item.size !== "One Size" ? item.size : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ") || "Standard"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-muted hover:text-red-500"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-border">
                              <button
                                type="button"
                                className="px-2 py-1"
                                onClick={() => updateQty(item.id, item.qty - 1)}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-8 text-center font-ui text-sm">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                className="px-2 py-1"
                                onClick={() => updateQty(item.id, item.qty + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="font-ui text-sm font-semibold">
                              {formatNaira(item.price * item.qty)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-border px-5 py-4">
                  <div className="mb-4 flex items-center justify-between font-ui">
                    <span className="text-muted">Grand Total</span>
                    <span className="text-lg font-bold">
                      {formatNaira(subtotal)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      setCheckoutOpen(true);
                    }}
                    className="w-full bg-brand-purple py-3.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-yellow hover:text-brand-black"
                  >
                    Proceed to Order
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
