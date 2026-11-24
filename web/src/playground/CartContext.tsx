import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from './types';

const STORAGE_KEY = 'pg-cart';
export const MAX_QTY = 10;

export type CartEntry = { product: Product; quantity: number };

type State = { items: CartEntry[]; coupon: string | null };

type CartValue = State & {
  count: number;
  add: (product: Product) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  setCoupon: (coupon: string | null) => void;
};

const CartContext = createContext<CartValue | null>(null);

function read(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as State) : { items: [], coupon: null };
  } catch {
    return { items: [], coupon: null };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(read);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const add = useCallback((product: Product) => {
    setState((prev) => {
      const existing = prev.items.find((entry) => entry.product.id === product.id);
      if (!existing) return { ...prev, items: [...prev.items, { product, quantity: 1 }] };
      return {
        ...prev,
        items: prev.items.map((entry) =>
          entry.product.id === product.id ? { product, quantity: Math.min(MAX_QTY, entry.quantity + 1) } : entry,
        ),
      };
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((entry) =>
        entry.product.id === productId ? { ...entry, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : entry,
      ),
    }));
  }, []);

  const remove = useCallback((productId: number) => {
    setState((prev) => ({ ...prev, items: prev.items.filter((entry) => entry.product.id !== productId) }));
  }, []);

  const clear = useCallback(() => setState({ items: [], coupon: null }), []);
  const setCoupon = useCallback((coupon: string | null) => setState((prev) => ({ ...prev, coupon })), []);

  const value = useMemo<CartValue>(
    () => ({
      ...state,
      count: state.items.reduce((sum, entry) => sum + entry.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      setCoupon,
    }),
    [state, add, setQuantity, remove, clear, setCoupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
