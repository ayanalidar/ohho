"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@/data/menu";

export type CartLine = {
  item: MenuItem;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (item: MenuItem, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.item.id === item.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.item.id === item.id ? { ...l, qty: l.qty + qty } : l
              ),
              isOpen: true,
            };
          }
          return { lines: [...s.lines, { item, qty }], isOpen: true };
        }),
      remove: (id) =>
        set((s) => ({ lines: s.lines.filter((l) => l.item.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.item.id !== id)
              : s.lines.map((l) =>
                  l.item.id === id ? { ...l, qty } : l
                ),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "ohho-cart-v1" }
  )
);

export const cartCount = (lines: CartLine[]) =>
  lines.reduce((n, l) => n + l.qty, 0);

export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((n, l) => n + l.qty * l.item.price, 0);
