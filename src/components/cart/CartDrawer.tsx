"use client";

import { useState } from "react";
import { Frown, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/utils";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import { cn } from "@/lib/utils";

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

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-brand-black/50 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!isOpen}
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
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <Frown className="size-12 text-muted" strokeWidth={1.25} />
            <p className="font-ui text-muted">Your shopping cart is empty!</p>
            <button
              type="button"
              onClick={closeCart}
              className="bg-brand-purple px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-yellow hover:text-brand-black"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b border-border pb-4"
                >
                  <div className="size-20 shrink-0 overflow-hidden bg-surface-alt">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/assets/tshirt_base.svg"}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate font-ui text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {item.color} · {item.size}
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
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="mb-4 flex items-center justify-between font-ui">
                <span className="text-muted">Grand Total</span>
                <span className="text-lg font-bold">{formatNaira(subtotal)}</span>
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
      </aside>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
